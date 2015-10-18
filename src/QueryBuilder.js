/**
 * @factory QueryBuilder
 */
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
	function select (model, fields) {
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
			fields = fields.map(function(field) { return model + '.' + field; });
		}

		fields.forEach(function (field) {
			if (this.$$fields.indexOf(field) === -1) {
				this.$$fields.push(field);
			}
		}, this);

		return this;
	}

	function skip(skipValue) {
		this.$$pagination.goToPage(~~(skipValue / this.$$pagination.itemsPerPage) + 1);
		return this;
	}

	function limit(limitValue) {
		this.$$pagination.setState({
			itemsPerPage: limitValue
		});
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
			sorting: this.$$sorting.toJSON(),
			fields: this.$$fields.slice()
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

	var operators = RepositoryFilter.prototype.operators,
		directions = RepositorySorting.prototype.directions;

	utils.merge(QueryBuilder, operators);
	utils.merge(QueryBuilder, directions);

	return QueryBuilder;
}
