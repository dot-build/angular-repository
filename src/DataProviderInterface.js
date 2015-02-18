/**
 * @factory DataProviderInterface
 */
function DataProviderInterfaceFactory(utils, $q) {
	function DataProviderInterface() {}

	function implement(prototype) {
		return utils.extend(DataProviderInterface, prototype);
	}

	function notImplemented(method) {
		return function() {
			return $q.reject(new Error(method + '() is not implemented'));
		};
	}

	DataProviderInterface.implement = implement;

	DataProviderInterface.prototype = {
		findOne: notImplemented('findOne'),
		findAll: notImplemented('findAll'),
		remove: notImplemented('remove'),
		save: notImplemented('save'),

		canGet: canDoMethod,
		canSave: canDoMethod,
		canRemove: canDoMethod,
		canList: canDoMethod
	};

	function canDoMethod() {
		return true;
	}

	return DataProviderInterface;
}
