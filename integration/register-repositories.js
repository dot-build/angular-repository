angular.module('integration').run(function(RepositoryManager, RepositoryConfig, DefaultDataProvider) {
	var productConfig = new RepositoryConfig({
		name: 'Product',
		endpoint: '/products',
		dataProvider: DefaultDataProvider
	});

	RepositoryManager.addRepository(productConfig);
});
