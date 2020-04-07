const express = require('express')
const path = require('path')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get("/",auth, async(req,res)=>{
    res.sendfile(path.resolve('./public/chat.html'))
})

module.exports = router