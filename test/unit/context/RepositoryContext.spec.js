describe('RepositoryContext', function() {
	var context;

	beforeEach(module('repository'));

	beforeEach(inject(function(RepositoryContext) {
		context = new RepositoryContext();
		context.initialize();
	}));

	describe('#constructor', function() {
		it('should be a subclass of EventEmitter', inject(function(EventEmitter) {
			expect(context instanceof EventEmitter).toBe(true);
		}));
	});

	describe('#initialize(Object filters, Object sorting, Object pagination)', function() {
		it('should initialize the context with default values and objects', function() {
			expect(context.$$filters).not.toBe(undefined);
			expect(context.$$sorting).not.toBe(undefined);
			expect(context.$$pagination).not.toBe(undefined);
		});

		it('should accept default values for filtering, sorting and pagination',
			inject(function(RepositoryContextFilter, RepositoryContextSorting, RepositoryContextPagination, RepositoryContext) {
				var context = new RepositoryContext();
				var filters = [
					['name', RepositoryContextFilter.EQ, 'John'],
					['age', RepositoryContextFilter.GT, 21]
				];

				var sorting = [
					['age', RepositoryContextSorting.DESC]
				];

				var pagination = {
					page: 1,
					limit: 10
				};

				spyOn(RepositoryContextFilter, 'create').and.callThrough();
				spyOn(RepositoryContextSorting, 'create').and.callThrough();
				spyOn(RepositoryContextPagination, 'create').and.callThrough();

				context.initialize(filters, sorting, pagination);

				expect(RepositoryContextFilter.create).toHaveBeenCalledWith(filters);
				expect(RepositoryContextSorting.create).toHaveBeenCalledWith(sorting);
				expect(RepositoryContextPagination.create).toHaveBeenCalledWith(pagination);
			}));
	});

	describe('#update()', function() {
		it('should trigger the update event', function() {
			var updateSpy = jasmine.createSpy('update');

			context.on('update', updateSpy);
			context.update();

			expect(updateSpy.calls.count()).toEqual(1);
		});
	});

	describe('#filters()', function() {
		it('should give access to the Context Filter object', inject(function(RepositoryContextFilter) {
			var filters = context.filters();
			expect(filters).not.toBe(undefined);
			expect(filters instanceof RepositoryContextFilter).toBe(true);
		}));
	});

	describe('#sorting()', function() {
		it('should give access to the Context Sorting object', inject(function(RepositoryContextSorting) {
			var sorting = context.sorting();
			expect(sorting).not.toBe(undefined);
			expect(sorting instanceof RepositoryContextSorting).toBe(true);
		}));

		it('should trigger the update event if a sorting rule is applied', function() {
			var spy = jasmine.createSpy();

			context.on('update', spy);

			context.sorting().sort('name');

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('#pagination()', function() {
		it('should give access to Context Pagination object', inject(function(RepositoryContextPagination) {
			var pagination = context.pagination();
			expect(pagination).not.toBe(undefined);
			expect(pagination instanceof RepositoryContextPagination).toBe(true);
		}));

		it('should trigger the update event if the pagination changes', function() {
			var spy = jasmine.createSpy();

			var paginationState = {
				count: 20,
				itemsPerPage: 10,
				currentPage: 1
			};

			context.on('update', spy);

			var pagination = context.pagination();
			pagination.setState(pagination);
			pagination.goToPage(2);

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('#reset()', function() {
		it('should reset all the stateful objects of context', function() {
			spyOn(context.$$filters, 'reset');
			spyOn(context.$$sorting, 'reset');
			spyOn(context.$$pagination, 'reset');

			context.reset();

			expect(context.$$filters.reset).toHaveBeenCalled();
			expect(context.$$sorting.reset).toHaveBeenCalled();
			expect(context.$$pagination.reset).toHaveBeenCalled();
		});
	});

	describe('#toJSON', function() {
		it('should return an object literal with sorting, pagination and filtering state', inject(function(RepositoryContextFilter, RepositoryContextSorting, RepositoryContextPagination, RepositoryContext) {
			var filters = ['name', RepositoryContextFilter.EQ, 'Bob'];
			var pagination = {
				count: 20,
				itemsPerPage: 10,
				currentPage: 2
			};
			var sorting = ['name', RepositoryContextSorting.ASC];

			var context = new RepositoryContext();
			context.initialize([filters], [sorting], pagination);

			var state = context.toJSON(),
				stateFilters = state.filters,
				stateSorting = state.sorting,
				statePagination = state.pagination;

			expect(typeof stateFilters).toBe('object');
			expect(stateFilters[0].name).toBe(filters[0]);
			expect(stateFilters[0].operator).toBe(filters[1]);
			expect(stateFilters[0].value).toBe(filters[2]);

			expect(typeof stateSorting).toBe('object');
			expect(stateSorting[0].name).toBe(sorting[0]);
			expect(stateSorting[0].direction).toBe(sorting[1]);

			expect(typeof statePagination).toBe('object');
			expect(statePagination.count).toBe(pagination.count);
			expect(statePagination.itemsPerPage).toBe(pagination.itemsPerPage);
			expect(statePagination.currentPage).toBe(pagination.currentPage);
		}));
	});
});
