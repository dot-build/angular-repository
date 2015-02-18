/**
 * @provider RepositoryManager
 */
function RepositoryManagerProvider($provide) {
	function RepositoryManagerFactory(Repository, RepositoryConfig) {
		var repositoryMap = {};

		var repositoryManager = {
			addRepository: addRepository,
			hasRepository: hasRepository,
			getRepository: getRepository,
			suffix: 'Repository'
		};

		function addRepository(config, properties) {
			if (!config || config instanceof RepositoryConfig === false) {
				throw new Error('Invalid repository definition');
			}

			var name = config.name;

			if (!name) {
				throw new Error('Invalid repository name');
			}

			if (repositoryMap.hasOwnProperty(name)) {
				throw new Error('Repository ' + name + ' already registed');
			}

			var ctor, instance;
			if (properties) {
				ctor = Repository.extend(properties);
				instance = new ctor(config);
			} else {
				instance = new Repository(config);
			}

			repositoryMap[name] = instance;

			// repository is now injectable
			$provide.value(name + repositoryManager.suffix, instance);

			return instance;
		}

		function getRepository(name) {
			if (name in repositoryMap === false) return null;

			return repositoryMap[name];
		}

		function hasRepository(name) {
			return name in repositoryMap;
		}

		return repositoryManager;
	}

	this.$get = ['Repository', 'RepositoryConfig', RepositoryManagerFactory];
}
