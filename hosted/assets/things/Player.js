import * as THREE from '../lib/three.module.min.js'

export default class Player {
  constructor (scene, config) {
    this.scene = scene

    this.config = {}
    this.setConfig(config)

    const texture = new THREE.TextureLoader().load(`https://mineskin.eu/helm/${this.config.name}/8.png`)
    texture.magFilter = THREE.NearestFilter

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ map: texture })
    this.mesh = new THREE.Mesh(geometry, material)

    this.scene.add(this.mesh)
  }

  setConfig (config) {
    this.config = structuredClone(config)
  }

  update () {
    this.mesh.rotation.x += (this.config.rx - this.mesh.rotation.x) * this.config.mirage
    this.mesh.rotation.y += (this.config.ry - this.mesh.rotation.y) * this.config.mirage
    this.mesh.rotation.z += (this.config.rz - this.mesh.rotation.z) * this.config.mirage

    this.mesh.position.x += (this.config.x - this.mesh.position.x) * this.config.mirage
    this.mesh.position.y += (this.config.y - this.mesh.position.y) * this.config.mirage
    this.mesh.position.z += (this.config.z - this.mesh.position.z) * this.config.mirage
  }

  destroy () {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
