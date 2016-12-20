const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.all('*', (req, res) => {
  const url = req.originalUrl
  const path = req.path
  const header = JSON.stringify(req.headers, null, 4)
  const cookie = JSON.stringify(req.cookies, null, 4)
  const method = req.method
  const hostname = req.hostname
  const ip = req.ip
  const body = JSON.stringify(req.body, null, 4)
  const result = `
    hostname: ${hostname}\n\n
    ip: ${ip}\n\n
    url: ${url}\n\n
    method: ${method}\n\n
    path: ${path}\n\n
    header: ${header}\n\n
    cookie: ${cookie}\n\n
    body: ${body}
  `

  res.send(`
    <h1>sample web server</h1><br/>
    <textarea style="margin: 0px; width: 881px; height: 323px;">${result}</textarea>`)
})

app.listen(8082)
