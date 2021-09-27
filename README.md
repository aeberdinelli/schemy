<div align="center">
    <img src="https://user-images.githubusercontent.com/1413883/134991554-4ff6464e-c297-4367-8191-088f9919a5e1.png" height="110">
</div>

### [Docs 📖](https://github.com/aeberdinelli/schemy/wiki) · [Plugins 🧩](https://github.com/aeberdinelli/schemy/wiki/List-of-plugins) · [Changelog 📝](https://github.com/aeberdinelli/schemy/releases)

Schemy is an extremely simple, lightweight yet powerful schema validation library. Perfect for lightweight-oriented projects like cloud functions where size and speed are key features. **It weights less than 18 KB!**

## Usage
Install using npm: `npm install --save schemy`.
Then, create a schema with the desired properties and their types:

```javascript
const Schemy = require('schemy');

const characterSchema = new Schemy({
    'name': {
        type: String,
        required: true
    }
});

// Validate against input data
if (!characterSchema.validate(someData)) {
    characterSchema.getValidationErrors(); // => [ 'Missing required property name' ]
}

// You can also validate asynchronously
await Schemy.validate(someData, characterSchema);
```

## Plugins
Schemy can be easily extended with new functionality. For example, we have support for spanish language:

```javascript
// Require the plugin
const ReferenceSupport = require('schemy-reference-support');

// Call Schemy.extend() with the plugin or with an array of plugins
Schemy.extend(ReferenceSupport);

new Schemy({
    password: String,
    confirm: Schemy.$ref('password')
});
```

You can check the whole list of [available plugins in the wiki ↗](https://github.com/aeberdinelli/schemy/wiki/List-of-plugins) 

## API
#### Static methods
- [Schemy(object)](https://github.com/aeberdinelli/schemy/wiki#-usage) - Takes an object with the desired structure to validate later
- [Schemy.validate(data, schema)](https://github.com/aeberdinelli/schemy/wiki/Async-validation#async-validation) - Asynchronously validates some data against the passed schema
- [Schemy.extend(Plugin)](https://github.com/aeberdinelli/schemy/wiki/Using-plugins) - Load one or multiple plugins into Schemy

#### Instance methods
- [validate(data)](https://github.com/aeberdinelli/schemy/wiki/Synchronous-validation) - Validates the schema
- [getValidationErrors()](https://github.com/aeberdinelli/schemy/wiki/getValidationErrors) - Returns generated errors from the last validation
- [getBody(includeAll = false)](https://github.com/aeberdinelli/schemy/wiki/getBody(includeAll-=-false)) - Returns the last validated input

<br>

[Full documentation ↗️](https://github.com/aeberdinelli/schemy/wiki)
