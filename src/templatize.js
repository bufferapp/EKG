const templateRegex = /\${([^{}\$]+)}/g

module.exports = ({ template, variables }) => {
  const result = template.replace(templateRegex, (match, key) => {
    if (!variables[key]) {
      throw new Error(`Could not find variable: ${key}`)
    }
    return variables[key]
  })
  return result
}
