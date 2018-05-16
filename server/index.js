const io = require('socket.io')()
const r = require('rethinkdb')

const cretaeDrawing = ({ connection, name }) => {
  r.table('drawings')
    .insert({
      name,
      timestamp: new Date()
    })
    .run(connection)
    .then(() => console.log(`created a drawing with the name ${name}`))
}

const subscribeToDrawings = ({client, connection }) => {
  r.table('drawings')
    .changes({ include_initial: true })
    .run(connection)
    .then((cursor) => {
      cursor.each((err, drawingRow) => client.emit('drawing', drawingRow.new_val))
    })
}

r.connect({
  host: 'localhost',
  port: 28015,
  db: 'awesome_drawboard'
})
  .then((connection) => {
    io.on('connection', (client) => {
      client.on('createDrawing', ({ name }) => {
        cretaeDrawing({ connection, name })
      })
      client.on('subscribeToDrawings', () => subscribeToDrawings({
        client,
        connection
      }))
    })
  })



const port = 8000
io.listen(8000, () => {console.log(`Listening on port ${port}`)})