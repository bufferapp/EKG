const dns = require('dns')
const net = require('net')
const { promisify } = require('util')
const request = require('request-promise')
const { Db, Server, MongoClient } = require('mongodb')

promiseDns = promisify(dns.lookup)
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

const mongoDBCheck = ({ url, dbName, timeout }) =>
  timeoutCheck({
    check: async () => {
      const connection = await MongoClient.connect(url)
      const stats = await connection.db(dbName).stats()
      if (stats.ok === 0) {
        throw new Error('MongoDB Is Not OK')
      }
      connection.close()
    },
    timeout,
  })

module.exports = {
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
}
