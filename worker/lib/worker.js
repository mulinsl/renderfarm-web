const WebSocket=require('ws')
const {execFile,exec,spawn}=require('child_process')
const config=require('./config')
const comm=require('./comm')

//请求任务协议
let taskReqObj={type:12,state:1}
let taskReq=JSON.stringify(taskReqObj)

//汇报任务协议
let taskReport={type:13,jobid:null,taskid:null,finishTime:null,state:null}

// 22=worker向Farmer汇报空闲或者忙的状态0--为忙，1--为空闲
let workingStateReport={type:22,state:null}

function wsClient(url) {
    this.url=url
    this.state=null
    this.alive=false
    this.reconnectTimes=0
}
wsClient.prototype.connect=function(){
    this.client=new WebSocket(this.url)
    this.client.on('error',(err)=>{
        this.reconnectTimes++
        console.log('连接错误，3秒后重试'+err+'--------重连次数：'+this.reconnectTimes)
        setTimeout(()=>{
            this.reconnect()
        },3000)
    })
    this.addListener()
}
wsClient.prototype.reconnect=function () {
    // setTimeout(()=>{
        this.client.removeAllListeners()
        this.client.terminate()
        clearInterval(this.checkAlive)
        this.connect()
    // },3000)
}
wsClient.prototype.addListener=function(){
    this.client.on('message',(msg)=>{
        this.alive=true
        if(msg.startsWith('{')){
            msgObj=JSON.parse(msg)
            if(msgObj.type==11){
                console.log('recived task <<<<<<<<<<<<<<<<<<<<<<<<<<----------------------------')
                console.log(msgObj)
                this.client.send('ok,I have get a task!')
                this.state=0
                //开始执行任务
                let taskLineTest=`node --version`
                let taskLine=`"${config.mayaRender}" ${msgObj.arg} -s ${msgObj.startFrame} -e ${msgObj.endFrame} -proj ${msgObj.proj} ${msgObj.file}`
                console.log(taskLine)
                const taskProcess = exec(taskLine,(error, stdout, stderr) => {
                    if (error) {
                        console.log('ERROR1001:--##################---\n'+error)
                        taskProcess.kill()
                        //this.client.send(taskReq)
                    }
                    console.log(stdout);
                    console.log(stderr);
                    });
                    // const taskProcess=spawn(taskLine2)
                    taskProcess.on('error',(err)=>{
                        console.log('ERROR:--###############################---\n'+err)
                        this.endProcess('mayabatch.exe')
                        this.endProcess('Render.exe')
                        taskProcess.kill()
                        //this.client.send(taskReq)
                    })
                    taskProcess.on('exit',()=>{
                        console.log('EXIT--###############################---\n')
                        this.endProcess('mayabatch.exe')
                        this.endProcess('Render.exe')
                        taskProcess.kill()
                        if(taskProcess.killed){
                            let req=setTimeout(()=>{this.client.send(taskReq)},8000)
                        }
                    })
                    taskProcess.on('close',()=>{
                        console.log('正在汇报任务状态.............')
                        taskReport.jobid=msgObj.jobid
                        taskReport.taskid=msgObj.taskid
                        taskReport.finishTime=comm.getCurrentTime()               
                        taskReport.state=1
                        this.state=1
                        this.endProcess('mayabatch.exe')
                        this.endProcess('Render.exe')
                        setTimeout(()=>{
                            let taskReportJson=JSON.stringify(taskReport)
                            this.client.send(taskReportJson) 
                            taskProcess.kill()
                            this.client.send(taskReq) 
                        },5000)                

                    })
                    taskProcess.on('message',()=>{
                        console.log('message')
                })
            }
        }else{
            console.log(msg)
        }
    
    })

    //断线重连实现，当连接打开时监听连接断开，若断开则重连
    this.client.on('open',()=>{
        this.alive=true
        this.reconnectTimes=0
        this.client.on('close',(code,reason)=>{
            console.log(code+'已和Farmer断开连接------------------------------------')
            this.alive=false
            this.reconnect()
        })
        this.checkAlive=setInterval(()=>{
            if(this.alive===false){
                console.log('已断开和Farmer的连接------------------------------')
                return this.client.terminate()
            }
            this.alive=false
            this.client.ping()
        },3000)
        this.client.on('pong',()=>{
            this.alive=true
        })
        //发送之前要检查连接的状态
        // this.interVal=setInterval(()=>{
        if(this.client.readyState==1){
            //每次连接上时重报状态，如果闲则主动请求工作
            console.log(`request task-------------${this.state}----------------`)
            this.client.send(JSON.stringify(workingStateReport),(err)=>{
                if(err){
                    this.alive=false
                }
            })
            if(this.state!=0){
                console.log('request task-------------*********************----------------')
                this.client.send(taskReq,(err)=>{
                    if(err){
                        this.alive=false
                    }
                })
            }
        }            
        // },2000)
    })
}

wsClient.prototype.endProcess=function (processName) {
    let cmdKillMayaBatch=`taskkill /f /t /im ${processName}`
    let endTask=exec(cmdKillMayaBatch,(error, stdout, stderr)=>{
        console.log(stdout)
        console.log(stderr)
        if(error){
            console.log(`结束进程：${processName}错误！--#############--`)
        }
    })
    
}

module.exports=wsClient