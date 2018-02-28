const { send } = require('micro')
const { router, get } = require('microrouter')
const {
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
} = require('./checks')

const EKG = function() {
  let livenessChecks = []
  let readynessChecks = []

  const addLivenessCheck = ({ name, check }) => {
    const newCheck = { name, check }
    livenessChecks = [...livenessChecks, newCheck]
    return () => {
      livenessChecks = livenessChecks.filter(curCheck => newCheck !== curCheck)
    }
  }

  const addReadynessCheck = ({ name, check }) => {
    const newCheck = { name, check }
    readynessChecks = [...readynessChecks, newCheck]
    return () => {
      readynessChecks = readynessChecks.filter(
        curCheck => newCheck !== curCheck,
      )
    }
  }

  const baseHandler = ({ checks }) => async (req, res) => {
    let results = []
    for (let check of checks) {
      try {
        await check.check()
        results = [
          ...results,
          {
            name: check.name,
            passed: true,
          },
        ]
      } catch ({ message, stack }) {
        results = [
          ...results,
          {
            name: check.name,
            passed: false,
            message,
            stack,
          },
        ]
      }
    }
    send(res, results.find(r => !r.passed) ? 503 : 200, results)
  }

  const liveHandler = (req, res) =>
    baseHandler({ checks: livenessChecks })(req, res)
  const readyHandler = (req, res) =>
    baseHandler({ checks: readynessChecks })(req, res)

  const handler = router(get('/live', liveHandler), get('/ready', readyHandler))
  return {
    handler,
    addLivenessCheck,
    addReadynessCheck,
  }
}

module.exports = {
  EKG,
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
}
