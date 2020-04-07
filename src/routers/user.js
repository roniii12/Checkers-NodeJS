const express = require('express')
const path = require('path')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        var cookieString = `cookieHTTP=test;httpOnly;max-age=${60*60*24};SameSite=Strict;expires=`
        await res.setHeader('Set-Cookie', `token=${token};httpOnly;SameSite=Strict;`)
        res.status(200).send({ user, token })
    } catch (e) {
        console.log(e);
        let errorMsg = {errMsg: "The email or password you\'ve entered is incorrect"}
        let errMsgJson = JSON.stringify(errorMsg);
        res.status(400).send(errMsgJson)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/register', async (req,res)=>{
    const user = new User({name: req.body.name, email: req.body.email, password: req.body.password})

    try {
        await user.save()
        res.status(201).send("");
    }catch(e){
        console.log(e);
        js = JSON.stringify(e);
        res.status(404).send(js);
    }
})
router.get("/register",(req,res)=>{
    res.sendfile(path.resolve('../public/register.html'))
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router