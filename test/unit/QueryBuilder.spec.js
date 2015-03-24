describe('QueryBuilder', function() {
	beforeEach(module('repository'));

	describe('::create()', function() {
		it('should return a instance of QueryBuilder', inject(function(QueryBuilder) {
			expect(QueryBuilder.create() instanceof QueryBuilder).toBe(true);
		}));
	});

	describe('#from(String repository)', function() {
		it('should select a repository where the query will be executed', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.from('FooRepository');
			expect(qb.$$repository).toBe('FooRepository');
		}));
	});

	describe('#where(name, operator, value)', function() {
		it('should add a filtering rule', inject(function(QueryBuilder, RepositoryFilter) {
			var qb = new QueryBuilder();
			qb.where('age', qb.operator.LT, 20);

			var filter = qb.$$filters.toJSON()[0];
			expect(filter.name).toBe('age');
			expect(filter.operator).toBe(RepositoryFilter.LT);
			expect(filter.value).toBe(20);
		}));
	});

	describe('#sort(name, direction)', function() {
		it('should add a sorting rule', inject(function(QueryBuilder, RepositorySorting) {
			var qb = new QueryBuilder();
			qb.sort('name', qb.direction.DESC);

			var sorting = qb.$$sorting.toJSON()[0];
			expect(sorting.name).toBe('name');
			expect(sorting.direction).toBe(RepositorySorting.DESC);
		}));
	});

	describe('#limit(Number limit)', function() {
		it('should set the page size and return the instance', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.limit(4);
			expect(qb.$$pagination.toJSON().itemsPerPage).toBe(4);
		}));
	});

	describe('#skip(Number skip)', function() {
		it('should set the search offset and return the instance', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.limit(5).skip(10);
			expect(qb.$$pagination.toJSON().currentPage).toBe(3);
		}));
	});

	describe('#page(Number page, Number [limit])', function() {
		it('should ', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.page(2, 10);

			var params = qb.$$pagination.toJSON();
			expect(params.currentPage).toBe(2);
			expect(params.itemsPerPage).toBe(10);
		}));
	});

	describe('#toJSON()', function() {
		it('should return the state in the query builder', inject(function(QueryBuilder) {
			var query = new QueryBuilder();

			var params = query
				.from('User')
				.limit(5)
				.skip(10)
				.where('name', QueryBuilder.operator.LK, 'john')
				.sort('name', QueryBuilder.direction.ASC)
				.toJSON();

			expect(params).toEqual({
				filters: [{
					name: 'name',
					operator: QueryBuilder.operator.LK,
					value: 'john'
				}],
				sorting: [{
					name: 'name',
					direction: QueryBuilder.direction.ASC
				}],
				pagination: {
					itemsPerPage: 5,
					currentPage: 3,
					count: 0
				}
			});

		}));
	});
});
