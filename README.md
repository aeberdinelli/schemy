# Schemy <sup>![Tests](https://github.com/aeberdinelli/schemy/workflows/Tests/badge.svg)</sup> | [Docs 📖](https://github.com/aeberdinelli/schemy/wiki) · [Plugins 🧩](https://github.com/aeberdinelli/schemy/wiki/List-of-plugins) · [Changes 📝](https://github.com/aeberdinelli/schemy/releases)
Schemy is an extremely simple, lightweight yet powerful schema validation library. Perfect for lightweight-oriented projects like cloud functions where size and speed are key features. It weights less than 18 KB!

## Why Schemy?
This is how Schemy looks compared to other validation libraries.

|Feature / Library|[Schemy](https://npmjs.com/package/schemy)|ajv|joi|yup|tiny|
|:--- |:---: |:---: |:---: |:---: |:---: |
|Size|18 KB|998 KB|515 KB|315 KB|195 KB|
|Lightweight|✔|❌|❌|❌|❌|
|Fully documented|✔|❌|❌|❌|❌|
|Easy to read codebase|✔|❌|❌|❌|❌|
|Plugin support|✔|✔|✔|❌|❌|

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
const Schemy = require('schemy');

// Require the plugin
const SchemySpanish = require('schemy-translations-spanish');

// Call Schemy.extend() with the plugin
Schemy.extend(SchemySpanish);

// If you have multiple plugins, you can pass an array:
Schemy.extend([plugin1, plugin2, plugin3]);

// Then use schemy as usual!
```

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
