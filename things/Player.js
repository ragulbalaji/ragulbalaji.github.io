class Player {
  constructor (config) {
    this.setConfig(config)
  }

  setConfig (config) {
    this.config = structuredClone(config)
  }

  update () {
  }

  destroy () {
  }
}

module.exports = Player
