describe('RepositoryConfig', function() {
	beforeEach(module('repository'));

	describe('#constructor(Object options)', function() {
		it('should NOT continue without a valid DataProvider', inject(function(RepositoryConfig) {
			function invalidDataProvider() {
				return new RepositoryConfig({
					endpoint: '/endpoint',
					dataProvider: new Date()
				});
			}

			expect(invalidDataProvider).toThrow();
		}));

		it('should NOT continue without an endpoint', inject(function(RepositoryConfig, DataProviderInterface) {
			var DummyProvider = DataProviderInterface.extend();

			function invalidEndpoint() {
				return new RepositoryConfig({
					dataProvider: new DummyProvider()
				});
			}

			expect(invalidEndpoint).toThrow();
		}));

		it('should copy the config values to instance', inject(function(DataProviderInterface, RepositoryConfig) {
			var DummyProvider = DataProviderInterface.extend();

			var instance = new RepositoryConfig({
				endpoint: '/endpoint',
				dataProvider: new DummyProvider(),
				otherConfig: 'otherConfig'
			});

			expect(instance.endpoint).toBe('/endpoint');
			expect(instance.dataProvider instanceof DataProviderInterface).toBe(true);
			expect(instance.otherConfig).toBe('otherConfig');
		}));
	});
});
