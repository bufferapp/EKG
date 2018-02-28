const { timeoutCheck, httpGetCheck } = require('../src/checks')
const sleep = require('then-sleep')

test('should export timeoutCheck', () => {
  expect(timeoutCheck).toBeDefined()
})

test('should return a valid response before timeout ends', async () => {
  const check = jest.fn()
  await timeoutCheck({
    check,
  })
  expect(check).toHaveBeenCalled()
})

test('should return a throw response before timeout ends', async () => {
  expect.assertions(1)
  try {
    await timeoutCheck({
      check: async () => await sleep(100),
      timeout: 10,
    })
  } catch (e) {
    expect(e.message).toBe('Check Timed Out')
  }
})
