const elasticsearch = require('elasticsearch')
const ElasticsearchScrollStream = require('elasticsearch-scroll-stream')

const host = process.env.EL_HOST || '192.168.99.100'
const port = process.env.EL_PORT || 9200

const client = new elasticsearch.Client({
  hosts: [
    `http://${host}:${port}/`
  ]
})

const es_stream = new ElasticsearchScrollStream(client, {
  index: 'naxsi',
  type: 'access',
  // search_type: 'scan',
  scroll: '10s',
  size: '50',
  _source: ['remote_addr'], // you can use fields:['name'] alternatively, or nothing at all for the full _source result
  q: 'remote_addr:192.168.99*'
}, ['_id', '_score']);

// Pipe the results to other writeble streams..
es_stream.pipe(process.stdout);

es_stream.on('end', function() {
  console.log("End");
});
