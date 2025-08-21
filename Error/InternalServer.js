const CustomAPI = require("./CustomAPI")
const { StatusCodes } = require("http-status-codes")

class InternalServerError extends CustomAPI {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}

module.exports = InternalServerError