const Schemy = require('../index');

describe('Schemy basic validations', function() {
	it('Should validate false if trying to validate empty data', function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});
		
		expect(schema.validate()).toBe(false);
	});

	it('Should validate false if passed a not declared property', function() {
		const schema = new Schemy({
			title: {
				type: String
			}
		});

		expect(schema.validate({ age: 21 })).toBe(false);
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
});