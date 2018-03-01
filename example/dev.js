const micro = require('micro')
const {
  default: EKG,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
  timeoutCheck,
} = require('../src')

const ekg = new EKG()

// Liveness
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
ekg.addLivenessCheck({
  name: 'tcp buffer',
  check: tcpDialCheck({ host: 'buffer.com', port: 80 }),
})
ekg.addLivenessCheck({
  name: 'mongodb localhost',
  check: mongoDBCheck({
    url: 'mongodb://localhost:27017',
    dbName: 'default',
  }),
})
ekg.addLivenessCheck({
  name: 'timeout fail!',
  check: timeoutCheck({
    check: () =>
      new Promise(resolve => {
        setTimeout(resolve, 100)
      }),
    timeout: 1,
  }),
})

// Readyness
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
ekg.addReadynessCheck({
  name: 'tcp buffer',
  check: tcpDialCheck({ host: 'buffer.com', port: 80 }),
})
ekg.addReadynessCheck({
  name: 'mongodb localhost',
  check: mongoDBCheck({
    url: 'mongodb://localhost:27017',
    dbName: 'default',
  }),
})
ekg.addReadynessCheck({
  name: 'timeout fail!',
  check: timeoutCheck({
    check: () =>
      new Promise(resolve => {
        setTimeout(resolve, 100)
      }),
    timeout: 1,
  }),
})

const server = micro(ekg.handler)
server.listen(3000, () => console.log('listening on port 3000'))
