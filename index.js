module.exports = class Schemy {
	constructor(schema) {
		for (var [key, properties] of Object.entries(schema)) {
			if (key !== 'strict' && !properties.type) {
				throw new Error(`Property ${key} has no type defined`);
			}

			if (typeof properties.type === 'function') {
				if (['boolean','string','number','object'].indexOf(typeof properties['type']()) === -1) {
					throw new Error(`Unsupported type on ${key}: ${typeof properties['type']()}`);
				}

				if (typeof properties['type']() !== 'string' && (properties.enum || properties.regex)) {
					throw new Error(`Invalid schema for ${key}: regex and enum can be set only for strings`);
				}

				if (properties.regex && !(properties.regex instanceof RegExp)) {
					throw new Error(`Invalid schema for ${key}: regex must be an instance of RegExp`);
				}

				if (properties.min && typeof properties.min !== 'number') {
					throw new Error(`Invalid schema for ${key}: min property must be a number`);
				}

				if (properties.max && typeof properties.max !== 'number') {
					throw new Error(`Invalid schema for ${key}: max property must be a number`);
				}
			}

			else if (typeof properties.type === 'string' && ['uuid/v1','uuid/v4'].indexOf(properties.type) === -1) {
				throw new Error(`Unsupported type on ${key}: ${properties.type}`);
			}

			else if (typeof properties.type === 'object' && Array.isArray(properties.type) && properties.type.length > 1) {
				throw new Error(`Invalid schema for ${key}. Array items must be declared of any type, or just one type: [String], [Number]`);
			}
		}

		this.validationErrors = [];
		this.missing = [];
		
		this.flex = (schema.strict === false);

		delete schema.strict;

		this.schema = schema;
		this.data = null;
		this.validationRan = false;
	}

	/**
	 * Async validates an object against a schema
	 * 
	 * @param {Object} body Object to validate
	 * @param {Schemy} schema Schemy instance to validate against to
	 */
	static async validate(body, schema) {
		if (!(schema instanceof Schemy)) {
			try {
				schema = new Schemy(schema);
			} catch (e) {
				throw new Error('Second argument must be an instance of Schemy or a valid schema');
			}
		}

		return new Promise((resolve, reject) => {
			if (!schema.validate(body)) {
				return reject(schema.getValidationErrors());
			}

			/* istanbul ignore next */
			return resolve(true);
		});
	}

	/**
	 * Validates data against this schema
	 * 
	 * @param {Object} data Object to validate agains the schema
	 * @returns {Boolean} true if validated correctly, false otherwise
	 */
	validate(data) {
		this.validationRan = true;
		this.validationErrors = [];
		this.missing = [];
		this.data = data;

		if (!data) {
			this.validationErrors.push('Cannot validate empty object');
			return false;
		}

		if (!this.flex && typeof data === 'object') {
			Object.keys(data).forEach(key => {
				if (!this.schema[key]) {
					this.validationErrors.push(`Property ${key} not valid in schema`);
				}
			});
		}

		for (var [key, properties] of Object.entries(this.schema)) {
			// Populate with default value if available
			if (typeof properties.default !== 'undefined' && properties.default !== null) {
				if (typeof properties.default === 'function') {
					try {
						data[key] = properties.default();
						this.data[key] = properties.default();
					} catch (e) {}
				}

				else if (['string','number'].indexOf(typeof properties.default) !== -1) {
					data[key] = properties.default;
					this.data[key] = properties.default;
				}
			}

			// If key is missing, ignore other validations
			if (!!properties.required && (data[key] === null || data[key] === undefined)) {
				this.validationErrors.push(`Missing required property ${key}`);
				continue;
			}

			// All required optional data and empty should not validate
			if (!data[key]) {
				continue;
			}

			if (properties.type) {
				// Validate child schema
				if (properties.type instanceof Schemy) {
					if (!properties.type.validate(data[key])) {
						this.validationErrors = [
							...this.validationErrors,
							...properties.type.getValidationErrors().map(error => error.replace('roperty ',`roperty ${key}.`))
						];
					}
				}

				else if (properties.type === Date) {
					if (['string','number'].indexOf(typeof data[key]) === -1 || isNaN(Date.parse(data[key]))) {
						this.validationErrors.push(`Property ${key} is not a valid date`);
					}
				}

				else if (typeof properties.type === 'function') {
					// Check native types
					if (typeof data[key] !== typeof properties['type']()) {
						this.validationErrors.push(`Property ${key} is ${typeof data[key]}, expected ${typeof properties['type']()}`);
					}

					// Check string: enum, regex, min, max
					else if (typeof properties['type']() === 'string') {
						if (properties.enum) {
							if (properties.enum.indexOf(data[key]) === -1) {
								this.validationErrors.push(`Value for property ${key} not in acceptable values`);
							}
						}

						if (properties.regex) {
							if (!properties.regex.test(data[key])) {
								this.validationErrors.push(`Regex validation failed for property ${key}`);
							}
						}

						if (typeof properties.min !== 'undefined' && data[key].length < properties.min) {
							this.validationErrors.push(`Property ${key} must contain at least ${properties.min} characters`);
						}

						if (typeof properties.max !== 'undefined' && data[key].length > properties.max) {
							this.validationErrors.push(`Property ${key} must contain less than ${properties.max} characters`);
						}
					}

					// Check number min/max
					else if (typeof properties['type']() === 'number') {
						if (typeof properties.min !== 'undefined' && data[key] < properties.min) {
							this.validationErrors.push(`Property ${key} must be greater than ${properties.min}`);
						}

						if (typeof properties.max !== 'undefined' && data[key] > properties.max) {
							this.validationErrors.push(`Property ${key} must be less than ${properties.max}`);
						}
					}
				}

				else if (properties.type === 'uuid/v1' && !/([a-z0-9]){8}-([a-z0-9]){4}-([a-z0-9]{4})-([a-z0-9]{4})-([a-z0-9]{12})/.test(data[key])) {
					this.validationErrors.push(`Property ${key} is not a valid uuid/v1`);
				}

				else if (properties.type === 'uuid/v4' && !/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(data[key])) {
					this.validationErrors.push(`Property ${key} is not a valid uuid/v4`);
				}

				else if (typeof properties.type === 'object' && Array.isArray(properties.type)) {
					if (!Array.isArray(data[key])) {
						this.validationErrors.push(`Property ${key} is ${typeof data[key]}, expected array`);
					}

					else if (properties.type.length === 1 && data[key].some(item => typeof item !== typeof properties.type[0]())) {
						this.validationErrors.push(`An item in array of property ${key} is not valid. All items must be of type ${typeof properties.type[0]()}`);
					}
				}
			}
		}

		return (this.validationErrors.length === 0);
	}

	/**
	 * Get all the validation errors from the last validation
	 * 
	 * @returns {Array<String>} Array with string of errors
	 */
	getValidationErrors() {
		if (!this.validationRan) {
			throw new Error('You need to call .validate() before .getValidationErrors()');
		}

		return this.validationErrors;
	}

	/**
	 * Get the data provided in the last validation
	 * 
	 * @param {Boolean} includeAll Include properties not declared in schema
	 * @returns {Object} Last validated data
	 */
	getBody(includeAll = false) {
		const output = { ...this.data };

		if (this.flex && !includeAll) {
			Object.keys(output).forEach(key => {
				if (!this.schema[key]) {
					delete output[key];
				}
			});
		}

		return output;
	}
}