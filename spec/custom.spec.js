const Schemy = require('../index');

describe('Schemy custom validations', function() {
    it('Should fail validation if custom validator returns a string', function() {
        const schema = new Schemy({
            name: {
                type: String,
                custom: (value) => (value !== 'correct') ? 'Name is incorrect' : true
            }
        });

        schema.validate({ name: 'incorrect' });

        expect(schema.getValidationErrors()[0]).toBe('Name is incorrect');
    });

    it('Should fail validation if custom validator returns false', function() {
        const schema = new Schemy({
            name: {
                type: String,
                custom: (value) => (value === 'correct')
            }
        });

        expect(schema.validate({ name: 'incorrect' })).toBe(false);
    });

    it('Should pass validation if custom validator returns true', function() {
        const schema = new Schemy({
            name: {
                type: String,
                custom: (value) => (value === 'correct')
            }
        });

        expect(schema.validate({ name: 'correct' })).toBe(true);
    });
});