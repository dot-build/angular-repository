/**
 * @factory RepositoryContext
 */
function RepositoryContextFactory(EventEmitter, utils, QueryBuilder) {
	function RepositoryContext(name) {
		EventEmitter.call(this);

		var query = QueryBuilder.create(),
			boundUpdateFn = update.bind(this);

		this.name = name;
		this.data = null;
		this.error = null;
		this.query = query;

		// the QueryBuilder instance won't trigger itself the events, this is a context-only thing
		query.$$filters.on('update', boundUpdateFn);
		query.$$sorting.on('update', boundUpdateFn);
		query.$$pagination.on('update', boundUpdateFn);
	}

	function initialize(filters, sorting, pagination) {
		var query = this.query;

		query.$$filters.setState(filters);
		query.$$sorting.setState(sorting);
		query.$$pagination.setState(pagination);
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

		return true;
	}

	function setError(error) {
		this.error = error;
		this.emit('error', error);
	}

	function reset() {
		this.query.$$filters.reset();
		this.query.$$sorting.reset();
		this.query.$$pagination.reset();
	}

	function toJSON() {
		return {
			filters: this.query.$$filters.toJSON(),
			pagination: this.query.$$pagination.toJSON(),
			sorting: this.query.$$sorting.toJSON()
		};
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
		setError: setError
	};

	utils.inherits(RepositoryContext, EventEmitter, prototype);

	return RepositoryContext;
}
