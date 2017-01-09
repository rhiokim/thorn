const elasticsearch = require('elasticsearch')

const host = process.env.EL_HOST || '127.0.0.1'
const port = process.env.EL_PORT || 9200

const client = new elasticsearch.Client({
  hosts: [
    `http://${host}:${port}/`
  ]
})

module.exports = client
