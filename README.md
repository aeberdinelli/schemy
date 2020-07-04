# Schemy | <sup><sub>[Documentation ↗](https://github.com/aeberdinelli/schemy/wiki)</sub></sup>
Schemy is a extremely simple, lightweight schema validation library.

## What's wrong with the existing alternatives?
Nothing. Joi is amazing, and if you use MongoDB you can also take advantage of mongoose. 
However, what if I want a really small, simple and lightweight library that just validates a schema and **nothing else**? To use in, for example, an AWS lambda function.

## Usage
Install using npm: `npm install --save schemy`.
Then, create a schema with the desired properties and their types:

```javascript
const Schema = require('schemy');

const characterSchema = new Schema({
    'name': {
        type: String,
        required: true
    },
    'age': {
	   type: Number,
       required: true
    },
    'pictures': {
        type: [String]
    },
    
    // Schemy has some helpers to validate string formats like v1 uuid
    'id': {
        type: 'uuid/v1'
    }
});
```

Now, to validate that schema in your validation code:
```javascript
// This is a mock of some input we want to validate
const userInput = { name: 'Alan' };

// Validate against input data
if (!characterSchema.validate(userInput)) {
    // Schema is incorrect
    console.log(
        characterSchema.getValidationErrors()
    );

    // That will output something like:
    // [
    //    'Missing required property age'
    // ]
}
```

## API
### Schemy(object)
Takes an object with the desired structure to validate later.

```javascript
const Schema = require('schemy');

module.exports = new Schema({
	'name': {
		type: String,
		required: true
	},
	'lastname': {
		type: String,
	},
	'phone': {
		type: Number,
		required: true
	},
	'pictures': {
		type: [String]
	},
	'type': {
		type: String,
		required: true,
		enum: ['type1','type2','other']
	},
	'companyId': {
		type: 'uuid/v1',
	},
	'deleted': {
		type: Number,
		default: 0
	}
});
```
<br>

### Schemy.validate(data)
Validates the schema and returns true if input data passes validation. Returns false otherwise.

```javascript
const exampleSchema = new Schema({...});

const input = {
    'name': 'Alan'
};

if (!exampleSchema.validate(input)) {
    // Input failed validation
} else {
    // All good!
}
```
<br>

### Schemy.getValidationErrors()
If `Schemy.validate(...)` was called before, returns an array with all the validation errors of the last validation.

```javascript
const exampleSchema = new Schema({
    'age': {
        type: Number,
        required: 'true'
    }
});

const input = {
    'age': '25'
};

if (!exampleSchema.validate(input)) {
    console.log(
        exampleSchema.getValidationErrors()
    );
    
    // Output will be:
    // [
    //     "Property age is string, expected number"
    // ] 
}
```
<br>

### Schemy.getBody()
Returns the validated body as an object from the last `Schemy.validate()` call.
