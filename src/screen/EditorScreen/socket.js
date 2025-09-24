import  {io}  from 'socket.io-client';

// Establish a single connection to your backend server.
const socket = io('http://localhost:4000');
//add export 

//  A helper function to join the specific project room.
export const joinProject = (projectId) => {
  socket.emit('join-project', projectId);
};

//  A helper function to send code changes to the server.
export const emitCodeChange = (projectId, newCode) => {
  socket.emit('code-change', { projectId, code: newCode });
};

export const listenForInitialCode = (callback) => {
    socket.on('initial-code', callback);
};

// // A helper function to send cursor movements to the server.
export const emitCursorMove = (projectId, position) => {
  socket.emit('cursor-move', { projectId, position });
};

// // A helper to listen for code updates from the server.
export const listenForCodeUpdates = (callback) => {
  socket.on('code-update', callback);
  return () => socket.off('code-update', callback);
};

//  A helper to listen for cursor updates from the server.
export const listenForCursorUpdates = (callback) => {
  socket.on('cursor-update', callback);
    return () => socket.off('cursor-update', callback);
};

export default socket;