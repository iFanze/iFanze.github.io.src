---
title: macOS CheatSheet
date: 2018-02-23 15:55:07
tags:
toc: true
---

记录常用的一些命令。

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
```

homebrew
=========

```bash
brew doctor
brew update
brew upgrade

brew search wget
brew info wget
brew install wget
brew list

brew cask search iterm2
brew cask info iterm2
brew install iterm2
brew cask list
```

nvm
======

```bash
nvm ls-remote
nvm install v8.9.4
nvm use v8.9.4
nvm current
nvm ls
nvm alias default v8.9.4
```

hexo
======

```bash
hexo new "Post Title"
hexo generate
hexo deploy
hexo clean
hexo server
```

