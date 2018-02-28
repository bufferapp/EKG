const micro = require('micro')
const { default: EKG, httpGetCheck, dnsResolveCheck } = require('../src')

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
ekg.addLivenessCheck({
  name: 'http google',
  check: httpGetCheck({ url: 'https://google.com' }),
})
ekg.addLivenessCheck({
  name: 'dns buffer',
  check: dnsResolveCheck({ host: 'buffer.com' }),
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
ekg.addReadynessCheck({
  name: 'http google',
  check: httpGetCheck({ url: 'https://google.com' }),
})
ekg.addReadynessCheck({
  name: 'dns buffer',
  check: dnsResolveCheck({ host: 'buffer.com' }),
})

const server = micro(ekg.handler)
server.listen(3000, () => console.log('listening on port 3000'))
