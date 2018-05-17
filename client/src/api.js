import openSocket from 'socket.io-client'

const socket = openSocket('http://localhost:8000')

function subscribeToDrawings(cb) {
  socket.on('drawing', cb)
  socket.emit('subscribeToDrawings')
}

const subscribeToDrawingLines = (drawingId, cb) => {
  socket.on(`drawingLine:${drawingId}`, cb)
  socket.emit('subscribeToDrawingLines', drawingId)
}

function createDrawing(name) {
  socket.emit('createDrawing', { name })
}

const publishLine = ({ drawingId, line }) => {
  socket.emit('publishLine', { drawingId, ...line })
}

export {
  createDrawing,
  subscribeToDrawings,
  publishLine,
  subscribeToDrawingLines
}