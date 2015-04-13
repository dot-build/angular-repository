describe('RepositoryFilter', function() {
	var instance;

	beforeEach(module('repository'));
	beforeEach(inject(function(RepositoryFilter) {
		instance = new RepositoryFilter();
	}));

	describe('::operators: LT, LTE, GT, GTE, IN, EQ, LK, ST, END', function() {
		it('should have ASC and DESC static values and instance values to use as sorting direction', inject(function(RepositoryFilter) {
			var whereToLook = [RepositoryFilter, instance, instance.operators],
				constants = ['LT', 'LTE', 'GT', 'GTE', 'IN', 'EQ', 'LK', 'ST', 'END'],
				values = ['<', '<=', '>', '>=', 'in', '=', '~', '^', '$'];

			whereToLook.forEach(function(place) {
				constants.forEach(function(constantName, index) {
					expect(place[constantName]).toBe(values[index]);
				});
			});
		}));
	});

	describe('::create(Object[] filters)', function() {
		it('should create an instance and add filters to it', inject(function(RepositoryFilter) {
			var ageFilter = {
				name: 'age',
				value: 20,
				operator: RepositoryFilter.GTE
			};

			var filters = RepositoryFilter.create([ageFilter]);

			expect(filters.toJSON()).toEqual([ageFilter]);
		}));
	});

	describe('#constructor()', function() {
		it('should be a subclass of EventEmitter', inject(function(EventEmitter) {
			expect(instance instanceof EventEmitter).toBe(true);
		}));
	});

	describe('#getFilter(String name)', function() {
		it('should get a filter by name, or return undefined', function() {
			instance.where('name', instance.EQ, 'John');

			var firstFilter = instance.$$filters[0];
			var foundFilter = instance.getFilter('name');

			expect(foundFilter).toBe(firstFilter);
			expect(instance.getFilter('foo')).toBe(undefined);
		});
	});

	describe('#setState(Array filters)', function() {
		it('should silently refuse to add invalid values', function() {
			instance.setState(null);
			instance.setState({});
			instance.setState(0);
			instance.setState(undefined);
			instance.setState(arguments);
			instance.setState([]);
			instance.setState([{}]);
			instance.setState([null]);

			// array but not an array of filters
			instance.setState(['name', instance.EQ, 'John']);

			expect(instance.$$filters.length).toBe(0);
		});

		it('should add filters using object notation', inject(function() {
			var ageFilter = {
				name: 'age',
				operator: instance.LTE,
				value: 32
			};

			instance.setState([ageFilter]);

			expect(instance.$$filters.length).toBe(1);
			expect(instance.$$filters[0]).toEqual(ageFilter);
		}));

		it('should add filters using the array triplet notation', function() {
			var ageFilter = {
				name: 'age',
				operator: instance.LTE,
				value: 32
			};

			var filterAsArray = [ageFilter.name, ageFilter.operator, ageFilter.value];

			instance.setState([filterAsArray]);

			expect(instance.$$filters.length).toBe(1);
			expect(instance.$$filters[0]).toEqual(ageFilter);
		});
	});

	describe('#where(String name, String operator, Mixed value)', function() {
		it('should add a filter definition from a triplet name/operator/value and emit "update" event', function() {
			var spy = jasmine.createSpy('update');

			instance.on('update', spy);
			instance.where('name', instance.EQ, 'John');

			var firstFilter = instance.$$filters[0];
			expect(firstFilter.name).toBe('name');
			expect(firstFilter.operator).toBe(instance.EQ);
			expect(firstFilter.value).toBe('John');

			expect(spy.calls.count()).toBe(1);
		});

		it('should add a filter definition from an name/value pair, using EQ as the operator', function() {
			instance.where('name', 'John');

			var firstFilter = instance.$$filters[0];
			expect(firstFilter.name).toBe('name');
			expect(firstFilter.operator).toBe(instance.EQ);
			expect(firstFilter.value).toBe('John');
		});

		it('should NOT add a filter twice with the same name', function() {
			instance.where('name', 'John');
			instance.where('name', 'Paul');

			expect(instance.$$filters.length).toBe(1);

			var firstFilter = instance.$$filters[0];
			expect(firstFilter.name).toBe('name');
			expect(firstFilter.operator).toBe(instance.EQ);
			expect(firstFilter.value).toBe('Paul');
		});

		it('should NOT accept invalid operators', function() {
			instance.where('name', 'ZZ', 'John');
			expect(instance.$$filters.length).toBe(0);
		});
	});

	describe('#remove(String name)', function() {
		it('should remove a filter by name', function() {
			instance.where('age', 21);

			var ageFilter = instance.getFilter('age');
			expect(ageFilter.name).toBe('age');
			expect(ageFilter.value).toBe(21);

			instance.remove('age');

			expect(instance.getFilter('age')).toBe(undefined);
		});
	});

	describe('#reset()', function() {
		it('should clear all the filters', function() {
			instance.where('name', 'John');
			expect(instance.$$filters.length).toBe(1);

			instance.reset();
			expect(instance.$$filters.length).toBe(0);
		});
	});

	// http://www.ecma-international.org/ecma-262/5.1/#sec-15.12.3
	describe('#toJSON()', function() {
		it('should convert the filters into an array of object literals with name, operator and value', function() {
			instance.where('name', instance.EQ, 'John');

			var json = instance.toJSON();

			expect(json).not.toBe(undefined);
			expect(json[0]).toEqual({
				name: 'name',
				operator: instance.EQ,
				value: 'John'
			});
		});
	});

	describe('#toArray()', function() {
		it('should convert the filters into an array where each item is a triplet name/operator/value', function() {
			instance.where('name', 'John');
			instance.where('age', instance.LT, 42);

			var filters = instance.toArray();

			expect(filters.length).toBe(2);

			var nameFilter = filters[0],
				ageFilter = filters[1];

			expect(nameFilter[0]).toBe('name');
			expect(nameFilter[1]).toBe(instance.EQ);
			expect(nameFilter[2]).toBe('John');

			expect(ageFilter[0]).toBe('age');
			expect(ageFilter[1]).toBe(instance.LT);
			expect(ageFilter[2]).toBe(42);
		});
	});
});
