const dns = require('dns')
const net = require('net')
const https = require('https')
const http = require('http')
const url = require('url')
const { promisify } = require('util')
const { Server } = require('mongodb-core')

promiseDns = promisify(dns.lookup)
const adapters = {
  'http:': http,
  'https:': https,
}
const defaultTimeout = 5000

const timeoutCheck = ({ check, timeout = defaultTimeout }) => async () =>
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

const httpGetCheck = ({ url: inputUrl, timeout }) =>
  timeoutCheck({
    check: () =>
      new Promise((resolve, reject) => {
        const { protocol } = url.parse(inputUrl)
        adapters[protocol]
          .request(new url.URL(inputUrl), res => {
            if (res.statusCode !== 200) {
              const error = new Error(`Status Code ${res.statusCode}`)
              error.statusCode = res.statusCode
              reject(error)
            }
            resolve()
          })
          .on('error', e => {
            reject(e)
          })
          .end()
      }),
    timeout,
  })

const dnsResolveCheck = ({ host, timeout }) =>
  timeoutCheck({
    check: () => promiseDns(host),
    timeout,
  })

const tcpDialCheck = ({ host, port, timeout = defaultTimeout }) => () =>
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

const mongoDBCheck = ({ host, port, timeout }) =>
  timeoutCheck({
    check: () =>
      new Promise((resolve, reject) => {
        let server = new Server({
          host,
          port,
        })
        server.on('error', e => reject(e))
        server.on('connect', connection => {
          connection.command('system.$cmd', { ping: 1 }, (e, result) => {
            connection.destroy()
            if (e) {
              reject(e)
            } else {
              if (result.result.ok === 1) {
                resolve()
              } else {
                reject(new Error('MongoDB Is Not OK'))
              }
            }
          })
        })
        server.connect()
      }),
    timeout,
  })

module.exports = {
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
}
