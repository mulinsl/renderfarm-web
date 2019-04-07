const fs=require('fs')
const config=require('./config')

let tasker={}
tasker.createList=function(msgJob){
    //生成任务列表--------------------------------------------------------
    if(!fs.existsSync(config.jobListFile)){
        let joblistInit=[]
        fs.writeFileSync(config.jobListFile,JSON.stringify(joblistInit))
    }
    let jobList=JSON.parse(fs.readFileSync(config.jobListFile,'utf-8' ))
    msgJob.state=0
    //生成任务列表 2-9 3 2-4 5-7 8-10
    let taskNum=Math.ceil((msgJob.endFrame-msgJob.startFrame+1)/msgJob.taskSize)
    msgJob.taskNum=taskNum
    console.log('总共的任务数:'+taskNum)
    jobList.push(msgJob)

    let taskList=[]
    for (let i = 0; i < taskNum; i++) {
        let task={jobid:msgJob.jobid,worker:null,proj:msgJob.proj,file:msgJob.file,arg:msgJob.arg,state:0}
        task.taskid=i+1
        task.report=false
        task.startFrame=msgJob.startFrame+i*msgJob.taskSize
        if(i+1==taskNum){
            task.endFrame=msgJob.endFrame
        }else{
            task.endFrame=task.startFrame+msgJob.taskSize-1
        }
        taskList[i]=task
        console.log(task)            
    }
    //储存jobList
    fs.writeFileSync(config.jobListFile,JSON.stringify(jobList),(err)=>{
        if(err)throw err
        console.log('joblist has been saved!')
    })
    //储存taskList
    fs.writeFileSync(`${config.jobDir}/${msgJob.jobid}.json`,JSON.stringify(taskList),(err)=>{
        if(err)throw err
        console.log('tasklist has been saved!')        
    })
    //返回生成的任务列表
    return taskList
    //生成任务列表--------------------------------------------------------  
}

tasker.markTask=function (msgJson) {
                // 读取taskList             
        let taskList=JSON.parse(fs.readFileSync(`${config.jobDir}/${msgJson.jobid}.json`,'utf-8'))
        let finishNum=0
        for (let i = 0; i < taskList.length; i++) {
            let task=taskList[i];
            if(task.state==1){
                finishNum++
            }else if(task.taskid==msgJson.taskid){
                task.state=1
                task.worker=msgJson.worker
                task.report=msgJson.report
                task.finishTime=msgJson.finishTime
                finishNum++
            }
           //break
            //如果该任务属于工作的最后一个则标记该工作完成
            if(finishNum==taskList.length){
                let jobObj=JSON.parse(fs.readFileSync(config.jobListFile,'utf-8'))
                for (let i = 0; i < jobObj.length; i++) {
                    const job = jobObj[i];
                    if(job.jobid==task.jobid){
                        jobObj[i].state=1
                        fs.writeFileSync(config.jobListFile,JSON.stringify(jobObj))
                        break
                    }
                }
            }    
        }
        // 储存taskList，此处要同步，否则有可能收到新消息时文件还没有储存完成
        fs.writeFileSync(`${config.jobDir}/${msgJson.jobid}.json`,JSON.stringify(taskList)) 
}
tasker.reportTask=function (ws) {
    let reportTaskObj={type:13,jobid:null,taskid:null,worker:null,finishTime:null,state:null}
    if(fs.existsSync(config.jobListFile)){
        let jobList=JSON.parse(fs.readFileSync(config.jobListFile,'utf-8'))
        jobList.forEach(job => {
            let taskList=JSON.parse(fs.readFileSync(`${config.jobDir}/${job.jobid}.json`,'utf-8'))
            taskList.forEach(task => {
            if(task.report==false && task.state==1){
                    reportTaskObj.jobid=task.jobid
                    reportTaskObj.taskid=task.taskid
                    reportTaskObj.state=task.state
                    reportTaskObj.worker=task.worker
                    reportTaskObj.finishTime=task.finishTime
                    ws.send(JSON.stringify(reportTaskObj),(err)=>{
                        if(err){
                            console.log(err)
                        }
                    })
            } 
            })
        })
    }
}
module.exports=tasker