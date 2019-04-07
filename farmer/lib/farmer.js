const WebSocket=require('ws')
const protocol=require('../protocol')
const fs=require('fs')
const config=require('./config')
const {reportTask}=require('./tasker')

//向Manager请求工作协议
let reqJob={type:18,state:1}

//连接manger
function wsClient(url) {
    this.url=url
    this.workerOnline={type:20}
    this.alive=false
    this.reconnectTimes=0
}
wsClient.prototype.connect=function () {
    this.client=new WebSocket(this.url)
    this.client.on('error',(e)=>{
        this.reconnectTimes++
        this.client.removeAllListeners()
        console.log(`连接manager失败！3秒后尝试重连...错误码：${e.code}...重连次数：${this.reconnectTimes}`)
        setTimeout(()=>{
            this.reconnect()
        },3000)
    })
    this.addListener()
}

wsClient.prototype.reconnect=function () {
        this.client.removeAllListeners()
        this.client.terminate()
        clearInterval(this.checkAlive)
        this.connect()
}
wsClient.prototype.addListener=function(){
    this.client.on('open',()=>{
        console.log(`Manager连接成功!`) 
        this.alive=true
        this.reconnectTimes=0
        if(this.client.readyState==1){
            //重发汇报失败的任务
            reportTask(this.client)
            //每次连上Manager后让Manager下发属于此Farmer的工作
            this.client.send(JSON.stringify(reqJob),(err)=>{
                if(err){
                    this.alive=false
                }
            })
        }
        this.checkAlive=setInterval(()=>{
            //console.log('正在检查连接是否活动......')
            if(!this.alive){
                console.log('已和Manager断开连接，正在尝试重连中------------------------------------')
                return this.client.terminate()
            }
            this.alive=false
            this.client.ping()
            this.updateWorkerList()
            this.client.send(JSON.stringify(this.workerOnline),(err)=>{
                //console.log('上传状态》》》》》》')
                if(err){
                    //console.log('已和Manager断开连接------------------------------------')
                    this.alive=false
                }
            })
            
        },3000)  
        this.client.on('close',(code,reason)=>{
            console.log(`${code}连接已关闭-------------------------------------------------`)
            this.alive=false
            this.reconnect()
        })
        this.client.on('pong',()=>{
            this.alive=true
        })      
    })

    //监听Manager发来的信息
    this.client.on("message",(msg)=>{
        //解析协议
        protocol.manager(this.workers,msg)
    })

}
//给连接更新worker列表
wsClient.prototype.setWorkers=function (workers) {
    this.workers=workers
}

wsClient.prototype.updateWorkerList=function(){
    //在线的worker列表
    this.workerOnline.workerList=[]
    this.workers.forEach(client => {
        let worker={id:client.id,name:client.name,ip:client.ip,jobid:client.jobid,taskid:client.taskid,state:client.state}
        this.workerOnline.workerList.push(worker)
    });
    //console.log('worker list update!--------------------')
    //把worker任务状态发给Manager
}
wsClient.prototype.heartbeat=function () {
    this.alive=true
}

module.exports=wsClient