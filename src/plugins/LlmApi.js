import axios from 'axios'

/// Base url for api
const LLM_API_BASE = ''
/// Default timeout before api call are considered failed
const DEFAULT_TIMEOUT = 180000

const LlmApi = {
  install: (app) => {
    const axios_base = axios.create({
      baseURL: LLM_API_BASE,
      timeout: DEFAULT_TIMEOUT
    })

    const run = async (query) => {
      // Wrap Pythia is an API and add the post request.
      // let response = await axios_base.post("", {});

      // Static response for development
      return {
        cypher: 'MATCH p = (:AS {asn:2497})--(:Name) RETURN p',
        explanation: "Based on the given results, the name of AS2497 is 'IIJ'."
      }
    }

    const LlmApi = {
      run
    }
    app.provide('LlmApi', LlmApi)
  }
}

export { LlmApi }
