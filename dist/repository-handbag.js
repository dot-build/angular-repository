(function(handbag, undefined) {
    handbag.value('EventEmitter', window.EventEmitter);
    handbag.value('$q', window.Q);

function ContextQueryBuilderFactory(utils, QueryBuilder, EventEmitter) {
    function ContextQueryBuilder() {
        QueryBuilder.call(this);
        EventEmitter.call(this);
        function update() {
            var args = ['update'];
            args.push.apply(args, arguments);
            this.emit.apply(this, args);
        }
        var boundUpdateFn = update.bind(this);
        this.$$filters.on('update', boundUpdateFn);
        this.$$sorting.on('update', boundUpdateFn);
        this.$$pagination.on('update', boundUpdateFn);
    }
    function queue() {
        this.suspendEvents();
        return this;
    }
    function exec() {
        this.resumeEvents();
        this.emit('update', this);
        return this;
    }
    var prototype = {
        queue: queue,
        exec: exec
    };
    utils.merge(prototype, EventEmitter.prototype);
    utils.merge(prototype, QueryBuilder.prototype);
    ContextQueryBuilder.prototype = prototype;
    ContextQueryBuilder.prototype.constructor = ContextQueryBuilder;
    ContextQueryBuilder.create = function () {
        return new ContextQueryBuilder();
    };
    return ContextQueryBuilder;
}
handbag.provide('ContextQueryBuilder', ContextQueryBuilderFactory);
ContextQueryBuilderFactory.$inject = [
    'utils',
    'QueryBuilder',
    'EventEmitter'
];
function DataProviderInterfaceFactory(utils, $q) {
    function DataProviderInterface() {
    }
    DataProviderInterface.extend = extend;
    DataProviderInterface.prototype = {
        find: notImplemented('find'),
        findAll: notImplemented('findAll'),
        remove: notImplemented('remove'),
        removeAll: notImplemented('removeAll'),
        save: notImplemented('save'),
        saveAll: notImplemented('saveAll')
    };
    function extend(prototype) {
        return utils.extend(DataProviderInterface, prototype);
    }
    function notImplemented(method) {
        return function () {
            return $q.reject(new Error(method + '() is not implemented'));
        };
    }
    return DataProviderInterface;
}
handbag.provide('DataProviderInterface', DataProviderInterfaceFactory);
DataProviderInterfaceFactory.$inject = [
    'utils',
    '$q'
];
function QueryBuilderFactory(RepositoryFilter, RepositorySorting, RepositoryPagination, utils) {
    function QueryBuilder() {
        this.$$filters = RepositoryFilter.create();
        this.$$sorting = RepositorySorting.create();
        this.$$pagination = RepositoryPagination.create();
        this.$$repository = '';
        this.$$fields = [];
    }
    function create() {
        return new QueryBuilder();
    }
    function from(repository) {
        this.$$repository = repository;
        return this;
    }
    function sort(name, direction) {
        this.$$sorting.sort(name, direction);
        return this;
    }
    function where() {
        this.$$filters.where.apply(this.$$filters, arguments);
        return this;
    }
    var FIELD_SEPARATOR = /,\s*/g;
    function select(model, fields) {
        if (model && !fields) {
            fields = model;
            model = false;
        }
        if (typeof fields === 'string' && FIELD_SEPARATOR.test(fields)) {
            fields = fields.split(FIELD_SEPARATOR);
        }
        if (!Array.isArray(fields)) {
            fields = [fields];
        }
        if (model && fields) {
            fields = fields.map(function (field) {
                return model + '.' + field;
            });
        }
        fields.forEach(function (field) {
            if (this.$$fields.indexOf(field) === -1) {
                this.$$fields.push(field);
            }
        }, this);
    }
    function skip(skipValue) {
        this.$$pagination.goToPage(~~(skipValue / this.$$pagination.itemsPerPage) + 1);
        return this;
    }
    function limit(limitValue) {
        this.$$pagination.setState({ itemsPerPage: limitValue });
        return this;
    }
    function page(pageNumber, limit) {
        this.$$pagination.goToPage(pageNumber, limit);
        return this;
    }
    function reset() {
        this.$$filters.reset();
        this.$$sorting.reset();
        this.$$pagination.reset();
        return this;
    }
    function toJSON() {
        return {
            filters: this.$$filters.toJSON(),
            pagination: this.$$pagination.toJSON(),
            sorting: this.$$sorting.toJSON()
        };
    }
    function getRepository() {
        return this.$$repository;
    }
    var prototype = {
        constructor: QueryBuilder,
        getRepository: getRepository,
        from: from,
        where: where,
        select: select,
        sort: sort,
        skip: skip,
        limit: limit,
        page: page,
        reset: reset,
        toJSON: toJSON
    };
    QueryBuilder.prototype = prototype;
    QueryBuilder.create = create;
    var operators = RepositoryFilter.prototype.operators, directions = RepositorySorting.prototype.directions;
    utils.merge(QueryBuilder, operators);
    utils.merge(QueryBuilder, directions);
    return QueryBuilder;
}
handbag.provide('QueryBuilder', QueryBuilderFactory);
QueryBuilderFactory.$inject = [
    'RepositoryFilter',
    'RepositorySorting',
    'RepositoryPagination',
    'utils'
];
function RepositoryFactory($q, EventEmitter, utils, RepositoryContext, RepositoryConfig, QueryBuilder, RepositoryQueryBuilder) {
    function Repository(config) {
        if (config instanceof RepositoryConfig === false) {
            throw new Error('Invalid config');
        }
        this.contexts = {};
        this.config = config;
        this.dataProvider = config.dataProvider;
        this.name = config.name;
        EventEmitter.call(this);
    }
    var prototype = {
        createContext: createContext,
        removeContext: removeContext,
        getContext: getContext,
        updateContext: updateContext,
        createQuery: createQuery,
        where: where,
        findBy: findBy,
        find: find,
        findAll: findAll,
        save: save,
        saveAll: saveAll,
        remove: remove,
        removeAll: removeAll
    };
    var repositoryEvents = {
        UPDATE: 'update',
        CREATE: 'create',
        REMOVE: 'remove'
    };
    utils.merge(prototype, repositoryEvents);
    function createContext(name) {
        var self = this, context;
        if (name in self.contexts === false) {
            context = new RepositoryContext(name);
            context.on('update', function (context) {
                self.updateContext(context);
            });
            this.contexts[name] = context;
        }
        return this.contexts[name];
    }
    function getContext(name) {
        return name in this.contexts ? this.contexts[name] : null;
    }
    function removeContext(name) {
        delete this.contexts[name];
    }
    function updateContext(context) {
        var state = context.toJSON();
        this.dataProvider.findAll(this.config.name, state).then(function (data) {
            context.setData(data);
        }).catch(function (error) {
            context.setError(error);
        });
    }
    function createQuery() {
        return RepositoryQueryBuilder.create().from(this.config.name);
    }
    function where() {
        var query = this.createQuery();
        query.where.apply(query, arguments);
        return query;
    }
    var InvalidPropertyError = new Error('Missing filter name');
    var InvalidValueError = new Error('Missing filter value');
    function findBy(property, operator, value) {
        if (property === undefined) {
            return $q.reject(InvalidPropertyError);
        }
        var argCount = arguments.length;
        if (!operator || operator && argCount === 3 && value === undefined) {
            return $q.reject(InvalidValueError);
        }
        var query = this.createQuery();
        if (argCount === 3) {
            query.where(property, operator, value);
        } else {
            query.where(property, operator);
        }
        return this.findAll(query).then(function (response) {
            return response.data;
        });
    }
    function findAll(queryBuilder, options) {
        if (queryBuilder.getRepository() !== this.config.name || !(queryBuilder instanceof QueryBuilder || queryBuilder instanceof RepositoryQueryBuilder)) {
            throw new Error('Invalid query builder');
        }
        var params = queryBuilder.toJSON();
        return this.dataProvider.findAll(this.config.name, params, options);
    }
    function find(id, options) {
        return this.dataProvider.find(this.config.name, id, options);
    }
    function remove(entity, options) {
        var service = this;
        return service.dataProvider.remove(this.config.name, entity, options).then(function (response) {
            service.emit(service.REMOVE, entity);
            return response;
        });
    }
    function removeAll(entityIds, options) {
        var service = this;
        return service.dataProvider.removeAll(this.config.name, entityIds, options).then(function (response) {
            service.emit(service.REMOVE, entityIds);
            return response;
        });
    }
    function save(entity, options) {
        var self = this;
        return this.dataProvider.save(this.config.name, entity, options).then(function (response) {
            self.emit(self.UPDATE, entity);
            return response;
        });
    }
    var InvalidEntitySetError = new Error('InvalidEntitySetError');
    function saveAll(entitySet, options) {
        var self = this;
        if (!Array.isArray(entitySet) || entitySet.length === 0) {
            return $q.reject(InvalidEntitySetError);
        }
        var validSet = entitySet.every(function (entity) {
            return entity !== null && typeof entity === 'object';
        });
        if (!validSet) {
            return $q.reject(InvalidEntitySetError);
        }
        return this.dataProvider.saveAll(this.config.name, entitySet, options).then(function (response) {
            self.emit(self.UPDATE, entitySet);
            return response;
        });
    }
    utils.inherits(Repository, EventEmitter, prototype);
    Repository.extend = function (prototype) {
        return utils.extend(Repository, prototype);
    };
    return Repository;
}
handbag.provide('Repository', RepositoryFactory);
RepositoryFactory.$inject = [
    '$q',
    'EventEmitter',
    'utils',
    'RepositoryContext',
    'RepositoryConfig',
    'QueryBuilder',
    'RepositoryQueryBuilder'
];
function RepositoryConfigFactory($injector, DataProviderInterface, utils) {
    function RepositoryConfig(config) {
        if (!config.name) {
            throw new Error('Invalid resource name');
        }
        var dataProvider = config.dataProvider, isInjected = typeof dataProvider === 'string';
        if (isInjected) {
            dataProvider = $injector.get(dataProvider);
        }
        if (dataProvider instanceof DataProviderInterface === false) {
            throw new Error('Invalid data provider');
        }
        utils.merge(this, config);
        this.dataProvider = dataProvider;
    }
    return RepositoryConfig;
}
handbag.provide('RepositoryConfig', RepositoryConfigFactory);
RepositoryConfigFactory.$inject = [
    '$injector',
    'DataProviderInterface',
    'utils'
];
function RepositoryContextFactory(EventEmitter, utils, ContextQueryBuilder, $window) {
    function RepositoryContext(name) {
        EventEmitter.call(this);
        var query = ContextQueryBuilder.create(), boundUpdateFn = update.bind(this);
        this.name = name;
        this.data = null;
        this.error = null;
        this.query = query;
        query.on('update', boundUpdateFn);
    }
    function initialize(filters, sorting, pagination) {
        var query = this.query;
        query.$$filters.setState(filters);
        query.$$sorting.setState(sorting);
        query.$$pagination.setState(pagination);
    }
    function setTimeout(timeout) {
        this.updateTimeout = timeout;
    }
    function filters() {
        return this.query.$$filters;
    }
    function sorting() {
        return this.query.$$sorting;
    }
    function pagination() {
        return this.query.$$pagination;
    }
    function update() {
        if (this.updateTimeout > 0) {
            if (this.$$lastUpdate) {
                $window.clearTimeout(this.$$lastUpdate);
            }
            this.$$lastUpdate = $window.setTimeout(triggerUpdate.bind(this), this.updateTimeout);
        } else {
            triggerUpdate.call(this);
        }
    }
    function triggerUpdate() {
        this.emit('update', this);
    }
    function setData(dataTransferObject) {
        if (!dataTransferObject || typeof dataTransferObject !== 'object' || 'data' in dataTransferObject === false) {
            this.setError(this.INVALID_RESPONSE);
            return false;
        }
        var page = dataTransferObject.meta;
        if (page) {
            this.query.$$pagination.setState({
                count: page.count || null,
                currentPage: page.currentPage || null,
                itemsPerPage: page.itemsPerPage || null
            });
        }
        this.data = dataTransferObject.data || null;
        this.error = null;
        this.emit('change', this.data);
        this.emit('done', {
            data: this.data,
            error: false
        });
        return true;
    }
    function setError(error) {
        this.error = error;
        this.emit('error', error);
        this.emit('done', {
            data: null,
            error: error
        });
    }
    function reset() {
        this.query.reset();
    }
    function toJSON() {
        return this.query.toJSON();
    }
    var prototype = {
        INVALID_RESPONSE: 'INVALID_RESPONSE',
        initialize: initialize,
        filters: filters,
        sorting: sorting,
        pagination: pagination,
        update: update,
        reset: reset,
        toJSON: toJSON,
        setData: setData,
        setError: setError,
        setTimeout: setTimeout
    };
    utils.inherits(RepositoryContext, EventEmitter, prototype);
    return RepositoryContext;
}
handbag.provide('RepositoryContext', RepositoryContextFactory);
RepositoryContextFactory.$inject = [
    'EventEmitter',
    'utils',
    'ContextQueryBuilder',
    '$window'
];
function RepositoryFilterFactory(EventEmitter, utils) {
    function RepositoryFilter() {
        EventEmitter.call(this);
        this.$$filters = [];
    }
    RepositoryFilter.create = function (filters) {
        var instance = new RepositoryFilter();
        instance.setState(filters);
        return instance;
    };
    var operators = {
        EQ: '=',
        LT: '<',
        LTE: '<=',
        GT: '>',
        GTE: '>=',
        IN: 'in',
        ST: '^',
        END: '$',
        LK: '~'
    };
    var operatorsArray = Object.keys(operators).map(function (key) {
        return operators[key];
    });
    var prototype = {
        setState: addFilterList,
        toJSON: toJSON,
        toArray: toArray,
        where: where,
        getFilter: getFilter,
        remove: removeFilter,
        reset: reset,
        operators: operators
    };
    utils.merge(prototype, operators);
    utils.merge(RepositoryFilter, operators);
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
        var current, i, max;
        if (typeof filter === 'object' && filter !== null && 'name' in filter && 'value' in filter && 'operator' in filter) {
            for (i = 0, max = this.$$filters.length; i < max; i++) {
                current = this.$$filters[i];
                if (current.name === filter.name && current.operator === filter.operator) {
                    current.operator = filter.operator;
                    current.value = filter.value;
                    return;
                }
            }
            this.$$filters.push(filter);
        }
    }
    function addFilterList(filters) {
        if (!Array.isArray(filters))
            return;
        filters.forEach(addFilter, this);
    }
    function where(name, operator, value) {
        if (arguments.length === 2) {
            value = operator;
            operator = operators.EQ;
        }
        if (operatorsArray.indexOf(operator) === -1)
            return;
        addFilter.call(this, [
            name,
            operator,
            value
        ]);
        this.emit('update', this);
    }
    function getFilter(name) {
        var found;
        this.$$filters.some(function (filter) {
            if (filter.name === name) {
                found = filter;
                return true;
            }
        });
        return found;
    }
    function reset() {
        this.$$filters = [];
    }
    function removeFilter(name) {
        if (!name)
            return;
        this.$$filters = this.$$filters.filter(function (filter) {
            return filter.name !== name;
        });
    }
    utils.inherits(RepositoryFilter, EventEmitter, prototype);
    return RepositoryFilter;
}
handbag.provide('RepositoryFilter', RepositoryFilterFactory);
RepositoryFilterFactory.$inject = [
    'EventEmitter',
    'utils'
];
function RepositoryManagerProvider($provide) {
    var defaultConfig = {};
    function RepositoryManagerFactory(Repository, RepositoryConfig) {
        var repositoryMap = {};
        var repositoryManager = {
            addRepository: addRepository,
            hasRepository: hasRepository,
            getRepository: getRepository,
            executeQuery: executeQuery,
            suffix: 'Repository'
        };
        function addRepository(config, properties) {
            if (!config || config instanceof RepositoryConfig === false) {
                throw new Error('Invalid repository definition');
            }
            var name = config.name;
            if (repositoryMap.hasOwnProperty(name)) {
                throw new Error('Repository ' + name + ' already registed');
            }
            var ctor, instance;
            if (properties) {
                ctor = Repository.extend(properties);
                instance = new ctor(config);
            } else {
                instance = new Repository(config);
            }
            repositoryMap[name] = instance;
            if (config.autoRegister === true || defaultConfig.autoRegister && config.autoRegister !== false) {
                $provide.value(name + repositoryManager.suffix, instance);
            }
            return instance;
        }
        function getRepository(name) {
            if (name in repositoryMap === false)
                return null;
            return repositoryMap[name];
        }
        function hasRepository(name) {
            return name in repositoryMap;
        }
        function executeQuery(queryBuilder) {
            var repository = queryBuilder.getRepository();
            if (!this.hasRepository(repository)) {
                throw new Error('Invalid repository');
            }
            return this.getRepository(repository).findAll(queryBuilder);
        }
        return repositoryManager;
    }
    this.$get = [
        'Repository',
        'RepositoryConfig',
        'QueryBuilder',
        RepositoryManagerFactory
    ];
    this.config = function (values) {
        if (!arguments.length)
            return defaultConfig;
        angular.extend(defaultConfig, values);
    };
}
handbag.provide('RepositoryManager', RepositoryManagerProvider);
RepositoryManagerProvider.$inject = ['$provide'];
function RepositoryPaginationFactory(utils, EventEmitter) {
    var paginationDefaults = {
        count: undefined,
        currentPage: undefined,
        itemsPerPage: undefined
    };
    function RepositoryPagination() {
        EventEmitter.call(this);
        this.reset();
    }
    RepositoryPagination.defaults = paginationDefaults;
    RepositoryPagination.create = function (state) {
        var instance = new RepositoryPagination();
        if (state) {
            instance.setState(state);
        }
        return instance;
    };
    var prototype = {
        reset: function () {
            utils.merge(this, RepositoryPagination.defaults);
            this.pageCount = 0;
        },
        next: function () {
            if (!this.hasNext())
                return false;
            return goToPage.call(this, this.currentPage + 1);
        },
        previous: function () {
            if (!this.hasPrevious())
                return false;
            return goToPage.call(this, this.currentPage - 1);
        },
        first: function () {
            if (!this.hasPrevious())
                return false;
            return goToPage.call(this, 1);
        },
        last: function () {
            if (!this.hasNext())
                return false;
            return goToPage.call(this, this.pageCount);
        },
        goToPage: function (page, limit) {
            if (limit) {
                this.itemsPerPage = Number(limit);
                this.setCount(this.count);
            }
            return goToPage.call(this, page);
        },
        hasNext: function () {
            return this.currentPage < this.pageCount;
        },
        hasPrevious: function () {
            return this.currentPage > 1;
        },
        setCount: function (count) {
            this.count = count;
            this.pageCount = this.itemsPerPage > 0 ? Math.ceil(this.count / this.itemsPerPage) : 0;
            return this;
        },
        toJSON: function () {
            var state = {};
            if (this.count !== undefined) {
                state.count = this.count;
            }
            if (this.currentPage !== undefined) {
                state.currentPage = this.currentPage;
            }
            if (this.itemsPerPage !== undefined) {
                state.itemsPerPage = this.itemsPerPage;
            }
            return state;
        },
        setState: function (state) {
            if (!state || typeof state !== 'object')
                return;
            var page, limit, count;
            if ('itemsPerPage' in state) {
                limit = Number(state.itemsPerPage) | 0;
                this.itemsPerPage = limit > 0 ? limit : 0;
            }
            if ('count' in state) {
                count = Number(state.count) | 0;
                this.setCount(count > 0 ? count : 0);
            }
            if ('currentPage' in state) {
                page = Number(state.currentPage) | 0;
                this.currentPage = page > 0 ? page : 1;
            }
        }
    };
    function goToPage(page) {
        if (!page)
            return false;
        this.currentPage = page;
        this.emit('update', this);
        return true;
    }
    utils.inherits(RepositoryPagination, EventEmitter, prototype);
    return RepositoryPagination;
}
handbag.provide('RepositoryPagination', RepositoryPaginationFactory);
RepositoryPaginationFactory.$inject = [
    'utils',
    'EventEmitter'
];
function RepositoryQueryBuilderFactory($injector, utils, QueryBuilder, EventEmitter) {
    function RepositoryQueryBuilder() {
        QueryBuilder.call(this);
        EventEmitter.call(this);
        function update() {
            var args = ['update'];
            args.push.apply(args, arguments);
            this.emit.apply(this, args);
        }
        var boundUpdateFn = update.bind(this);
        this.$$filters.on('update', boundUpdateFn);
        this.$$sorting.on('update', boundUpdateFn);
        this.$$pagination.on('update', boundUpdateFn);
    }
    function exec() {
        var RepositoryManager = $injector.get('RepositoryManager');
        return RepositoryManager.executeQuery(this);
    }
    function Dummy() {
    }
    Dummy.prototype = QueryBuilder.prototype;
    var prototype = new Dummy();
    utils.merge(prototype, EventEmitter.prototype);
    prototype.exec = exec;
    RepositoryQueryBuilder.prototype = prototype;
    RepositoryQueryBuilder.prototype.constructor = RepositoryQueryBuilder;
    RepositoryQueryBuilder.create = function () {
        return new RepositoryQueryBuilder();
    };
    return RepositoryQueryBuilder;
}
handbag.provide('RepositoryQueryBuilder', RepositoryQueryBuilderFactory);
RepositoryQueryBuilderFactory.$inject = [
    '$injector',
    'utils',
    'QueryBuilder',
    'EventEmitter'
];
function RepositorySortingFactory(EventEmitter, utils) {
    function RepositorySorting() {
        this.$$sorting = [];
    }
    RepositorySorting.create = function (sorting) {
        var instance = new RepositorySorting();
        instance.setState(sorting);
        return instance;
    };
    var directions = {
        ASC: 'asc',
        DESC: 'desc'
    };
    var prototype = {
        setState: addSortingList,
        sort: sort,
        invert: invert,
        remove: removeSorting,
        reset: reset,
        toJSON: toJSON,
        toArray: toArray,
        getSorting: getSorting,
        hasSorting: hasSorting,
        directions: directions
    };
    utils.merge(prototype, directions);
    utils.merge(RepositorySorting, directions);
    function toJSON() {
        return this.$$sorting.slice();
    }
    function toArray() {
        return this.$$sorting.map(function (sort) {
            return [
                sort.name,
                sort.direction
            ];
        });
    }
    function addSorting(sorting) {
        if (Array.isArray(sorting)) {
            sorting = {
                name: sorting[0],
                direction: sorting[1]
            };
        }
        if (typeof sorting === 'object' && sorting !== null && 'name' in sorting && 'direction' in sorting) {
            if (this.hasSorting(sorting.name)) {
                this.invert(sorting.name);
            } else {
                this.$$sorting.push(sorting);
            }
        }
    }
    function sort(name, direction) {
        if (arguments.length === 1) {
            direction = directions.ASC;
        }
        addSorting.call(this, [
            name,
            direction
        ]);
        this.emit('update', this);
    }
    function invert(name) {
        this.$$sorting.some(function (sort) {
            if (sort.name === name) {
                sort.direction = sort.direction === directions.ASC ? directions.DESC : directions.ASC;
                return true;
            }
        });
    }
    function removeSorting(name) {
        if (!name)
            return;
        this.$$sorting = this.$$sorting.filter(function (sort) {
            return sort.name !== name;
        });
    }
    function getSorting(name) {
        var found = null;
        this.$$sorting.some(function (sort) {
            if (sort.name === name) {
                found = sort;
                return true;
            }
        });
        return found;
    }
    function hasSorting(name) {
        return this.$$sorting.some(function (sort) {
            return sort.name === name;
        });
    }
    function reset() {
        this.$$sorting = [];
    }
    function addSortingList(sortingList) {
        if (!Array.isArray(sortingList))
            return;
        sortingList.forEach(addSorting, this);
    }
    utils.inherits(RepositorySorting, EventEmitter, prototype);
    return RepositorySorting;
}
handbag.provide('RepositorySorting', RepositorySortingFactory);
RepositorySortingFactory.$inject = [
    'EventEmitter',
    'utils'
];
function utilsFactory() {
    var utils = {
        inherits: inherits,
        extend: extend,
        merge: merge
    };
    return utils;
    function merge(destination, source) {
        Object.keys(source).forEach(function (key) {
            destination[key] = source[key];
        });
        return destination;
    }
    function inherits(NewClass, SuperClass, attributes) {
        var prototype = SuperClass.prototype, childPrototype = Object.create(prototype);
        if (attributes) {
            Object.keys(attributes).forEach(function (key) {
                childPrototype[key] = attributes[key];
            });
        }
        childPrototype.__super__ = SuperClass.prototype;
        NewClass.prototype = childPrototype;
        NewClass.prototype.constructor = NewClass;
    }
    function extend(SuperClass, prototype) {
        function SubClass() {
            SuperClass.apply(this, arguments);
        }
        inherits(SubClass, SuperClass, prototype);
        return SubClass;
    }
}
handbag.provide('utils', utilsFactory);

}(window.handbag));
