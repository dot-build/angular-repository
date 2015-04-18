/**
 * @factory BasicDataProvider
 */
function BasicDataProviderFactory($q, $http, DataProviderInterface) {

	/**
	 * @param {String} resource 	Name of a resource
	 *
	 * Returns a string with underscore or dash characters removed
	 */
	function getResourceSlug(resource) {
		return String(resource).toLowerCase().replace(/([_-])/, '');
	}

	/**
	 * @param {String} resoure 		Name of a resource
	 * @param {String} [id] 		Optional id to append at the end of URI
	 */
	function getResourceUri(resource, id) {
		return '/' + getResourceSlug(resource) + '/' + (id ? id + '/' : '');
	}

	/**
	 * @param {String} resource 	Name of the resource being used
	 * @param {Object} parameters 	Object with "filters", "sorting" and "pagination" properties
	 *                             	These values are generated on QueryBuilder#toJSON()
	 */
	function findAll(resource, parameters) {
		var URI = getResourceUri(resource);
		var query = {};
		var pagination = parameters.pagination;

		if (pagination.currentPage) {
			query.page = pagination.currentPage;
		}

		if (pagination.itemsPerPage) {
			query.limit = pagination.itemsPerPage;
		}

		var filters = [];
		if (parameters.filters.length) {
			parameters.filters.forEach(function(filter) {
				filters.push([filter.name, filter.operator, filter.value]);
			});
		}

		var sorting = [];
		if (parameters.sorting.length) {
			parameters.sorting.forEach(function(sort) {
				var name = sort.name;
				if (sort.direction === 'desc') {
					name = '-' + name;
				}

				sorting.push(name);
			});
		}

		query.filters = JSON.stringify(filters);
		query.sortBy = sorting.join(',');

		query = {
			params: query
		};

		return $http.get(URI, query);
	}

	/**
	 * @param {String} resource 	Name of the resource being used
	 * @param {String} id 			Id of resource to find
	 */
	function find(resource, id) {
		var URI = getResourceUri(resource, id);

		return $http.get(URI).then(function(response) {
			return response.data || null;
		});
	}

	/**
	 * @param {String} resource 	Name of the resource being used
	 * @param {Object} entity 		Object with the values to save. If the entity has an "id" property,
	 *                          	the object is set with the PUT method. Otherwise, a POST is issued
	 */
	function save(resource, entity) {
		var URI = getResourceUri(resource, entity.id),
			method = 'post';

		if (entity.id) {
			method = 'put';
		}

		return $http[method](URI, entity).then(function(response) {
			return response.data || null;
		});
	}

	/**
	 * @param {String} resource 	Name of the resource being used
	 * @param {Array} entitySet 	Array of objects to save
	 *
	 * As same as call save() on each object in the array, but returns a promise with all the save()
	 * calls chained
	 */
	function saveAll(resource, entitySet) {
		var result = $q.when(true);

		entitySet.forEach(function(entity) {
			result = result.then(function() {
				return save(resource, entity);
			});
		});

		return result;
	}

	/**
	 * @param {String} resource 	Name of the resource being used
	 * @param {String} id 			Id of resource to remove
	 */
	function remove(resource, id) {
		var URI = getResourceUri(resource, id);
		return $http.delete(URI);
	}

	/**
	 * @param {String} resource 	Name of the resource being used
	 * @param {Array} resourceIds 	Array of ids. The remove() method is called for each id in the list,
	 *                             	much like the saveAll() method does for each object
	 */
	function removeAll(resource, resourceIds) {
		var result = $q.when(true);

		resourceIds.forEach(function(id) {
			result = result.then(function() {
				return remove(resource, id);
			});
		});

		return result;
	}

	var methods = {
		find: find,
		findAll: findAll,
		save: save,
		saveAll: saveAll,
		remove: remove,
		removeAll: removeAll
	};

	var BasicDataProvider = DataProviderInterface.extend(methods);
	var instance = new BasicDataProvider();

	return instance;
}
