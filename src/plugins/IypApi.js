import axios from 'axios'

/// Base url for api
const IYP_API_BASE = 'https://iyp.iijlab.net/iyp/db/neo4j/tx/'
/// Default timeout before api call are considered failed
const DEFAULT_TIMEOUT = 180000

const IypApi = {
  install: (app, options) => {
    const axios_base = axios.create({
      baseURL: IYP_API_BASE,
      timeout: DEFAULT_TIMEOUT
    })

    const run = async (query) => {
      let response = await axios_base.post('', {
        statements: [
					{
						statement: query,
						resultDataContents: ['row', 'graph']
					}
				]
    	})
      return nvlResultTransformer(response.data.results[0].data)
    }

    const nvlResultTransformer = (results) => {
			const nodes = []
			const relationships = []
			results.forEach(row => {
				if (row['graph'] !== undefined) {
					row['graph'].nodes.forEach(node => {
						if (nodes.indexOf(node) === -1) {
							nodes.push(node)
						}
					})
					row['graph'].relationships.forEach(relationship => {
						if (relationships.indexOf(relationship) === -1) {
							relationship['from'] = relationship['startNode']
							relationship['to'] = relationship['endNode']
							delete relationship['startNode']
							delete relationship['endNode']
							relationships.push(relationship)
						}
					})
				}
			})
			return { nodes, relationships }
    }

    const iyp_api = {
      run
    }
    app.provide('iyp_api', iyp_api)
  }
}

export { IypApi }