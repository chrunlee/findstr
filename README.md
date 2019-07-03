# findstring - 命令行工具
查找目标文件夹内符合后缀的文件内的关键字，并进行替换。目前只能替换单行文字，后续增加多行文本或文件。



# install 

```
npm install findstr -g
```

# usage

```
//指定目标文件夹
findstring -d /home/resource/     

//需要查找或要替换的字符串
findstring -k keyword             

//需要替换的字符串
findstring -t replaceword        

//是否递归查询
findstring -r 

//文件的后缀名称
findstring -e .txt,.css

//使用，替换 D:/test/ 目录下所有（递归）html 文件中的 span ，为 div
findstring -d d:/test/ -k span -t div -r

//help 
findstring -h
```

# description 

.. 写完最后使用才发现.findstr 为 windows 自带命令.. 无奈改名 findstring,勉强自己使用吧。