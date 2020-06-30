class Schemy {
	constructor(object) {
		// Validate schema first
		for (var [key, properties] of Object.entries(object)) {
			if (properties.type) {
				if (typeof properties.type === 'function') {
					if (Schemy.getSupportedTypes().indexOf(typeof properties['type']()) === -1) {
						throw new Error(`Unsupported type on ${key}: ${typeof properties['type']()}`);
					}

					if (typeof properties['type']() !== 'string' && (properties.enum || properties.regex)) {
						throw new Error(`Invalid schema for ${key}: regex and enum can be set only for strings`);
					}

					if (properties.regex && !(properties.regex instanceof RegExp)) {
						throw new Error(`Invalid schema for ${key}: regex must be an instance of RegExp`);
					}
				}

				else if (typeof properties.type === 'string' && Schemy.getSupportedStringValidations().indexOf(properties.type) === -1) {
					throw new Error(`Unsupported type on ${key}: ${properties.type}`);
				}
			}
		}

		this.validationErrors = [];
		this.missing = [];
		this.flex = (object.strict === false);

		delete object.strict;

		this.schema = object;
		this.data = null;
	}

	static getSupportedTypes() {
		return [
			'boolean',
			'string',
			'number',
			'object'
		];
	}

	static getSupportedStringValidations() {
		return [
			'uuid/v1',
			'uuid/v4'
		];
	}

	validate(data) {
		this.validationErrors = [];
		this.missing = [];
		this.data = data;

		if (!data) {
			this.validationErrors.push('Cannot validate empty object');
			return false;
		}

		if (!this.flex) {
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
					}
					catch (e) {}
				}

				else if (['string','number'].indexOf(typeof properties.default) !== -1) {
					data[key] = properties.default;
					this.data[key] = properties.default;
				}
			}

			if (!!properties.required && (data[key] === null || data[key] === undefined)) {
				this.validationErrors.push(`Missing required property ${key}`);

				// If key is missing, ignore other validations
				continue;
			}

			// All required optional data and empty should not validate
			if (!data[key]) {
				continue;
			}

			if (properties.type) {
				if (typeof properties.type === 'function') {
					// Check value matches expected type
					if (typeof data[key] !== typeof properties['type']()) {
						this.validationErrors.push(`Property ${key} is ${typeof data[key]}, expected ${typeof properties['type']()}`);
					}

					// If is a string check for enum and regex
					else if (typeof properties['type']() === 'string') {
						if (properties.enum) {
							if (properties.enum.indexOf(data[key]) === -1) {
								this.validationErrors.push(`Value for ${key} not in acceptable values`);
							}
						}

						if (properties.regex) {
							if (!properties.regex.test(data[key])) {
								this.validationErrors.push(`Regex validation failed for ${key}`);
							}
						}
					}
				}

				else if (typeof properties.type === 'string') {
					if (properties.type === 'uuid/v1' && !/([a-z0-9]){8}-([a-z0-9]){4}-([a-z0-9]{4})-([a-z0-9]{4})-([a-z0-9]{12})/.test(data[key])) {
						this.validationErrors.push(`${key} is not a valid uuid/v1`);
					}

					if (properties.type === 'uuid/v4' && !/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(data[key])) {
						this.validationErrors.push(`${key} is not a valid uuid/v4`);
					}
				}
			}
		}

		return (this.validationErrors.length === 0);
	}

	getValidationErrors() {
		return this.validationErrors;
	}

	getBody() {
		return this.data;
	}
}

module.exports = Schemy;