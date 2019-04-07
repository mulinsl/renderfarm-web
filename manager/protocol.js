const tasker=require('./lib/tasker')
const config=require('./lib/config')
const fs=require('fs')
let protocol={}

//publisher发来的协议解析
protocol.publisher=function(wss,ws,msg) {
    //开头为{则是发过来的对象，解析为job或者control，直接转发给farmer处理
    if(msg.startsWith('{')){        
        //json转换为obj
        let msgObj=JSON.parse(msg)
            msgObj.assign=false
        if(msgObj.type==10){
            //新建的工作分配到Farmer
            if(msgObj.farmer==''){
                console.log("farmerNull-------------------------------")
                ws.send('Manager:ok,received job!,will AUTO select the Farmer')
            }else{
                let clientN=0
                for (const client of wss.clients) {
                    clientN++
                    if(client.name==msgObj.farmer){
                        console.log("farmer-----------Find!!!--------------------")
                        if(client.readyState==1){

                        client.send(msg,(err)=>{
                            if(err){
                                //发给失败则分派失败
                                msgObj.assign=false
                                //加入工作并创建任务列表
                                tasker.createList(msgObj)
                            }else{
                                //加入字段标记为已分派
                                msgObj.assign=true
                                //加入工作并创建任务列表
                                tasker.createList(msgObj)
                            }
                        })
                        ws.send(`Manager:ok,received job!,send to ${client.name}`)
                        break
                        }
                    }
                    if(clientN==wss.clients.size){
                        ws.send(`Manager:ok,received job!,but the Farmer：[${msgObj.farmer}] off line，will send when it online`)
                    }      
                                        
                }

            }
        //解析14--查询工作进度
        }else if(msgObj.type==14&&fs.existsSync(config.jobListFile)){
            
            let jobProgress={type:15,jobInfo:JSON.parse(fs.readFileSync(config.jobListFile,'utf-8'))}            
            ws.send(JSON.stringify(jobProgress))
        //解析14--查询任务进度
        }else if(msgObj.type==16&&fs.existsSync(`${config.jobDir}/${msgObj.jobid}.json`)){
            let taskProgress={type:17,taskInfo:JSON.parse(fs.readFileSync(`${config.jobDir}/${msgObj.jobid}.json`,'utf-8'))}            
            ws.send(JSON.stringify(taskProgress))            
        }else{
            ws.send(`${config.name}:No job or task...`)
        }
    }   
}

//farmer发来的协议解析
protocol.farmer=function(wss,ws,msg) {
    ws.send("manger:ok,received job process!")
    if (msg.startsWith('{')){
        let msgJson=JSON.parse(msg)
        //任务状态标记
        if(msgJson.type==13){
            ws.send("manger:ok,received job process!")
            tasker.markTask(msgJson)
        //检测工作，决定是否分派
        }else if(msgJson.type==18){
            if(fs.existsSync(config.jobListFile)){
                let jobList=JSON.parse(fs.readFileSync(config.jobListFile,'utf-8'))
                jobList.forEach((job,index,array) => {
                if(job.state==0 && job.farmer==ws.name && !job.assign){
                    console.log(`检测到未分派的工作：${job.jobid},正在重新分派.....`)
                    jobList[index].assign=true
                    ws.send(JSON.stringify(job),(err)=>{
                        if(err){
                            console.log('发送工作失败！xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
                            jobList[index].assign=false
                        }
                    })
                    fs.writeFileSync(config.jobListFile,JSON.stringify(jobList))
                }  
                })
            }
        //收到Farmer发来的实时工作任务数据
        }else if(msgJson.type==20){
            msgJson.farmer=ws.name
            msgJson.lastOnlineTime=ws.lastOnlineTime
            ws.onlineWorker=msgJson
        }
    }
}


module.exports=protocol