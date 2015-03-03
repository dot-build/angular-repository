describe('ProductListController', function() {
	beforeEach(module('integration'));
	beforeEach(loadJSONFixture('product/list.json'));

	function parseQueryString(string) {
		var pairs = string.split('&'),
			result = {};

		pairs.forEach(function(pair) {
			var name = pair.slice(0, pair.indexOf('=')),
				value = pair.slice(name.length + 1);

			result[name] = decodeURIComponent(value);
		});

		return result;
	}

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

		it('should fetch a list of products with a querybuilder', inject(function(RepositoryManager, $httpBackend) {
			var qb = RepositoryManager.createQuery();

			var onSuccess = jasmine.createSpy('success'),
				onError = jasmine.createSpy('error');

			qb.from('Product').where('name', 'product');

			RepositoryManager.executeQuery(qb).then(onSuccess, onError);
			$httpBackend.flush();

			// data was put in the right place
			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		}));
	});
});
