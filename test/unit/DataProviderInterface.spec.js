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

	describe('@findOne(), findAll(), remove(), save() - abstract methods', function() {
		it('should throw exceptions if a method not implemented is called', inject(function($rootScope) {
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

	describe('#canGet(endpoint, id)', function() {
		it('should return true as the default response', function() {
			expect(instance.canGet()).toBe(true);
		});
	});

	describe('#canList(endpoint, id)', function() {
		it('should return true as the default response', function() {
			expect(instance.canList()).toBe(true);
		});
	});

	describe('#canSave(endpoint, entity)', function() {
		it('should return true as the default response', function() {
			expect(instance.canSave()).toBe(true);
		});
	});

	describe('canRemove(endpoint, id)', function() {
		it('should return true as the default response', function() {
			expect(instance.canRemove()).toBe(true);
		});
	});

});
