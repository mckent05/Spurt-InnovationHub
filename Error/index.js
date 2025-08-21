const NotfoundError = require("./notfound")
const BadRequestError = require("./BadRequest")
const UnAuthenticatedError = require("./unauthenticated")
const CustomAPI = require("./CustomAPI")
const InternalServerError = require("./InternalServer")

module.exports = {
    NotfoundError,
    BadRequestError,
    UnAuthenticatedError,
    CustomAPI, 
    InternalServerError
}