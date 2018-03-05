const templatize = require('../src/templatize')

test('should string with no templates', () => {
  const template = 'test'
  expect(templatize({ template })).toBe(template)
})

test('should replace string templates with tokens', () => {
  const template = ' ${test} '
  const variables = {
    test: 'this is just a test',
  }
  expect(templatize({ template, variables })).toBe(` ${variables.test} `)
})

test('should replace 2 string templates with tokens', () => {
  const template = ' ${one} ${two} '
  const variables = {
    one: 1,
    two: 2,
  }
  expect(templatize({ template, variables })).toBe(` 1 2 `)
})

test('should throw an error if a variable is missing', () => {
  const template = ' ${test} '
  const variables = {}
  expect(() => templatize({ template, variables })).toThrow(
    `Could not find variable: test`,
  )
})
