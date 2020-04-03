import TtlCache from './cache';


let BASE_URL;

if (process.env.REACT_APP_APP_STAGE === "production") {
  BASE_URL = process.env.REACT_APP_API_ENDPOINT
} else {
  BASE_URL = `${window.location.protocol}://${window.location.hostname}/api/v1`
}

const withParams = (params, schema) => {
  for (let [key, value] of Object.entries(params)) {
    if (schema[key] === undefined) {
      throw new Error(`Extra parameter found: ${key}`)
    }
  }

  for (let [key, required] of Object.entries(schema)) {
    if (!params[key] && required) {
      throw new Error(`Missing required parameter: ${key}`)
    }
  }
}

const cache = new TtlCache(60);

const get = async (endpoint, params) => {
  let url = new URL(endpoint, BASE_URL);
  url.search = new URLSearchParams(params).toString();

  const key = url.toString()
  const cached = cache.get(key)
  if (cached) {
    return cached
  }

  const response = await fetch(url).then(resp => resp.json())
  cache.set(key, response)
  return response
}

const createApiMethod = (endpoint, schema, paramFormatter) => {
  const method = async (params = {}) => {
    withParams(params, schema)
    if (paramFormatter) {
      params = paramFormatter(params)
    }
    return await get(endpoint, params)
  }
  return method
}

const createResourceClient = resourceName => ({
  change: createApiMethod(`${resourceName}/change`, {value: true, date: false}),
  snapshot: createApiMethod(`${resourceName}/snapshot`, {value: true, date: true}),
  timeline: createApiMethod(`${resourceName}/timeline`, {value: true, startDate: false, endDate: false}),
  newest: createApiMethod(`${resourceName}/newest`, {sortBy: false}),
  deltas: createApiMethod(`${resourceName}/difference`, {value: true, stat: true}),
  keys: createApiMethod(`${resourceName}/keys`, {})
})

export const CountryApi = createResourceClient('country')
export const StateApi = createResourceClient('state')
export const CityApi = createResourceClient('city')

export const getClient = level => {
  switch (level) {
    case 'state':
      return StateApi
    case 'city':
      return CityApi
    default:
      return CountryApi
  }
}
