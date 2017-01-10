const zmq = require('zeromq')
const uuidV1 = require('uuid/v1')
const streamifier = require('streamifier')
const WritableBulk = require('elasticsearch-streams').WritableBulk
const TransformToBulk = require('elasticsearch-streams').TransformToBulk

const mode = process.env.ZMQ_MODE || 'sub'
const host = process.env.ZMQ_HOST || '127.0.0.1'
const port = process.env.ZMQ_PORT || 5556

const elastic_client = require('./libs/client')
const stream = zmq.socket('stream')

const bulkExec = function(bulkCmds, callback) {
  console.log('bulk insert')
  console.log(bulkCmds)
  elastic_client.bulk({
    index : 'naxsi',
    type  : 'access',
    body  : bulkCmds
  }, callback);
};
const ws = new WritableBulk(bulkExec);
const toBulk = new TransformToBulk(function getIndexTypeId(doc) {
  console.log('transform')
  console.log(doc)
  return { _id: uuidV1() }; })

const create = buf => {
  console.log(typeof buf)
  streamifier.createReadStream(buf).pipe(process.stdout)
  streamifier.createReadStream(buf).pipe(toBulk).pipe(ws).on('finish', () => {
    console.log('done')
  })
  // elastic_client.create({
  //   index: 'naxsi',
  //   type: 'access',
  //   id: uuidV1(),
  //   body: JSON.parse(buf.toString())
  // }, (err, res, status) => {
  //   console.log(buf.toString())
  //   console.log(err, res, status)
  // })
}

stream.on('message', (id, msg) => {
  console.log('stream.on message', id, msg)
})

stream.bind(`tcp://${host}:${port}`, err => {
  if (err) {
    throw err
  }

  console.log('stream bind')
})
// sock.bindSync(`tcp://${host}:${port}`);
// sock.bindSync('tcp://127.0.0.1:5556')

// sock.subscribe('')
// stream.on('message', msg => create(msg))
// sock.on('message', msg => create(msg))

// setInterval(function(){
//   console.log('sending a multipart message envelope')
//   sock.send(['kitty cats', 'meow!'])
// }, 500)

console.log(`ZMQ_PORT=${port} ZMQ_HOST=${host} ZMQ_MODE=${mode} npm start`)
