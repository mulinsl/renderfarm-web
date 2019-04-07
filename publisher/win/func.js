const func={}

func.setTaskMax=function (min,max,size) {


}

func.displayJobInfo=function (elementId,jobInfo) {
    let pos=document.getElementById(elementId)
    let a=""
    jobInfo.forEach(job => {
        if(job.farmer==""){
            job.farmer="*AUTO*"
        }
        let b=
        `<div class="row">
        <div class="cell" style='width:120px'>${job.jobid}</div>
        <div class="cell" style='width:80px'>${job.farmer}</div>
        <div class="cell" style='width:30px'>${job.startFrame}</div>
        <div class="cell" style='width:30px'>${job.endFrame}</div>
        <div class="cell" style='width:30px'>${job.taskSize}</div>
        <div class="cell" style='width:30px'>${job.state}</div>
        </div>`
        a=a+b        
    })
    pos.innerHTML=a       
}
func.displayTaskInfo=function (elementId,taskInfo) {
    let pos=document.getElementById(elementId)
    let a=''
    taskInfo.forEach(task => {
        if(task.worker==""){
            task.worker="AUTO"
        }
        let b=`<div class="row">
                <div class="cell">${task.taskid}</div>
                <div class="cell">${task.worker}</div>
                <div class="cell">${task.startFrame}</div>
                <div class="cell">${task.endFrame}</div>
                <div class="cell">${task.finishTime}</div>
                <div class="cell">${task.state}</div>
                </div>`
        a=a+b        
    })
    pos.innerHTML=a   
}
func.displayManagerMsg=function (elementId,msg) {
    let pos=document.getElementById(elementId)
    
    pos.innerHTML=msg
}
func.displayWorkState=function(elementId,workerList){
    let pos=document.getElementById(elementId)
    let a=JSON.stringify(workerList) 
    pos.innerHTML=a       
}

module.exports=func