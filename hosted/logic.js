import * as THREE from 'three'
import { PointerLockControls } from 'PointerLockControls'
import Cone from './assets/things/Cone.js'
import Player from './assets/things/Player.js'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
// window.onresize = () => {
//   window.location.reload()
// }

const socket = io()

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)
// const camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000)
// camera.zoom = 40
camera.position.set(15, 2, 15)
camera.lookAt(0, 0, 0)
camera.updateProjectionMatrix()

const controls = new PointerLockControls(camera, document.body)
document.body.onclick = () => { controls.lock() }
scene.add(controls.getObject())

const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const gameObjects = {}

// {
const geometry = new THREE.PlaneGeometry(64, 64)
const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = -Math.PI / 2
scene.add(plane)

const light = new THREE.AmbientLight(0xaaaaaa) // soft white light
scene.add(light)

const pointlights = []
for (let i = 1; i < 8; i++) {
  // make random color hex will fill saturation and lightness
  const color = (i & 0b100) * 0xff0000 + (i & 0b010) * 0x00ff00 + (i & 0b001) * 0x0000ff
  const pointlight = new THREE.PointLight(color, 100, 100)
  pointlight.position.set(Math.random() * 20 - 10, 10, Math.random() * 20 - 10)
  scene.add(pointlight)
  pointlights.push(pointlight)
  const pointLightHelper = new THREE.PointLightHelper(pointlight, 1)
  scene.add(pointLightHelper)
}

// const playerTest = new Player(scene, {
//   id: 'playerTest',
//   type: 'Player',
//   mirage: 0.05,
//   x: 0,
//   y: 2,
//   z: 0,
//   rx: 0,
//   ry: 0,
//   rz: 0
// })
// gameObjects[playerTest.config.id] = playerTest

// }

const keys = {}
document.body.onkeydown = (e) => { keys[e.keyCode] = true }
document.body.onkeyup = (e) => { keys[e.keyCode] = false }
camera.config = {
  sendInterval: 1000 / 8,
  lastSend: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  ax: 0,
  ay: 0.01, // gravity
  az: 0
}

function animate () {
  stats.begin()

  camera.config.vy -= camera.config.ay
  camera.position.y += camera.config.vy

  const playerSpeed = 0.5
  const minHeight = keys[16] ? 1 : 2
  if (camera.position.y <= minHeight) {
    camera.position.y = minHeight
    camera.config.vx *= 0.1
    camera.config.vz *= 0.1
    if (keys[87]) { camera.config.vx = playerSpeed }
    if (keys[83]) { camera.config.vx = -playerSpeed }
    if (keys[65]) { camera.config.vz = -playerSpeed }
    if (keys[68]) { camera.config.vz = playerSpeed }
    if (keys[32]) { camera.config.vy = 0.5 }
  } else {
    camera.config.vx *= 0.99
    camera.config.vz *= 0.99
  }

  controls.moveForward(camera.config.vx)
  controls.moveRight(camera.config.vz)

  if (Date.now() - camera.config.lastSend > camera.config.sendInterval) {
    camera.config.lastSend = Date.now()
    socket.emit('playerUpdate', {
      id: 'player_' + localStorage.getItem('name'),
      name: localStorage.getItem('name'),
      type: 'Player',
      mirage: 0.05,
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      rx: camera.rotation.x,
      ry: camera.rotation.y,
      rz: camera.rotation.z
    })
  }

  // playerTest.config.rx = camera.rotation.x
  // playerTest.config.ry = camera.rotation.y
  // playerTest.config.rz = camera.rotation.z
  // playerTest.config.x = camera.position.x - Math.sin(camera.rotation.y) * 5
  // playerTest.config.y = camera.position.y
  // playerTest.config.z = camera.position.z - Math.cos(camera.rotation.y) * 5

  for (const id in gameObjects) {
    gameObjects[id].update()
  }

  for (let i = 0; i < pointlights.length; i++) {
    pointlights[i].position.y = Math.sin(Date.now() / 1000 + i) * 2 + 5
  }

  renderer.render(scene, camera)
  stats.end()
  requestAnimationFrame(animate)
}
animate()

const name = localStorage.getItem('name') || prompt('Enter your name')
localStorage.setItem('name', name)

socket.on('connect', () => {
  console.log(socket.id, 'connected')
  socket.emit('register', { name })
})

socket.on('globalupdate', (data) => {
  // console.log('globalupdate', data)

  for (const id in gameObjects) {
    if (!data[id]) {
      gameObjects[id].destroy()
      delete gameObjects[id]
    }
  }

  for (const id in data) {
    if (gameObjects[id]) {
      gameObjects[id].setConfig(data[id])
    } else {
      if (data[id].type === 'Cone') { gameObjects[id] = new Cone(scene, data[id]) } else if (data[id].type === 'Player') {
        if (data[id].name === localStorage.getItem('name')) continue
        gameObjects[id] = new Player(scene, data[id])
      }
    }
  }

  // console.log(Object.keys(gameObjects).length)
})

socket.on('disconnect', () => {
  console.log('disconnected')
})

const utils = { serverName: null }
socket.on('util', (data) => {
  console.log('util', data)
  if (data.serverName) {
    if (utils.serverName && utils.serverName !== data.serverName) {
      console.log('Server different, reloading')
      document.body.style.backgroundColor = 'red'
      document.body.style.fontSize = '100px'
      document.body.style.color = 'white'
      document.body.innerHTML = 'reconnecting...'
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      utils.serverName = data.serverName
    }
  }
})

const chatBox = document.getElementById('chatbox')
socket.on('chat', (data) => {
  const message = document.createElement('div')
  message.innerText = data.msg
  chatBox.appendChild(message)

  while (chatBox.children.length > 5) {
    chatBox.removeChild(chatBox.children[0])
  }
})

const chatInput = document.getElementById('chatinput')
chatInput.onkeydown = (e) => {
  if (e.key === 'Enter') {
    if (chatInput.value.trim().length === 0) return
    socket.emit('chat', { msg: chatInput.value })
    chatInput.value = ''
  }
}
