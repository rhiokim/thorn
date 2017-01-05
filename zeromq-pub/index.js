const zmq = require('zeromq')

const mode = process.env.ZMQ_MODE || 'pub'
const host = process.env.ZMQ_PUBLISHER || '127.0.0.1'
const port = process.env.ZMQ_PORT || 5556

const sock = zmq.socket(mode)

sock.connect(`tcp://${host}:${port}`)

setInterval(function(){
  console.log('sending a multipart message envelope')
  sock.send('ya ong!')
  sock.send(['kitty cats', 'meow!'])
}, 500)

// sock.subscribe('kitty cats')
// console.log(`Subscriber connected to tcp://${host}:${port}`)

// sock.on('message', function(topic, message) {
//   console.log('received a message related to:', topic, 'containing message:', message)
// })
