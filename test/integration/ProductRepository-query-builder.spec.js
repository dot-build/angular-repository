describe('ProductRepository: find using a QueryBuilder', function() {
	beforeEach(module('integration'));
	beforeEach(loadJSONFixture('product/list-querybuilder.json'));

	describe('create a QueryBuilder in the repository and call findAll() to search for items', function() {
		beforeEach(inject(function($httpBackend) {
			var fixture = getJSONFixture('product/list-querybuilder.json');
			var matcher = /\/api\/product\?(.*)/;

			$httpBackend.whenGET(matcher).respond(function() {
				return [200, fixture];
			});
		}));

		it('should fetch a list of products', inject(function($httpBackend, RepositoryManager) {
			var onSuccess = jasmine.createSpy('success'),
				onError = jasmine.createSpy('error');

			var ProductRepository = RepositoryManager.getRepository('Product');
			var qb = ProductRepository.createQuery().from('Product').where('name', 'product');

			ProductRepository.findAll(qb).then(onSuccess, onError);
			$httpBackend.flush();

			// data was put in the right place
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		}));
	});
});
