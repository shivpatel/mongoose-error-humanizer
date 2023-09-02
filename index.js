class MongooseHumanError extends Error {
  constructor(message) {
    super(message)

    this.name = 'MongooseHumanError'
    this.message = message
  }
}

function friendlyMsgFrom(validatorError) {
  switch (validatorError.kind) {
    case 'required':
      return `${validatorError.path} required`
    case 'enum':
      return `${validatorError.path} cannot be ${validatorError.value}`
    case 'min':
      return `${validatorError.path} must be at least ${validatorError.properties?.min}`
    case 'max':
      return `${validatorError.path} cannot exceed ${validatorError.properties?.max}`
    case 'minlength':
      return `${validatorError.path} must be at least ${validatorError.properties?.minlength} character(s) long`
    case 'maxlength':
      return `${validatorError.path} cannot be more than ${validatorError.properties?.maxlength} character(s) long`
    default:
      return validatorError.message
  }
}

module.exports = function handler(e, res, next) {
  if (e === undefined || e === null) {
    return next()
  }

  if (e?.name === 'ValidationError') {
    const validatorErrors = Object.values(e?.errors || {}).map(friendlyMsgFrom).join(', ')
    return next(new MongooseHumanError(validatorErrors))
  }

  if (e?.name === 'MongoServerError') {
    switch (e?.code) {
      case 11000:
        const msg = Object.keys(e?.keyPattern || {}).join(', ') + ' must be unique'
        return next(new MongooseHumanError(msg))
      default:
        return next()
    }
  }

  // Error handling middleware can transform an error, but it can't remove the error.
  // Even if you call next() with no error as shown above, the function call will still error out.
  // https://mongoosejs.com/docs/middleware.html#error-handling-middleware
  next()
}