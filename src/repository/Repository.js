/**
 * @factory Repository
 */
function RepositoryFactory(EventEmitter, utils, RepositoryContext) {

	function Repository(config) {
		EventEmitter.call(this);

		this.contexts = {};
		this.endpoint = config.endpoint;
	}

	var prototype = {
		createContext: createContext,
		removeContext: removeContext,
		getContext: getContext
	};

	function createContext(name) {
		if (name in this.contexts === false) {
			var context = new RepositoryContext(name),
				boundUpdateFn = updateContext.bind(this);

			context.on('update', boundUpdateFn);

			this.contexts[name] = context;
		}

		return this.contexts[name];
	}

	function getContext(name) {
		return (name in this.contexts) ? this.contexts[name] : null;
	}

	function updateContext(context) {
		// var repository = this;
	}

	function removeContext(name) {
		delete this.contexts[name];
	}

	utils.inherits(Repository, EventEmitter, prototype);

	return Repository;
}
