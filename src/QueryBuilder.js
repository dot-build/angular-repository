/**
 * @factory QueryBuilder
 */
function QueryBuilderFactory(RepositoryFilter, RepositorySorting, RepositoryPagination) {
	function QueryBuilder() {
		this.$$filters = RepositoryFilter.create();
		this.$$sorting = RepositorySorting.create();
		this.$$page = RepositoryPagination.create();
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

	function page(page, limit) {
		this.$$page.goToPage(page, limit);
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
		page: page,
		toJSON: toJSON
	};

	QueryBuilder.prototype = prototype;
	QueryBuilder.create = create;

	QueryBuilder.operator = prototype.operator = RepositoryFilter.prototype.operators;
	QueryBuilder.direction = prototype.direction = RepositorySorting.prototype.directions;

	return QueryBuilder;
}
