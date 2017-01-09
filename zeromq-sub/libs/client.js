const elasticsearch = require('elasticsearch')

const host = process.env.EL_HOST || '127.0.0.1'
const port = process.env.EL_PORT || 9200

const client = new elasticsearch.Client({
  hosts: [
    `http://${host}:${port}/`
  ]
})

client.cluster.health({}, (err, res, status) => {
  console.log(res)
})

client.indices.exists({
  index: 'naxsi'
}, (err, res, status) => {
  console.log('exists naxsi index', res)
})

module.exports = client
