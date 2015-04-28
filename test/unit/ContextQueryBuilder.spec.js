describe('ContextQueryBuilder', function() {
	beforeEach(module('repository'));

	describe('#constructor()', function() {
		it('should proxy "update" events from filters, pagination or sorting instances', inject(function(ContextQueryBuilder) {
			var qb = new ContextQueryBuilder();
			var eventSpy = jasmine.createSpy('update');

			qb.on('update', eventSpy);

			qb.$$filters.emit('update', 'foo');
			expect(eventSpy).toHaveBeenCalledWith('foo');

			eventSpy.calls.reset();
			qb.$$sorting.emit('update', 'bar');
			expect(eventSpy).toHaveBeenCalledWith('bar');

			eventSpy.calls.reset();
			qb.$$pagination.emit('update', 'baz');
			expect(eventSpy).toHaveBeenCalledWith('baz');
		}));
	});

	// extends QueryBuilder with methods to queue a sequence of filters on contexts
	describe('#queue()', function() {
		it('should pause the events to avoid multiple "update" triggerings', inject(function(ContextQueryBuilder, QueryBuilder) {
			var qb = new ContextQueryBuilder();
			var eventSpy = jasmine.createSpy('queue');

			qb.on('update', eventSpy);

			qb.queue()
				.where('age', QueryBuilder.LT, 20)
				.where('name', 'John');

			expect(eventSpy.calls.count()).toBe(0);
		}));
	});

	describe('#exec', function() {
		it('should restore the events and emit an "update" event', inject(function(ContextQueryBuilder, QueryBuilder) {
			var qb = new ContextQueryBuilder();
			var eventSpy = jasmine.createSpy('exec');

			qb.on('update', eventSpy);

			qb.queue()
				.where('age', QueryBuilder.LT, 20)
				.where('name', 'John')
				.exec();

			expect(eventSpy.calls.count()).toBe(1);
		}));
	});
});
