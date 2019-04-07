const WebSocket=require('ws')
const protocol=require('./protocol')
const url=require('url')
const config=require('./lib/config')
const wsClient=require('./lib/farmer')
const Keeper=require('./lib/keeper')

//启动客户端连接Manager
let wsc=new wsClient(config.url)
wsc.connect()


//作为本地网络服务器模式：本地网络运行manger+farmer即可
//开启本地端口接受worker
const wss=new WebSocket.Server({port:config.localport,clientTracking:true})
console.log(`listening:${config.localport}`)
let idInit=2001
wss.getUniqueID = function () {
    return idInit++;
};
wss.on('connection',function connection(ws,req) {
    ws.id=wss.getUniqueID()
    const parameters=url.parse(req.url,true)
    ws.name=parameters.query.name
    ws.group=parameters.query.group
    ws.ip=req.connection.remoteAddress
    ws.jobid=''
    ws.taskid=''
    ws.alive=true
    //worker的工作状态，0--为忙 1--为空闲，null--为未知
    ws.state=null
    console.log('❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖')
    console.log('worker havd connected! id:'+ws.id)
    console.log('client name:'+ws.name)
    console.log('client group:'+ws.group)
    //用ip识别客户端
    console.log('client accept:'+ws.ip)
    console.log('❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖')
    ws.send('connected!')
    //解析worker发来的协议
    ws.on('message',(msg)=> {
        ws.alive=true
        //每次收到worker的信息则为WSC更新WORKER列表
        wsc.setWorkers(wss.clients)
        if(!msg.startsWith('{')){
            console.log(`【${ws.name}】:${msg}`)
        }
        if(ws.group=='workers'){
            protocol.worker(wsc,ws,msg)
        }
    })
    ws.on('ping',()=>{
        ws.alive=true
    })
})   
wsc.setWorkers(wss.clients)
let kp=new Keeper(wss)
setTimeout(()=>{
    kp.removeOffline()
},3000)