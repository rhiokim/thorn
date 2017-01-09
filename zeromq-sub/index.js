const zmq = require('zeromq')
const uuidV1 = require('uuid/v1')

const mode = process.env.ZMQ_MODE || 'sub'
const host = process.env.ZMQ_HOST || '127.0.0.1'
const port = process.env.ZMQ_PORT || 5556

const elastic_client = require('./libs/client')
const sock = zmq.socket(mode)

const create = buf => {
  elastic_client.create({
    index: 'naxsi',
    type: 'access',
    id: uuidV1(),
    body: JSON.parse(buf.toString())
  }, (err, res, status) => {
    console.log(buf.toString())
    console.log(err, res, status)
  })
}

sock.bindSync(`tcp://${host}:${port}`);
// sock.bindSync('tcp://127.0.0.1:5556')

sock.subscribe('')
sock.on('message', msg => create(msg))

// setInterval(function(){
//   console.log('sending a multipart message envelope')
//   sock.send(['kitty cats', 'meow!'])
// }, 500)

console.log(`ZMQ_PORT=${port} ZMQ_HOST=${host} ZMQ_MODE=${mode} npm start`)
