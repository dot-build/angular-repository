/**
 * @factory utils
 */
function utilsFactory() {
	var utils = {};

	utils.inherits = inherits;
	utils.merge = merge;

	return utils;

	/**
	 * @param {Object} destination
	 * @param {Object} source
	 */
	function merge(destination, source) {
		var key;

		for (key in source) {
			if (!source.hasOwnProperty(key)) continue;
			destination[key] = source[key];
		}

		return destination;
	}

	/**
	 * @param {Function} NewClass
	 * @param {Function} SuperClass
	 *
	 * @example
	 *   function Foo() {}
	 *   function Bar() { Foo.call(this); }
	 *   inherits(Bar, Foo);
	 */
	function inherits(NewClass, SuperClass, attributes) {
		var prototype = SuperClass.prototype,
			childPrototype = Object.create(prototype);

		Object.keys(attributes).forEach(function(key) {
			childPrototype[key] = attributes[key];
		});

		NewClass.prototype = childPrototype;
		NewClass.prototype.constructor = NewClass;
	}
}
