const { timeoutCheck } = require('../src/checks')
const sleep = require('then-sleep')

test('should export timeoutCheck', () => {
  expect(timeoutCheck).toBeDefined()
})

test('should return a valid response before timeout ends', () => {
  expect(() =>
    timeoutCheck({
      check: () => 'OK',
    }),
  ).not.toThrowError()
})

test('should return a throw response before timeout ends', async () => {
  expect.assertions(1)
  try {
    await timeoutCheck({
      check: async () => await sleep(100),
      timeout: 10,
    })
  } catch (e) {
    expect(e.message).toBe('Check Timeout')
  }
})
