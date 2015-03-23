/**
 * @factory RepositoryContext
 */
function RepositoryContextFactory(EventEmitter, utils, RepositoryFilter, RepositorySorting, RepositoryPagination) {
	function RepositoryContext(name) {
		this.name = name;
		EventEmitter.call(this);
	}

	function initialize(filters, sorting, pagination) {
		var boundUpdateFn = update.bind(this);

		this.$$filters = RepositoryFilter.create(filters);
		this.$$sorting = RepositorySorting.create(sorting);
		this.$$pagination = RepositoryPagination.create(pagination);

		this.$$filters.on('update', boundUpdateFn);
		this.$$sorting.on('update', boundUpdateFn);
		this.$$pagination.on('update', boundUpdateFn);

		this.data = null;
		this.error = null;
	}

	function filters() {
		return this.$$filters;
	}

	function sorting() {
		return this.$$sorting;
	}

	function pagination() {
		return this.$$pagination;
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
			this.$$pagination.setState({
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

	var prototype = {
		INVALID_RESPONSE: 'INVALID_RESPONSE',

		$$filters: null,
		$$pagination: null,
		$$sorting: null,

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
