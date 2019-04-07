const doc=require('./lib/doc.js')

let ui={}
ui.list=function (id,titleObj,contentObj) {
    let list= document.querySelector(id)
    
    title.onclick=function () {
        // alert(title.firstChild.id)
        title.lastElementChild.style.display="block"
        // this.style.display="none"
        // this.fisrtChild.style.display="block"
        // this.fisrtChild.style.backgroundColor="blue"
    }
    
}

doc.onReady(()=>{
    ui.list('#list')
})

    



