module.exports = class Schemy {
	/**
	 * Extend Schemy functionality with plugins
	 * 
	 * @param {Array} plugins Array of schemy plugins to load (or a single one)
	 */
	static extend(plugins) {
		plugins = Array.isArray(plugins) ? plugins : [plugins];
		
		Schemy.plugins = [
			...(Schemy.plugins || []),
			...plugins.map(plugin => {
				// Inject Schemy into the plugin to make it available for use internally
				plugin.Schemy = Schemy;
				return plugin;
			})
		];

		Schemy.triggerEvent.call(this, 'pluginsInitialized', plugins);
	}

	// Trigger plugin methods based on event
	static triggerEvent(event, body) {
		if (Schemy.plugins && Schemy.plugins.length > 0) {
			for (var plugin of Schemy.plugins) {
				if (typeof plugin[event] === 'function') {
					plugin[event].call(this, body);
				}
			}
		}
	}

	// Get current version
	static getVersion() {
		return require('./package.json').version;
	}

	/**
	 * Async validates an object against a schema and returns the body
	 * 
	 * @param {Object} body Object to validate
	 * @param {Object|Schemy} schema Schemy instance or raw schema to validate against to
	 * @param {Boolean} includeAll Include properties not declared in schema, defaults to false
	 * @param {Boolean} orderBody Order the body based on the schema, defaults to false
	 */
	static async validate(body, schema, includeAll = false, orderBody = false) {
		if (!(schema instanceof Schemy)) {
			schema = new Schemy(schema);
		}

		return new Promise((resolve, reject) => {
			if (schema.validate(body)) {
				return resolve(
					schema.getBody(includeAll, orderBody)
				);
			}

			return reject(schema.getValidationErrors());
		});
	}

	/**
	 * @typedef {Object} SchemySettings
	 * 
	 * @property {Boolean} strict Determines if the schema is strict or accepts properties not declared within itself
	 */

	/**
	 * @param {Object} schema Object with properties and their rules
	 * @param {SchemySettings} settings Settings for this schema
	 */
	constructor(schema, { strict } = {}) {
		Schemy.triggerEvent.call(this, 'beforeParse', schema);

		const settings = arguments[1] || {};
		// If schema was already parsed by a plugin, prevent parsing it again
		if (!this.schemaParsed) {
			if (typeof schema !== 'object') {
				throw 'Schemy must receive an object with a schema';
			}

			for (var [key, properties] of Object.entries(schema)) {
				if (key !== 'required' && !properties.type) {
					if (typeof properties === 'function' || properties === 'uuid/v1' || properties === 'uuid/v4') {
						schema[key] = { type: properties, required: true };
					}
					
					else if (typeof properties === 'object') {
						try {
							const parsed = {};
	
							if (schema[key].custom) {
								const { custom } = schema[key];
								parsed.custom = custom;
							}
	
							parsed.type = new Schemy(properties);
							parsed.required = !!properties.required;
	
							schema[key] = parsed;
						} catch (err) {
							throw `Could not parse property ${key} as schema`;
						}
					}
				}

				else if (typeof properties.type === 'function') {
					if (['boolean','string','number','object','function'].indexOf(typeof properties.type()) === -1) {
						throw `Unsupported type on ${key}: ${typeof properties.type()}`;
					}

					if (typeof properties.type() !== 'string' && (properties.enum || properties.regex)) {
						throw `Invalid schema for ${key}: regex and enum can be set only for strings`;
					}

					if (properties.regex && !(properties.regex instanceof RegExp)) {
						throw `Invalid schema for ${key}: regex must be an instance of RegExp`;
					}

					if (properties.min && typeof properties.min !== 'number') {
						throw `Invalid schema for ${key}: min property must be a number`;
					}

					if (properties.max && typeof properties.max !== 'number') {
						throw `Invalid schema for ${key}: max property must be a number`;
					}
				}

				else if (typeof properties.type === 'string' && ['uuid/v1','uuid/v4'].indexOf(properties.type) === -1) {
					throw `Unsupported type on ${key}: ${properties.type}`;
				}

				else if (typeof properties.type === 'object' && Array.isArray(properties.type)) {
					if (properties.type.length > 1) {
						throw `Invalid schema for ${key}. Array items must be declared of any type, or just one type: [String], [Number]`;
					}

					// Auto parse array item as schemy
					if (typeof properties.type[0] === 'object') {
						if (typeof properties.type[0].validate === 'undefined') {
							properties.type[0] = new Schemy(properties.type[0]);
						}
					}
				}

				// Parse child schema and keep custom validator if it exists
				else if (typeof properties.type === 'object' && !(properties.type instanceof Schemy)) {
					try {
						const parsed = {};

						if (schema[key].custom) {
							const { custom } = schema[key];
							parsed.custom = custom;
						}

						parsed.type = new Schemy(properties.type);
						parsed.required = !!properties.required;

						schema[key] = parsed;
					} catch (err) {}
				}

				if (properties.custom && typeof properties.custom !== 'function') {
					throw `Custom validator for ${key} must be a function, was ${typeof properties.custom}`;
				}
			}
		}

		Schemy.triggerEvent.call(this, 'afterParse', schema);

		this.validationErrors = null;
		this.flex = (settings.strict === false);
		this.data = null;
		this.schema = schema;
	}

	/**
	 * Validates data against this schema
	 * 
	 * @param {Object} data Object to validate agains the schema
	 * @returns {Boolean} true if validated correctly, false otherwise
	 */
	validate(data) {
		this.validationErrors = [];
		this.data = data;

		Schemy.triggerEvent.call(this, 'beforeValidate', data);

		if (!data || typeof data !== 'object') {
			this.validationErrors.push('Data passed to validate is incorrect. It must be an object.');
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
					try { data[key] = properties.default() } catch (e) {}
				}

				else if (['string','number'].indexOf(typeof properties.default) !== -1) {
					data[key] = properties.default;
				}
			}

			// If key is missing, ignore other validations
			if (!!properties.required && (data[key] === null || data[key] === undefined)) {
				this.validationErrors.push(`Missing required property ${key}`);
				continue;
			}

			// All optional data and empty should not validate
			if (typeof data[key] === 'undefined') {
				continue;
			}

			if (properties.custom) {
				const customValidationResult = properties.custom(data[key], data, this.schema);

				if (typeof customValidationResult === 'string') {
					this.validationErrors.push(customValidationResult);
				}
				
				else if (customValidationResult !== true) {
					this.validationErrors.push(`Custom validation failed for property ${key}`);
				}
			}

			if (properties.type) {
				// Validate child schema
				if (properties.type instanceof Schemy && !properties.type.validate(data[key])) {
					this.validationErrors = [
						...this.validationErrors,
						...properties.type.getValidationErrors().map(error => error.replace('roperty ',`roperty ${key}.`))
					];
				}

				else if (properties.type === Date) {
					if (['string','number'].indexOf(typeof data[key]) === -1 || isNaN(Date.parse(data[key]))) {
						this.validationErrors.push(`Property ${key} is not a valid date`);
					}
				}

				else if (typeof properties.type === 'function') {
					// Check native types
					if (typeof data[key] !== typeof properties.type()) {
						this.validationErrors.push(`Property ${key} is ${typeof data[key]}, expected ${typeof properties.type()}`);
					}

					// Check string: enum, regex, min, max
					else if (typeof properties.type() === 'string') {
						if (properties.enum && properties.enum.indexOf(data[key]) === -1) {
							this.validationErrors.push(`Value of property ${key} does not contain an acceptable value`);
						}

						if (properties.regex && !properties.regex.test(data[key])) {
							this.validationErrors.push(`Regex validation failed for property ${key}`);
						}

						if (typeof properties.min !== 'undefined' && data[key].length < properties.min) {
							this.validationErrors.push(`Property ${key} must contain at least ${properties.min} characters`);
						}

						if (typeof properties.max !== 'undefined' && data[key].length > properties.max) {
							this.validationErrors.push(`Property ${key} must contain less than ${properties.max} characters`);
						}
					}

					// Check number min/max
					else if (typeof properties.type() === 'number') {
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

					if (typeof properties.min !== 'undefined' && data[key].length < properties.min) {
						this.validationErrors.push(`Property ${key} must contain at least ${properties.min} elements`);
					}

					if (typeof properties.max !== 'undefined' && data[key].length > properties.max) {
						this.validationErrors.push(`Property ${key} must contain no more than ${properties.max} elements`);
					}

					else if (properties.type.length === 1 && properties.type[0] instanceof Schemy) {
						if (data[key].some(item => !properties.type[0].validate(item))) {
							this.validationErrors.push(`An item in array of property ${key} is not valid`);
						}

						continue;
					}

					else if (properties.type.length === 1 && data[key].some(item => typeof item !== typeof properties.type[0]())) {
						this.validationErrors.push(`An item in array of property ${key} is not valid. All items must be of type ${typeof properties.type[0]()}`);
					}
				}
			}
		}

		Schemy.triggerEvent.call(this, 'afterValidate', data);

		return (this.validationErrors.length === 0);
	}

	/**
	 * Get all the validation errors from the last validation
	 * 
	 * @returns {Array<String>} Array with string of errors
	 */
	getValidationErrors() {
		if (this.validationErrors === null) {
			throw 'You need to call .validate() before .getValidationErrors()';
		}

		Schemy.triggerEvent.call(this, 'getValidationErrors', null);

		return this.validationErrors;
	}

	/**
	 * Get the data provided in the last validation
	 * 
	 * @param {Boolean} includeAll Include properties not declared in schema
	 * @param {Boolean} orderBody Order the body based on the schema
	 * @returns {Object} Last validated data
	 */
	getBody(includeAll = false, orderBody = true) {
		let output = { ...this.data };
		let ordered = {};

		if (this.flex && !includeAll) {
			Object.keys(output).forEach(key => {
				if (!this.schema[key]) {
					delete output[key];
				}
			});
		}

		if (!orderBody) {
			return output;
		}

		// Add key in orders
		for (const key in this.schema) {
			if (typeof output[key] !== 'undefined') {
				ordered[key] = output[key];
				delete output[key];
			}
		}

		// Add remaining things not in the schema
		for (const key in output) {
			ordered[key] = output[key];
		}

		return ordered;
	}
}