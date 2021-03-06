---
title: Git CheatSheet
categories: 笔记
toc: false
comments: true
date: 2016-01-15 21:59:32
tags:
    - linux
    - macOS
---

常用的 Git 操作以及在廖雪峰的官方网站学习的 Git 教程.

<!-- more -->
<!-- toc -->


Git
===

```bash
# git config
git config --global user.name "Meng Fanze"
git config --global user.email "iFanze@outlook.com"
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config --list

# gen SSH key to github
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa



# 以下学习自廖雪峰的官方网站：
git init
git add "readme.txt"
git status
git commit -m "修正了一个错误"
git diff

git checkout -- readme.txt  #撤销更改，回到上次git add或者版本库的状态。
git reset HEAD readme.txt   #撤销add操作

git log
git log --pretty=oneline

git reset --hard HEAD^
git reset --hard HEAD^^
git reset --hard HEAD-100

git reset --hard 3628164

git reflog

git -diff HEAD -- readme.txt

git rm readme.txt
git checkout -- readme.txt

# 如果~/.ssh下没有id_rsa和id_rsa.pub两个文件：
ssh-keygen -t rsa -C "youremail@example.com"

git remote add origin git@server-name:path/repo-name.git
git remote          #查看远程仓库名称
git remote -v


# 第一次推送要加上-u来合并本地和远程的master分支。
git push -u origin master
git push origin master

git clone git@github.com:michaelliao/gitskills.git

git branch          #查看分支
git branch dev      #创建分支
git checkout dev    #切换分支
git checkout -b dev #创建并切换分支

git merge dev       #合并分支（Fast-forward方式）
git branch -d dev   #删除分支
git branch -D dev   #强行删除还未进行合并的分支

git log --graph --pretty=oneline --abbrev-commit    #显示分支合并图、一行显示、简化版本号

# 以上都是使用Fast Forward模式，如果关闭：
git merge --no-ff -m "merge with no-ff" dev

git stash
git stash list
git stash apply     #恢复
git stash drop      #删除
git stash pop       #恢复并删除
git stash apply stash@{0}

# 拉去远程的分支
git checkout -b dev origin/dev

git pull
git branch --set-upstream dev origin/dev

git tag v1.0
git tag v0.9 6224937
git show v0.9
git tag -a v0.1 -m "version 0.1 released" 3628164
git tag -s v0.2 -m "signed version 0.2 released" fec145a    #用PGP签名标签

git tag -d v0.1                     #本地删除标签
git push origin v1.0                #推送标签
git push origin --tags              #推送所有标签
git push origin :refs/tags/v0.9     #删除远程标签

git config --global color.ui true
git add -f App.class                #强行添加被ignore的文件
git check-ignore -v App.class       #查看是哪条ignore语句对该文件起了作用

git config --global alias.st status
git config --global alias.co checkout
git config --global alias.ci commit
git config --global alias.br branch
git config --global alias.unstage 'reset HEAD'
git config --global alias.last 'log -1'
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

#搭建Git服务器
sudo apt-get install git
sudo adduser git
收集所有需要登录的用户的公钥，就是他们自己的id_rsa.pub文件，把所有公钥导入到/home/git/.ssh/authorized_keys文件里，一行一个。
sudo git init --bare sample.git
sudo chown -R git:git sample.git

#禁止用git用户登录shell
vi /etc/passwd
把
git:x:1001:1001:,,,:/home/git:/bin/bash
改为
git:x:1001:1001:,,,:/home/git:/usr/bin/git-shell

git clone git@server:/srv/sample.git

管理公钥：Gitosis
管理权限：Gitolite


```