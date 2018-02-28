const { default: micro, send } = require('micro')
const sleep = require('then-sleep')
const listen = require('test-listen')
const { timeoutCheck, httpGetCheck, dnsResolveCheck } = require('../src/checks')

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
