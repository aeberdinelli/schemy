const Schemy = require('../index');

describe('Schemy number validations', function() {
	it('Should validate false if string property is a number', function() {
		const schema = new Schemy({
			title: {
				type: String,
				required: true
			}
		});

		expect(schema.validate({ title: 1 })).toBe(false);
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