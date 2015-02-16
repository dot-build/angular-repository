ddescribe('RepositoryContextFilters', function() {
	var instance;

	beforeEach(module('repository'));
	beforeEach(inject(function(RepositoryContextFilters) {
		instance = new RepositoryContextFilters();
	}));

	describe('#getFilter(String name)', function() {
		it('should get a filter by name, or return undefined', function() {
			instance.where('name', instance.EQ, 'John');

			var firstFilter = instance.$$filters[0];
			var foundFilter = instance.getFilter('name');

			expect(foundFilter).toBe(firstFilter);
			expect(instance.getFilter('foo')).toBe(undefined);
		});
	});

	describe('#add(Array filters)', function() {
		it('should silently refuse to add invalid values', function() {
			instance.add(null);
			instance.add({});
			instance.add(0);
			instance.add(undefined);
			instance.add(arguments);
			instance.add([]);
			instance.add([{}]);
			instance.add(['name', instance.EQ, 'John']);

			expect(instance.$$filters.length).toBe(0);
		});

		it('should add filters using object notation', inject(function(RepositoryContextFilters) {
			var ageFilter = {
				name: 'age',
				operator: instance.LTE,
				value: 32
			};

			instance.add([ageFilter]);

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

			instance.add([filterAsArray]);

			expect(instance.$$filters.length).toBe(1);
			expect(instance.$$filters[0]).toEqual(ageFilter);
		});
	});

	describe('#where(String name, String operator, Mixed value)', function() {
		it('should add a filter definition from a triplet name/operator/value', function() {
			instance.where('name', instance.EQ, 'John');

			var firstFilter = instance.$$filters[0];
			expect(firstFilter.name).toBe('name');
			expect(firstFilter.operator).toBe(instance.EQ);
			expect(firstFilter.value).toBe('John');
		});

		it('should add a filter definition from an name/value pair, using EQ as the operator', function() {
			instance.where('name', 'John');

			var firstFilter = instance.$$filters[0];
			expect(firstFilter.name).toBe('name');
			expect(firstFilter.operator).toBe(instance.EQ);
			expect(firstFilter.value).toBe('John');
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
			instance.where('age', 42);
		});
	});
});
