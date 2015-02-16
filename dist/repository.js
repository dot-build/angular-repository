(function(undefined){

angular.module('repository', ['EventEmitter']);
function EntityManagerFactory(Repository) {
    var repositoryMap = {}, urlPrefix = '';
    function addRepository(name, config) {
        if (!name || name in repositoryMap || !config || typeof config === 'object' && !config.endpoint) {
            throw new Error('Invalid repository definition');
        }
        if (typeof config === 'string') {
            config = { endpoint: config };
        }
        if (!config.model) {
            config.model = name;
        }
        repositoryMap[name] = new Repository(name, config);
    }
    function getRepository(name) {
        if (name in repositoryMap === false)
            return null;
        return repositoryMap[name];
    }
    function hasRepository(name) {
        return name in repositoryMap;
    }
    function removeRepository(name) {
        delete repositoryMap[name];
    }
    function setUrlPrefix(prefix) {
        urlPrefix = prefix;
    }
    function getUrlPrefix() {
        return urlPrefix;
    }
    return {
        addRepository: addRepository,
        hasRepository: hasRepository,
        getRepository: getRepository,
        removeRepository: removeRepository,
        setUrlPrefix: setUrlPrefix,
        getUrlPrefix: getUrlPrefix
    };
}
angular.module('repository').factory('EntityManager', EntityManagerFactory);
EntityManagerFactory.$inject = ['Repository'];
function PaginationFactory(utils, EventEmitter) {
    var paginationDefaults = {
        count: 0,
        currentPage: 1,
        itemsPerPage: 10
    };
    function Pagination() {
        EventEmitter.call(this);
        this.reset();
    }
    var paginationProto = {
        reset: function () {
            angular.extend(this, paginationDefaults);
            this.pageCount = 0;
        },
        next: function () {
            if (!this.hasNext())
                return false;
            return this.goTo(this.currentPage + 1);
        },
        previous: function () {
            if (!this.hasPrevious())
                return false;
            return this.goTo(this.currentPage - 1);
        },
        first: function () {
            if (!this.hasPrevious())
                return false;
            return this.goTo(1);
        },
        last: function () {
            if (!this.hasNext())
                return false;
            return this.goTo(this.pageCount);
        },
        page: function (page, limit) {
            if (limit) {
                this.itemsPerPage = Number(limit);
            }
            return this.goTo(page);
        },
        hasNext: function () {
            return this.currentPage < this.pageCount;
        },
        hasPrevious: function () {
            return this.currentPage > 1;
        },
        setCount: function (count) {
            this.count = count;
            this.pageCount = Math.ceil(this.count / this.itemsPerPage);
            return this;
        },
        toJSON: function () {
            return {
                page: this.currentPage,
                max: this.itemsPerPage
            };
        },
        goTo: function (page) {
            if (!page)
                return;
            this.currentPage = page;
            this.emit('change', this);
        }
    };
    utils.inherits(Pagination, EventEmitter, paginationProto);
    return Pagination;
}
angular.module('repository').factory('Pagination', PaginationFactory);
PaginationFactory.$inject = [
    'utils',
    'EventEmitter'
];
function RepositoryContextFactory(EventEmitter, Pagination, utils) {
    function RepositoryContext(name) {
        EventEmitter.call(this);
        this.name = name;
        this.list = [];
    }
    var contextProto = {
        ASC: 'asc',
        DESC: 'desc',
        initialize: function () {
            this.filters = {};
            this.sorting = {};
            this.customValues = {};
            this.pagination = new Pagination();
            this.pagination.on('change', this.update.bind(this));
            this.defaults = {
                filters: {},
                sorting: {}
            };
        },
        filter: function (name, value) {
            if (angular.isObject(name)) {
                angular.extend(this.filters, name);
            } else {
                this.filters[name] = value || null;
            }
            this.emit('filter', this);
            this.update();
            return this;
        },
        sort: function (property, direction) {
            this.sorting[property] = direction;
            this.emit('sort', this);
            this.update();
            return this;
        },
        paginate: function (page, limit) {
            page = Number(page) || 1;
            limit = Number(limit) || null;
            var pagination = this.pagination;
            pagination.page(page, limit);
            this.emit('paginate', this);
            this.update();
            return this;
        },
        update: function () {
            if (this.updateInProgress) {
                this.needsUpdate = true;
                return;
            }
            this.updateInProgress = true;
            this.emit('update', this);
        },
        setItems: function (list) {
            if (this.needsUpdate) {
                this.updateInProgress = false;
                this.needsUpdate = false;
                this.update();
                return;
            }
            this.list = list;
            this.emit('change', this.list);
            this.updateInProgress = false;
            this.needsUpdate = false;
            return this;
        },
        reset: function () {
            this.list.length = 0;
            this.resetFilters();
            this.resetSorting();
            this.customValues = {};
        },
        resetFilters: function () {
            this.filters = angular.copy(this.defaults.filters, {});
        },
        resetSorting: function () {
            this.sorting = angular.copy(this.defaults.sorting, {});
        },
        set: function (name, value) {
            this.customValues[name] = value;
        },
        get: function (name) {
            return this.customValues[name] || null;
        },
        setDefaultFilters: function (filters) {
            this.defaults.filters = filters;
            return this;
        },
        setDefaultSorting: function (sorting) {
            this.defaults.sorting = sorting;
            return this;
        },
        toJSON: function () {
            return {
                filter: Model.toJSON(this.filters),
                sort: Model.toJSON(this.sorting),
                page: this.pagination.toJSON()
            };
        }
    };
    utils.inherits(RepositoryContext, EventEmitter, contextProto);
    return RepositoryContext;
}
angular.module('repository').factory('RepositoryContext', RepositoryContextFactory);
RepositoryContextFactory.$inject = [
    'EventEmitter',
    'Pagination',
    'utils'
];
function RepositoryContextFiltersFactory(EventEmitter, utils) {
    function ContextFilters(data) {
        EventEmitter.call(this);
        this.$$filters = [];
    }
    var prototype = {
        add: addFilters,
        toJSON: toJSON,
        toArray: toArray,
        where: where,
        getFilter: getFilter
    };
    var operators = {
        EQ: '=',
        NE: '!=',
        LT: '<',
        LTE: '<=',
        GT: '>',
        GTE: '>=',
        IN: 'in'
    };
    utils.merge(prototype, operators);
    prototype.operators = operators;
    function toJSON() {
        return this.$$filters.slice();
    }
    function toArray() {
        return this.$$filters.map(function (filter) {
            return [
                filter.name,
                filter.operator,
                filter.value
            ];
        });
    }
    function addFilter(filter) {
        if (Array.isArray(filter)) {
            filter = {
                name: filter[0],
                operator: filter[1],
                value: filter[2]
            };
        }
        if (typeof filter !== 'object')
            return;
        if ('name' in filter && 'value' in filter && 'operator' in filter) {
            this.$$filters.push(filter);
        }
    }
    function addFilters(filters) {
        if (!Array.isArray(filters))
            return;
        filters.forEach(addFilter, this);
    }
    function where(name, operator, value) {
        if (arguments.length === 2) {
            value = operator;
            operator = operators.EQ;
        }
        addFilter.call(this, [
            name,
            operator,
            value
        ]);
    }
    function getFilter(name) {
        var found;
        this.$$filters.some(function (filter, index, array) {
            if (filter.name === name) {
                found = filter;
                return true;
            }
        });
        return found;
    }
    utils.inherits(ContextFilters, EventEmitter, prototype);
    return ContextFilters;
}
angular.module('repository').factory('RepositoryContextFilters', RepositoryContextFiltersFactory);
RepositoryContextFiltersFactory.$inject = [
    'EventEmitter',
    'utils'
];
function DataProviderFactory($http, $q) {
    function fetch() {
        params = { params: context.toJSON() };
        return $http.get(this.endpoint, params).then(function (response) {
            var result = response.data, list = [], Model = repository.model;
            context.pagination.setCount(result.count);
            if (angular.isArray(result.items) && result.items.length) {
                list = result.items.map(function (item) {
                    return new Model(item);
                });
            }
            context.setItems(list);
        });
    }
}
function RepositoryFactory($http, $q, RepositoryContext, ModelFactory, EventEmitter, utils) {
    function Repository(config) {
        EventEmitter.call(this);
        this.contexts = {};
        this.endpoint = config.endpoint;
        this.model = ModelFactory.getModel(config.model);
    }
    function updateContext(context) {
        var repository = this;
    }
    function getContext(name) {
        return name in this.contexts ? this.contexts[name] : null;
    }
    function createContext(name) {
        if (name in this.contexts === false) {
            var context = new RepositoryContext(name), _updateContext = updateContext.bind(this);
            context.on('update', _updateContext);
            this.contexts[name] = context;
        }
        return this.contexts[name];
    }
    function removeContext(name) {
        delete this.contexts[name];
    }
    utils.inherits(Repository, EventEmitter, {
        createContext: createContext,
        getContext: getContext,
        updateContext: updateContext,
        removeContext: removeContext
    });
    return Repository;
}
angular.module('repository').factory('Repository', RepositoryFactory);
RepositoryFactory.$inject = [
    '$http',
    '$q',
    'RepositoryContext',
    'ModelFactory',
    'EventEmitter',
    'utils'
];
function ServiceClassFactory($q, $http, EventEmitter, inherits) {
    function Service(config) {
        EventEmitter.call(this);
        config = angular.isObject(config) && config || { endpoints: config };
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
    function findOne(id) {
        if (this.endpoints.get === false) {
            return $q.reject();
        }
        var self = this;
        return $http.get(this.endpoints.get + '/' + id).then(function (response) {
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
        return $http.post(this.endpoints.put + '/' + item.id, item).then(function (response) {
            service.emit(service.CREATE, item);
            return response;
        });
    }
    function create(item) {
        if (this.endpoints.post === false) {
            return $q.reject();
        }
        var service = this;
        return $http.post(this.endpoints.post, item).then(function (response) {
            service.emit(service.UPDATE, item);
            return response;
        });
    }
    function remove(item) {
        if (this.endpoints.delete === false) {
            return $q.reject();
        }
        var service = this;
        return $http.delete(this.endpoints.delete + '/' + item.id, item).then(function (response) {
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
    Service.extend = function (properties) {
        function NewService(config) {
            Service.call(this, config);
        }
        inherits(NewService, Service, properties);
        return NewService;
    };
    return Service;
}
angular.module('repository').factory('Service', ServiceClassFactory);
ServiceClassFactory.$inject = [
    '$q',
    '$http',
    'EventEmitter',
    'inherits'
];
function utilsFactory() {
    var utils = {};
    utils.inherits = inherits;
    utils.merge = merge;
    return utils;
    function merge(destination, source) {
        var key;
        for (key in source) {
            if (!source.hasOwnProperty(key))
                continue;
            destination[key] = source[key];
        }
        return destination;
    }
    function inherits(NewClass, SuperClass, attributes) {
        var prototype = SuperClass.prototype, childPrototype = Object.create(prototype);
        Object.keys(attributes).forEach(function (key) {
            childPrototype[key] = attributes[key];
        });
        NewClass.prototype = childPrototype;
        NewClass.prototype.constructor = NewClass;
    }
}
angular.module('repository').factory('utils', utilsFactory);
}());