import * as THREE from './assets/lib/three.module.min.js'

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

const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.ConeGeometry(1, 2, 8)
const material = new THREE.MeshNormalMaterial({ })
const cube = new THREE.Mesh(geometry, material)
cube.targets = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }
scene.add(cube)

{
  const geometry = new THREE.PlaneGeometry(20, 20)
  const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = Math.PI / 2
  scene.add(plane)
}

camera.position.set(10, 10, 10)
camera.zoom = 40
camera.lookAt(0, 0, 0)
camera.updateProjectionMatrix()

function animate () {
  stats.begin()

  cube.rotation.x += (cube.targets.rx - cube.rotation.x) * 0.1
  cube.rotation.y += (cube.targets.ry - cube.rotation.y) * 0.1
  cube.rotation.z += (cube.targets.rz - cube.rotation.z) * 0.1

  cube.position.x += (cube.targets.x - cube.position.x) * 0.1
  cube.position.y += (cube.targets.y - cube.position.y) * 0.1
  cube.position.z += (cube.targets.z - cube.position.z) * 0.1

  // camera.lookAt(cube.position)

  renderer.render(scene, camera)
  stats.end()
  requestAnimationFrame(animate)
}

animate()

const socket = io()

socket.on('connect', () => {
  console.log(socket.id, 'connected')
})

socket.on('disconnect', () => {
  console.log('disconnected')
})

socket.on('cube', (data) => {
  // console.log('cube', data)
  cube.targets = data
})

const utils = {
  serverName: null
}

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
