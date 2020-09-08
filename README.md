# Schemy <sup>![Tests](https://github.com/aeberdinelli/schemy/workflows/Tests/badge.svg)</sup> | [Documentation ↗](https://github.com/aeberdinelli/schemy/wiki)
Schemy is an extremely simple, light schema validation library. Perfect for lightweight-oriented projects like cloud functions where size and speed are key features. It weights less than 9 KB!

## Features
✅ **Ultra lightweight**<br />
✅ **Ultra fast**<br />
✅ Nested schemas validation <br />
✅ Custom regex rules <br />
✅ Built-in Date support <br />
✅ Built-in whitelist (enum) validations <br />
✅ Built-in min/max rules for string lengths <br />
✅ Built-in min/max rules for numbers <br />
✅ Supports validation with async/await, promises and sync <br />
✅ Built-in validations for common strings format, like uuid v1 and v4 <br />
✅ Unit tested with 100% coverage <br />
✅ Easy to read and full documentation <br />

## Usage
Install using npm: `npm install --save schemy`.
Then, create a schema with the desired properties and their types:

```javascript
const Schema = require('schemy');

const nameSchema = new Schema({
    'firstname': {
        type: String,
    },
    'lastname': {
        type: String
    }
});

const characterSchema = new Schema({
    'name': {
        type: nameSchema, // You can also use nested schemas
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

// You can also validate asynchronously
await Schemy.validate(userInput, characterSchema);

// Or, using promises
Schemy
    .validate(userInput, characterSchema)
    .then(passed => {...})
    .catch(validationErrors => {...});
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
    'age': {
        type: Number,
        min: 18
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

### Schemy.validate(data, SchemyInstance)
Asynchronously validates some data against the passed schema. Throws error on failure.

```javascript
const exampleSchema = new Schemy({...});

const input = {
    'name': 'Alan'
};

async function() {
    await Schemy.validate(input, exampleSchema);
}
```

### Schemy*instance*.validate(data)
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

### Schemy*instance*.getValidationErrors()
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

### Schemy*instance*.getBody(includeAll = false)
Returns the validated body as an object from the last `Schemy.validate()` call.
If includeAll is set to true, then schemy will return the object with all the extra properties not defined in the original schema.
