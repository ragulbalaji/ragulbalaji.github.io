const express = require('express')
const { createServer } = require('node:http')

const app = express()
const server = createServer(app)
const sio = require('socket.io')(server)

const serverName = 'ragsvr_' + require('crypto').randomBytes(8).toString('hex')

app.use(express.static('hosted'))

sio.on('connection', (socket) => {
  console.log(socket.id, 'connected')
  socket.emit('util', { serverName })

  socket.on('disconnect', () => {
    console.log(socket.id, 'disconnected')
  })
})

server.listen(8443, () => {
  console.log('server running at *:8443')
})

const head = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: Math.PI / 2, vx: 0, vy: 0, vz: 0 }
setInterval(() => {
  // head.rx += Math.random() * 0.4 - 0.2
  // head.ry += Math.random() * 0.4 - 0.2
  // head.rz += Math.random() * 0.4 - 0.2

  head.x += head.vx
  head.z += head.vz

  head.x = Math.max(-10, Math.min(10, head.x))
  head.z = Math.max(-10, Math.min(10, head.z))

  head.y = Math.cos(Date.now() / 100) * 0.4 + 2

  sio.emit('cube', head)
}, 1000 / 10)

setInterval(() => {
  const speed = 2
  const angle = Math.random() * Math.PI * 2

  head.ry = -angle

  head.vx = Math.cos(angle) * speed
  head.vz = Math.sin(angle) * speed
}, 1000)
