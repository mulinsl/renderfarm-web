const WebSocket=require('ws')
const readline=require('readline')
const protocol=require('./protocol')
const fs=require('fs')
const url=require('url')
const config=require('./lib/config')
const Keeper=require('./lib/keeper')
const comm=require('./lib/comm')

let idInit=1001
const wss=new WebSocket.Server({port:config.port,clientTracking:true})
console.log(`listening:${config.port}`)
wss.getUniqueID = function () {
    return idInit++;
};
wss.on('connection',function connection(ws,req) {
    ws.alive = true;
    ws.id=wss.getUniqueID()
    const parameters=url.parse(req.url,true)
    ws.name=parameters.query.name
    ws.group=parameters.query.group
    ws.alive=true
    ws.connectTime=comm.getCurrentTime()
    ws.lastOnlineTime=ws.connectTime
    ws.onlineWorker={}
    console.log('❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖')
    console.log('client id:'+ws.id)
    console.log('client name:'+ws.name)
    console.log('client group:'+ws.group)
    console.log('client accept:'+req.connection.remoteAddress)
    console.log('❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖❖')
    ws.send(`${config.name}：You're connected!`)
    //解析协议
    ws.on('message',(msg)=> {
        ws.lastOnlineTime=comm.getCurrentTime()
        ws.alive=true
        if(!msg.startsWith('{')){
            console.log(ws.name+':'+msg)
        }
        if(ws.group=='publishers'){
            protocol.publisher(wss,ws,msg)
        }else if(ws.group=='farmers'){
            protocol.farmer(wss,ws,msg)
        }
    })
    // ws.on('pong',()=>{
    //     ws.alive=true
    //     ws.lastOnlineTime=comm.getCurrentTime()
    // })
    ws.on('ping',()=>{
        ws.alive=true
       if(ws.group=='publishers'){
            ws.checkTime=comm.getCurrentTime()
            ws.lastOnlineTime=ws.checkTime
           //收到publisher的ping则实时回转数据
           let sendWorkerState={type:21}
           sendWorkerState.workerList=[]
           wss.clients.forEach((client)=>{
              if (client.group=='farmers') {
                        sendWorkerState.workerList.push(client.onlineWorker)
                }
           })
           ws.send(JSON.stringify(sendWorkerState))
       }
    })
})
// const pingInterval=setTimeout(()=>{
//     wss.clients.forEach((ws)=>{
//         if(ws.alive===false) return ws.terminate()
//         ws.alive=false
//         ws.ping()
//     })
// },3000)
setTimeout(()=>{
    let kp=new Keeper(wss)
    kp.checkAlive()
    // kp.removeOffline()
},3000)


