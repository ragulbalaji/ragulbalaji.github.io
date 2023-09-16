import * as THREE from './assets/lib/three.module.min.js'
import Cone from './assets/things/Cone.js'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
window.onresize = () => {
  window.location.reload()
}

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)
const camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000)
camera.zoom = 40
camera.position.set(15, 15, 15)
camera.lookAt(0, 0, 0)
camera.updateProjectionMatrix()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const gameObjects = {}

// {
  const geometry = new THREE.PlaneGeometry(20, 20)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = - Math.PI / 2
  scene.add(plane)

  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  let pointlights = []
  for (let i = 1; i < 8; i++) {
    // make random color hex will fill saturation and lightness
    const color = (i & 0b100) * 0xff0000 + (i & 0b010) * 0x00ff00 + (i & 0b001) * 0x0000ff
    const pointlight = new THREE.PointLight( color , 100, 100 );
    pointlight.position.set( Math.random() * 20 - 10, 10, Math.random() * 20 - 10 );
    scene.add( pointlight );
    pointlights.push(pointlight)
    const pointLightHelper = new THREE.PointLightHelper( pointlight, 1 );
    scene.add(pointLightHelper);
  }

  
// }

function animate () {
  stats.begin()

  for (const id in gameObjects) {
    gameObjects[id].update()
  }

  // camera.position.x = Math.sin(Date.now() / 1000) * 20
  // camera.position.z = Math.cos(Date.now() / 1000) * 20
  // camera.position.y = Math.sin(Date.now() / 500) * 5 + 15
  camera.lookAt(0, 0, 0)

  for (let i = 0; i < pointlights.length; i++) {
    pointlights[i].position.y = Math.sin(Date.now() / 1000 + i) * 2 + 5
  }

  renderer.render(scene, camera)
  stats.end()
  requestAnimationFrame(animate)
}
animate()

const socket = io()
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
      if (data[id].type === 'Cone') {
        gameObjects[id] = new Cone(scene, data[id])
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
