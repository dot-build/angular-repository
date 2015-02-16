/**
 * @factory RepositoryContextPagination
 */
function RepositoryContextPaginationFactory(utils, EventEmitter) {
	var paginationDefaults = {
		count: 0,
		currentPage: 1,
		itemsPerPage: 10
	};

	function RepositoryContextPagination() {
		EventEmitter.call(this);
		this.reset();
	}

	RepositoryContextPagination.defaults = paginationDefaults;

	RepositoryContextPagination.create = function(state) {
		var instance = new RepositoryContextPagination();
		instance.setState(state);

		return instance;
	}

	var prototype = {
		reset: function() {
			utils.merge(this, RepositoryContextPagination.defaults);
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
			this.pageCount = Math.ceil(this.count / this.itemsPerPage);
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

			if ('itemsPerPage' in state) {
				this.itemsPerPage = Number(state.itemsPerPage);
			}

			if ('count' in state) {
				this.setCount(Number(state.count));
			}

			if ('currentPage' in state) {
				this.currentPage = Number(state.currentPage);
			}
		}
	};

	function goToPage(page) {
		if (!page) return false;

		this.currentPage = page;
		this.emit('update', this);
		return true;
	}

	utils.inherits(RepositoryContextPagination, EventEmitter, prototype);

	return RepositoryContextPagination;
}
