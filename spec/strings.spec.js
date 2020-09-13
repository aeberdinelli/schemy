const Schemy = require('../index');

describe('Schemy string validations', function() {
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

	it('Should validate false if regex fails value validation', function() {
		const schema = new Schemy({
			title: {
				type: String,
				regex: /^([a-z]+)$/i
			}
		});

		expect(schema.validate({ title: 'not matching regex value 1' })).toBe(false);
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

	it('Should fail validation if value is not string on a shorted string rule', function() {
		const schema = new Schemy({
			name: String
		});

		expect(schema.validate({ name: 1 })).toBe(false);
	});
});