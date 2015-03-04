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
			executeQuery: executeQuery,
			suffix: 'Repository'
		};

		function addRepository(config, properties) {
			if (!config || config instanceof RepositoryConfig === false) {
				throw new Error('Invalid repository definition');
			}

			var name = config.name;

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

			if (config.autoRegister !== false) {
				// repository is now injectable
				$provide.value(name + repositoryManager.suffix, instance);
			}

			return instance;
		}

		function getRepository(name) {
			if (name in repositoryMap === false) return null;

			return repositoryMap[name];
		}

		function hasRepository(name) {
			return name in repositoryMap;
		}

		function executeQuery(queryBuilder) {
			var repository = queryBuilder.getRepository();

			if (!this.hasRepository(repository)) {
				throw new Error('Invalid repository');
			}

			return this.getRepository(repository).findAll(queryBuilder);
		}

		return repositoryManager;
	}

	this.$get = ['Repository', 'RepositoryConfig', 'QueryBuilder', RepositoryManagerFactory];
}
