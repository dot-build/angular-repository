/**
 * @factory RepositoryConfig
 */
function RepositoryConfigFactory($injector, DataProviderInterface, utils) {
	function RepositoryConfig(config) {
		if (!config.name) {
			throw new Error('Invalid resource name');
		}

		var dataProvider = config.dataProvider,
			isInjected = typeof dataProvider === 'string';

		if (isInjected) {
			dataProvider = $injector.get(dataProvider);
		}

		if (dataProvider instanceof DataProviderInterface === false) {
			throw new Error('Invalid data provider');
		}

		utils.merge(this, config);
		this.dataProvider = dataProvider;
	}

	return RepositoryConfig;
}
