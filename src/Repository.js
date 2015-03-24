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
		createQuery: createQuery,
		findAll: findAll,
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

	function removeContext(name) {
		delete this.contexts[name];
	}

	function updateContext(context) {
		var state = context.toJSON();

		this.dataProvider.findAll(this.config.name, state).then(function(data) {
			context.setData(data);
		}).catch(function(error) {
			context.setError(error);
		});
	}

	function createQuery() {
		return QueryBuilder.create().from(this.config.name);
	}

	function findAll(queryBuilder) {
		if (queryBuilder instanceof QueryBuilder === false || queryBuilder.getRepository() !== this.config.name) {
			throw new Error('Invalid query builder');
		}

		var params = queryBuilder.toJSON();

		return this.dataProvider.findAll(this.config.name, params);
	}

	function findOne(id) {
		return this.dataProvider.findOne(this.config.name, id);
	}

	function remove(entity) {
		var service = this;

		return service.dataProvider.remove(this.config.name, entity).then(function(response) {
			service.emit(service.REMOVE, entity);
			return response;
		});
	}

	function save(entity) {
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
