describe('ProductRepository: use a RepositoryContext inside a controller', function() {
	beforeEach(module('integration'));
	beforeEach(loadJSONFixture('product/list.json'));

	describe('fetch a list of products', function() {
		var fixture, matcher;

		beforeEach(inject(function($httpBackend) {
			fixture = getJSONFixture('product/list.json');
			matcher = /\/api\/product\?(.*)/;

			$httpBackend.whenGET(matcher).respond(function(method, url) {
				var match = url.match(matcher);
				var meta = {};

				if (match) {
					var params = parseQueryString(match[1]);
					meta.currentPage = +params.page;
					meta.itemsPerPage = +params.limit;
					meta.count = fixture.length;
				}

				return [200, {
					meta: meta,
					data: fixture
				}];
			});
		}));

		it('should have a list of products in the context', inject(function($rootScope, $controller, $httpBackend) {
			var $scope = $rootScope.$new();
			$controller('ProductListController as listing', {
				$scope: $scope
			});

			var viewModel = $scope.listing;
			expect(viewModel.context).not.toBe(undefined);

			var context = viewModel.context,
				filters = context.filters(),
				pagination = context.pagination();

			filters.where('name', 'product');
			$httpBackend.flush();

			// data was put in the right place
			expect(viewModel.context.data).not.toBeFalsy();
			expect(viewModel.context.error).toBe(null);

			// pagination kept the right state after update
			expect(pagination.currentPage).toBe(1);
			expect(pagination.itemsPerPage).toBe(10);
			expect(pagination.count).toBe(fixture.length);
		}));
	});
});
