/**
 * @factory Repository
 */
function RepositoryFactory($q, EventEmitter, utils, RepositoryContext, RepositoryConfig, QueryBuilder) {

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
		findAll: findAll,
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

	function removeContext(name) {
		delete this.contexts[name];
	}

	function updateContext(context) {
		if (!this.dataProvider.canList(this.config.name)) {
			return $q.reject();
		}

		var state = context.toJSON();

		this.dataProvider.findAll(this.config.name, state).then(function(data) {
			context.setData(data);
		}).catch(function(error) {
			context.setError(error);
		});
	}

	function findAll(queryBuilder) {
		if (queryBuilder instanceof QueryBuilder === false || queryBuilder.getRepository() !== this.config.name) {
			throw new Error('Invalid query builder');
		}

		var params = queryBuilder.toJSON();

		return this.dataProvider.findAll(this.config.name, params);
	}

	function findOne(id) {
		if (!this.dataProvider.canGet(this.config.name, id)) {
			return $q.reject();
		}

		return this.dataProvider.findOne(this.config.name, id);
	}

	function remove(entity) {
		if (!this.dataProvider.canRemove(this.config.name, entity)) {
			return $q.reject();
		}

		var service = this;

		return service.dataProvider.remove(this.config.name, entity).then(function(response) {
			service.emit(service.REMOVE, entity);
			return response;
		});
	}

	function save(entity) {
		if (!this.dataProvider.canSave(this.config.name, entity)) {
			return $q.reject();
		}

		var self = this;
		return this.dataProvider.save(this.config.name, entity).then(function(response) {
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
