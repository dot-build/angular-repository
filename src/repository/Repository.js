/**
 * @factory Repository
 */
function RepositoryFactory($q, EventEmitter, utils, RepositoryContext, RepositoryConfig) {

	function Repository(config) {
		if (config instanceof RepositoryConfig === false) {
			throw new Error('Invalid config');
		}

		this.contexts = {};
		this.config = config;
		this.dataProvider = config.dataProvider;
		this.name = config.name;

		EventEmitter.call(this);
	}

	var prototype = {
		createContext: createContext,
		removeContext: removeContext,
		getContext: getContext,
		updateContext: updateContext,
		findOne: findOne,
		save: save,
		remove: remove
	};

	var repositoryEvents = {
		UPDATE: 'update',
		CREATE: 'create',
		REMOVE: 'remove'
	};

	utils.merge(prototype, repositoryEvents);

	function createContext(name) {
		var self = this,
			context;

		if (name in self.contexts === false) {
			context = new RepositoryContext(name);

			// using updateContext.bind to generate a handler is harder to test
			// keep calling with the closure's "self" reference
			context.on('update', function(context) {
				self.updateContext(context);
			});

			this.contexts[name] = context;
		}

		return this.contexts[name];
	}

	function getContext(name) {
		return (name in this.contexts) ? this.contexts[name] : null;
	}

	function updateContext(context) {
		var config = this.config,
			state = context.toJSON();

		this.dataProvider.findAll(config.endpoint, state).then(function(data) {
			context.setData(data);
		}).catch(function(error) {
			context.setError(error);
		});
	}

	function removeContext(name) {
		delete this.contexts[name];
	}

	function findOne(id) {
		if (!this.dataProvider.canGet(this.config.endpoint)) {
			return $q.reject();
		}

		return this.dataProvider.findOne(this.config.endpoint, id);
	}

	function remove(entity) {
		if (!this.dataProvider.canRemove(this.config.endpoint)) {
			return $q.reject();
		}

		var service = this;

		return service.dataProvider.remove(this.config.endpoint, entity).then(function(response) {
			service.emit(service.REMOVE, entity);
			return response;
		});
	}

	function save(entity) {
		if (!this.dataProvider.canSave(this.config.endpoint)) {
			return $q.reject();
		}

		var self = this;
		return this.dataProvider.save(this.config.endpoint, entity).then(function(response) {
			self.emit(self.UPDATE, entity);
			return response;
		});
	}

	utils.inherits(Repository, EventEmitter, prototype);

	Repository.extend = function(prototype) {
		return utils.extend(Repository, prototype);
	};

	return Repository;
}
