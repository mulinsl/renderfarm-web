let doc={}

doc.onReady=function(callback){
    setTimeout(()=>{
        if(document.readyState=='complete'){
            callback()
            return
        }else{
            this.onReady()
        }
    },200)
}
module.exports=doc


