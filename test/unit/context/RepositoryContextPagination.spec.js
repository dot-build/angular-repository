describe('RepositoryContextPagination', function() {
	var instance;

	beforeEach(module('repository'));

	beforeEach(inject(function(RepositoryContextPagination) {
		instance = new RepositoryContextPagination();
	}));

	describe('::create', function() {
		it('should create a RepositoryContextPagination instance and set the state', inject(function(RepositoryContextPagination) {
			var paginationState = {
				currentPage: 1,
				itemsPerPage: 10,
				count: 100
			};

			var instance = RepositoryContextPagination.create(paginationState);

			expect(instance instanceof RepositoryContextPagination).toBe(true);
			expect(instance.count).toBe(paginationState.count);
			expect(instance.currentPage).toBe(paginationState.currentPage);
			expect(instance.itemsPerPage).toBe(paginationState.itemsPerPage);
		}));

		it('should create a RepositoryContextPagination instance and set the DEFAULT state', inject(function(RepositoryContextPagination) {
			var instance = RepositoryContextPagination.create();
			var defaults = RepositoryContextPagination.defaults;

			expect(instance instanceof RepositoryContextPagination).toBe(true);
			expect(instance.count).toBe(0);
			expect(instance.currentPage).toBe(defaults.currentPage);
			expect(instance.itemsPerPage).toBe(defaults.itemsPerPage);
		}));
	});

	describe('#constructor', function() {
		it('should be a subclass of EventEmitter', inject(function(EventEmitter) {
			expect(instance instanceof EventEmitter).toBe(true);
		}));
	});

	describe('#toJSON()', function() {
		it('should return an object with `count`, `currentPage` and `itemsPerPage` properties', function() {
			var state = instance.toJSON();

			expect(state.count).toBe(0);
			expect(state.currentPage).toBe(1);
			expect(state.itemsPerPage).toBe(10);
		});
	});

	describe('#setState(Object state)', function() {
		it('should update current pagination state (count, currentPage, itemsPerPage and pageCount)', function() {
			var expected = {
				itemsPerPage: 20,
				count: 100,
				currentPage: 2
			};

			instance.setState(expected);

			expect(instance.itemsPerPage).toBe(expected.itemsPerPage);
			expect(instance.currentPage).toBe(expected.currentPage);
			expect(instance.count).toBe(expected.count);
			expect(instance.pageCount).toBe(5);
		});

		it('should do nothing if a invalid state object is specified', function() {
			var oldState = instance.toJSON();
			instance.setState(null);

			var newState = instance.toJSON();
			expect(newState).toEqual(oldState);
		});

		it('should apply a partial state', function() {
			var partialState;

			partialState = {
				itemsPerPage: 5
			};

			instance.setState(partialState);
			expect(instance.itemsPerPage).toBe(5);

			partialState = {
				count: 100
			};

			instance.setState(partialState);
			expect(instance.itemsPerPage).toBe(5);
			expect(instance.count).toBe(100);
			expect(instance.pageCount).toBe(20);
		});

		it('should handle zeros or invalid values', function() {
			var state = {
				count: -1,
				itemsPerPage: 0,
				currentPage: 'hu3'
			};

			instance.setState(state);
			expect(instance.itemsPerPage).toBe(0);
			expect(instance.pageCount).toBe(0);
			expect(instance.count).toBe(0);
			expect(instance.currentPage).toBe(1);
		});
	});

	describe('#pageCount', function() {
		it('should have the current page count', function() {
			instance.setState({
				count: 20,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.pageCount).toBe(2);
		});
	});

	describe('#hasPrevious()', function() {
		it('should return true if a previous page is available', function() {
			instance.setState({
				count: 20,
				currentPage: 2,
				itemsPerPage: 10
			});

			expect(instance.hasPrevious).not.toBe(undefined);
			expect(instance.hasPrevious()).toBe(true);
		});

		it('should return false when the first page is reached', function() {
			instance.setState({
				count: 20,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.hasPrevious()).toBe(false);
		});
	});

	describe('#hasNext()', function() {
		it('should return true if a next page is available', function() {
			instance.setState({
				count: 20,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.hasNext).not.toBe(undefined);
			expect(instance.hasNext()).toBe(true);
		});

		it('should return false when the last page is reached', function() {
			instance.setState({
				count: 20,
				currentPage: 2,
				itemsPerPage: 10
			});

			expect(instance.hasNext()).toBe(false);
		});
	});

	describe('#previous()', function() {
		it('should go to previous page, if available, and return true if succeed', function() {
			instance.setState({
				count: 50,
				currentPage: 2,
				itemsPerPage: 10
			});

			expect(instance.previous).not.toBe(undefined);
			expect(instance.previous()).toBe(true);

			expect(instance.currentPage).toBe(1);
		});

		it('should NOT change the page if is already on first page, returning false', function() {
			instance.setState({
				count: 50,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.previous()).toBe(false);
			expect(instance.currentPage).toBe(1);
		});
	});

	describe('#next()', function() {
		it('should go to previous page, if available, and return true if succeed', function() {
			instance.setState({
				count: 20,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.next).not.toBe(undefined);
			expect(instance.next()).toBe(true);

			expect(instance.currentPage).toBe(2);
		});

		it('should NOT change the page if is already on last page, returning false', function() {
			instance.setState({
				count: 20,
				currentPage: 2,
				itemsPerPage: 10
			});

			expect(instance.next()).toBe(false);
			expect(instance.currentPage).toBe(2);
		});
	});

	describe('#first()', function() {
		it('should go to first page and return true if succeed', function() {
			instance.setState({
				count: 20,
				currentPage: 2,
				itemsPerPage: 10
			});

			expect(instance.first).not.toBe(undefined);
			expect(instance.first()).toBe(true);

			expect(instance.currentPage).toBe(1);
		});

		it('should NOT change the page if is already on first page, returning false', function() {
			instance.setState({
				count: 20,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.first()).toBe(false);
			expect(instance.currentPage).toBe(1);
		});
	});

	describe('#last()', function() {
		it('should go to last page and return true if succeed', function() {
			instance.setState({
				count: 20,
				currentPage: 1,
				itemsPerPage: 10
			});

			expect(instance.last).not.toBe(undefined);
			expect(instance.last()).toBe(true);

			expect(instance.currentPage).toBe(2);
		});

		it('should NOT change the page if is already on last page, returning false', function() {
			instance.setState({
				count: 20,
				currentPage: 2,
				itemsPerPage: 10
			});

			expect(instance.last()).toBe(false);
			expect(instance.currentPage).toBe(2);
		});
	});

	describe('#reset()', function() {
		it('should restore the default pagination state from RepositoryContextPagination.defaults', inject(function(RepositoryContextPagination) {
			var defaultState = RepositoryContextPagination.defaults;

			var newState = {
				currentPage: 2,
				itemsPerPage: 15,
				count: 30
			};

			instance.setState(newState);
			expect(instance.toJSON()).toEqual(newState);

			instance.reset();
			expect(instance.toJSON()).toEqual(defaultState);
		}));
	});

	describe('#goToPage(Number page, Number [limit])', function() {
		it('should navigate to a given page and emit the "update" event', function() {
			var spy = jasmine.createSpy('update');

			instance.on('update', spy);

			instance.setState({
				currentPage: 1,
				itemsPerPage: 15,
				count: 30
			});

			instance.goToPage(2);

			expect(instance.currentPage).toBe(2);
			expect(instance.itemsPerPage).toBe(15);

			expect(spy.calls.count()).toBe(1);
		});

		it('should navigate to a given page and update the limit', function() {
			instance.setState({
				currentPage: 1,
				itemsPerPage: 15,
				count: 30
			});

			expect(instance.currentPage).toBe(1);
			expect(instance.pageCount).toBe(2);
			expect(instance.itemsPerPage).toBe(15);

			instance.goToPage(2, 10);

			expect(instance.currentPage).toBe(2);
			expect(instance.pageCount).toBe(3);
			expect(instance.itemsPerPage).toBe(10);
		});
	});

});
