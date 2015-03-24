/**
 * @factory DataProviderInterface
 */
function DataProviderInterfaceFactory(utils, $q) {
	function DataProviderInterface() {}

	DataProviderInterface.extend = extend;

	DataProviderInterface.prototype = {
		findOne: notImplemented('findOne'),
		findAll: notImplemented('findAll'),
		remove: notImplemented('remove'),
		removeAll: notImplemented('removeAll'),
		save: notImplemented('save'),
		saveAll: notImplemented('saveAll')
	};

	function extend(prototype) {
		return utils.extend(DataProviderInterface, prototype);
	}

	function notImplemented(method) {
		return function() {
			return $q.reject(new Error(method + '() is not implemented'));
		};
	}

	return DataProviderInterface;
}
