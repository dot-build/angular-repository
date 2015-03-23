/**
 * @factory RepositoryPagination
 */
function RepositoryPaginationFactory(utils, EventEmitter) {
	var paginationDefaults = {
		count: 0,
		currentPage: 1,
		itemsPerPage: 10
	};

	function RepositoryPagination() {
		EventEmitter.call(this);
		this.reset();
	}

	RepositoryPagination.defaults = paginationDefaults;

	RepositoryPagination.create = function(state) {
		var instance = new RepositoryPagination();

		if (state) {
			instance.setState(state);
		}

		return instance;
	};

	var prototype = {
		reset: function() {
			utils.merge(this, RepositoryPagination.defaults);
			this.pageCount = 0;
		},

		next: function() {
			if (!this.hasNext()) return false;
			return goToPage.call(this, this.currentPage + 1);
		},

		previous: function() {
			if (!this.hasPrevious()) return false;
			return goToPage.call(this, this.currentPage - 1);
		},

		first: function() {
			if (!this.hasPrevious()) return false;
			return goToPage.call(this, 1);
		},

		last: function() {
			if (!this.hasNext()) return false;
			return goToPage.call(this, this.pageCount);
		},

		goToPage: function(page, limit) {
			if (limit) {
				this.itemsPerPage = Number(limit);

				// call setCount() to apply pageCount calculation
				this.setCount(this.count);
			}

			return goToPage.call(this, page);
		},

		hasNext: function() {
			return (this.currentPage < this.pageCount);
		},

		hasPrevious: function() {
			return (this.currentPage > 1);
		},

		setCount: function(count) {
			this.count = count;
			this.pageCount = this.itemsPerPage > 0 ? Math.ceil(this.count / this.itemsPerPage) : 0;
			return this;
		},

		toJSON: function() {
			return {
				count: this.count,
				currentPage: this.currentPage,
				itemsPerPage: this.itemsPerPage
			};
		},

		setState: function(state) {
			if (!state || typeof state !== 'object') return;

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
		if (!page) return false;

		this.currentPage = page;
		this.emit('update', this);
		return true;
	}

	utils.inherits(RepositoryPagination, EventEmitter, prototype);

	return RepositoryPagination;
}
