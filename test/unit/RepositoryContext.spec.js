/**
 * The context is a set of objects that store state and represent a viewpoint of a given resource
 * Each context holds pagination, sorting and filtering state that correspond to a way to see a list
 * of any resource type. These values are kept through an instance of a QueryBuilder
 */
describe('RepositoryContext', function() {
	var context, CONTEXT_NAME = 'test-context';

	beforeEach(module('repository'));

	beforeEach(inject(function(RepositoryContext) {
		context = new RepositoryContext(CONTEXT_NAME);
	}));

	describe('#constructor(String name)', function() {
		it('should initialize the instance with default properties and a query builder', inject(function(EventEmitter, ContextQueryBuilder) {
			expect(context instanceof EventEmitter).toBe(true);
			expect(context.query instanceof ContextQueryBuilder).toBe(true);
			expect(context.name).toBe(CONTEXT_NAME);
			expect(context.data).toBe(null);
			expect(context.error).toBe(null);
		}));
	});

	describe('#initialize(Object filters, Object sorting, Object pagination)', function() {
		it('should accept default values for filtering, sorting and pagination',
			inject(function(RepositoryFilter, RepositorySorting, RepositoryPagination, RepositoryContext) {
				var context = new RepositoryContext();
				var filters = [
					['name', RepositoryFilter.EQ, 'John'],
					['age', RepositoryFilter.GT, 21]
				];

				var sorting = [
					['age', RepositorySorting.DESC]
				];

				var pagination = {
					page: 1,
					limit: 10
				};

				spyOn(context.query.$$filters, 'setState').and.callThrough();
				spyOn(context.query.$$pagination, 'setState').and.callThrough();
				spyOn(context.query.$$sorting, 'setState').and.callThrough();

				context.initialize(filters, sorting, pagination);

				expect(context.query.$$filters.setState).toHaveBeenCalledWith(filters);
				expect(context.query.$$sorting.setState).toHaveBeenCalledWith(sorting);
				expect(context.query.$$pagination.setState).toHaveBeenCalledWith(pagination);
			}));
	});

	describe('#update()', function() {
		it('should trigger the update event', function() {
			var updateSpy = jasmine.createSpy('update');

			context.on('update', updateSpy);
			context.update();

			expect(updateSpy.calls.count()).toEqual(1);
		});

		it('should debounce the update event if the context has a property "updateTimeout" greater than zero', function(done) {
			context.setTimeout(5);

			expect(context.updateTimeout).toBe(5);

			var updateSpy = jasmine.createSpy('update');
			context.on('update', updateSpy);

			context.update();
			context.update();
			context.update();

			setTimeout(function() {
				expect(updateSpy.calls.count()).toEqual(1);
				done();
			}, 50);
		});
	});

	describe('#setTimeout(Number timeout)', function() {
		it('should set a property used to debounce sequencial updates', inject(function() {
			context.setTimeout(5);
			expect(context.updateTimeout).toBe(5);
		}));
	});

	describe('#filters()', function() {
		it('should give access to the Context Filter object', inject(function(RepositoryFilter) {
			var filters = context.filters();
			expect(filters).not.toBe(undefined);
			expect(filters instanceof RepositoryFilter).toBe(true);
		}));

		it('should trigger the update event if the pagination changes', function() {
			var spy = jasmine.createSpy();

			context.on('update', spy);
			var filters = context.filters();
			filters.where('name', 'value');

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('#sorting()', function() {
		it('should give access to the Context Sorting object', inject(function(RepositorySorting) {
			var sorting = context.sorting();
			expect(sorting).not.toBe(undefined);
			expect(sorting instanceof RepositorySorting).toBe(true);
		}));

		it('should trigger the update event if a sorting rule is applied', function() {
			var spy = jasmine.createSpy();

			context.on('update', spy);
			context.sorting().sort('name');

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('#pagination()', function() {
		it('should give access to Context Pagination object', inject(function(RepositoryPagination) {
			var pagination = context.pagination();
			expect(pagination).not.toBe(undefined);
			expect(pagination instanceof RepositoryPagination).toBe(true);
		}));

		it('should trigger the update event if the pagination changes', function() {
			var spy = jasmine.createSpy();

			context.on('update', spy);

			var pagination = context.pagination();
			pagination.setState(pagination);
			pagination.goToPage(2);

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('#reset()', function() {
		it('should reset the state on query builder', function() {
			spyOn(context.query, 'reset');
			context.reset();
			expect(context.query.reset).toHaveBeenCalled();
		});
	});

	describe('#toJSON()', function() {
		it('should return an object literal with sorting, pagination and filtering state', inject(function(RepositoryFilter, RepositorySorting, RepositoryPagination, RepositoryContext) {
			var filters = ['name', RepositoryFilter.EQ, 'Bob'];
			var pagination = {
				count: 20,
				itemsPerPage: 10,
				currentPage: 2
			};
			var sorting = ['name', RepositorySorting.ASC];

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

	describe('#setData(Object dto)', function() {
		it('should update the context data/state, emit "change" and "done" events and return true', function() {
			expect(context.data).toBe(null);
			expect(context.error).toBe(null);

			// a valid DTO must have a "meta" property with at least the count value
			var dto = {
				meta: {
					count: 30,
					currentPage: 1,
					itemsPerPage: 20
				},
				data: [{
					name: 'John'
				}, {
					name: 'Bob'
				}]
			};

			var onChange = jasmine.createSpy('change');
			var onDone = jasmine.createSpy('done');
			context.on('change', onChange);
			context.on('done', onDone);

			context.error = {};
			var response = context.setData(dto);

			expect(context.data).not.toBe(null);
			expect(Array.isArray(context.data)).toBe(true);
			expect(context.data.length).toBe(2);
			expect(context.data[0].name).toBe('John');
			expect(context.data[1].name).toBe('Bob');
			expect(context.error).toBe(null);
			expect(response).toBe(true);

			expect(onChange).toHaveBeenCalledWith(dto.data);
			expect(onDone).toHaveBeenCalledWith({
				data: dto.data,
				error: false
			});
		});

		it('should NOT change the context data and change the context error if the DTO format is invalid, emit "error" and return false', function() {
			// a valid DTO must have a "data" property that is applied to context

			expect(context.data).toBe(null);
			expect(context.error).toBe(null);

			var dto = {
				meta: {}
			};

			var onError = jasmine.createSpy('error');
			var onDone = jasmine.createSpy('done');
			context.on('error', onError);
			context.on('done', onDone);

			var response = context.setData(dto);
			expect(response).toBe(false);

			expect(context.data).toBe(null);
			expect(context.error).toBe(context.INVALID_RESPONSE);

			expect(onError).toHaveBeenCalledWith(context.INVALID_RESPONSE);
			expect(onDone).toHaveBeenCalledWith({
				data: null,
				error: context.INVALID_RESPONSE
			});
		});
	});

	describe('#setError(Mixed error)', function() {
		it('should set the error property with the errors of last call and emit "error" and "done" events with the errors', function() {
			expect(context.error).toBe(null);
			expect(context.data).toBe(null);

			var errors = ['An error happened'];

			var onError = jasmine.createSpy('error');
			var onDone = jasmine.createSpy('done');
			context.on('error', onError);
			context.on('done', onDone);

			context.setError(errors);

			expect(context.error).toBe(errors);
			expect(context.data).toBe(null);

			expect(onError).toHaveBeenCalledWith(errors);
			expect(onDone).toHaveBeenCalledWith({
				data: null,
				error: errors
			});
		});
	});
});
