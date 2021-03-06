// @ts-check

const AlgoliaIndex = require('../lib/algolia-index')
// @ts-ignore
const apis = require('../electron-api.json')
const slugger = new (require('github-slugger'))()

module.exports = new AlgoliaIndex('apis', getRecords())

function getUrlFragment (urlFragment) {
  return urlFragment !== undefined ? urlFragment : ''
}

function signatureNeeded (signature) {
  if (signature !== undefined) {
    return signature
  }

  return ''
}

function getRecords () {
  const records = []

  apis.forEach(api => {
    // TODO constructorMethod
    const properties = api.properties || []
    properties.forEach(property => {
      property.apiType = 'properties'
      property.fullSignature = `${api.name}.${property.name}`
      property.tldr = getTLDR(property)
      property.slug = slugger.slug(property.fullSignature, false)
      property.url = `${api.websiteUrl}${getUrlFragment(property.urlFragment)}`
      records.push(property)
    })

    const instanceProperties = api.instanceProperties || []
    instanceProperties.forEach(property => {
      property.apiType = 'instanceProperties'
      property.fullSignature = `${api.name}.${property.name}`
      property.tldr = getTLDR(property)
      property.slug = slugger.slug(property.fullSignature, false)
      property.url = `${api.websiteUrl}${getUrlFragment(property.urlFragment)}`
      records.push(property)
    })

    const methods = api.methods || []
    methods.forEach(method => {
      method.apiType = 'methods'
      method.fullSignature = `${api.name}.${method.name}${signatureNeeded(method.signature)}`
      method.tldr = getTLDR(method)
      method.slug = slugger.slug(method.fullSignature, false)
      method.url = `${api.websiteUrl}${getUrlFragment(method.urlFragment)}`
      records.push(method)
    })

    const staticMethods = api.staticMethods || []
    staticMethods.forEach(method => {
      method.apiType = 'staticMethod'
      method.fullSignature = `${api.name}.${method.name}${signatureNeeded(method.signature)}`
      method.tldr = getTLDR(method)
      method.slug = slugger.slug(method.fullSignature, false)
      method.url = `${api.websiteUrl}${getUrlFragment(method.urlFragment)}`
      records.push(method)
    })

    const instanceMethods = api.instanceMethods || []
    instanceMethods.forEach(method => {
      method.apiType = 'instanceMethod'
      method.fullSignature = `${api.instanceName}.${method.name}${signatureNeeded(method.signature)}`
      method.tldr = getTLDR(method)
      method.slug = slugger.slug(method.fullSignature, false)
      method.url = `${api.websiteUrl}${getUrlFragment(method.urlFragment)}`
      records.push(method)
    })

    const events = api.events || []
    events.forEach(event => {
      event.apiType = 'event'
      event.fullSignature = `${api.name}.on('${event.name}')`
      event.url = `${api.websiteUrl}${getUrlFragment(event.urlFragment)}`
      event.slug = slugger.slug(event.fullSignature, false)
      event.tldr = getTLDR(event)
      records.push(event)
    })

    const instanceEvents = api.instanceEvents || []
    instanceEvents.forEach(event => {
      event.apiType = 'event'
      event.fullSignature = `${api.instanceName}.on('${event.name}')`
      event.url = `${api.websiteUrl}${getUrlFragment(event.urlFragment)}`
      event.slug = slugger.slug(event.fullSignature, false)
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
      { objectID: `${record.url.replace('https://electronjs.org/docs/api/', 'api-')}-${record.slug}` },
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
