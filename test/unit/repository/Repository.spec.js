describe('Repository', function() {

	beforeEach(module('repository'));

	// tests with a mocked DataProviderInterface
	describe('-', function() {
		var instance;

		function DataProviderInterface() {}

		function RepositoryConfig() {
			this.dataProvider = new DataProviderInterface();
		}

		beforeEach(module({
			RepositoryConfig: RepositoryConfig,
			DataProviderInterface: DataProviderInterface
		}));

		beforeEach(inject(function(RepositoryConfig, Repository) {
			var config = new RepositoryConfig();
			instance = new Repository(config);
		}));

		describe('::extend', function() {
			it('should be a static method to extend the repository class', inject(function(Repository, RepositoryConfig) {
				expect(typeof Repository.extend).toBe('function');

				var config = new RepositoryConfig();
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
	});

	describe('.', function() {
		var DataProvider;
		var instance;

		beforeEach(inject(function(DataProviderInterface, RepositoryConfig, Repository) {
			DataProvider = DataProviderInterface.implement();

			var config = new RepositoryConfig({
				endpoint: '/resource',
				dataProvider: new DataProvider()
			});

			instance = new Repository(config);
		}));

		describe('#findOne(String id)', function() {
			it('should retrieve a single entity with the given id through DataProvider#findOne', inject(function(RepositoryConfig, $q, $rootScope) {
				var config = instance.config,
					dataProvider = config.dataProvider,
					id = 'entity-id',

					entity = {
						id: id,
						name: 'John'
					};

				spyOn(dataProvider, 'findOne').and.returnValue($q.when(entity));

				var promise = instance.findOne(id),
					value;

				expect(dataProvider.findOne).toHaveBeenCalledWith(instance.config.endpoint, id);

				promise.then(function(e) {
					value = e;
				});

				$rootScope.$digest();
				expect(value).toEqual(entity);
			}));

			it('should NOT search if the method is not allowed on dataProvider', function() {
				var dataProvider = instance.config.dataProvider;
				spyOn(dataProvider, 'canGet').and.returnValue(false);
				spyOn(dataProvider, 'findOne');

				instance.findOne('id');

				expect(dataProvider.canGet).toHaveBeenCalled();
				expect(dataProvider.findOne).not.toHaveBeenCalled();
			});
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

				expect(dataProvider.save).toHaveBeenCalledWith(instance.config.endpoint, entity);
			}));

			it('should NOT save if the method is not allowed on dataProvider', function() {
				var dataProvider = instance.config.dataProvider;
				spyOn(dataProvider, 'canSave').and.returnValue(false);
				spyOn(dataProvider, 'save');

				instance.save({
					id: '1'
				});

				expect(dataProvider.canSave).toHaveBeenCalled();
				expect(dataProvider.save).not.toHaveBeenCalled();
			});
		});

		describe('#remove(String id)', function() {
			it('should remove a single entity found by ID', inject(function($q, $rootScope) {
				var config = instance.config,
					dataProvider = config.dataProvider,
					entityId = 'entity-id';

				spyOn(dataProvider, 'remove').and.returnValue($q.when(true));
				instance.remove(entityId);
				$rootScope.$digest();

				expect(dataProvider.remove).toHaveBeenCalledWith(instance.config.endpoint, entityId);
			}));

			it('should NOT remove if the method is not allowed on dataProvider', function() {
				var dataProvider = instance.config.dataProvider;
				spyOn(dataProvider, 'canRemove').and.returnValue(false);
				spyOn(dataProvider, 'remove');

				instance.remove('id');

				expect(dataProvider.canRemove).toHaveBeenCalled();
				expect(dataProvider.remove).not.toHaveBeenCalled();
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
					expect(dataProvider.findAll).toHaveBeenCalledWith(instance.config.endpoint, contextState);
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
				expect(dataProvider.findAll).toHaveBeenCalledWith(instance.config.endpoint, contextState);
				expect(context.error).toBe(response);
			}));
		});
	});
});
