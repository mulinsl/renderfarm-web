const fs=require('fs')
const wsClient=require('./lib/worker')
const config=require('./lib/config.js')



//同步读取JSON配置
const wsc=new wsClient(config.url)
wsc.connect()


// //发送数据
// wsc.client.on('open',()=> {
//     console.log('connecting farmer...');
//     wsc.client.send(taskReq) 
// })
// //接收数据
// wsc.client.on("message",(msg)=>{
//     if(msg.startsWith('{')){
//         msgObj=JSON.parse(msg)
//         if(msgObj.type==11){
//             console.log('recived task <<<<<<<<<<<<--------------------------------<<<<<<<<<<<<')
//             console.log(msgObj)
//             wsc.client.send('ok,I have get a task!')
//             //开始执行任务
//             let taskLineTest=`node --version`
//             let taskLine=`"${config.mayaRender}" -s ${msgObj.startFrame} -e ${msgObj.endFrame} -proj ${msgObj.proj} ${msgObj.file}`
//             console.log(taskLine)
//             const taskProcess = exec(taskLineTest,(error, stdout, stderr) => {
//                 if (error) {
//                // console.log(error)
//                 //throw error;
//                 }
//                 console.log(stdout);
//                 console.log(stderr);
//               });
//             // const taskProcess=spawn(taskLine2)
//             taskProcess.on('error',()=>{
//                 console.log('err')
//                 taskProcess.kill()
//             })
//             taskProcess.on('exit',()=>{
//                 console.log('exit')
//                 taskProcess.kill()
//             })
//             taskProcess.on('close',()=>{
//                 console.log('close')
//                 taskReport.jobid=msgObj.jobid
//                 taskReport.taskid=msgObj.taskid                
//                 let taskReportJson=JSON.stringify(taskReport)
//                 wsc.client.send(taskReportJson) 
//                 taskProcess.kill()
//                 wsc.client.send(taskReq) 
//             })
//             taskProcess.on('message',()=>{
//                 console.log('message')
//             })
//         }
//     }
// })


