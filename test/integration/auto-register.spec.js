describe('RepositoryManager.autoRegister', function() {
	beforeEach(module('integration'));

	describe('Product repository has no flag to disable autoRegister', function() {
		it('should have the Product repository auto-registered', inject(function ($injector) {
			expect($injector.has('ProductRepository')).toBe(true);
		}));
	});

	describe('Other repository has a config to disable auto-register', function() {
		it('should NOT have the Other repository auto-registered', inject(function ($injector, RepositoryManager) {
			expect(RepositoryManager.getRepository('Other')).not.toBe(null);
			expect($injector.has('OtherRepository')).toBe(false);
		}));
	});
});