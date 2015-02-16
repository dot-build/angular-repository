xdescribe('Model', function() {
	beforeEach(module('repository'));

	describe('#constructor(Object data)', function() {
		it('should store the data passed to constructor into a new object as "data" property ' +
			'and the original state into "source" property', inject(function(Model) {
				var data = {
					name: 'John'
				};

				var person = new Model(data);

				expect(person.data).not.toBe(undefined);
				expect(person.data.name).not.toBe(undefined);
				expect(person.data.name).toBe(data.name);
				expect(person.data !== data).toBe(true);
				expect(person.source === data).toBe(true);
			}));

		it('should initialize with an empty object if no data was provided', inject(function(Model) {
			var model = new Model();
			expect(model.data).not.toBe(undefined);
			expect(typeof model.source).toBe('object');
		}));

		it('should be a EventEmitter subclass and emit events', inject(function(EventEmitter, Model) {
			var model = new Model();

			expect(model instanceof EventEmitter).toBe(true);

			var handler = jasmine.createSpy();
			model.on('foo', handler);
			model.emit('foo');
			model.off('foo');

			expect(handler).toHaveBeenCalled();
		}));
	});

	// http://www.ecma-international.org/ecma-262/5.1/#sec-15.12.3
	describe('#toJSON()', function() {
		it('should convert the model data into an object literal to allow native serialization',
			inject(function(Model) {
				var data = {
					nullValue: null,
					name: 'John',
					age: 42,
					married: false,
					wife: undefined,
					children: [],
					fn: function() {}
				};

				var person = new Model(data);
				var dataSerialized = JSON.stringify(data);
				var modelSerialized = JSON.stringify(person);

				expect(dataSerialized === modelSerialized).toBe(true);
			}));
	});

	describe('#commit()', function() {
		it('should persist the current model state in the "source" property', inject(function(Model) {
			var person = {
				name: 'John'
			};

			var model = new Model(person);
			expect(model.data.name).toBe(model.source.name);

			model.data.name = 'Paul';
			expect(model.data.name).not.toBe(model.source.name);

			model.commit();
			expect(model.data.name).toBe(model.source.name);
		}));
	});

	describe('#rollback()', function() {
		it('should restore the model state from the last state saved on "source" property', inject(function(Model) {
			var person = {
				name: 'John'
			};

			var model = new Model(person);
			expect(model.data.name).toBe(model.source.name);

			model.data.name = 'Paul';
			expect(model.data.name).not.toBe(model.source.name);

			model.rollback();
			expect(model.data.name).toBe(model.source.name);
		}));
	});
});
