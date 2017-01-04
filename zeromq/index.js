const zmq = require('zeromq')

const mode = process.env.ZMQ_MODE || 'pub'
const host = process.env.ZMQ_HOST || '127.0.0.1'
const port = 3000

const sock = zmq.socket(mode)

sock.bindSync(`tcp://${host}:${port}`);
console.log(`mode: ${mode} , host: ${host} , port: ${port}`);

setInterval(function(){
  console.log('sending a multipart message envelope');
  sock.send(['kitty cats', 'meow!']);
}, 500);
