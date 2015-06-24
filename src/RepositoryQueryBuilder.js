/**
 * @factory RepositoryQueryBuilder
 */
function RepositoryQueryBuilderFactory($injector, utils, QueryBuilder, EventEmitter) {
	function RepositoryQueryBuilder() {
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

	function exec() {
		// avoids circular dependency
		var RepositoryManager = $injector.get('RepositoryManager');
		return RepositoryManager.executeQuery(this);
	}

	function Dummy() {}
	Dummy.prototype = QueryBuilder.prototype;
	var prototype = new Dummy();

	utils.merge(prototype, EventEmitter.prototype);
	prototype.exec = exec;

	RepositoryQueryBuilder.prototype = prototype;
	RepositoryQueryBuilder.prototype.constructor = RepositoryQueryBuilder;

	RepositoryQueryBuilder.create = function() {
		return new RepositoryQueryBuilder();
	};

	return RepositoryQueryBuilder;
}
