# mongoose-error-humanizer
Mongoose post hook handler to automatically convert validation and dup errors into human friendly strings

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