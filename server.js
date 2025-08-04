import express from 'express';
const app = express();
import { createServer } from 'http';
const {server} = require('socket.io');




const server = createServer(app);
const io = new server(server);

io.on('connection', (socket) => {
    console.log('socket connected', socket.id)
} )


const PORT = process.env.PORT || 5000;
server.listen(PORT,() => console.log('Listening on port ${PORT}'));