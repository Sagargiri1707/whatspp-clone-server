const express=require('express')
const socketio=require('socket.io')
const http=require('http')
const cors=require('cors')
const Port=process.env.PORT||5000

const router=require('./router')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./user');

const app=express()
app.use(cors())
const server=http.createServer(app)
const io=socketio(server,{
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

io.on('connection',(socket)=>{
    console.log('we have a new conn');
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);

        if(user) {
          io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
          io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    })

    socket.on('join',({name,room},callback)=>{
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return callback(error);
    
        socket.join(user.room);
    
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
    
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    
        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        console.log(message);
        io.to(user.room).emit('message', { user: user.name, text: message });
    
        callback();
      
    });
     
    

})

app.use(router)
server.listen(Port,()=>console.log('port',Port))