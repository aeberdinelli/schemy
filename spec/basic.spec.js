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
		expect(result).toEqual(jasmine.any(Array));
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

	it("Should pass validation with correct child schemas using strict property", function () {
		const nameSchema = new Schemy(
			{
				firstname: {
					type: String,
					required: true,
				},
				lastname: {
					type: String,
				},
			},
			{ strict: false }
		);

		const personSchema = new Schemy(
			{
				name: { type: nameSchema, required: true },
				age: { type: Number, required: true },
			},
			{ strict: false }
		);

		const payload = {
			name: {
				firstname: "Joaquin",
				lastname: "Arreguez",
				secondName: "Eduardo",
			},
			age: 28,
			address: "Avenida Siempre Viva 666",
		};

		const result = personSchema.validate(payload);

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

	it('Should faild validation if number of items is less than required', function() {
		const schema = new Schemy({
			items: {
				type: [],
				min: 1
			}
		});

		expect(schema.validate({
			items: []
		})).toBe(false);
	});

	it('Should fail validation if number of items is greater than max', function() {
		const schema = new Schemy({
			items: {
				type: [],
				max: 2
			}
		});

		expect(schema.validate({
			items: [1, 2, 3]
		})).toBe(false);
	})
});