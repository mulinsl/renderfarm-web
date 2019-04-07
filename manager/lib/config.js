const fs=require('fs')
let cfg={}



//同步读取JSON配置
cfg=require('../config.json')
cfg.url=`ws://${cfg.ip}:${cfg.port}/?name=${cfg.name}&group=${cfg.group}`
//所有的目录配置放在这里
cfg.workDir=`${__dirname}/..`
cfg.jobDir=`${__dirname}/../job`
cfg.jobListFile=`${__dirname}/../job/joblist.json`



//改变工作目录以给fs使用
module.exports=cfg