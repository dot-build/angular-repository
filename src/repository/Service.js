/**
 * @factory Service
 */
function ServiceClassFactory($q, $http, EventEmitter, inherits) {
	/**
	 * @param {String|Object} config String: endpoint. Object: configs
	 */
	function Service(config) {
		EventEmitter.call(this);

		config = angular.isObject(config) && config || {
			endpoints: config
		};

		var endpoints = config.endpoints;

		if (angular.isString(endpoints)) {
			endpoints = {
				index: endpoints,
				get: endpoints,
				post: endpoints,
				put: endpoints,
				'delete': endpoints
			};
		} else if (angular.isObject(endpoints)) {
			var defaultEndpoint = endpoints.get || endpoints.index;

			endpoints = {
				index: endpoints.index || defaultEndpoint,
				get: endpoints.get || defaultEndpoint,
				post: endpoints.post || defaultEndpoint,
				put: endpoints.put || endpoints.get || defaultEndpoint,
				'delete': endpoints.delete || defaultEndpoint
			};
		}

		this.endpoints = endpoints;
		this.model = config.model;
	}

	/**
	 * Find one item by id
	 * @param {String} id
	 * @return {Promise}
	 */
	function findOne(id) {
		if (this.endpoints.get === false) {
			return $q.reject();
		}

		var self = this;

		return $http.get(this.endpoints.get + '/' + id).then(function(response) {
			var item = response.data;

			if (item && item.id && self.model) {
				item = new self.model(item);
			}

			return item || null;
		});
	}

	function update(item) {
		if (this.endpoints.put === false) {
			return $q.reject();
		}

		var service = this;

		return $http.post(this.endpoints.put + '/' + item.id, item).then(function(response) {
			service.emit(service.CREATE, item);
			return response;
		});
	}

	function create(item) {
		if (this.endpoints.post === false) {
			return $q.reject();
		}

		var service = this;

		return $http.post(this.endpoints.post, item).then(function(response) {
			service.emit(service.UPDATE, item);
			return response;
		});
	}

	function remove(item) {
		if (this.endpoints.delete === false) {
			return $q.reject();
		}

		var service = this;

		return $http.delete(this.endpoints.delete + '/' + item.id, item).then(function(response) {
			service.emit(service.REMOVE, item);
			return response;
		});
	}

	function save(item) {
		if (item.id) {
			return this.update(item);
		}

		return this.create(item);
	}

	inherits(Service, EventEmitter, {
		UPDATE: 'update',
		CREATE: 'create',
		REMOVE: 'remove',

		findOne: findOne,
		update: update,
		create: create,
		remove: remove,
		save: save
	});

	Service.extend = function(properties) {
		function NewService(config) {
			Service.call(this, config);
		}

		inherits(NewService, Service, properties);

		return NewService;
	};

	return Service;
}
