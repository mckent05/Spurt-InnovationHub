const { StatusCodes } = require('http-status-codes')
const CustomAPI = require('./CustomAPI')

class UnAuthenticatedError extends CustomAPI {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = UnAuthenticatedError