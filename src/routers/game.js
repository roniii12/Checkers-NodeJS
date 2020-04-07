const express = require('express')
const path = require('path')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get('/play/:id',auth, async(req,res)=>{
    if(req.query&&req.query.username&&req.user)
        if(req.query.username != req.user.name)
            res.status(401).send({error: "auth failed"})
    res.sendfile(path.resolve('./public/Game.html'))
})

module.exports = router
