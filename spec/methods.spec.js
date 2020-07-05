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
            'Property \'title\' is number, expected string',
            'Property \'age\' is string, expected number',
            'An item in array of \'types\' is not valid. All items must be of type string'
        ];

        expect(schema.validate(input)).toBe(false);
        expect(schema.getValidationErrors()).toEqual(expectedErrors);
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
});