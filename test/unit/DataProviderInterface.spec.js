describe('DataProviderInterface', function() {

	beforeEach(module('repository'));

	describe('::extend', function() {
		it('should have a static method to extend the provider interface', inject(function(DataProviderInterface) {
			expect(typeof DataProviderInterface.extend).toBe('function');
			var SubClass = DataProviderInterface.extend({});
			var instance = new SubClass();

			expect(instance instanceof DataProviderInterface).toBe(true);
		}));
	});

	describe('abstract methods', function() {
		it('should throw exceptions if a method not implemented is called', inject(function(DataProviderInterface, $rootScope) {
			var Implementation = DataProviderInterface.extend();
			var instance = new Implementation();

			checkPromise(instance.findOne);
			checkPromise(instance.findAll);
			checkPromise(instance.remove);
			checkPromise(instance.save);

			function checkPromise(fn) {
				var promise = fn();
				expect(promise).not.toBe(undefined);
				expect(typeof promise.then).toBe('function');

				var error;
				promise.catch(function(e) {
					error = e;
				});

				$rootScope.$digest();
				expect(error instanceof Error).toBe(true);
			}
		}));
	});

	describe('can* methods', function() {
		it('should return true as the default response', inject(function(DataProviderInterface, $rootScope) {
			var Implementation = DataProviderInterface.extend();
			var instance = new Implementation();

			expect(instance.canGet()).toBe(true);
			expect(instance.canList()).toBe(true);
			expect(instance.canSave()).toBe(true);
			expect(instance.canRemove()).toBe(true);
		}));
	});
});
