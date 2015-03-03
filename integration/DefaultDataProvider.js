angular.module('integration').factory('DefaultDataProvider', function(DataProviderInterface, $http) {
	function queryStringPagination(pagination) {
		var pairs = [];

		if (pagination.currentPage) {
			pairs.push('page=' + pagination.currentPage);
		}

		if (pagination.itemsPerPage) {
			pairs.push('limit=' + pagination.itemsPerPage);
		}

		return pairs.join('&');
	}

	function queryStringFilters(filters) {
		var pairs = filters.map(function(filter) {
			return filter.name + filter.operator + encodeURIComponent(filter.value);
		});

		return pairs.join('&');
	}

	function queryStringSorting(sorting) {
		var pairs = sorting.map(function(rule) {
			return rule.name + ':' + rule.direction;
		});

		return 'sort=' + encodeURIComponent(pairs.join(','));
	}

	var DefaultDataProvider = DataProviderInterface.extend({
		baseUrl: '/api',

		findOne: function(resource, id) {
			return $http.get(this.baseUrl + resource + '/' + id);
		},

		findAll: function(resource, contextState) {
			var url = this.baseUrl + uriMap[resource] + '?',
				pagination = queryStringPagination(contextState.pagination),
				filters = contextState.filters.length ? queryStringFilters(contextState.filters) : '',
				sorting = contextState.sorting.length ? queryStringSorting(contextState.sorting) : '';

			var pairs = [];

			if (pagination) {
				pairs.push(pagination);
			}

			if (sorting) {
				pairs.push(sorting);
			}

			if (filters) {
				pairs.push(filters);
			}

			url += pairs.join('&');

			return $http.get(url).then(function(response) {
				return response.data;
			});
		}
	});

	var uriMap = {
		Product: '/product'
	};

	return new DefaultDataProvider();
});
