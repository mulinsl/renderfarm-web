let comm={}

comm.getCurrentTime=function() {
    let dateNow=new Date()
    let year=dateNow.getFullYear()
    let month=this.addZero(dateNow.getMonth()+1)
    let day=this.addZero(dateNow.getDate())
    let hours=this.addZero(dateNow.getHours())
    let minutes=this.addZero(dateNow.getMinutes())
    let seconds=this.addZero(dateNow.getSeconds())
    let time=`${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`
    return time
}

comm.addZero=function(num){
    if((num+'').length==1){
        let doubleNum=`0${num}`
        return doubleNum
    }else{
        return num
    }
}

comm.getValueTime=function() {
    let dateNow=new Date()
    let year=dateNow.getFullYear()
    let month=this.addZero(dateNow.getMonth()+1)
    let day=this.addZero(dateNow.getDate())
    let hours=this.addZero(dateNow.getHours())
    let minutes=this.addZero(dateNow.getMinutes())
    let seconds=this.addZero(dateNow.getSeconds())
    let time=parseInt(`${year}${month}${day}${hours}${minutes}${seconds}`)
    return time
}

comm.getJobidTime=function() {
    let dateNow=new Date()
    let year=dateNow.getFullYear()
    let month=this.addZero(dateNow.getMonth()+1)
    let day=this.addZero(dateNow.getDate())
    let hours=this.addZero(dateNow.getHours())
    let minutes=this.addZero(dateNow.getMinutes())
    let seconds=this.addZero(dateNow.getSeconds())
    let mmsec=dateNow.getMilliseconds()
    let time=`${year}${month}${day}-${hours}${minutes}${seconds}${mmsec}`
    return time
}
module.exports=comm