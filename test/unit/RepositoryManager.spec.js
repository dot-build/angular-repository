describe('RepositoryManager', function() {
	var DummyProvider, repositoryConfig;

	beforeEach(module('repository'));

	beforeEach(inject(function(DataProviderInterface, RepositoryConfig) {
		DummyProvider = DataProviderInterface.extend();

		repositoryConfig = new RepositoryConfig({
			name: 'test',
			endpoint: '/name',
			dataProvider: new DummyProvider()
		});
	}));

	describe('#hasRepository(String name)', function() {
		it('should return true/false if a repository exists in the manager', inject(function(RepositoryManager) {
			RepositoryManager.addRepository(repositoryConfig);
			expect(RepositoryManager.hasRepository('test')).toBe(true);
		}));
	});

	describe('#addRepository(RepositoryConfig config, Object [properties])', function() {
		it('should add a repository to manager that extends the base repository, register the repository into $provide and return it', inject(function(RepositoryManager, Repository, $injector) {
			var repositoryNameInjectable = repositoryConfig.name + RepositoryManager.suffix;

			// custom properties of new repository
			var properties = {
				doSomething: function() {}
			};

			var repository = RepositoryManager.addRepository(repositoryConfig, properties);

			expect($injector.has(repositoryNameInjectable)).toBe(true);

			var registeredRepository = $injector.get(repositoryNameInjectable);
			expect(registeredRepository).toBe(repository);
			expect(registeredRepository instanceof Repository).toBe(true);
			expect(registeredRepository.doSomething).toBe(properties.doSomething);
		}));

		it('should NOT register into $provide if autoRegister = false in the config', inject(function(RepositoryManager, Repository, $injector) {
			var repositoryNameInjectable = repositoryConfig.name + RepositoryManager.suffix;
			repositoryConfig.autoRegister = false;

			RepositoryManager.addRepository(repositoryConfig);
			expect($injector.has(repositoryNameInjectable)).toBe(false);
		}));

		it('should NOT add a repository without a name', inject(function(RepositoryManager, RepositoryConfig) {
			function addRepositoryWithoutName() {
				var config = new RepositoryConfig({
					name: '',
					dataProvider: new DummyProvider()
				});
				RepositoryManager.addRepository(config);
			}

			expect(addRepositoryWithoutName).toThrow();
		}));

		it('should NOT register a repository twice', inject(function(RepositoryManager) {
			function addRepository() {
				RepositoryManager.addRepository(repositoryConfig);
			}

			expect(addRepository).not.toThrow();
			expect(addRepository).toThrow();
			expect(RepositoryManager.hasRepository(repositoryConfig.name)).toBe(true);
		}));

		it('should NOT register a repository without a valid config', inject(function(RepositoryManager) {
			function registerInvalidConfig() {
				RepositoryManager.addRepository(null);
			}

			expect(registerInvalidConfig).toThrow();
		}));
	});

	describe('#getRepository(String name)', function() {
		it('should return a previously registered repository', inject(function(RepositoryManager) {
			var registeredRepository = RepositoryManager.addRepository(repositoryConfig);
			var repository = RepositoryManager.getRepository(repositoryConfig.name);

			expect(repository).not.toBeFalsy();
			expect(repository).toBe(registeredRepository);
		}));

		it('should return NULL if the repository does not exists', inject(function(RepositoryManager) {
			var result = RepositoryManager.getRepository('foo');
			expect(result).toBe(null);
		}));
	});

	describe('#createQuery()', function() {
		it('should create and return an instance of a QueryBuilder', inject(function(RepositoryManager, QueryBuilder) {
			expect(RepositoryManager.createQuery() instanceof QueryBuilder).toBe(true);
		}));
	});

	describe('#executeQuery(QueryBuilder query)', function() {
		it('should execute a search in the right repository using a QueryBuilder', inject(function(RepositoryManager, QueryBuilder) {
			var query = QueryBuilder.create();

			function execEmptyQuery() {
				RepositoryManager.executeQuery(query);
			}

			expect(execEmptyQuery).toThrow();

			var registeredRepository = RepositoryManager.addRepository(repositoryConfig);
			spyOn(registeredRepository, 'findAll');

			query.from(repositoryConfig.name);
			RepositoryManager.executeQuery(query);

			expect(registeredRepository.findAll).toHaveBeenCalledWith(query);
		}));
	});
});
