/**
 * @factory RepositoryFilter
 */
function RepositoryFilterFactory(EventEmitter, utils) {
	function RepositoryFilter() {
		EventEmitter.call(this);
		this.$$filters = [];
	}

	RepositoryFilter.create = function(filters) {
		var instance = new RepositoryFilter();
		instance.setState(filters);

		return instance;
	};

	var operators = {
		EQ: '=',
		LT: '<',
		LTE: '<=',
		GT: '>',
		GTE: '>=',
		IN: 'in',
		ST: '^',
		END: '$',
		LK: '~'
	};

	var operatorsArray = Object.keys(operators).map(function(key) {
		return operators[key];
	});

	var prototype = {
		setState: addFilterList,
		toJSON: toJSON,
		toArray: toArray,
		where: where,
		getFilter: getFilter,
		remove: removeFilter,
		reset: reset,

		operators: operators
	};

	utils.merge(prototype, operators);
	utils.merge(RepositoryFilter, operators);

	function toJSON() {
		return this.$$filters.slice();
	}

	function toArray() {
		return this.$$filters.map(function(filter) {
			return [filter.name, filter.operator, filter.value];
		});
	}

	function addFilter(filter) {
		if (Array.isArray(filter)) {
			filter = {
				name: filter[0],
				operator: filter[1],
				value: filter[2]
			};
		}

		if (typeof filter === 'object' && filter !== null && 'name' in filter && 'value' in filter && 'operator' in filter) {
			this.$$filters.push(filter);
		}
	}

	function addFilterList(filters) {
		if (!Array.isArray(filters)) return;

		filters.forEach(addFilter, this);
	}

	function where(name, operator, value) {
		if (arguments.length === 2) {
			value = operator;
			operator = operators.EQ;
		}

		if (operatorsArray.indexOf(operator) === -1) return;

		addFilter.call(this, [name, operator, value]);
		this.emit('update', this);
	}

	function getFilter(name) {
		var found;

		this.$$filters.some(function(filter) {
			if (filter.name === name) {
				found = filter;
				return true;
			}
		});

		return found;
	}

	function reset() {
		this.$$filters = [];
	}

	function removeFilter(name) {
		if (!name) return;

		this.$$filters = this.$$filters.filter(function(filter) {
			return filter.name !== name;
		});
	}

	utils.inherits(RepositoryFilter, EventEmitter, prototype);

	return RepositoryFilter;
}
