---
title: AppleScript 学习笔记
categories: 笔记
toc: true
comments: true
date: 2016-12-08 20:32
tags:
    - macOS
---

“AppleScript简明基础教程”的阅读笔记。

<!-- more -->
<!-- toc -->

## 1. AppleScript入门

工作机制：

![](http://static.ifanze.cn/14812008690466.jpg)

## 2. 快速上手AppleScript编辑器

```
tell application "Finder"
    make new folder at desktop
end tell
```

脚本的四种存储格式：

1. `.scpt`，脚本格式，可以设置是否能编辑。
2. `.scptd`，脚本包格式，包含rtfd介绍文件、plist配置文件、sctp脚本。
3. `.app`，应用程序格式，具有标准Cocoa程序的结构，有“仅运行”、“启动屏幕”、”保持打开“三个选项。
4. `.applescript`，文本格式。

应用程序对AppleScript的支持类型：

1. 可编程。
2. 可录制。
3. 可嵌入。

实例：建立100个文件夹

```
tell application "Finder" 
    make new folder at desktop with properties {name:"Test"} 
    repeat with a from 1 to 100
        make new folder at folder "Test" of desktop with properties {name:a as string} 
    end repeat 
end tell
```

## 3. AppleScript语言初步

AppleSript是面向对象的脚本语言，有对象、属性、命令的概念，类似类、属性、方法的概念。

采用Unicode文字编码，不区分大小写。

标识符：必须以英文开头，可使用字母、数字、下划线。但可以在开头和结尾使用`|`，这样就能使用全部Unicode字符了（除去`|`）。

数据类型：

1. `Boolean`：仅包括`True`和`False`。
2. `Number`、`Integer`、`Real`。
3. `Text`、`String`：无区别。
4. `Date`：取决于系统设置。
5. `Constant`：系统定义的yes、no、ask等，也可以是用户定义的常量，关键字也可以认作是常量。
6. `List`：`{1,2,3}`、`{1,1.9,"text"}`，可嵌套。
7. `Record`：`{first:"111",last:"222"}`，带有名称的列表。可以使用`of`进行访问：

```
first of {first:"111",last:"222"}
```

确定数据类型：

```
class of "string"
```

强制类型转换：

```
"1.99" as real
"1.99" as integer   --得到2
"text" as list      --得到{"text"}
{a:1,b:2} as list   --得到{1,2}
{1,2} as record     --错误，无法得到标识符。
```

数学运算符（注意3/2的值为1.5）：

```
+ - * /或÷ ^ div mod
```

比较运算符：

```
= > >= < <= 

start[s] with
end[s] with

contain[s]
dosen't contain

is in
is not in
```

逻辑运算符：

```
and or not
```

合并运算符`&`：

- 左边Text，结果为Text，存在报错可能。
- 左边Record，结果为Record，存在报错可能。
- 左边为其它类型，结果为List。

![](http://static.ifanze.cn/14812069593782.jpg)

提取对象中的元素：

```
characters of "A string"        --得到{"A"," ",....}
every character of "A string"

words of "a string"

--进阶的（words类似）：
characters 3 through 5 of "a string"    --得到{"s","t","r"}
characters 3 thru 5 of "a string"
character 3 of "a string"               --得到"s"
```

提取文件列表：

```
tell application "Finder"
    files of desktop
    folders of desktop
    
    name of files of desktop
    
    files of desktop whose name begins with "a"
```

- 复数可改成`every`。
- `whose`可改成`where its`

注释：

```
-- 行尾注释
#  行尾注释（2.0）
(*
    块注释
*)
```

代码缩写：

- `application`：`app`
- `end tell/repeat/try`：`end`
- `through`：`thru`

## 4. 读懂AppleScript字典

S：Suite 套装
C（圆）：Command 命令
C（方）：Class 类
P：Property 属性

## 5. 变量和属性

```
set name to value as type
set myRes to the result of (make new folder at desktop)
```

可分为全局变量和局部变量。显式声明可以在变量名前加上`Global`和`Local`。

Record和List是传引用的，其它类型是传值得。这两种类型传值要使用：

```
set a to {1,2,3}
set b to 1
copy a to b
```

定义属性：

```
property countTimes : 0
```

脚本退出后其值依然不变，一定是全局的。

常用的预定义变量有：

- `result`：记录最近一个命令执行的结果，如果没有会报错
- `it`：指代最近的一个tell对象
- `me`：指代脚本，如path to me
- `tab`：用于string，一个制表符
- `return`：用于string，一个换行


## 6. 流程控制

### 6.1 tell语句

有简单形式和复合形式：

```
tell front window of application "Finder" to close
tell application "Finder"
    close front window
end tell
```

### 6.2 if语句

```
if boolean then statement
if boolean1 then
    statement1
else if boolean2 then
    statement2
else 
    statement3
end if
```

### 6.3 循环语句

退出循环使用`exit`。

```
repeat
    ...
end repeat

repeat n times
    ...
end repeat

repeat until boolean
    ...
end repeat

repeat while boolean
    ...
end repeat

repeat with loopVariable from startValue to stopValue by stepValue
    ...
end repeat

repeat with loopVariable in list
    ... --得到的是位置，获取内容要使用contents of loopVariable
end repeat

```

### 6.4文本比较

```
considering attribute1 but ignoring attribute2
    --compare texts
end considering
```

包括：

- `case`
- `diacriticals`：字母变调符号
- `hyphens`：连字符
- `numeric strings`：如启用它来比较版本号，"1.10.1" > "1.9.4"
- `punctuation`：标点符号
- `white space`

## 7. 基本用户交互

### 7.1 对话框和输入框

```
display dialog "text"   --包含确认和取消
display dialog "text" buttons {"好的","明白"} default button "好的" with title "标题" with icon note giving up after 5  --5秒后自动消失

display dialog "text" default answer "默认输入"
display dialog "text" default answer "默认输入" hidden answer true --输入密码
```

返回值：是一个Record

- `text returned`：用户输入的文本
- `button returned`：按钮
- `gave up`：是否自动超时消失

### 7.2 警告框

```
display alert "text" message "detail" as warning
```

还可以是`critical`或`infomation`，也可以使用`buttons`、`give up after`。

### 7.3 选择框

```
choose from list {"choice1","choice2"} with title "title" with prompt "xxxx" default items {"choice2"} with empty selection allowed and multiple selections allowed
```

### 7.4 文件选择框

```
--选文件名称：
choose file name with prompt "xxx" default name "xxx" default location file "Macintosh HD:Users"

--选文件夹，返回alias或者List：
choose folder with prompt "xxx" default location file "Macintosh HD:Users" with invisibles, multiple selection allowed and showing package contents

--选文件，可以用的参数同选文件夹：
choose file of type {"txt"}
```

### 7.5 其它用户交互

`choose color`、`beep n`、`delay n`、`say text`。

## 8. 错误处理

### 8.1 try语句

```
try
    ...
end try

try 
    ...
on error errText number errNum
    ...
end try
```

### 8.2 抛出错误

```
error "自定义错误" number 999
```

### 8.3 超时

默认120秒等待用户或应用程序响应，否则抛出"AppleEvent已超时"，number-1712。如果需要自己确定一个时间：

```
with timeout of x seconds
    ...
end timeout
```

## 9. 文件操作

### 9.1 Alias类型

一个文件指针，记录文件的唯一识别码，即使文件被移动也能找到。

也可以使用传统的file类型，但我们一般总是使用alias，file多用于操作尚不存在的文件。

```
set myAlias1 to alias "Macintosh HD:System:Library:"
set myAlias2 to alias "Macintosh HD:Users:xxx:Desktop:a.txt"
```

### 9.2 相对路径和POSIX路径

```
path to documents folder
path to library folder from system domain
```

还可以获得application support、applications folder、desktop、document folder、downloads folder、system folder等，域还包括user domain（缺省值）、system domain和local domain。


```
POSIX path of alias "Macintosh HD:System" --返回/System/
POSIX file "Macintosh HD:Users:a.txt" --返回/Users/a.txt
```

还是推荐使用alias，不要与POSIX file混用。

### 9.3 文件读取

```
set myFile to alias "Macintosh HD:a.txt"
read myFile
```

- `from n`：从哪个字节处开始读取
- `for n`：读取多少字节
- `to n`：读取到哪里
- `before 文本`：读取到指定文本（不含本身）
- `until 文本`：读取到指定文本（包含本身）
- `using delimiter 文本`：指定分隔符，读取成list类型数据，这里的文本参数也可以是list。
- `as 类型`：读取成何种类型，如text，list。

读到文件结尾会抛出错误，因此要先确定文件长度，使用`get eof`命令。

### 9.4 文件写入

```
set aFile to alias "...a.txt"
set fp to open for access aFile with write permission
write "abc" to fp
close access to fp
```

`write`命令可以指定`starting at`参数指定开始写入的位置。

任何文件操作，包括读取和写入，都要注意打开和关闭文件。

## 10. 事件处理器

类似函数。

### 10.1 基本的事件处理器

```
on Helloworld()
    display dialog "Hello,world"
end Helloworld

Hellowworld()
```

注意，无法再Tell语句块内直接调用，如果确实要调用，使用`Helloworld() of me`。

### 10.2 带参数的事件处理器

包括位置参数和标签参数。

```
on Hello(somebody, howlong)
    display dialog somebody giving up after howlong
end Hello

Hello("Apple",2)

on Hello to somebody for howlong
    ...
end Hello

Hello to "Apple" for 2
```

一般使用有意义的介词，但还是用位置参数比较好吧……

### 10.3 返回值

```
on add(x,y)
    set answer to (x+y)
    return answer
end add

display dialog add(1,2)
```

### 10.4 run和open事件处理器

只用于脚本应用程序。

`run`提供程序入口，如果显式声明的话不能有任何代码在事件处理器外。

`open`用于实现拖拽功能。

```
on open names
    set pathNames to ""
    repeat with i in names
        set iPath to (i as text)
        set pathNames to pathNames & iPath & return
    end repeat
    
    tell application "TextEdit"
        set paragraph 1 of front document to pathNames
    end tell
    
    return
end open
```

### 10.5 保持打开的脚本应用程序

将脚本存储为应用程序，并勾选“保持打开”。

`idle`事件处理器：处理应用程序空闲时的后台任务，只要不退出或者有其他任务，他隔一段时间（默认30s，可以通过`return n`控制）会执行一次。

`quit`事件处理器：用于处理用户手动退出保持运行的程序时要执行的任务。其中必须包含有`continue quit`命令，否则程序将不可能正常退出。

```
on idle
    beep 2
    display dialog "程序正在运行" giving up after 1
    return 5
end idle

on quit
    display dialog "真的要退出" buttons{"是","否"}
    if button returned of result = "是的" then
        continue quit
    end if
end quit
```

### 10.6 文件夹操作

存储在”资源库/Scripts/Folder Action Scripts“，或者用户资源库下的。

```
on adding folder items to theFolder after receiving theItemList
    display dialog((count theItemList) & "个项目被添加") as text buttons{"好","立即查看"}
    if button returned of result = "立即查看" then
        tell application "Finder"
            open theFolder
        end tell
    end if
end adding folder items to
```

文件夹操作的缺点是运行速度慢，好处是不影响系统使用。

## 11. 脚本对象

### 11.1 me关键字

指代脚本，两个常见用途：

- `path to me`，返回脚本路径或是AppleScript编辑器路径
- `class of me`，得到script。

### 11.2 编写和使用基本的Script对象

```
property dialogText : "xxx"
script ShowMe
    display dialog dialogText
    
    on showSomething()
        display dialog "yyyy"
    end
end

run ShowMe
showSomething() of ShowMe

--另一种更推荐的方式：
tell ShowMe
    run
    showSomething()
end
```

### 11.3 载入和调用外部script对象

```
set thePath to ((path to desktop) as text) & "Script to Load.scpt"

set theScript to load script file thePath

run ShowMe of theScript
showSomething() of ShowMe of theScript
```

### 11.4 修改外部script对象中的属性

```
set thePath to ((path to desktop) as text) & "Script to Load.scpt"
set theScript to load script file thePath

run ShowMe of theScript

set dialogText of theScript to "zzzzz"

run ShowMe of theScipt

--如果是要修改脚本文件中的属性(比较危险)：
store script theScript in file thePath with replacing
```

## 附录

![](http://static.ifanze.cn/14812140639900.jpg)
![](http://static.ifanze.cn/14812141121492.jpg)

