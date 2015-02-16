describe('EntityManager', function() {
	function Repository() {}

	beforeEach(module('repository'));
	beforeEach(module({
		Repository: Repository
	}));

	describe('#[sg]etUrlPrefix', function() {
		it('should set a URL prefix to add on every request made to server', inject(function(EntityManager) {
			var prefix = '/api/v1';

			EntityManager.setUrlPrefix(prefix);
			var savedPrefix = EntityManager.getUrlPrefix();

			expect(savedPrefix).toBe(prefix);
		}));
	});

	describe('#hasRepository', function() {
		it('should return true/false if a repository exists in the manager or not', inject(function(EntityManager) {
			EntityManager.addRepository('name', '/name');
			expect(EntityManager.hasRepository('name')).toBe(true);
			expect(EntityManager.hasRepository('other')).toBe(false);
		}));
	});

	describe('#addRepository(String name, String|Object endpoint|config)', function() {
		it('should add a repository with a name and an endpoint string', inject(function(EntityManager) {
			EntityManager.addRepository('people', '/people');
			var hasRepository = EntityManager.hasRepository('people');
			expect(hasRepository).toBe(true);
		}));

		it('should add a repository with a name and a config object', inject(function(EntityManager) {
			var repositoryConfig = {
				endpoint: '/people'
			};

			EntityManager.addRepository('people', repositoryConfig);
			var hasRepository = EntityManager.hasRepository('people');

			expect(hasRepository).toBe(true);
		}));

		it('should NOT add a repository without a name and a valid config/endpoint', inject(function(EntityManager) {
			function addRepositoryWithoutName() {
				EntityManager.addRepository('', '/people');
			}

			function addRepositoryWithoutConfig() {
				EntityManager.addRepository('people');
			}

			function addRepositoryWithoutEndpointConfig() {
				EntityManager.addRepository('people', {});
			}

			expect(addRepositoryWithoutName).toThrow();
			expect(EntityManager.hasRepository('people')).toBe(false);

			expect(addRepositoryWithoutConfig).toThrow();
			expect(EntityManager.hasRepository('people')).toBe(false);

			expect(addRepositoryWithoutEndpointConfig).toThrow();
			expect(EntityManager.hasRepository('people')).toBe(false);
		}));

		it('should NOT register a repository twice', inject(function(EntityManager) {
			function addRepository() {
				EntityManager.addRepository('people', '/people');
			}

			expect(addRepository).not.toThrow();
			expect(addRepository).toThrow();
			expect(EntityManager.hasRepository('people')).toBe(true);
		}));
	});

	describe('#removeRepository(String name)', function() {
		it('should remove a previously registered repository', inject(function(EntityManager) {
			EntityManager.addRepository('people', '/people');
			expect(EntityManager.hasRepository('people')).toBe(true);
			EntityManager.removeRepository('people');
			expect(EntityManager.hasRepository('people')).toBe(false);
		}));
	});

	describe('#getRepository(String name)', function() {
		it('should return null if the repository was not found', inject(function(EntityManager) {
			expect(EntityManager.getRepository('foo')).toBe(null);
		}));

		it('should return the repository', inject(function(EntityManager, Repository) {
			EntityManager.addRepository('people', '/people');
			var repository = EntityManager.getRepository('people');

			expect(repository).not.toBe(null);
			expect(repository instanceof Repository).toBe(true);
		}));
	});
});
