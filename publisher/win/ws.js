const wsc=require('../index')

// wsc.connect()
// wsc.client.on('open',()=>{
//     //console.log(`连接成功!`)       
// })
// wsc.client.on('open',()=> {
//     wsc.client.send('xxxxxxxxxxxx')
//     // rl.on('line',(input)=>{
//     //     switch (input) {
//     //         case 'job':
//     //         let job1=makdJob()
//     //         wsc.client.send(JSON.stringify(job1))
//     //             break;
//     //         case 'ping':
//     //         wsc.client.ping()
//     //             break;        
//     //         default:
//     //         wsc.client.send(input)
//     //             break;
//     //     }                    
//     // })
// })
// wsc.client.on("message",function incoming(data) {
//     //console.log(data)
//     alert(data)
// })
wsc.client.on("open",()=>{
    wsc.client.send('pppppppppppppppp')
})
wsc.client.on("message",function incoming(data) {
    alert(data)
})

function submitJob(id){
    let content=document.getElementById(id)
    alert(content.value)
    alert(wsc.client.readyState)
    wsc.client.on("open",()=>{
        wsc.client.send("{",(err)=>{alert(err)})
    })
}