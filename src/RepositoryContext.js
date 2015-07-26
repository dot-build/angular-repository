/**
 * @factory RepositoryContext
 */
function RepositoryContextFactory(EventEmitter, utils, ContextQueryBuilder, $window) {
	function RepositoryContext(name) {
		EventEmitter.call(this);

		var query = ContextQueryBuilder.create(),
			boundUpdateFn = update.bind(this);

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
