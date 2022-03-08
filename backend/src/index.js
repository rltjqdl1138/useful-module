require('@babel/polyfill')
const http = require('http')
const appRun = require('./runner/RestAPI').default;
const {serverData} = require('../config')

appRun().then(({app}) =>
    http.createServer(app).listen(serverData.port, print ))

const print = ()=>{
    console.log(`Server is Running on ${serverData.address}:${serverData.port}`)
}