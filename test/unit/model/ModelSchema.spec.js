describe('ModelSchema', function() {
	beforeEach(module('repository'));

	describe('#constructor(Object schema)', function() {
		it('should add the properties declared in the first parameter in a map called "properties", indexed by field name',
			inject(function(ModelSchema) {
				var postFields = {
					title: String,
					content: String
				};

				var schema = new ModelSchema(postFields);

				expect(schema.properties).not.toBe(undefined);
				expect('title' in schema.properties).toBe(true);
				expect('content' in schema.properties).toBe(true);
			}));
	});

	describe('#addProperty(String name, SchemaType type)', function() {
		it('should add a property declaration to current schema if the schema type is valid', inject(function(ModelSchema) {
			var schema = new ModelSchema();

			schema.addProperty('name', String);
			schema.addProperty('age', {
				type: 'number'
			});

			expect(schema.properties.name).not.toBe(undefined);
			expect(schema.properties.age).not.toBe(undefined);
		}));

		it('should accept built-in constructors as valid types for primitive types (Boolean, String, Number)', inject(function(ModelSchema) {
			var schema = new ModelSchema();
			schema.addProperty('age', Number);
			schema.addProperty('name', String);
			schema.addProperty('hasChildren', Boolean);
			schema.addProperty('lastModified', Date);

			expect(schema.properties.age).not.toBe(undefined);
			expect(schema.properties.name).not.toBe(undefined);
			expect(schema.properties.hasChildren).not.toBe(undefined);
			expect(schema.properties.lastModified).not.toBe(undefined);
			expect(schema.properties.age.path).toBe('age');
			expect(schema.properties.name.path).toBe('name');
			expect(schema.properties.hasChildren.path).toBe('hasChildren');
			expect(schema.properties.lastModified.path).toBe('lastModified');
		}));
	});
});
