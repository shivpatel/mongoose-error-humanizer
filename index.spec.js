const assert = require('assert')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const prettifyErrors = require('./')

const schema = new mongoose.Schema({
  name: { type: String, required: [true, 'name required'], unique: true },
  email: { type: String, required: [true, 'email required'], unique: true, immutable: true },
  phone: { type: String, required: [true, 'phone number required'], unique: true },
  country: { type: String, enum: ['usa', 'india'] }
})

schema.post('save', prettifyErrors)
schema.post('update', prettifyErrors)

const Model = mongoose.model('model', schema)

describe('prettier', function () {
  let db

  before(async function () {
    db = await MongoMemoryServer.create()
    await mongoose.connect(db.getUri(), { useNewUrlParser: true })
  })

  beforeEach(async function () {
    await mongoose.connection.db.dropDatabase();
    await Model.ensureIndexes()
  })

  after(async function () {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    await db.stop()
  })

  it('throws when required field is missing', async function () {
    await assert.rejects(async function () {
      await Model.create({})
    }, { name: 'Error', message: 'phone required, email required, name required' })
  })

  it('throws on unique field violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123' })
      await Model.create({ name: 'shiv', email: 'shiv2@domain.com', phone: '456' })
    }, { name: 'Error', message: 'name must be unique' })
  })

  it('throws on field enum violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', country: 'other' })
    }, { name: 'Error', message: 'country cannot be other' })
  })

})