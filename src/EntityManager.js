/**
 * @factory EntityManager
 */
function EntityManagerFactory(Repository) {
	var repositoryMap = {},
		urlPrefix = '';

	function addRepository(name, config) {
		if (!name || name in repositoryMap || !config || (typeof config === 'object' && !config.endpoint)) {
			throw new Error('Invalid repository definition');
		}

		if (typeof config === 'string') {
			config = {
				endpoint: config
			};
		}

		repositoryMap[name] = new Repository(name, config);
	}

	function getRepository(name) {
		if (name in repositoryMap === false) return null;

		return repositoryMap[name];
	}

	function hasRepository(name) {
		return name in repositoryMap;
	}

	function removeRepository(name) {
		delete repositoryMap[name];
	}

	function setUrlPrefix(prefix) {
		urlPrefix = prefix;
	}

	function getUrlPrefix() {
		return urlPrefix;
	}

	return {
		addRepository: addRepository,
		hasRepository: hasRepository,
		getRepository: getRepository,
		removeRepository: removeRepository,
		setUrlPrefix: setUrlPrefix,
		getUrlPrefix: getUrlPrefix
	};
}
