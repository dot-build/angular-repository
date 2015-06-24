describe('RepositoryQueryBuilder', function() {
	beforeEach(module('repository'));

	describe('#constructor()', function() {
		it('should extend QueryBuilder', inject(function (RepositoryQueryBuilder, QueryBuilder) {
			var qb = new RepositoryQueryBuilder();
			expect(qb instanceof RepositoryQueryBuilder).toBe(true);
			expect(qb instanceof QueryBuilder).toBe(true);
		}));
	});

	// extends QueryBuilder with methods to queue a sequence of filters on contexts
	describe('#exec', function() {
		it('should execute the query in the bound repository', inject(function(RepositoryQueryBuilder, RepositoryManager) {
			spyOn(RepositoryManager, 'executeQuery');
			var qb = new RepositoryQueryBuilder();
			qb.exec();
			expect(RepositoryManager.executeQuery).toHaveBeenCalledWith(qb);
		}));
	});
});
