const zmq = require('zeromq')

const mode = process.env.ZMQ_MODE || 'sub'
const host = process.env.ZMQ_HOST || '127.0.0.1'
const port = process.env.ZMQ_PORT || 5556

const sock = zmq.socket(mode)
sock.bindSync(`tcp://${host}:${port}`);
// sock.bindSync('tcp://127.0.0.1:5556')

sock.subscribe('')
sock.on('message', (msg) => {
  console.log(msg.toString())
})

// setInterval(function(){
//   console.log('sending a multipart message envelope')
//   sock.send(['kitty cats', 'meow!'])
// }, 500)

console.log(`ZMQ_PORT=${port} ZMQ_HOST=${host} ZMQ_MODE=${mode} npm start`)
