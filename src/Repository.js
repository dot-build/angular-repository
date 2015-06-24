/**
 * @factory Repository
 */
function RepositoryFactory($q, EventEmitter, utils, RepositoryContext, RepositoryConfig, QueryBuilder, RepositoryQueryBuilder) {

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
		where: where,
		findBy: findBy,
		findAll: findAll,
		find: find,
		save: save,
		saveAll: saveAll,
		remove: remove,
		removeAll: removeAll
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
		return RepositoryQueryBuilder.create().from(this.config.name);
	}

	function where () {
		var query = this.createQuery();
		query.where.apply(query, arguments);

		return query;
	}

	var InvalidPropertyError = new Error('Missing filter name');
	var InvalidValueError = new Error('Missing filter value');

	function findBy(property, operator, value) {
		if (property === undefined) {
			return $q.reject(InvalidPropertyError);
		}

		var argCount = arguments.length;
		if (!operator || (operator && argCount === 3 && value === undefined)) {
			return $q.reject(InvalidValueError);
		}

		var query = this.createQuery();

		if (argCount === 3) {
			query.where(property, operator, value);
		} else {
			// with 2 arguments operator becomes the value
			query.where(property, operator);
		}

		return this.findAll(query).then(function(response) {
			return response.data;
		});
	}

	function findAll(queryBuilder) {
		if (queryBuilder.getRepository() !== this.config.name || !(
				queryBuilder instanceof QueryBuilder ||
				queryBuilder instanceof RepositoryQueryBuilder
			)
		) {
			throw new Error('Invalid query builder');
		}

		var params = queryBuilder.toJSON();

		return this.dataProvider.findAll(this.config.name, params);
	}

	function find(id) {
		return this.dataProvider.find(this.config.name, id);
	}

	function remove(entity) {
		var service = this;

		return service.dataProvider.remove(this.config.name, entity).then(function(response) {
			service.emit(service.REMOVE, entity);
			return response;
		});
	}

	function removeAll(entityIds) {
		var service = this;

		return service.dataProvider.removeAll(this.config.name, entityIds).then(function(response) {
			service.emit(service.REMOVE, entityIds);
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

	var InvalidEntitySetError = new Error('InvalidEntitySetError');

	function saveAll(entitySet) {
		var self = this;

		if (!Array.isArray(entitySet) || entitySet.length === 0) {
			return $q.reject(InvalidEntitySetError);
		}

		var validSet = entitySet.every(function(entity) {
			return entity !== null && typeof entity === 'object';
		});

		if (!validSet) {
			return $q.reject(InvalidEntitySetError);
		}

		return this.dataProvider.saveAll(this.config.name, entitySet).then(function(response) {
			self.emit(self.UPDATE, entitySet);
			return response;
		});
	}

	utils.inherits(Repository, EventEmitter, prototype);

	Repository.extend = function(prototype) {
		return utils.extend(Repository, prototype);
	};

	return Repository;
}
