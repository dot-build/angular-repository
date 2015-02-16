/**
 * @factory DataProviderAbstract
 */
function DataProviderAbstractFactory(utils) {
	function DataProviderAbstract() {
		this.$$urlPrefix = '';
	}

	function extend(prototype) {
		return utils.extend(DataProviderAbstract, prototype);
	}

	function setUrlPrefix(prefix) {
		this.$$urlPrefix = prefix;
	}

	function getUrlPrefix() {
		return this.$$urlPrefix;
	}

	DataProviderAbstract.prototype = {
		constructor: DataProviderAbstract,
		setUrlPrefix: setUrlPrefix,
		getUrlPrefix: getUrlPrefix
	};

	DataProviderAbstract.extend = extend;

	return DataProviderAbstract;
}
