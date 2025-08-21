require("dotenv").config()
require('express-async-errors');

const express = require("express")
const connectDB = require("./config/db")
const authRouter = require("./routes/auth")
const cors = require('cors');
const errorHandlerMiddleware = require("./middleWare/errorHandler")
const { auth, roleCheck } = require("./middleWare/authenticationHandler")
const adminRoutes = require("./routes/admin")
const expertRoutes = require("./routes/experts")
const hubRoutes = require("./routes/hubs")
const expertBookingRoutes = require("./routes/expertBookings")
const hubBookingRoutes = require("./routes/hubBookings")
const payOutRoutes = require("./routes/payouts")
const notFound = require("./middleWare/notFound")
const app = express()
let connectionString = process.env.MONGO_URI
connectionString = connectionString.replace("<password>", encodeURIComponent(process.env.password))

const PORT = 3000


app.use(cors());
app.use(express.json())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/admin", auth, roleCheck(["admin"]), adminRoutes)
app.use("/api/v1/experts", auth, expertRoutes)
app.use("/api/v1/hubs", auth, hubRoutes)
app.use("/api/v1/expert-booking", auth, expertBookingRoutes)
app.use("/api/v1/hub-booking", auth, hubBookingRoutes)
app.use("/api/v1/payouts", auth, payOutRoutes)
app.use(errorHandlerMiddleware)
app.use(notFound)



const start = async () => {
    try {
        await connectDB(connectionString)
        app.listen(PORT, () => {
            console.log(`Server is runnning on ${PORT}...`)
        })
    }
    catch(err) {
        console.log(err)
    }
}

start()