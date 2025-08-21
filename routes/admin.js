const express = require('express')

const router = express.Router()

const {
    users,
    approveUser,
    rejectUser
} = require("../controllers/admin")

router.route('/users').get(users)

router.route('/users/:id/approve').put(approveUser)

router.route('/users/:id/reject').put(rejectUser)

module.exports = router
