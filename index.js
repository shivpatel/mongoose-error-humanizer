function friendlyMsgFrom(validatorError) {
  switch (validatorError.kind) {
    case 'required':
      return `${validatorError.path} required`
    case 'enum':
      return `${validatorError.path} cannot be ${validatorError.value}`
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
    return next(new Error(validatorErrors))
  }

  if (e?.name === 'MongoServerError') {
    switch (e?.code) {
      case 11000:
        const msg = Object.keys(e?.keyPattern || {}).join(', ') + ' must be unique'
        return next(new Error(msg))
      default:
        return next()
    }
  }
}