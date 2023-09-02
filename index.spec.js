const assert = require('assert')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const prettifyErrors = require('./')

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, immutable: true },
  phone: { type: String, required: true, unique: true },
  country: { type: String, enum: ['usa', 'india'] },
  city: { type: String, minLength: 1, maxLength: 10 },
  age: { type: Number, min: 1, max: 100 },
  birthday: {
    year: { type: Number, min: 1900, max: 3000 }
  }

})

schema.post('save', prettifyErrors)
schema.post('update', prettifyErrors)

const Model = mongoose.model('model', schema)

describe('humanizer', function () {
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

  it('resolves when no errors are thrown', async function () {
    await assert.doesNotReject(async function () {
      await Model.create({ name: 'shiv', email: 'shiv@domain.com', phone: 123 })
    })
  })

  it('throws when required field is missing', async function () {
    await assert.rejects(async function () {
      await Model.create({})
    }, { name: 'MongooseHumanError', message: 'phone required, email required, name required' })
  })

  it('throws on unique field violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123' })
      await Model.create({ name: 'shiv', email: 'shiv2@domain.com', phone: '456' })
    }, { name: 'MongooseHumanError', message: 'name must be unique' })
  })

  it('throws on field enum violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', country: 'other' })
    }, { name: 'MongooseHumanError', message: 'country cannot be other' })
  })

  it('throws on Number field min violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', age: 0 })
    }, { name: 'MongooseHumanError', message: 'age must be at least 1' })
  })

  it('throws on Number field max violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', age: 101 })
    }, { name: 'MongooseHumanError', message: 'age cannot exceed 100' })
  })

  it('throws on String field min length violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', city: '' })
    }, { name: 'MongooseHumanError', message: 'city must be at least 1 character(s) long' })
  })

  it('throws on String field max length violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', city: 'ABCDEFGHIJKLMNOP' })
    }, { name: 'MongooseHumanError', message: 'city cannot be more than 10 character(s) long' })
  })

  it('throws with dot notation on nested field violation', async function () {
    await assert.rejects(async function () {
      await Model.create({ name: 'shiv', email: 'shiv1@domain.com', phone: '123', birthday: { year: 1800 } })
    }, { name: 'MongooseHumanError', message: 'birthday.year must be at least 1900' })
  })

})