var SSE = require('sse-nodejs');
var bodyParser = require('body-parser')
var express = require('express');
var app = express();
app.use(bodyParser.json())
var sse = new Map
var allmsg = []

var os = require('os')
var ifaces = os.networkInterfaces()
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0
    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) return
        if (alias >= 1) {
            console.log(ifname + ':' + alias, iface.address)
        } else {
            console.log(ifname, iface.address)
        }
        ++alias
    })
})

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html') )

app.get('/start/:id', (req, res) => {
    let app = SSE(res)
    let appid = req.params.id
    app.disconnect( () => sse.delete(appid) )
    sse.set( appid, app )
    allmsg.forEach( v => app.sendEvent('time', () => v ) )
})

app.post('/ping', (req, res) => {
    allmsg.push( data = { ts: new Date(), msg: req.body.x, uid: req.body.id })
    sse.forEach( (v, k) =>
        v.sendEvent('time', () => data )
    )  
    res.send({ nu: sse.size })
})

app.listen(3000)