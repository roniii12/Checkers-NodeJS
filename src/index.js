const path = require('path')
const http = require('http')
const request = require('request')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
require('./db/mongoose')
const User = require('./models/user')
const userRouter = require('./routers/user')
const gameRouter = require('./routers/game')
const chatRoomRouter = require('./routers/chatRoom')
const CheckersGame = require('./utils/chekerGame')
var bodyParser = require('body-parser');



const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 8000
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, './templates/views')


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.json());
app.use(express.static(publicDirectoryPath));
app.use(userRouter);
app.use(gameRouter);
app.use(chatRoomRouter);


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', async (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
            user: user.username
        });
        const users = {};
        const all = await User.find(users,(err,user)=>{
            users[user._id]=user;
        });
        io.to(user.room).emit('allMembers',{
            members: all
        })

        callback()
    })
    socket.on('joinGame', async (options, callback) => {
        const realUser = await User.findOne({name: options.username})
        if(!realUser){
            console.log("doesn't success find this user")
            callback({error: "doesn't success find this user"})
        }
        console.log(realUser.name);
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback({error})
        }
        socket.join(user.room)
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        let lengthUsers = Object.keys(getUsersInRoom(user.room)).length
        if(lengthUsers == 1){
            callback({message: "bright"});
        }
        else if (lengthUsers == 2){
            callback({message: "dark"});
        }
        else {
            callback({message: "watch"})
        }
    })

    socket.on('addUser',(options,callback)=>{
        request({method:"POST", uri: "http://127.0.0.1:8000/register",json: options},(error,response,body)=>{
            callback(response.body||"");
        })
    })

    // socket.on("login",(options,callback)=>{
    //     request.post({uri: "http://127.0.0.1:8000/login", json: options},(error,response,body)=>{
    //         callback(response.body||"");
    //     })
    // })


    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    socket.on("sendPlay", async ({currentChecker,currentCheckerKing, room, numbersOfRow, targetLocation,element,game,username})=>{
        let broad;
        let change;
        if(numbersOfRow){
            console.log("has nubmers of row ohhhhhhh");
            broad = new CheckersGame(numbersOfRow,currentChecker,currentCheckerKing);
            broad.createTable();
        }
        if(targetLocation){
            let keepPlay = new CheckersGame(numbersOfRow,currentChecker,currentCheckerKing);
            keepPlay.table = game.table;
            keepPlay.locations = game.locations;
            keepPlay.isTurnBright = game.isTurnBright;
            keepPlay.elements = game.elements;
            keepPlay.update = game.update;
            change = keepPlay.move(element,targetLocation)
            broad = keepPlay;
        }
        if(broad.isGameOverProp && broad.isGameOverProp.GameOver == true)
        {
            broad.isGameOverProp.message += " (" + username+") ";
            console.log(broad.isGameOverProp.message);
            const users = getUsersInRoom(room);
            let user1= await User.findOne({name: users[0].username})
            let user2= await User.findOne({name: users[1].username})
            if(username==user1.name){
                if(user1.points>=user2.points)
                    user1.points+=3;
                else
                    user1.points+=3+(user2.points-user1.points)/10;
                user1.save();
            }
            else if(username==user2.name){
                if(user2.points>=user1.points)
                    user2.points+=3;
                else
                    user2.points+=3+(user1.points-user2.points)/10
                user2.save();
            }
        }
        socket.join(room)
        if(game){
            if(change)
                io.to(room).emit("play",broad);
        }
        else
            io.to(room).emit("play",broad);
        if(targetLocation)
            io.to(room).emit("color",broad);
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})