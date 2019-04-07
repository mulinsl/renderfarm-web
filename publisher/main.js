const electron = require('electron')
const { app, BrowserWindow } = require('electron')


function createWindow () {   
  // 创建浏览器窗口
  let win = new BrowserWindow({ width: 800, height: 600 })
  // 然后加载 app 的 index.html.
  win.loadFile('./win/main.html')
}

app.on('ready',()=>{createWindow()} )
app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
      createWindow()
    }
    

  })
console.log('start....')

