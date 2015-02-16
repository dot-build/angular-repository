function DataProviderFactory($http, $q) {
	function fetch() {
		// AngularJS request config object
		// params will have "filter", "sort" and "page" properties
		params = {
			params: context.toJSON()
		};

		return $http.get(this.endpoint, params).then(function(response) {
			var result = response.data,
				list = [],
				Model = repository.model;

			context.pagination.setCount(result.count);

			if (angular.isArray(result.items) && result.items.length) {
				list = result.items.map(function(item) {
					return new Model(item);
				});
			}

			context.setItems(list);
		});
	}
}
