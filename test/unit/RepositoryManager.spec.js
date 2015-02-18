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

		it('should NOT add a repository without a name', inject(function(RepositoryManager, RepositoryConfig) {
			var config = new RepositoryConfig({
				name: '',
				endpoint: '/test',
				dataProvider: new DummyProvider()
			});

			function addRepositoryWithoutName() {
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
	});
});
