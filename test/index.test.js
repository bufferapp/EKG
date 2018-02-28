const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')
const EKG = require('../src')

test('should export handler', () => {
  expect(new EKG().handler).toBeDefined()
})

test('should export addLivenessCheck', () => {
  expect(new EKG().addLivenessCheck).toBeDefined()
})

test('should export addReadynessCheck', () => {
  expect(new EKG().addReadynessCheck).toBeDefined()
})

test('should handle /live endpoint', async () => {
  const service = micro(new EKG().handler)

  const url = await listen(service)
  const body = await request(`${url}/live`)

  expect(JSON.parse(body)).toEqual([])
  service.close()
})

test('should handle /live endpoint with passing check', async () => {
  const ekg = new EKG()
  const check = {
    name: 'my passing check',
    check: () => 'OK',
  }
  ekg.addLivenessCheck(check)
  const service = micro(ekg.handler)

  const url = await listen(service)
  const body = await request(`${url}/live`)

  expect(JSON.parse(body)).toEqual([
    {
      name: check.name,
      passed: true,
    },
  ])
  service.close()
})

test('should handle /live endpoint with failing checks', async () => {
  const ekg = new EKG()
  const message = 'Kaboom'
  const checks = [
    {
      name: 'my failing check',
      check: () => {
        throw new Error(message)
      },
    },
    {
      name: 'my other failing check',
      check: () => {
        throw new Error(message)
      },
    },
  ]
  checks.forEach(check => ekg.addLivenessCheck(check))

  const service = micro(ekg.handler)

  const url = await listen(service)

  const { statusCode, body: reqBody } = await request({
    uri: `${url}/live`,
    simple: false,
    resolveWithFullResponse: true,
  })

  expect(statusCode).toBe(503)

  const body = JSON.parse(reqBody)
  expect(body.length).toBe(2)
  checks.forEach((check, i) => {
    expect(body[i].name).toBe(check.name)
    expect(body[i].message).toBe(message)
    expect(body[i].stack).toEqual(expect.stringContaining(message))
    expect(body[i].passed).toBe(false)
  })
  service.close()
})

test('should handle /ready endpoint', async () => {
  const service = micro(new EKG().handler)

  const url = await listen(service)
  const body = await request(`${url}/ready`)

  expect(JSON.parse(body)).toEqual([])
  service.close()
})

test('should handle /ready endpoint with passing check', async () => {
  const ekg = new EKG()
  const check = {
    name: 'my passing check',
    check: () => 'OK',
  }
  ekg.addReadynessCheck(check)
  const service = micro(ekg.handler)

  const url = await listen(service)
  const body = await request(`${url}/ready`)

  expect(JSON.parse(body)).toEqual([
    {
      name: check.name,
      passed: true,
    },
  ])
  service.close()
})

test('should handle /ready endpoint with failing checks', async () => {
  const ekg = new EKG()
  const message = 'Kaboom'
  const checks = [
    {
      name: 'my failing check',
      check: () => {
        throw new Error(message)
      },
    },
    {
      name: 'my other failing check',
      check: () => {
        throw new Error(message)
      },
    },
  ]
  checks.forEach(check => ekg.addReadynessCheck(check))

  const service = micro(ekg.handler)

  const url = await listen(service)

  const { statusCode, body: reqBody } = await request({
    uri: `${url}/ready`,
    simple: false,
    resolveWithFullResponse: true,
  })

  expect(statusCode).toBe(503)

  const body = JSON.parse(reqBody)
  expect(body.length).toBe(2)
  checks.forEach((check, i) => {
    expect(body[i].name).toBe(check.name)
    expect(body[i].message).toBe(message)
    expect(body[i].stack).toEqual(expect.stringContaining(message))
    expect(body[i].passed).toBe(false)
  })
  service.close()
})
