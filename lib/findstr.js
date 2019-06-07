/****
 * 命令行工具 - findstr
 * 查找符合后缀条件的文件，并查找关键字进行替换。
 * @author chrunlee
 ***/
let async = require('async');
let fs = require('fs');
let readline = require('readline');
let path = require('path');
let colors = require('colors');
colors.setTheme({
  error : 'red',
  success : 'green',
  info : 'yellow'
});
//统计信息
let fileCount = 0,strCount = 0;

/*****
 * 在目标文件夹内查找符合后缀条件的文件列表，并返回文件路径数组。
 * @descriotion : 同步函数。
 * @params directory {String} : 目标文件夹路径
 * @params extname {String} : 文件后缀，多个可以使用逗号进行分割，可以带.或不带。
 * @params recurision {Boolean} : 是否递归查询
 * @return arr {Array} : 包含符合条件的文件路径地址
 ***/
function getSuitFile (directory,extname,recurision){
    let files = fs.readdirSync(directory);
    let arr = [];
    let extArr = extname.split(',').map(item=>{
        return item.startsWith('.') ? item.toLowerCase() : '.'+item.toLowerCase();
    });
    files.forEach(item=>{
        let absolutePath = path.join(directory,item);

        let stats = fs.statSync(absolutePath);

        let ext = (path.extname(item)||'').toString().toLowerCase();

        if(stats.isDirectory() && recurision){
            arr = arr.concat(getSuitFile(absolutePath,extname,recurision));
        }else if(!stats.isDirectory() && extArr.indexOf(ext) > -1){
            arr.push(absolutePath);
        }
    })
    return arr;
}
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

    let fileArr = getSuitFile(options.directory,options.extname,options.recurision);

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
