const Schemy = require('../index');

describe('Schemy date validations', function() {
	it('Should pass date validation when using correct string date', function() {
		const schema = new Schemy({
			date: {
				type: Date,
				required: true
			}
		});

		expect(schema.validate({
			date: '01 Jan 1970 00:00:00 GMT'
		})).toBe(true);

		expect(schema.getValidationErrors().length).toBe(0);
	});

	it('Should fail validation when passing an invalid string date', function() {
		const schema = new Schemy({
			date: {
				type: Date,
				required: true
			}
		});

		expect(schema.validate({
			date: '01 Jan 1970 abc 00:00:00 GMT'
		})).toBe(false);

		expect(schema.getValidationErrors().length).toBe(1);
	});

	it('Should fail validation when passing an invalid date format', function() {
		const schema = new Schemy({
			date: {
				type: Date,
				required: true
			}
		});

		expect(schema.validate({
			date: function(){}
		})).toBe(false);

		expect(schema.getValidationErrors().length).toBe(1);
	});

	it('Should fail validation when passing an invalid date using numbers', function() {
		const schema = new Schemy({
			date: {
				type: Date,
				required: true
			}
		});

		expect(schema.validate({
			date: 11111111111111111111111111
		})).toBe(false);

		expect(schema.getValidationErrors().length).toBe(1);
	});
});