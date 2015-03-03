angular.module('integration').run(function(RepositoryManager, RepositoryConfig, DefaultDataProvider) {
	var productConfig = new RepositoryConfig({
		name: 'Product',
		dataProvider: DefaultDataProvider
	});

	RepositoryManager.addRepository(productConfig);
});
