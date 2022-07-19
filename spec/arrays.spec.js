const Schemy = require('../index');

describe('Schemy array validation', function() {
    it('Should auto parse schemas within arrays', function() {
        const schema = new Schemy({
            products: {
                type: [{price: Number}]
            }
        });

        expect(schema.validate({
            products: [{price: 1}]
        })).toBe(true);
    });

    it('Should fail if expected an array and another type given', function() {
    	const productSchema = new Schemy({
    		something: {
    			type: [String]
    		}
    	});

    	const input = { something: 'not an array' };

    	expect(productSchema.validate(input)).toBe(false);
    	expect(productSchema.getValidationErrors()).toEqual(['Property something is string, expected array']);
    });

    it('Should validate all items in array of schemy passes their schema validation', function() {
		const productSchema = new Schemy({
			price: {type: Number, required: true}
		});

		const schema = new Schemy({
			products: {
				type: [productSchema]
			}
		});

		expect(schema.validate({
			products: [
				{
					price: 1
				}
			]
		})).toBe(true);
	});

	it('Should fail validation if a child array schema fails validation', function() {
		const productSchema = new Schemy({
			price: {type: Number, required: true}
		});

		const schema = new Schemy({
			products: {
				type: [productSchema]
			}
		});

		expect(schema.validate({
			products: [
				{
					price: 'abc'
				}
			]
		})).toBe(false);
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
});