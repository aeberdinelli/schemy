const Schemy = require('../index');

describe('Schemy validator', function() {
	it('Should validate false if trying to validate empty data', function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});
		
		expect(schema.validate()).toBe(false);
	});

	it('Should validate false if string property is a number', function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});

		expect(schema.validate({ title: 1 })).toBe(false);
	});

	it('Should validate false if passed a not declared property', function() {
		const schema = new Schemy({
			title: {
				type: String
			}
		});

		expect(schema.validate({ age: 21 })).toBe(false);
	});

	it('Should validate false if value not in enum rule', function() {
		const schema = new Schemy({
			title: {
				type: String,
				enum: ['value1','value2']
			}
		});

		expect(schema.validate({ title: 'value3' })).toBe(false);
	});

	it('Should validate false if missing required property', function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});

		expect(schema.validate({ age: 21 })).toBe(false);
	});

	it('Should validate false if value is not a correct uuid/v1 type on uuid/v1 property', function() {
		const schema = new Schemy({
			title: {
				type: 'uuid/v1',
				required: true
			}
		});

		expect(schema.validate({ title: 'not uuid/v1' })).toBe(false);
	});

	it('Should validate false if value is not a correct uuid/v4 type on uuid/v4 property', function() {
		const schema = new Schemy({
			title: {
				type: 'uuid/v4',
				required: true
			}
		});

		expect(schema.validate({ title: 'not uuid/v4' })).toBe(false);
	});

	it('Should validate false if not an array value on an array property', function() {
		const schema = new Schemy({
			titles: {
				type: [],
				required: true
			}
		});

		expect(schema.validate({ titles: 'not an array' })).toBe(false);
	});

	it('Should validate false if an element in an array is not the declared type', function() {
		const schema = new Schemy({
			titles: {
				type: [String],
				required: true
			}
		});

		expect(schema.validate({ titles: ['string', 1] })).toBe(false);
	});

	it('Should validate false if regex fails value validation', function() {
		const schema = new Schemy({
			title: {
				type: String,
				regex: /^([a-z]+)$/i
			}
		});

		expect(schema.validate({ title: 'not matching regex value 1' })).toBe(false);
	});

	it('Should pass if property has a default value and input data did not declare that property', function() {
		const schema = new Schemy({
			title: {
				type: String,
				default: 'title'
			}
		});

		expect(schema.validate({})).toBe(true);
	});

	it('Should pass if property has a default value function and input data did not declare that property', function() {
		const schema = new Schemy({
			title: {
				type: String,
				default: function() {}
			}
		});

		expect(schema.validate({})).toBe(true);
	});

	it('Should throw exception while validating asyncronously', async function() {
		const schema = new Schemy({
			title: {
				type: String
			}
		});

		let result;

		try {
			await Schemy.validate({title: 1}, schema);
		}
		catch (e) {
			result = e;
		}

		expect(result).toBeDefined();
		expect(result).toBe(jasmine.any(Array));
	});

	it('Should pass validation with correct child schemas', function() {
		const schemaName = new Schemy({
			firstname: {
				type: String,
				required: true
			},
			lastname: {
				type: String
			}
		});

		const schemaPerson = new Schemy({
			name: {
				type: schemaName,
				required: true
			}
		});

		const result = schemaPerson.validate({
			name: {
				firstname: 'Name'
			}
		});

		expect(result).toBe(true);
	});

	it('Should fail validation if child schema data is incorrect', function() {
		const schemaName = new Schemy({
			firstname: {
				type: String,
				required: true
			},
			lastname: {
				type: String
			}
		});

		const schemaPerson = new Schemy({
			name: {
				type: schemaName,
				required: true
			}
		});

		const result = schemaPerson.validate({
			name: {
				lastname: 'Lastname'
			}
		});

		expect(result).toBe(false);
		expect(schemaPerson.getValidationErrors()[0]).toBe('Missing required property name.firstname');
	});

	it('Should fail validation if a number is greater than declared in schema', function() {
		const schema = new Schemy({
			age: {
				type: Number,
				max: 18
			}
		});

		expect(schema.validate({age: 21})).toBe(false);
	});

	it('Should fail validation if a number is less than declared in schema', function() {
		const schema = new Schemy({
			age: {
				type: Number,
				min: 18
			}
		});

		expect(schema.validate({age: 8})).toBe(false);
	});

	it('Should fail validation if a string length is less than declared in schema', function() {
		const schema = new Schemy({
			name: {
				type: String,
				min: 3
			}
		});

		expect(schema.validate({name: 'ab'})).toBe(false);
	});

	it('Should fail validation if a string length is greater than declared in schema', function() {
		const schema = new Schemy({
			name: {
				type: String,
				max: 3
			}
		});

		expect(schema.validate({name: 'abcd'})).toBe(false);
	});

	it('Should pass validation if number is within expected min/max', function() {
		const schema = new Schemy({
			age: {
				type: Number,
				min: 18,
				max: 50
			}
		});

		expect(schema.validate({age: 21})).toBe(true);
	});
});