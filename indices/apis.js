const AlgoliaIndex = require('../lib/algolia-index')
const apis = require('../electron-api.json')
const slugger = new (require('github-slugger'))()

module.exports = new AlgoliaIndex('apis', getRecords())

function getRecords () {
  const records = []

  apis.forEach(api => {
    // TODO constructorMethod
    // TODO properties
    // TODO instanceProperties

    const staticMethods = api.staticMethods || []
    staticMethods.forEach(method => {
      method.apiType = 'staticMethod'
      method.fullSignature = `${api.name}.${method.name}${method.signature}`
      method.tldr = getTLDR(method)
      method.slug = slugger.slug(method.fullSignature)
      method.url = `https://electronjs.org/docs/api/${api.slug}#${method.slug}`
      delete method.signature
      records.push(method)
    })

    const instanceMethods = api.instanceMethods || []
    instanceMethods.forEach(method => {
      method.apiType = 'instanceMethod'
      method.fullSignature = `${api.instanceName}.${method.name}${method.signature}`
      method.tldr = getTLDR(method)
      method.slug = slugger.slug(method.fullSignature)
      method.url = `https://electronjs.org/docs/api/${api.slug}#${method.slug}`
      delete method.signature
      records.push(method)
    })

    const events = api.events || []
    events.forEach(event => {
      event.apiType = 'event'
      event.fullSignature = `${api.name}.on('${event.name}')`
      event.url = `https://electronjs.org/docs/api/${api.slug}#event-${event.name}`
      event.tldr = getTLDR(event)
      records.push(event)
    })

    const instanceEvents = api.instanceEvents || []
    instanceEvents.forEach(event => {
      event.apiType = 'event'
      event.fullSignature = `${api.instanceName}.on('${event.name}')`
      event.url = `https://electronjs.org/docs/api/${api.slug}#event-${event.name}`
      event.tldr = getTLDR(event)
      records.push(event)
    })
  })

  return records.map(record => {
    record.keyValuePairs = [
      'is:doc',
      'is:api',
      `api:${record.name}`,
      `api:${record.slug}`,
      `api:${record.fullSignature}`,
      `doc:${record.name}`,
      `doc:${record.slug}`,
      `doc:${record.fullSignature}`
    ]

    return Object.assign(
      {objectID: record.url.replace('https://electronjs.org/docs/api/', 'api-')},
      record
    )
  })
}

function getTLDR (api) {
  const { description, returns } = api
  let tldr = null

  if (!description && returns && returns.description) {
    tldr =
      'Returns ' +
      returns.description.charAt(0).toLowerCase() +
      returns.description.slice(1)
  } else if (typeof description !== 'string' || !description.length) {
    return null
  } else {
    tldr = description.split('. ')[0]
  }

  if (!tldr.endsWith('.')) tldr += '.'

  return tldr
}