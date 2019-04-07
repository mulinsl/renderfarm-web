
let Keeper=function (wss) {
    this.wss=wss
    //this.checkTime=3000
    this.checkTimeOut=10000
}

Keeper.prototype.removeOffline=function () {
    let checkInterval=setInterval(()=>{
        this.wss.clients.forEach((client)=>{
            if (client.alive===false) {
                console.log(`终止了未活动的....${client.name}的连接`)
                return  client.terminate()
            } 
            client.alive=false
        })       
    },this.checkTimeOut)
}

module.exports=Keeper