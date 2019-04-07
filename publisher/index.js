const WebSocket=require('ws')
const readline=require('readline')
const comm=require('./lib/comm')
//读取配置文件
let config=require('./lib/config')
let wsUrl=config.wsUrl


//接受终端命令输入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//连接manger
function wsClient(url) {
    this.url=url
    this.heartbeat=false
}

//发送的每条Json消息都有type，端与端之间全部用Json来通信
//type:
// 10=job send
// 11=task send
// 12=ask fo task
// 13=report task
let jobidInit=0
function makdJob() {
    let job={type:10,farmer:'farmer001',proj:'G:/My3D/renderfarmproj',file:'G:/My3D/renderfarmproj/scenes/test.mb',startFrame:1,endFrame:8,taskSize:3,arg:''}
    jobidInit++    
    job.jobid=`${comm.getJobidTime()}-${jobidInit}`
    return job
}


wsClient.prototype.connect=function () {
    this.client=new WebSocket(this.url)
}

let wsc=new wsClient(wsUrl)
wsc.connect()
// this.client.on('error',(e)=>{
//     console.log(`连接manager失败！错误码：${e.code}`)
//     console.log('3秒后尝试重连...')
//     setTimeout(()=>{this.connect(this.url)},3000)
// })
wsc.client.on('open',()=>{
    console.log(`连接成功!`)       
})
wsc.client.on('open',()=> {
    rl.on('line',(input)=>{
        switch (input) {
            case 'job':
            let job1=makdJob()
            wsc.client.send(JSON.stringify(job1))
                break;
            case 'ping':
            wsc.client.ping()
                break;        
            default:
            
                wsc.client.send(input,(err)=>{
                    if(err){
                        console.log('发送失败！')
                    }
                })
                break;
        }                    
    })
})
wsc.client.on("message",(msg)=> {
    console.log(msg)
})

module.exports=wsc
