describe('EntityManager in a controller', function() {
	/**
	 * Using: Person, PeopleRepository
	 * The controller injects the EntityManager, then asks for a repository.
	 * The repository is created and returned
	 * The controller asks the repository for a context using a unique name
	 * The repository returns the context, or returns null if it was not found
	 * If not found, the controller asks the repository for a new context using the same name
	 * With the context ready, initialize default sorting/default filters
	 * --
	 * The view-model is now ready to start serching in that context. Search for a person named "John"
	 *
	 */
	describe('', function() {

	});
});
