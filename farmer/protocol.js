const fs=require('fs')
const jobListFile='./job/joblist.json'
const jobPath='./job'
const jober=require('./lib/Jober.js')
const tasker=require('./lib/tasker')


let protocol=function () {
    
}

//manager发来的协议解析
protocol.manager=function(workers,msg) {
    //ws.send("farmer:ok,received job!")
    //判断是否JSON
    if(msg.startsWith('{')){
        let msgJob=JSON.parse(msg)    
        if(msgJob.type==10){
            //json转换为obj
            //生成任务列表并储存--------------------------------------------------------            
            let taskList = tasker.createList(msgJob)
            //转发任务给在线的Worker
            let jobList=JSON.parse(fs.readFileSync(jobListFile,'utf-8'))
            let taskJob=new jober(jobList,jobPath,jobListFile)
            workers.forEach(client => {
                //空闲且在线的worker才发送
                console.log(client.state)
                if(client.state!=0){
                    console.log(`task send>>>>>>>${client.name}----------------------------------`)
                    taskJob.sendTask(client)
                }else{
                    console.log('no worker online or idle...')
                }
            });
        }  
    }   
}


//worker发来的协议解析
protocol.worker=function(wsc,ws,msg) {
    //检测是否是json
    console.log(msg)
    if (msg.startsWith('{')){
        let msgObj=JSON.parse(msg)
        //type:
        // 12=worker request task
        if(msgObj.type==12&&fs.existsSync(jobListFile)){
            //读取joblist检测未完成工作-->读取该工作的任务列表检测未完成工作分配给worker并标记状态-->写入任务状态
            let jobList=JSON.parse(fs.readFileSync(jobListFile,'utf-8'))
            let taskJob=new jober(jobList,jobPath,jobListFile)
            taskJob.sendTask(ws)
            ws.send('Farmer：收到任务请求，已处理-----------------------------------')
        }else if(msgObj.type==13){
            //转发给manager
            msgObj.report=true
            msgObj.worker=ws.name            
            wsc.client.send(JSON.stringify(msgObj),(err)=>{
                if(err){
                    msgObj.report=false
                    console.log('report task to Manager fail......will next time report again')
                }
            })
            //任务状态标记
            ws.state=msgObj.state
            tasker.markTask(msgObj)
        //更新worker的状态是空闲还是忙            
        }else if(msgObj.type==22){
            ws.state=msgObj.state
        }

    }

}



module.exports=protocol