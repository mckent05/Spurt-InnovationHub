const CustomAPI = require("./CustomAPI")
const { StatusCodes } = require("http-status-codes")

class NotfoundError extends CustomAPI {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

module.exports = NotfoundError