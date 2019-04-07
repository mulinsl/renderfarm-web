
let Keeper=function (wss) {
    this.wss=wss
    this.checkTime=3000
    this.checkTimeOut=10000
}

Keeper.prototype.checkAlive=function () {
    let checkInterval=setInterval(()=>{
        this.wss.clients.forEach((client)=>{
            if (client.alive===false) {
                console.log(`终止了未活动的....${client.name}的连接`)
                return  client.terminate()
            } 
            client.alive=false
            //client.ping()
        })       
    },this.checkTimeOut)
}
Keeper.prototype.removeOffline=function () {
    let queryInterval=setInterval(()=>{
        this.wss.clients.forEach((client)=>{
            console.log(`总连接数：${this.wss.clients.size}`)
            if(!client.alive){
                console.log(`终止了未活动的....${client.name}的连接`)
                client.removeAllListeners()
                client.terminate()
            }
        })  
    },this.checkTimeOut)
}

module.exports=Keeper