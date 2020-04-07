const jwt = require('jsonwebtoken')
const User = require('../models/user')
const path = require('path')


const auth = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '')
        const cookie = req.headers.cookie;
        let token = cookie.substring(cookie.indexOf("token=")+6);
        const end = token.indexOf("; ")
        if(end!=-1)
            token = token.substring(0, end);
        const decoded = jwt.verify(token, process.env.JWT_SECRET||"thisisasecretformyapp")
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.sendfile(path.resolve('./public/login.html'))
    }
}

module.exports = auth