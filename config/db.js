const moongose = require("mongoose")


const connectDB = async(url) => {
    try {
        await moongose.connect(url)
    }
    catch(err) {
        console.log(err)
    }
}

module.exports = connectDB