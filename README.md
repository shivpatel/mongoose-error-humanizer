# mongoose-error-humanizer
Mongoose post hook handler to automatically convert validation and dup errors into human friendly strings

**Important**: This package cannot detect when mongoose custom error messages are used in your schema (https://mongoosejs.com/docs/validation.html#custom-error-messages). Do not use this package if you need your custom error messages to be thrown.

## Example Error Messages
| Case | Example |
| ----------- | ----------- |
| required field missing | `name required` |
| multiple, required fields missing | `email required, name required` |
| index (unique) violation | `email must be unique` |
| enum violation | `country cannot be other` |
| string min length violation | `city must be at least 1 character(s) long` |
| string max length violation | `city cannot be more than 10 character(s) long` |
| number min violation | `age must be at least 1` |
| number max violation | `age cannot exceed 100` |
| nested field violations | `birthday.year must be at least 1900` |

Thrown errors are of type `MongooseHumanError` (an extension of the `Error` class).

## Usage

```js
const mongoose = require('mongoose')
const humanizeErrors = require('mongoose-error-humanizer')

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
})

schema.post('save', humanizeErrors)
schema.post('update', humanizeErrors)

module.exports = mongoose.model('MyModel', schema)
```