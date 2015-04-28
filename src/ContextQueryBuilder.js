/**
 * @factory ContextQueryBuilder
 */
function ContextQueryBuilderFactory(utils, QueryBuilder, EventEmitter) {
	function ContextQueryBuilder() {
		QueryBuilder.call(this);
		EventEmitter.call(this);

		function update() {
			var args = ['update'];
			args.push.apply(args, arguments);

			this.emit.apply(this, args);
		}

		var boundUpdateFn = update.bind(this);

		// the QueryBuilder instance won't trigger itself the events, this is a context-only thing
		// so we proxy the events here
		this.$$filters.on('update', boundUpdateFn);
		this.$$sorting.on('update', boundUpdateFn);
		this.$$pagination.on('update', boundUpdateFn);
	}

	function queue() {
		this.suspendEvents();
		return this;
	}

	function exec() {
		this.resumeEvents();
		this.emit('update', this);
		return this;
	}

	var prototype = {
		queue: queue,
		exec: exec
	};

	utils.merge(prototype, EventEmitter.prototype);
	utils.merge(prototype, QueryBuilder.prototype);

	ContextQueryBuilder.prototype = prototype;
	ContextQueryBuilder.prototype.constructor = ContextQueryBuilder;

	ContextQueryBuilder.create = function() {
		return new ContextQueryBuilder();
	};

	return ContextQueryBuilder;
}
