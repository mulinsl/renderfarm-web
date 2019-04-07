const fs=require('fs')

Jober=function (jobList,jobPath,jobListFile) {
    //this.ws=ws;
    this.jobList=jobList;
    this.jobPath=jobPath;
    this.jobListFile=jobListFile;
}

Jober.prototype.sendTask=function(ws){
    let taskSended=false
    if(this.jobList.length>0){
        for (let i = 0; i < this.jobList.length; i++) {
            let job = this.jobList[i];
            if(job.state==0){
                console.log('check unfinish job!...checking unfinish task...')
                let taskList=JSON.parse(fs.readFileSync(`${this.jobPath}/${job.jobid}.json`,'utf-8'))
                let taskFinishNum=0 
                for (let j = 0; j < taskList.length; j++) {
                    let task = taskList[j];
                    if(task.state==0 && ws.name && !task.worker){
                        //发送任务
                        console.log('check unfinish task!...')
                        task.type=11
                        taskList[j].worker=ws.name
                        ws.send(JSON.stringify(task))
                        //标记该worker正在工作的任务
                        ws.jobid=job.jobid
                        ws.taskid=task.taskid
                        ws.state=0
                        console.log(`send task to>>>>>>>>${ws.name}--------------------------------------------->>>>>>>>`)
                        fs.writeFileSync(`${this.jobPath}/${job.jobid}.json`,JSON.stringify(taskList))
                        console.log(task)
                        taskSended=true
                        //分配了任务后中断任务检索
                        break
                    }else if(task.state==1){
                        taskFinishNum++
                        if(taskFinishNum==job.taskNum){
                            this.jobList[i].state=1
                            //任务全完成了，标记然后标记该工作已完成
                            fs.writeFileSync(this.jobListFile,JSON.stringify(this.jobList))
                            //再次往下检索未完成的工作
                            this.sendTask()
                        }
                    }
                }
            }
            //分配了任务后中断工作检索
            if(taskSended){
                break
            }else{
                continue
            }                
        }
    }
}


 
module.exports=Jober