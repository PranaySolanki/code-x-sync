const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');


const app = express();
app.use(cors());
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

// A basic route to test if the server is working
// app.get('/', (req, res) => {
//   res.send('<h1>CodeXsync Server is Running</h1>');
// });

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const projectStates = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

//   // Listen for a client to join a specific project
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);

    if (projectStates[projectId]) {
      // If it exists, send the current code to the new user
      socket.emit('initial-code', projectStates[projectId]);
    } else {
      // If the project is new, initialize it with an empty string
      projectStates[projectId] = '';
    }
  });

//   // Listen for real-time code changes from a client
    socket.on('code-change', (data) => {
      // Update the server's state for this project
    projectStates[data.projectId] = data.code;
     // Broadcast the change to all other clients in the sam room
    socket.to(data.projectId).emit('code-update', {
      ...data,
      userId: socket.id
    });
  });

   // Listen for cursor movements from a client
  socket.on('cursor-move', (data) => {
    // Broadcast the cursor position to all other users in the same room
    socket.to(data.projectId).emit('cursor-update', {
      ...data,
      userId: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
