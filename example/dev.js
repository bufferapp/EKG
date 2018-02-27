const micro = require('micro')
const EKG = require('../src')

const ekg = new EKG()

ekg.addLivenessCheck({
  name: 'passing check',
  check: async () => 'OK',
})
ekg.addLivenessCheck({
  name: 'failing check',
  check: async () => {
    throw new Error('Liveness Kaboom!')
  },
})

ekg.addReadynessCheck({
  name: 'passing check',
  check: async () => 'OK',
})
ekg.addReadynessCheck({
  name: 'failing check',
  check: async () => {
    throw new Error('Readyness Kaboom!')
  },
})

const server = micro(ekg.handler)
server.listen(3000, () => console.log('listening on port 3000'))
