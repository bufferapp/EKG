const { default: micro, send } = require('micro')
const { URL } = require('url')
const sleep = require('then-sleep')
const listen = require('test-listen')
const MongoDB = require('mongodb')
const {
  timeoutCheck,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
} = require('../src/')

test('should export timeoutCheck', () => {
  expect(timeoutCheck).toBeDefined()
})

test('should return a valid response before timeout ends', async () => {
  const check = jest.fn()
  await timeoutCheck({
    check,
  })()
  expect(check).toHaveBeenCalled()
})

test('should return a throw response before timeout ends', async () => {
  expect.assertions(1)
  try {
    await timeoutCheck({
      check: () => sleep(100),
      timeout: 10,
    })()
  } catch (e) {
    expect(e.message).toBe('Check Timed Out')
  }
})

test('should export httpGetCheck', () => {
  expect(httpGetCheck).toBeDefined()
})

test('should do an httpGetCheck', async () => {
  const message = 'OK'
  const handler = jest.fn(() => message)
  const service = micro(handler)
  const url = await listen(service)

  await httpGetCheck({ url })()
  expect(handler).toHaveBeenCalled()
  service.close()
})

test('should timeout an httpGetCheck', async () => {
  expect.assertions(1)
  const service = micro(async () => {
    await sleep(100)
    return 'OK'
  })
  const url = await listen(service)
  try {
    await httpGetCheck({ url, timeout: 10 })()
  } catch (e) {
    expect(e.message).toBe('Check Timed Out')
  }

  service.close()
})

test('should handle httpGetCheck failure', async () => {
  expect.assertions(1)
  const service = micro((req, res) => {
    send(res, 400, 'NO')
  })
  const url = await listen(service)
  try {
    await httpGetCheck({ url })()
  } catch (e) {
    expect(e.statusCode).toBe(400)
  }
  service.close()
})

test('should export dnsResolveCheck', () => {
  expect(dnsResolveCheck).toBeDefined()
})

test('should resolve with dnsResolveCheck', async () => {
  const { address, family } = await dnsResolveCheck({
    host: 'buffer.com',
  })()
  expect(address).toBeDefined()
  expect(family).toBeDefined()
})

test('should handle non-existent dnsResolveCheck', async () => {
  expect.assertions(1)
  try {
    await dnsResolveCheck({
      host: 'nonexistent.buffer.com',
    })()
  } catch (e) {
    expect(e.message).toBe('getaddrinfo ENOTFOUND nonexistent.buffer.com')
  }
})

test('should handle timeout dnsResolveCheck', async () => {
  expect.assertions(1)
  try {
    await dnsResolveCheck({
      host: 'nonexistent.buffer.com',
      timeout: 0,
    })()
  } catch (e) {
    expect(e.message).toBe('Check Timed Out')
  }
})

test('should export tcpDialCheck', () => {
  expect(tcpDialCheck).toBeDefined()
})

test('should perform tcpDialCheck', async () => {
  const service = micro(() => 'OK')
  const url = await listen(service)
  const { port } = new URL(url)
  await tcpDialCheck({
    host: 'localhost',
    port,
  })()
})

test('should handle tcpDialCheck timeout', async () => {
  expect.assertions(1)
  try {
    await tcpDialCheck({
      host: 'buffer.com',
      port: 80,
      timeout: 1,
    })()
  } catch (e) {
    expect(e.message).toBe('Check Timed Out')
  }
})

test('should handle tcpDialCheck failure', async () => {
  expect.assertions(1)
  try {
    await tcpDialCheck({
      host: 'nonexistent.buffer.com',
      port: 80,
    })()
  } catch (e) {
    expect(e.message).toBe(
      'getaddrinfo ENOTFOUND nonexistent.buffer.com nonexistent.buffer.com:80',
    )
  }
})

test('should export mongoDBCheck', () => {
  expect(mongoDBCheck).toBeDefined()
})

test('should perform mongoDBCheck', async () => {
  const url = 'mongodb://localhost:27017'
  const dbName = 'default'
  await mongoDBCheck({
    url,
    dbName,
  })()
  expect(MongoDB.MongoClient.connect).toHaveBeenCalledWith(url)
  expect(MongoDB.db).toHaveBeenCalledWith(dbName)
  expect(MongoDB.stats).toHaveBeenCalled()
})

it('should handle failed mongoDBCheck', async () => {
  expect.assertions(1)
  const url = 'mongodb://localhost:27017'
  const dbName = 'fail'
  try {
    await mongoDBCheck({
      url,
      dbName,
    })()
  } catch (e) {
    expect(e.message).toBe('MongoDB Is Not OK')
  }
})

it('should handle timeout mongoDBCheck', async () => {
  expect.assertions(1)
  const url = 'mongodb://localhost:27017'
  const dbName = 'timeout'
  try {
    await mongoDBCheck({
      url,
      dbName,
      timeout: 1,
    })()
  } catch (e) {
    expect(e.message).toBe('Check Timed Out')
  }
})
