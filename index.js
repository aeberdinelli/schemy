class Schemy {
	constructor(object) {
		this.validationErrors = [];
		this.missing = [];
		this.flex = (object.strict === false);

		delete object.strict;

		this.schema = object;
		this.data = null;
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
					if (typeof data[key] !== typeof properties['type']()) {
						this.validationErrors.push(`Property ${key} is ${typeof data[key]}, expected ${typeof properties['type']()}`);
					}
				}

				else if (typeof properties.type === 'string' && properties.type.toLowerCase() === 'uuid/v1') {
					if (!/([a-z0-9]){8}-([a-z0-9]){4}-([a-z0-9]{4})-([a-z0-9]{4})-([a-z0-9]{12})/.test(data[key])) {
						this.validationErrors.push(`${key} is not a valid uuid/v1`);
					}
				}

				else if (typeof properties.type === 'string' && properties.enum) {
					if (properties.enum.indexOf(data[key]) === -1) {
						this.validationErrors.push(`${key} not in acceptable values`);
					}
				}
			}

			if (properties.regex) {
				if (!regex.test(data[key])) {
					this.validationErrors.push(`Regex validation failed for key ${key}`);
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