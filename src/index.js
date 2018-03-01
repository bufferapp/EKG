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
  let readinessChecks = []

  const addLivenessCheck = ({ name, check }) => {
    const newCheck = { name, check }
    livenessChecks = [...livenessChecks, newCheck]
    return () => {
      livenessChecks = livenessChecks.filter(curCheck => newCheck !== curCheck)
    }
  }

  const addReadinessCheck = ({ name, check }) => {
    const newCheck = { name, check }
    readinessChecks = [...readinessChecks, newCheck]
    return () => {
      readinessChecks = readinessChecks.filter(
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
    baseHandler({ checks: readinessChecks })(req, res)

  const handler = router(get('/live', liveHandler), get('/ready', readyHandler))
  return {
    handler,
    addLivenessCheck,
    addReadinessCheck,
  }
}

module.exports = EKG
exports = EKG
exports.default = EKG
exports.timeoutCheck = timeoutCheck
exports.httpGetCheck = httpGetCheck
exports.dnsResolveCheck = dnsResolveCheck
exports.tcpDialCheck = tcpDialCheck
exports.mongoDBCheck = mongoDBCheck
