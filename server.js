const express = require('express')
const { createServer } = require('node:http')
const crypto = require('crypto')

const app = express()
const server = createServer(app)
const sio = require('socket.io')(server)

const serverName = 'ragsvr_' + crypto.randomBytes(8).toString('hex')
const hello = ['Welcome', 'வணக்கம்', 'नमस्ते', 'こんにちは', '你好', 'Hola', 'Bonjour', 'Ciao', 'Hej', 'Ahoj']

app.use(express.static('hosted'))

const gameObjects = {}
const Cone = require('./things/Cone.js')

sio.on('connection', (socket) => {
  console.log(socket.id, 'connected')
  socket.emit('util', { serverName })

  socket.on('disconnect', () => {
    console.log(socket.id, socket.registration, 'disconnected')
  })

  socket.on('register', (data) => {
    if (socket.registration) return
    if (!data.name) return
    if (data.name.length > 20) return
    console.log(socket.id, 'registered', data)
    socket.registration = data
    sio.emit('chat', { msg: `[SERVER] ${hello[Math.floor(Math.random() * hello.length)]} ${data.name}, there are ${sio.engine.clientsCount} people online` })

    socket.emit('globalupdate', gameObjects)
  })

  socket.on('chat', (data) => {
    if (!socket.registration) return
    const msg = data.msg.trim()
    if (msg.length > 100) return
    if (msg.length === 0) return
    sio.emit('chat', { msg: `[${socket.registration.name}] ${msg}` })
  })
})

server.listen(8443, () => {
  console.log('server running at *:8443')
})

setInterval(() => {
  if (Object.keys(gameObjects).length === 0) {
    for (let i = 0; i < Math.pow(2, 8); i++) {
      const config = {
        id: crypto.randomBytes(8).toString('hex'),
        type: 'Cone',
        mirage: 0.05,
        x: Math.random() * 20 - 10,
        y: 2,
        z: Math.random() * 20 - 10,
        rx: 0,
        ry: Math.random() * Math.PI * 2,
        rz: Math.PI / 2
      }
      gameObjects[config.id] = new Cone(config)
    }
  }

  for (const id in gameObjects) {
    gameObjects[id].update()

    if (Math.random() < 0.01) {
      gameObjects[id].destroy()
      delete gameObjects[id]
    }
  }

  const globalUpdateStates = {}
  for (const id in gameObjects) {
    globalUpdateStates[id] = gameObjects[id].config
  }
  
  sio.emit('globalupdate', globalUpdateStates)
}, 1000 / 5)
