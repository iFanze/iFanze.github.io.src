---
title: Shell CheatSheet
categories: 笔记
toc: true
comments: true
date: 2018-06-24 16:17:10
tags:
    - 参考
    - linux
    - macOS
---

经常需要编写 shell 脚本进行一些自动化操作或者简单的处理，这里记录一些小技巧。

<!-- more -->
<!-- toc -->

## 写好shell脚本的13个技巧

> 引用：https://codeburst.io/13-tips-tricks-for-writing-shell-scripts-with-awesome-ux-19a525ae05ae
> 中文版：https://mp.weixin.qq.com/s/ZaIX8jv9LMWmrHQb4ew-dQ


### 1. 提供`--help`

```sh
#!/bin/sh
if [ ${#@} -ne 0 ] && [ "${@#"--help"}" = "" ]; then
  printf -- '...help...\n';
  exit 0;
fi;
```

- 学到了：

    - `$@`输出所有参数。
    - `$#`或`${ #@ }`输出参数长度。*（hexo报错，这里多加了空格）*
    - `#`用于按最短截断字符串，`##`用于按最长截断。
    - `-eq`、`-ne`等只能用于数值，不能用于字符串。
    - 字符串操作：https://blog.csdn.net/dongwuming/article/details/50605911

### 2. 检查所有使用命令的可用性

```sh
#!/bin/sh
_=$(command -v docker);
if [ "$?" != "0" ]; then
  ...
  exit 127;
fi;
echo "start..."
```

- 使用`command -v`寻找命令，弱寻找到该命令返回0。
- 使用`$?`获取上条命令的退出值。

### 3. 独立于当前工作目录

```sh
#!/bin/sh
CURR_DIR="$(dirname $0)"
cd ${CURR_DIR}
pwd
```

- `dirname file`可获取到当前目录到目标文件的相对路径。

### 4. 输入使用环境变量还是参数？

```sh
# do this
AWS_ACCESS_TOKEN='xxxxxxxxxxxx' ./provision-everything
# and not
./provisiong-everything --token 'xxxxxxxxxxx';

# do this
./provision-everything --async --instance-count 400
# and not
INSTANCE_COUNT=400 ASYNC=true ./provision-everything
```

### 5. 打印对系统进行的所有操作

```sh
#!/bin/sh
printf -- 'Downloading required document to ./downloaded... ';
wget -o ./downloaded https://some.site.com/downloaded;
printf -- 'Moving ./downloaded to /opt/downloaded...';
mv ./downloaded /opt/;
printf -- 'Creating symlink to /opt/downloaded...';
ln -s /opt/downloaded /usr/bin/downloaded;
```

- `printf -- "xxxxx"`可以让后面的字符串原样打印。

### 6. `--silent`模式

```sh
#!/bin/sh
if [ ${#@} -ne 0 ] && [ "${@#"--silent"}" = "" ]; then
  stty -echo;
fi;
# ...
# before point of intended output:
stty +echo && printf -- 'intended output\n';
# silence it again till end of script
stty -echo;
# ...
stty +echo;
exit 0;
```

- 利用`stty -echo`和`stty +echo`控制屏幕回显。但要注意如果程序中途异常状态没有设置回来。

### 7. 捕获异常恢复输出显示

```sh
#!/bin/sh
error_handle() {
  stty echo;
}
if [ ${#@} -ne 0 ] && [ "${@#"--silent"}" = "" ]; then
  stty -echo;
  trap error_handle INT;
  trap error_handle TERM;
  trap error_handle KILL;
  trap error_handle EXIT;
fi;
# ...
```

### 8. 动态进度条

```sh
#!/bin/sh
printf -- 'Performing asynchronous action..';
./trigger-action;
DONE=0;
while [ $DONE -eq 0 ]; do
  ./async-checker;
  if [ "$?" = "0" ]; then DONE=1; fi;
  printf -- '.';
  sleep 1;
done;
printf -- ' DONE!\n';
```

> 参考：http://mywiki.wooledge.org/BashFAQ/034

### 9. 用颜色编码输出

```sh
#!/bin/sh
printf -- "doing something... \n";
printf -- "\033[37m someone else\s output \033[0m\n";
printf -- "\033[32m SUCCESS: yay \033[0m\n";
printf -- "\033[33m WARNING: hmm \033[0m\n";
printf -- "\033[31m ERROR: fubar \033[0m\n";
```

- 有些脚本使用`\e`而不是`\033`，但要注意`\e`不适用于所有的 UNIX 系统。
- 所有可用颜色：https://misc.flogisoft.com/bash/tip_colors_and_formatting

### 10. 出现错误立即退出脚本

```sh
#!/bin/sh
set +e;
./script-1;
./script-2; # does not depend on ./script-1
./script-3; # does not depend on ./script-2
set -e;
./script-4;
./script-5; # depends on success of ./script-4
# ...
```

### 11. 自己执行清理工作

```sh
#!/bin/sh
handle_exit_code() {
  ERROR_CODE="$?";
  printf -- "an error occurred. cleaning up now... ";
  # ... cleanup code ...
  printf -- "DONE.\nExiting with error code ${ERROR_CODE}.\n";
  exit ${ERROR_CODE};
}
trap "handle_exit_code" EXIT;
# ... actual script...
```

### 12. 在退出时使用不同的错误码

```sh
#!/bin/sh
# ...
if [ "$?" != "0" ]; then
  printf -- 'X happened. Exiting with status code 1.\n';
  exit 1;
fi;
# ...
if [ "$?" != "0" ]; then
  printf -- 'Y happened. Exiting with status code 2.\n';
  exit 2;
fi;
```

### 13. 在结束时打印一个新行

```sh
#!/bin/sh
# ... your awesome script ...
printf -- '\n';
exit 0;
```

- 最好用`printf`代替`echo`，因为后者在不同系统中行为有差别。
- `printf`不会像`echo`那样在命令结束后添加一个换行符。
