class Cone {
  constructor (config) {
    this.config = structuredClone(config)

    this.agent = {
      lastUpdate: 0,
      updateInterval: Math.random() * 2000 + 1000,
      vx: 0,
      vy: 0,
      vz: 0,
      heading: 0,
      speed: 1
    }
  }

  update (data) {
    if (data) this.config = data

    if (Date.now() - this.agent.lastUpdate > this.agent.updateInterval) {
      this.agent.lastUpdate = Date.now()
      this.agent.heading = Math.random() * Math.PI * 2

      this.config.ry = -this.agent.heading

      this.agent.vx = Math.cos(this.agent.heading) * this.agent.speed
      this.agent.vz = Math.sin(this.agent.heading) * this.agent.speed
    }

    this.config.x += this.agent.vx
    this.config.z += this.agent.vz

    this.config.x = Math.max(-32, Math.min(32, this.config.x))
    this.config.z = Math.max(-32, Math.min(32, this.config.z))
  }

  destroy () {
  }
}

module.exports = Cone
