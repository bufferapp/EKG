const dns = require('dns')
const net = require('net')
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

const tcpDialCheck = ({ host, port, timeout = 5000 }) => () =>
  new Promise((resolve, reject) => {
    const sock = new net.Socket()
    sock.on('error', e => {
      sock.destroy()
      reject(e)
    })
    sock.setTimeout(timeout, () => {
      sock.destroy()
      reject(new Error('Check Timed Out'))
    })
    sock.connect(port, host, () => {
      sock.destroy()
      resolve()
    })
  })

const mongoDBCheck = () => {}

module.exports = {
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
}
