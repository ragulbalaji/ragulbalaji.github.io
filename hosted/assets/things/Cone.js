import * as THREE from '../lib/three.module.min.js'

export default class Cone {
  constructor (scene, config) {
    this.scene = scene

    this.config = {}
    this.setConfig(config)
    
    const geometry = new THREE.ConeGeometry(1, 2, 8)
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
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