ddescribe('DataProviderAbstract', function() {
	var instance;

	beforeEach(module('repository'));
	beforeEach(inject(function(DataProviderAbstract) {
		instance = new DataProviderAbstract();
	}));

	describe('#setUrlPrefix(prefix) | #getUrlPrefix()', function() {
		it('should set/get the URL prefix added on every request made to server', function() {
			var prefix = '/api/v1';

			expect(instance.getUrlPrefix()).toBe('');

			instance.setUrlPrefix(prefix);
			var savedPrefix = instance.getUrlPrefix();

			expect(savedPrefix).toBe(prefix);
		});
	});
});
