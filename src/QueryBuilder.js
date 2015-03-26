/**
 * @factory QueryBuilder
 */
function QueryBuilderFactory(RepositoryFilter, RepositorySorting, RepositoryPagination, utils) {
	function QueryBuilder() {
		this.$$filters = RepositoryFilter.create();
		this.$$sorting = RepositorySorting.create();
		this.$$pagination = RepositoryPagination.create();
		this.$$repository = '';
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
