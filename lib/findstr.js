/****
 * 命令行工具 - findstr
 * 查找符合后缀条件的文件，并查找关键字进行替换。
 * @author chrunlee
 ***/
let async = require('async');
let fs = require('fs');
let readline = require('readline');
let dirfile = require('dirfile');
let path = require('path');
let colors = require('colors');
colors.setTheme({
  error : 'red',
  success : 'green',
  info : 'yellow'
});
//统计信息
let fileCount = 0,strCount = 0;


/****
 * 查找对应文件内的每行内容，如果发现对应的字符串则提示出来，如果有需要替换的字符，则进行替换
 * @params item {String} : 文件路径
 * @params keyword {String} : 查找的关键字
 * @params replace {String} : 要替换的内容
 * @params cb {Function} : 执行完成后的回调函数
 ***/
function findAndReplace(item,keyword,replaceWord,cb){
    let replace = null == replaceWord || '' == replaceWord ? false : true;
    let rl = readline.createInterface({
        input : fs.createReadStream(item)
    });

    let strArr = [];//存放内容行数组
    let infoStr = [],find = false;//tips
    rl.on('line',line => {
        if(line.indexOf(keyword) > -1){
            find = true;
            infoStr.push(`第${strArr.length + 1}行: ${line}`);
            strCount ++;
            if(replace){
                let Reg = new RegExp(keyword,'g');
                line = line.replace(Reg,replaceWord);
            }
        }
        strArr.push(line);
    })

    //读取结束，重新写入
    rl.on('close',()=>{
        if(find){
            fileCount ++;
            console.log(`###############################################################################`.green)
            console.log(`文 件: ${item.error}`);
            console.log(infoStr.join('\r\n'));
        }
        if(replace){
            fs.writeFileSync(item,strArr.join('\r\n'));
        }
        cb(null,null);
    })
}

module.exports = function(options){
    console.log(`查找中... 请等待!`);
    let fileArr = dirfile(options.directory,false,options.recursion,function(filePath,stat){
        var ext = path.extname(filePath).toLowerCase(),
            extArr = options.extname.split(',').map(item=>{
                return item.startsWith('.') ? item : '.'+item;
            }).join(',');
        return ext!= '' && extArr.indexOf(ext) > -1;
    },function(filePath,stat){
        return filePath;
    });
    if(fileArr.length == 0){
        console.log(`目标文件夹中没有符合后缀条件的文件!`);
        process.exit(0);
    }
    
    async.mapLimit(fileArr,fileArr.length < 50 ? fileArr.length : 50,(item,cb)=>{
        findAndReplace(item,options.keyword,options.target,cb);
    },(err,values)=>{
        console.log(`###############################################################################`.green)
        console.log(`查找结束`.info);
        console.log(`共计文件: ${fileCount}`);
        console.log(`共计行数: ${strCount}`);
        process.exit(0);
    });
}
