(function(module) {
	module.config(function(RepositoryManagerProvider) {
		RepositoryManagerProvider.config({
			autoRegister: true
		});
	});

	module.run(function(RepositoryManager, RepositoryConfig, DefaultDataProvider) {
		var productConfig = new RepositoryConfig({
			name: 'Product',
			dataProvider: DefaultDataProvider
		});

		var otherRepoConfig = new RepositoryConfig({
			name: 'Other',
			dataProvider: DefaultDataProvider,
			autoRegister: false
		});

		RepositoryManager.addRepository(otherRepoConfig);
		RepositoryManager.addRepository(productConfig);
	});

})(angular.module('integration'));
