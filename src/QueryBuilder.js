/**
 * @factory QueryBuilder
 */
function QueryBuilderFactory(RepositoryContextFilter, RepositoryContextSorting, RepositoryContextPagination) {
	function QueryBuilder() {
		this.$$filters = RepositoryContextFilter.create();
		this.$$sorting = RepositoryContextSorting.create();
		this.$$page = RepositoryContextPagination.create();
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
		this.$$page.goToPage(~~(skipValue / this.$$page.itemsPerPage) + 1);
		return this;
	}

	function limit(limitValue) {
		this.$$page.setState({
			itemsPerPage: limitValue
		});
		return this;
	}

	function toJSON() {
		return {
			filters: this.$$filters.toJSON(),
			pagination: this.$$page.toJSON(),
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
		toJSON: toJSON
	};

	QueryBuilder.prototype = prototype;
	QueryBuilder.create = create;

	QueryBuilder.operator = prototype.operator = RepositoryContextFilter.prototype.operators;
	QueryBuilder.direction = prototype.direction = RepositoryContextSorting.prototype.directions;

	return QueryBuilder;
}
