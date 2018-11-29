var SSE = require('sse-nodejs');
var bodyParser = require('body-parser')
var express = require('express');
var app = express();
const PORT = process.env.PORT || 5000
app.use(bodyParser.json())
var sse = new Map
var allmsg = []

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/favicon.ico', (req, res) => res.sendFile(__dirname + '/favicon.ico'))

app.get('/start/:id', (req, res) => {
    let app = SSE(res)
    let appid = req.params.id
    app.disconnect( () => sse.delete(appid) )
    sse.set( appid, app )
    //allmsg.forEach( v => app.sendEvent('time', () => v ) )
})

app.post('/ping', (req, res) => {
    allmsg.push( data = { ts: new Date(), msg: req.body.x, uid: req.body.id })
    sse.forEach( (v, k) =>
        v.sendEvent('time', () => data )
    )  
    res.send({ nu: sse.size })
})

app.listen(PORT)