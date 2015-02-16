/**
 * @factory RepositoryContext
 */
function RepositoryContextFactory(EventEmitter, utils, RepositoryContextFilter, RepositoryContextSorting, RepositoryContextPagination) {
	function RepositoryContext(name) {
		EventEmitter.call(this);

		this.name = name;
		this.list = [];
	}

	// TODO add a method to import state values from a state object, e.g. $stateParams
	function initialize(filters, sorting, pagination) {
		var boundUpdateFn = update.bind(this);

		this.$$filters = RepositoryContextFilter.create(filters);
		this.$$sorting = RepositoryContextSorting.create(sorting);
		this.$$pagination = RepositoryContextPagination.create(pagination);

		this.$$filters.on('update', boundUpdateFn);
		this.$$sorting.on('update', boundUpdateFn);
		this.$$pagination.on('update', boundUpdateFn);
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
		// a second update is called with one already in progress
		/*if (this.updateInProgress) {
			this.needsUpdate = true;
			return;
		}

		this.updateInProgress = true;
		*/

		this.emit('update', this);
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

	/*var contextProto = {
		this.emit('filter', this);
		this.emit('sort', this);

		setItems: function(list) {
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
		}
	};*/

	var prototype = {
		initialize: initialize,
		filters: filters,
		sorting: sorting,
		pagination: pagination,
		update: update,
		reset: reset,
		toJSON: toJSON
	};

	utils.inherits(RepositoryContext, EventEmitter, prototype);

	return RepositoryContext;
}
