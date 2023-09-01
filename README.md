# mongoose-error-humanizer
Mongoose post hook handler to automatically convert validation and dup errors into human friendly strings

## Example Error Messages
| Case | Message |
| ----------- | ----------- |
| required field missing | `name required` |
| multiple, required fields missing | `email required, name required` |
| index (unique) violation | `email must be unique` |
| enum violation | `country cannot be other` |

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