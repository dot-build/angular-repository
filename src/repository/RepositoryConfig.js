/**
 * @factory RepositoryConfig
 */
function RepositoryConfigFactory(DataProviderInterface, utils) {
	function RepositoryConfig(config) {
		if (!config.endpoint) {
			throw new Error('Invalid endpoint');
		}

		if (config.dataProvider instanceof DataProviderInterface === false) {
			throw new Error('Invalid data provider');
		}

		utils.merge(this, config);
	}

	return RepositoryConfig;
}
