const dns = require('dns')
const { promisify } = require('util')
const request = require('request-promise')

promiseDns = promisify(dns.lookup)

const timeoutCheck = ({ check, timeout = 5000 }) => async () =>
  new Promise(async (resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error('Check Timed Out'))
    }, timeout)
    let result
    try {
      result = await check()
    } catch (e) {
      reject(e)
    }
    clearTimeout(id)
    resolve(result)
  })

const httpGetCheck = ({ url, timeout }) =>
  timeoutCheck({
    check: () => request(url),
    timeout,
  })

const dnsResolveCheck = ({ host, timeout }) =>
  timeoutCheck({
    check: () => promiseDns(host),
    timeout,
  })

module.exports = {
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
}
