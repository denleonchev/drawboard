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

const subscribeToDrawingsLines = ({ client, connection, drawingId }) => {
  return r.table('lines')
    .filter(r.row('drawingId').eq(drawingId))
    .changes({include_initial: true})
    .run(connection)
    .then((cursor) => {
      cursor.each((err, lineRow) => client.emit(`drawingLine:${drawingId}`, lineRow.new_val))
    })
}

const subscribeToDrawings = ({client, connection }) => {
  r.table('drawings')
    .changes({ include_initial: true })
    .run(connection)
    .then((cursor) => {
      cursor.each((err, drawingRow) => client.emit('drawing', drawingRow.new_val))
    })
}

const handleLinePublish = ({ connection, line }) => {
  console.log('saving line to db')
  console.log(line)
  r.table('lines')
    .insert(Object.assign(line, { timestamp: new Date() }))
    .run(connection)
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
      client.on('publishLine', (line) => {
        handleLinePublish({
          connection,
          line
        })
      })
      client.on('subscribeToDrawingLines', (drawingId) => {
        subscribeToDrawingsLines({
          client,
          connection,
          drawingId
        })
      })
    })
  })



const port = parseInt(process.argv[2], 10) || 8000
io.listen(8000, () => {console.log(`Listening on port ${port}`)})