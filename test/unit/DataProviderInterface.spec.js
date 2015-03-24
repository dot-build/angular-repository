describe('DataProviderInterface', function() {
	var instance;

	beforeEach(module('repository'));
	beforeEach(inject(function(DataProviderInterface) {
		var Implementation = DataProviderInterface.extend();
		instance = new Implementation();
	}));

	describe('::extend(Object prototype)', function() {
		it('should have a static method to extend the provider interface', inject(function(DataProviderInterface) {
			expect(typeof DataProviderInterface.extend).toBe('function');
			expect(instance instanceof DataProviderInterface).toBe(true);
		}));
	});

	describe('@find(), findAll(), remove(), removeAll(), save(), saveAll() - abstract methods', function() {
		it('should throw exceptions if a method not implemented is called', inject(function($rootScope) {
			checkPromise(instance.find);
			checkPromise(instance.findAll);
			checkPromise(instance.remove);
			checkPromise(instance.removeAll);
			checkPromise(instance.save);
			checkPromise(instance.saveAll);

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

});
