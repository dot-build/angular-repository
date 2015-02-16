describe('Repository', function() {
	var repository;

	function RepositoryContext() {
		this.on = jasmine.createSpy();
	}

	function ModelFactory() {
		this.getModel = jasmine.createSpy();
	}

	beforeEach(module('repository'));
	beforeEach(module({
		RepositoryContext: new RepositoryContext(),
		ModelFactory: new ModelFactory()
	}));

	beforeEach(inject(function(Repository) {
		repository = new Repository({
			endpoint: '/foo'
		});
	}));

	describe('#constructor(Object config)', function() {
		it('should save the endpoint and fetch the model class from ModelFactory', inject(function() {

		}));
	});

	describe('#getContext(String name)', function() {
		it('should return null if the context was not found', inject(function() {
			var context = repository.getContext('context');
			expect(context).toBe(null);
		}));

		it('should return a context that was created before with the given name', inject(function(RepositoryContext) {
			var context = repository.createContext('context');
			var foundContext = repository.getContext('context');
			expect(foundContext).not.toBe(null);
			expect(foundContext).toBe(context);
			expect(foundContext instanceof RepositoryContext).toBe(true);
		}));
	});

	describe('#createContext(String name)', function() {
		it('should create a context with a given name', inject(function(RepositoryContext) {
			var context = repository.createContext('context');
			expect(context).not.toBeFalsy();
			expect(context instanceof RepositoryContext).toBe(true);
		}));
	});

	describe('#removeContext(String name)', function() {
		it('should destroy a previously created context', inject(function(RepositoryContext) {
			var context = repository.createContext('context');
			expect(context instanceof RepositoryContext).toBe(true);

			repository.removeContext('context');
			context = repository.getContext('context');
			expect(context).toBe(null);
		}));
	});

	describe('#updateContext(RepositoryContext context)', function() {
		it('should use the query parameters from a context to fetch a new set of items and update the context', inject(function(Repository, RepositoryContext) {
			var context = new RepositoryContext();
		}));
	});
});
