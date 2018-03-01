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

// Readiness
ekg.addReadinessCheck({
  name: 'passing check',
  check: async () => 'OK',
})
ekg.addReadinessCheck({
  name: 'failing check',
  check: async () => {
    throw new Error('Readiness Kaboom!')
  },
})
ekg.addReadinessCheck({
  name: 'http google',
  check: httpGetCheck({ url: 'https://google.com' }),
})
ekg.addReadinessCheck({
  name: 'dns buffer',
  check: dnsResolveCheck({ host: 'buffer.com' }),
})
ekg.addReadinessCheck({
  name: 'tcp buffer',
  check: tcpDialCheck({ host: 'buffer.com', port: 80 }),
})
ekg.addReadinessCheck({
  name: 'mongodb localhost',
  check: mongoDBCheck({
    url: 'mongodb://localhost:27017',
    dbName: 'default',
  }),
})
ekg.addReadinessCheck({
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
