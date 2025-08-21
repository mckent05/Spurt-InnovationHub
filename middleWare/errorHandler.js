const { StatusCodes } = require('http-status-codes')
const CustomAPI = require('../Error/CustomAPI')

const errorHandler = (error, req, res, next) => {
    let customErrorMsg = {
        statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: error.message || 'Something went wrong'
    }

    if(error.name === "ValidationError") {
        customErrorMsg.msg = Object.values(error.errors).map((item) => item.message).join('')
        customErrorMsg.statusCode = 400   
    }
    if (error.code && error.code === 11000) {
        customErrorMsg.msg = `Duplicate value entered for ${Object.keys(
          error.keyValue
        )} field, please choose another value`
        customErrorMsg.statusCode = 400
      }
      if (error.name === 'CastError') {
        customErrorMsg.msg = `No item found with id : ${error.value}`
        customErrorMsg.statusCode = 404
      }
    res.status(customErrorMsg.statusCode).json({msg: customErrorMsg.msg})
    
}

module.exports = errorHandler