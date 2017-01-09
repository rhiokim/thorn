const elasticsearch = require('elasticsearch')

const host = process.env.EL_HOST || '192.168.99.100'
const port = process.env.EL_PORT || 9200

const client = new elasticsearch.Client({
  hosts: [
    `http://${host}:${port}/`
  ]
})

client.search({
  index: 'naxsi',
  type: 'access',
  body: {
    query: {
      match: {
        remote_addr: "192.168.99.1"
      }
    }
  }
}).then(resp => {
  console.log(resp)
}, err => {
  console.trace(err.message)
})
