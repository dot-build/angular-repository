ddescribe('Repository', function() {
	var instance,
		ENDPOINT = '/endpoint';

	// function RepositoryContext() {
	// var self = this;
	// this.toJSON = jasmine.createSpy('toJSON');
	// this.on = jasmine.createSpy('on').and.callFake(function(event, fn) {
	// self.callback = fn;
	// });
	// }

	beforeEach(module('repository'));
	// beforeEach(module({
	// RepositoryContext: RepositoryContext
	// }));
	beforeEach(inject(function(Repository) {
		instance = new Repository({
			endpoint: ENDPOINT
		});
	}));

	describe('#constructor(Object config)', function() {
		it('should save the endpoint', inject(function() {
			expect(instance.endpoint).toBe(ENDPOINT);
		}));
	});

	describe('#createContext(String name)', function() {
		it('should create a Repository Context with a given name', inject(function(RepositoryContext) {
			var context = instance.createContext('context');
			expect(context).not.toBeFalsy();
			expect(context instanceof RepositoryContext).toBe(true);
		}));

		it('should NOT create a new context if one with the same name already exists. Return it instead', inject(function(RepositoryContext) {
			var context = instance.createContext('my-context');
			expect(context instanceof RepositoryContext).toBe(true);

			var otherContext = instance.createContext('my-context');
			expect(otherContext).toBe(context);
		}));
	});

	describe('#getContext(String name)', function() {
		it('should return null if the context was not found', function() {
			var context = instance.getContext('null-context');
			expect(context).toBe(null);
		});

		it('should return a context that was created before with the given name', inject(function(RepositoryContext) {
			var context = instance.createContext('context');
			var foundContext = instance.getContext('context');
			expect(foundContext).not.toBe(null);
			expect(foundContext).toBe(context);
			expect(foundContext instanceof RepositoryContext).toBe(true);
		}));
	});

	describe('#removeContext(String name)', function() {
		it('should destroy a previously created context', inject(function(Repository, RepositoryContext) {
			var context = instance.createContext('context');
			expect(context instanceof RepositoryContext).toBe(true);

			instance.removeContext('context');
			context = instance.getContext('context');
			expect(context).toBe(null);
		}));
	});

	describe('private updateContext(RepositoryContext context)', function() {
		it('should respond to context changes fetching a new set of items from a DataProvider and keeping the context updated', function() {
			var context = instance.createContext('context');
			var updateSpy = jasmine.createSpy('ctx-update');

			context.initialize();
			context.on('update', updateSpy);

			expect(context.list.length).toBe(0);
			context.filters().where('name', 'John');

			expect(updateSpy).toHaveBeenCalled();


		});
	});
});
