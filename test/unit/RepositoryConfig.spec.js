describe('RepositoryConfig', function() {
	beforeEach(module('repository'));

	describe('#constructor(Object options)', function() {
		it('should NOT continue without a valid DataProvider', inject(function(RepositoryConfig) {
			function invalidDataProvider() {
				return new RepositoryConfig({
					name: 'resource',
					dataProvider: new Date()
				});
			}

			function notRegisteredDataProvider() {
				return new RepositoryConfig({
					name: 'resource',
					dataProvider: 'InvalidProvider'
				});
			}

			expect(invalidDataProvider).toThrow();
			expect(notRegisteredDataProvider).toThrow();
		}));

		it('should NOT continue without a resource name', inject(function(RepositoryConfig, DataProviderInterface) {
			var DummyProvider = DataProviderInterface.extend();

			function invalidResourceName() {
				return new RepositoryConfig({
					dataProvider: new DummyProvider()
				});
			}

			expect(invalidResourceName).toThrow();
		}));

		it('should copy the config values to instance', inject(function(DataProviderInterface, RepositoryConfig) {
			var DummyProvider = DataProviderInterface.extend();

			var instance = new RepositoryConfig({
				name: 'resource',
				dataProvider: new DummyProvider(),
				otherConfig: 'otherConfig'
			});

			expect(instance.name).toBe('resource');
			expect(instance.dataProvider instanceof DataProviderInterface).toBe(true);
			expect(instance.otherConfig).toBe('otherConfig');
		}));
	});
});
