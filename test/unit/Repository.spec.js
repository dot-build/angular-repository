describe('Repository', function() {

	beforeEach(module('repository'));

	var instance;

	beforeEach(inject(function(DataProviderInterface, RepositoryConfig, Repository) {
		var DataProvider = DataProviderInterface.extend();

		var config = new RepositoryConfig({
			name: 'resource',
			dataProvider: new DataProvider()
		});

		instance = new Repository(config);
	}));

	describe('::extend(Object [prototype])', function() {
		it('should be a static method to extend the repository class', inject(function(Repository, RepositoryConfig, DataProviderInterface) {
			expect(typeof Repository.extend).toBe('function');

			var config = new RepositoryConfig({
				name: 'static-test',
				dataProvider: new DataProviderInterface()
			});

			var Dummy = Repository.extend({
				isDummy: true
			});

			var dummy = new Dummy(config);
			expect(dummy instanceof Repository).toBe(true);
			expect(dummy.isDummy).toBe(true);
		}));
	});

	describe('#constructor(Object config)', function() {
		it('should NOT continue without a valid config', inject(function(Repository) {
			function invalidConfig() {
				return new Repository(null);
			}

			expect(invalidConfig).toThrow();
		}));

		it('should save the config into .config property', inject(function(RepositoryConfig) {
			expect(instance.config).not.toBe(undefined);
			expect(instance.config instanceof RepositoryConfig).toBe(true);
		}));
	});

	describe('#createContext(String name)', function() {
		it('should create a Repository Context with a given name', inject(function(RepositoryContext) {
			var context = instance.createContext('context');
			expect(context).not.toBeFalsy();
			expect(context instanceof RepositoryContext).toBe(true);
		}));

		it('should NOT create a new context if one with the same name already exists. Return it instead', inject(function(RepositoryContext) {
			var context = instance.createContext('my-context');
			expect(context instanceof RepositoryContext).toBe(true);

			var otherContext = instance.createContext('my-context');
			expect(otherContext).toBe(context);
		}));
	});

	describe('#getContext(String name)', function() {
		it('should return null if the context was not found', function() {
			var context = instance.getContext('null-context');
			expect(context).toBe(null);
		});

		it('should return a context that was created before with the given name', inject(function(RepositoryContext) {
			var context = instance.createContext('context');
			var foundContext = instance.getContext('context');
			expect(foundContext).not.toBe(null);
			expect(foundContext).toBe(context);
			expect(foundContext instanceof RepositoryContext).toBe(true);
		}));
	});

	describe('#removeContext(String name)', function() {
		it('should destroy a previously created context', inject(function(Repository, RepositoryContext) {
			var context = instance.createContext('context');
			expect(context instanceof RepositoryContext).toBe(true);

			instance.removeContext('context');
			context = instance.getContext('context');
			expect(context).toBe(null);
		}));
	});

	describe('#find(String id)', function() {
		it('should retrieve a single entity with the given id through DataProvider#find', inject(function(RepositoryConfig, $q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				id = 'entity-id',

				entity = {
					id: id,
					name: 'John'
				};

			spyOn(dataProvider, 'find').and.returnValue($q.when(entity));

			var promise = instance.find(id),
				value;

			expect(dataProvider.find).toHaveBeenCalledWith(instance.config.name, id);

			promise.then(function(e) {
				value = e;
			});

			$rootScope.$digest();
			expect(value).toEqual(entity);
		}));
	});

	describe('#save(Object entity)', function() {
		it('should persist the entity values', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entity = {
					id: 'entity-id',
					name: 'John'
				};

			spyOn(dataProvider, 'save').and.returnValue($q.when(true));
			instance.save(entity);
			$rootScope.$digest();

			expect(dataProvider.save).toHaveBeenCalledWith(instance.config.name, entity);
		}));
	});

	describe('#saveAll(Object[] entities)', function() {
		it('should only allow an array of objects as a valid entity set', inject(function($q, $rootScope) {
			var invalidSets = {
				empty: [],
				nullValues: [null, {}],
				numbers: [1, 2, 3],
				strings: ['one', 'two'],
				undefinedValues: [undefined]
			};

			var dataProvider = instance.config.dataProvider;
			spyOn(dataProvider, 'saveAll').and.callFake(function() {
				return $q.when(true);
			});

			Object.keys(invalidSets).forEach(function(key) {
				var invalidSet = invalidSets[key],
					onError = jasmine.createSpy('error-' + key);

				instance.saveAll(invalidSet).then(null, onError);
				$rootScope.$digest();

				expect(onError).toHaveBeenCalled();
			});

			expect(dataProvider.saveAll).not.toHaveBeenCalled();
		}));

		it('should persist a set of entities in batch mode', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entitySet = [{
					id: 1,
					name: 'John'
				}, {
					id: 2,
					name: 'Paul'
				}];

			spyOn(dataProvider, 'saveAll').and.returnValue($q.when(true));
			instance.saveAll(entitySet);

			$rootScope.$digest();

			expect(dataProvider.saveAll).toHaveBeenCalledWith(instance.config.name, entitySet);
		}));
	});

	describe('#remove(String id)', function() {
		it('should remove a single entity found by ID', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entityId = 'entity-id';

			spyOn(dataProvider, 'remove').and.returnValue($q.when(true));
			instance.remove(entityId);
			$rootScope.$digest();

			expect(dataProvider.remove).toHaveBeenCalledWith(instance.config.name, entityId);
		}));
	});

	describe('#removeAll(String[] id)', function() {
		it('should remove a set of entities in batch mode', inject(function($q, $rootScope) {
			var config = instance.config,
				dataProvider = config.dataProvider,
				entitySet = [1, 2, 3];

			spyOn(dataProvider, 'removeAll').and.returnValue($q.when(true));

			instance.removeAll(entitySet);
			$rootScope.$digest();

			expect(dataProvider.removeAll).toHaveBeenCalledWith(instance.config.name, entitySet);
		}));
	});

	describe('#createQuery()', function() {
		it('should create a instance of QueryBuilder bound to the repository', inject(function(QueryBuilder) {
			var query = instance.createQuery();
			expect(query instanceof QueryBuilder).toBe(true);
			expect(query.$$repository).toBe(instance.config.name);
		}));
	});

	describe('#findAll(QueryBuilder query)', function() {
		it('should call the dataProvider with the query parameters and return a promise', inject(function($q, QueryBuilder) {
			var dataProvider = instance.dataProvider;
			var response = {
				meta: {
					count: 100,
					itemsPerPage: 2,
					currentPage: 1
				},
				data: [{}, {}]
			};

			var qb = QueryBuilder.create()
				.from(instance.name)
				.limit(2)
				.skip(0);

			spyOn(dataProvider, 'findAll').and.returnValue($q.when(response));

			instance.findAll(qb);
			var args = dataProvider.findAll.calls.argsFor(0);

			expect(args[0]).toBe(qb.$$repository);

			expect(args[1].pagination).toEqual({
				currentPage: 1,
				itemsPerPage: 2
			});

			expect(args[1].sorting.length).toBe(0);
			expect(args[1].filters.length).toBe(0);
		}));

		it('should trow and error without a valid query builder', function() {
			function invalidQueryBuilder() {
				instance.findAll(new Date());
			}

			expect(invalidQueryBuilder).toThrow();
		});
	});

	describe('#updateContext(RepositoryContext context)', function() {
		it('should call the dataProvider and update the context data based on context state. ' +
			'Must be automatically on context changes', inject(function($q, $rootScope) {
				var context = instance.createContext('test');
				var dataProvider = instance.dataProvider;

				context.initialize();

				var response = {
					meta: {
						count: 100,
						itemsPerPage: 2,
						currentPage: 1
					},
					data: [{}, {}]
				};

				spyOn(instance, 'updateContext').and.callThrough();
				spyOn(dataProvider, 'findAll').and.returnValue($q.when(response));

				context.filters().where('name', 'Bob');

				var contextState = context.toJSON();

				$rootScope.$digest();

				expect(instance.updateContext).toHaveBeenCalledWith(context);
				expect(dataProvider.findAll).toHaveBeenCalledWith(instance.config.name, contextState);
				expect(context.data).toBe(response.data);

				var paginationState = context.pagination().toJSON();
				expect(paginationState.count).toBe(response.meta.count);
				expect(paginationState.itemsPerPage).toBe(response.meta.itemsPerPage);
				expect(paginationState.currentPage).toBe(response.meta.currentPage);
			}));

		it('should call the dataProvider and update the context error if the fetching fails', inject(function($q, $rootScope) {
			var context = instance.createContext('fail-test');
			var dataProvider = instance.dataProvider;

			context.initialize();

			var response = {
				errors: ['some error']
			};

			spyOn(instance, 'updateContext').and.callThrough();
			spyOn(dataProvider, 'findAll').and.returnValue($q.reject(response));

			context.filters().where('name', 'Bob');

			var contextState = context.toJSON();
			$rootScope.$digest();

			expect(instance.updateContext).toHaveBeenCalledWith(context);
			expect(dataProvider.findAll).toHaveBeenCalledWith(instance.config.name, contextState);
			expect(context.error).toBe(response);
		}));
	});
});
