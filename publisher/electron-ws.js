const WebSocket=require('ws')
const func=require('./win/func')
const fs=require('fs')
const comm=require('./lib/comm')
let jobidInit=0
try {
    process.chdir(__dirname);
} catch (err) {
    console.error(`chdir: ${err}`);
}
const workDir=process.cwd()
//读取配置文件
let config=require('./lib/config')

//连接manger
function wsClient() {
    this.heartbeat=false
    this.ip=config.ip
    this.name=config.name
    this.port=config.port
    this.alive=false
}

//发送的每条Json消息都有type，端与端之间全部用Json来通信
//type:
// 10=job send
// 11=task send
// 12=ask for task
// 13=report task
// 14=get all job process
// 15=report all job process
// 16=get job's tasklist process by jobid
// 17=report job's tasklist process by jobid
// 18=farmer ask for job
// 19
// 20=Farmer实时向Manager汇报工作
// 21=Manager向Publisher汇报工作

wsClient.prototype.connect=function (name,ip,port) {
    if(!(name==null&&ip==null&&port==null)){
        this.url=`ws://${ip}:${port}/?name=${name}&group=publishers`
        let config={name:name,ip:ip,port:port}
        fs.writeFileSync(`${workDir}/config.json`,JSON.stringify(config))
    }else{
        this.url=`ws://${this.ip}:${this.port}/?name=${this.name}&group=publishers`
    }
    if(this.alive==true){
        this.client.removeAllListeners()
        this.client.terminate()
        clearInterval(this.updateWorkerState)
        this.client=new WebSocket(this.url)
    }else{
        this.client=new WebSocket(this.url)
    }
    this.client.on('open',()=>{
        this.updateWorkerState= setInterval(()=>{
            if(this.alive===false){
                //当失去连接时提示
                return this.client.terminate()
            }
            this.alive=false
            this.client.ping()
        },3000)
        this.client.on('pong',()=>{
            this.alive=true
        })
        this.client.on('close',()=>{
            this.alive=false
            func.displayManagerMsg('managerMsg','服务器消息：已和Manager断开连接！')
        })
    })
    this.client.on('error',(err)=>{
        clearInterval(this.updateWorkerState)
        if(err){
            alert(err)
            this.client.removeAllListeners()
            this.client.terminate()
        }
    })
    this.client.on("message",(msg)=>{
        this.alive=true
        //协议解析
        if(msg.startsWith('{')){
            msgObj=JSON.parse(msg)
            if(msgObj.type==15){
                //调用方法前台渲染Html
                func.displayJobInfo('jobInfo',msgObj.jobInfo)
            }else if(msgObj.type==17){
                func.displayTaskInfo('taskInfo',msgObj.taskInfo)
            }else if(msgObj.type==21){
                func.displayWorkState('workerListInfo',msgObj.workerList)
            }
        }else{
            func.displayManagerMsg('managerMsg',msg)
        }        
        
    }) 

}
wsClient.prototype.setName=function (name) {
    this.name=name
}
wsClient.prototype.setIp=function (ip) {
    this.ip=ip
}
wsClient.prototype.setPort=function (port) {
    this.port=port
}
wsClient.prototype.sendJob=function (farmer,proj,file,startFrame,endFrame,taskSize,arg) {
    job={type:10,farmer:farmer,proj:proj,file:file,startFrame:parseInt(startFrame),endFrame:parseInt(endFrame),taskSize:parseInt(taskSize),arg:arg}
    
    jobidInit++    
    job.jobid=`${comm.getJobidTime()}-${jobidInit}`
    if(this.alive==false){
        alert('还没有连接上Manager服务器')
    }else if(this.client.readyState==1){
        alert(`工作已提交：\n场景文件：${file}\n项目目录：${proj}\n开始帧：${startFrame}    结束帧：${endFrame}     任务大小：${taskSize}\n渲染农场：${farmer}\n参数：${arg}`)
        this.client.send(JSON.stringify(job))
    }
}

wsClient.prototype.getJobProgress=function () {
    let protocol={type:14}
    this.client.send(JSON.stringify(protocol))
}

wsClient.prototype.getTaskProgressByJobId=function (jobid) {
    let protocol={type:16,jobid:jobid}
    protocol.jobid=document.getElementById(jobid).value
    this.client.send(JSON.stringify(protocol))
}

module.exports=wsClient
