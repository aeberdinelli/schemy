const Schemy = require('../index');

describe('Schemy methods', function() {
	it('Should return all validation errors', function() {
		const schema = new Schemy({
			title: {
				type: String
			},
			age: {
				type: Number
			},
			types: {
				type: [String]
			}
		});

		const input = {
			title: 1,
			age: '21',
			types: [1],
			something: true
		};

		const expectedErrors = [
			'Property something not valid in schema',
			'Property title is number, expected string',
			'Property age is string, expected number',
			'An item in array of property types is not valid. All items must be of type string'
		];

		expect(schema.validate(input)).toBe(false);
		expect(schema.getValidationErrors()).toEqual(expectedErrors);
	});

	it('Should throw error trying to get errors without calling validate first', function() {
		const schema = new Schemy({strict: false});

		try {
			schema.getValidationErrors();
		} 
		catch (err) {
			expect(err).toBe('You need to call .validate() before .getValidationErrors()');
		}
	});

	it('Should return the validated data', function() {
		const schema = new Schemy({
			title: {
				type: String
			}
		});
		
		const input = {
			title: 'something'
		};

		expect(schema.validate(input)).toBe(true);
		expect(schema.getBody()).toEqual(input);
	});

	it('Should return validated data asynchronously', async function() {
		const schema = new Schemy({ name: String });
		const result = await Schemy.validate({ name: 'Alan' }, schema);

		expect(result.name).toBe('Alan');
	});

	it('Should return validated data including unknown properties', async function() {
		const schema = new Schemy({ name: String }, { strict: false });
		const result = await Schemy.validate({ name: '--name--', lastname: '--lastname--' }, schema, true);

		expect(result.name).toBe('--name--');
		expect(result.lastname).toBe('--lastname--');
	});

	it('Should return false when strict setting is not passed', function() {
		const schema = new Schemy({
			title: {
				type: String
			},
			strict: false
		});
		
		const input = { title: 'something', age: 21 };

		expect(schema.validate(input)).toBe(false);
	});

	it('Should return true if strict setting is true and schema contains extra properties', function() {
		const schema = new Schemy({
			title: {
				type: String
			}
		}, { strict: false });

		const input = { title: 'something', age: 21 };

		expect(schema.validate(input)).toBe(true);
		expect(schema.getBody()).toEqual({title: 'something'});
	})

	it('Should throw error if passing not Schemy instance as validation argument', async function() {
		expect(await Schemy.validate({}, {})).toThrow('Second argument must be an instance of Schemy');
	});

	it('Should throw error if passing an invalid argument as validation argument', async function() {
		expect(await Schemy.validate({}, 'abc')).toThrow('Second argument must be an instance of Schemy or a valid schema');
	});

	it('Should validate correctly if passing two objects to validate method', async function() {
		expect(
			await Schemy.validate({
				name: 'Alan'
			}, {
				name: {
					type: String,
					required: true
				}
			})
		).toBe(true);
	});

	it('Should pass validation correctly when validating asynchronously', async function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});

		const input = {
			name: 'Name'
		};

		expect(await Schemy.validate(input, schema)).toBe(true);
	});

	it('Should pass validation correctly when validating using promise', function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});

		const input = {
			name: 'Name'
		};

		Schemy.validate(input, schema).then(result => {
			expect(result).toBe(true);
		});
	});

	it('Should return validated data without changing its order', function() {
		const schema = new Schemy({
			lastname: String,
			name: String
		});

		const input = {
			name: 'Name',
			lastname: 'Lastname'
		};

		schema.validate(input);

		const keys = Object.keys(schema.getBody(false, false));

		expect(keys[0]).toBe('name');
		expect(keys[1]).toBe('lastname');
	});

	it('Should return ordered validated data', function() {
		const schema = new Schemy({
			lastname: String,
			name: String
		});

		const input = {
			name: 'Name',
			lastname: 'Lastname'
		};

		schema.validate(input);

		const keys = Object.keys(schema.getBody(true, true));

		expect(keys[0]).toBe('lastname');
		expect(keys[1]).toBe('name');
	});

	it('Should return all data', function() {
		const schema = new Schemy({
			title: String,
			strict: false
		});

		const result = schema.validate({
			title: 'something',
			name: 'name',
			lastname: 'lastname'
		});

		const body = schema.getBody(true, true);

		expect(body.name).toBeDefined();
		expect(body.lastname).toBeDefined();
	});
});