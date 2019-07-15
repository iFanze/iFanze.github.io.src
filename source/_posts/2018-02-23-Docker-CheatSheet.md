---
title: Docker CheatSheet
date: 2018-02-23 16:40:23
categories: 笔记
tags: 
    - 参考
    - docker
toc: true
---

阅读 Docker 官方文档的笔记。

<!-- more -->
<!-- toc -->

Get Started, Part 1: Orientation and setup
===========================================

``` bash
## List Docker CLI commands
docker
docker container --help

## Display Docker version and info
docker --version
docker version
docker info

## Excecute Docker image
docker run hello-world

## List Docker images
docker image ls

## List Docker containers (running, all, all in quiet mode)
docker container ls
docker container ls -all
docker container ls -a -q
```

Get Started, Part 2: Containers
===================================

```bash
docker build -t friendlyhello .  # Create image using this directory's Dockerfile
docker run -p 4000:80 friendlyhello  # Run "friendlyname" mapping port 4000 to 80
docker run -d -p 4000:80 friendlyhello         # Same thing, but in detached mode
docker container ls                                # List all running containers
docker container ls -a             # List all containers, even those not running
docker container stop <hash>           # Gracefully stop the specified container
docker container kill <hash>         # Force shutdown of the specified container
docker container rm <hash>        # Remove specified container from this machine
docker container rm $(docker container ls -a -q)         # Remove all containers
docker image ls -a                             # List all images on this machine
docker image rm <image id>            # Remove specified image from this machine
docker image rm $(docker image ls -a -q)   # Remove all images from this machine
docker login             # Log in this CLI session using your Docker credentials
docker tag <image> username/repository:tag  # Tag <image> for upload to registry
docker push username/repository:tag            # Upload tagged image to registry
docker run username/repository:tag                   # Run image from a registry
```

```dockerfile
# Use an official Python runtime as a parent image
FROM python:2.7-slim

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]
```

Get Started, Part 3: Services
====================================

```bash
docker stack ls                                            # List stacks or apps
docker stack deploy -c <composefile> <appname>  # Run the specified Compose file
docker service ls                 # List running services associated with an app
docker service ps <service>                  # List tasks associated with an app
docker inspect <task or container>                   # Inspect task or container
docker container ls -q                                      # List container IDs
docker stack rm <appname>                             # Tear down an application
docker swarm leave --force      # Take down a single node swarm from the manager
```

Get Started, Part 4: Swarms
=================================

```bash
docker-machine create --driver virtualbox myvm1 # Create a VM (Mac, Win7, Linux)
docker-machine create -d hyperv --hyperv-virtual-switch "myswitch" myvm1 # Win10
docker-machine env myvm1                # View basic information about your node
docker-machine ssh myvm1 "docker node ls"         # List the nodes in your swarm
docker-machine ssh myvm1 "docker node inspect <node ID>"        # Inspect a node
docker-machine ssh myvm1 "docker swarm join-token -q worker"   # View join token
docker-machine ssh myvm1   # Open an SSH session with the VM; type "exit" to end
docker node ls                # View nodes in swarm (while logged on to manager)
docker-machine ssh myvm2 "docker swarm leave"  # Make the worker leave the swarm
docker-machine ssh myvm1 "docker swarm leave -f" # Make master leave, kill swarm
docker-machine ls # list VMs, asterisk shows which VM this shell is talking to
docker-machine start myvm1            # Start a VM that is currently not running
docker-machine env myvm1      # show environment variables and command for myvm1
eval $(docker-machine env myvm1)         # Mac command to connect shell to myvm1
& "C:\Program Files\Docker\Docker\Resources\bin\docker-machine.exe" env myvm1 | Invoke-Expression   # Windows command to connect shell to myvm1
docker stack deploy -c <file> <app>  # Deploy an app; command shell must be set to talk to manager (myvm1), uses local Compose file
docker-machine scp docker-compose.yml myvm1:~ # Copy file to node's home dir (only required if you use ssh to connect to manager and deploy the app)
docker-machine ssh myvm1 "docker stack deploy -c <file> <app>"   # Deploy an app using ssh (you must have first copied the Compose file to myvm1)
eval $(docker-machine env -u)     # Disconnect shell from VMs, use native docker
docker-machine stop $(docker-machine ls -q)               # Stop all running VMs
docker-machine rm $(docker-machine ls -q) # Delete all VMs and their disk images
```

Dockerfile Sample
===============================

``` dockerfile
# Use an official Python runtime as a parent image
FROM python:2.7-slim

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]
```

docker-compose.yml Sample
=======================

```yml
version: "3"
services:
  web:
    # replace username/repo:tag with your name and image details
    image: username/repo:tag
    deploy:
      replicas: 5
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: "0.1"
          memory: 50M
    ports:
      - "80:80"
    networks:
      - webnet
  visualizer:
    image: dockersamples/visualizer:stable
    ports:
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
    deploy:
      placement:
        constraints: [node.role == manager]
    networks:
      - webnet
  redis:
    image: redis
    ports:
      - "6379:6379"
    volumes:
      - "/home/docker/data:/data"
    deploy:
      placement:
        constraints: [node.role == manager]
    command: redis-server --appendonly yes
    networks:
      - webnet
networks:
  webnet:
```

Docker development best practices
======================================

1. Keep images small

    - Start with an appropriate base image.
    - Use **multistage builds**, or reduce the number of layers by minimizing the number of `RUN` command.
    - Creating your own base image, if you have multiple images with a lot in common.
    - Use the production image as the base image for the debug image.
    - Tag images with useful tags.

2. Persist data

    - Avoid storing data in writable layer using storage drivers, instead, using **volumes**.
    - Use **bind mounts** during development and production.
    - For production, use **secrets** and **configs** to store sensitive/non-sensitive data.

3. Use swarm services when possible

    - Design the app with the ability to scale using swarm services.
    - Even only need a single instance, swarm services is better.
    - Use `docker stack deploy` instead of `docker pull`.


Dockerfile Reference 
========================

Usage
------

```shell
docker build -f /path/to/a/Dockerfile -t shykes/myapp:1.0.2 -t shykes/myapp:latest .
```

Format
-------

- Comment: `#`.
- Parser directives: 
    - Only one at present: `# escape=\`. 
    - Must be at the very top of a Dockerfile.
    - Line continuation characters are not supported.

Environment replacement
------------------------

- `ENV`
- `${var}`
- `${var:-word}`
- `${var:+word}`

```dockerfile
ENV abc=hello
ENV abc=bye def=$abc        # def is hello
ENV ghi=$abc                # ghi is bye
```

.dockerignore file
-------------------

```
# comment
*/temp*
*/*/temp*
temp?
*.md
!README.md
```

FROM
-----

```docker
ARG  CODE_VERSION=latest
FROM <image> [AS <name>]
FROM <image>[:<tag>] [AS <name>]
FROM <image>[@<digest>] [AS <name>]
```

- `ARG` is the only instruction that may precede `FROM`.
- `FROM` can appear multiple times.

RUN
----

2 forms:
- shell form: `RUN <command>` , it will run in a shell which by default is `/bin/sh -c` or `cmd /S /C`.
- exec form: `RUN ["executable", "param1", "param2"]`.

note: it is the shell that is doing the environment variable expansion, not docker. so:

```docker
RUN [ "echo", "$HOME" ]             # incorrect
RUN [ "sh", "-c", "echo $HOME" ]    # correct
```

CMD
-----

3 forms:
- `CMD ["executable","param1","param2"]` (exec form, this is the preferred form)
- `CMD ["param1","param2"]` (as default parameters to ENTRYPOINT)
- `CMD command param1 param2` (shell form)

Note: 
- Only one `CMD` allowed, or, the last will take effect.
- If the user specifies arguments to `docker run` then they will override the default specified in `CMD`.
- `CMD` does not execute anything at build time.


LABEL
-----

```docker
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```

Adds metadata to an image, such as `MAINTAINER`.


EXPOSE
-------

```docker
EXPOSE <port> [<port>/<protocol>...]
EXPOSE 80/tcp
EXPOSE 80/udp
```

Override at runtime:

```
docker run -p 80:80/tcp -p 80:80/udp ...
```

ENV
----

```docker
ENV <key> <value>
ENV <key>=<value> ...

ENV myName="John Doe" myDog=Rex\ The\ Dog \
    myCat=fluffy

ENV myName John Doe
ENV myDog Rex The Dog
ENV myCat fluffy
```

To set a value for a single command, use `RUN <key>=<value> <command>`.

ADD
-----

2 forms:

- `ADD [--chown=<user>:<group>] <src>... <dest>`
- `ADD [--chown=<user>:<group>] ["<src>",... "<dest>"]` (this form is required for paths containing whitespace)

note:
- `<dest>` is an absolute path, or a path relative to `WORKDIR`.
- `<user>:<group>` will be `0` by default. Setting them through `UID/GID` or `username/groupname` is OK.
- Using `username/groupname` require the base image contain `/etc/passwd` and `/etc/group`.


COPY
-----

Almost same as `ADD`, but:

- `ADD` allows `<src>` to be an URL
- If the `<src>` parameter of `ADD` is an archive in a recognised compression format, it will be unpacked


ENTRYPOINT
-----------

2 forms:

- `ENTRYPOINT ["executable", "param1", "param2"]` (exec form, preferred)
- `ENTRYPOINT command param1 param2` (shell form)

note:

- Unlike `CMD`, `ENTRYPOINT` won't be replaced by command line arguments, those arguments will be appended after all elements in an **exec form** `ENTRYPOINT`.
- You can override the `ENTRYPOINT` instruction using the `docker run --entrypoint flag`.
- **shell form** `ENTRYPOINT` can prevent `CMD` or command line arguments from being used, however, container's `PID 1` will be `/bin/sh` rather than the executable. So the executable won't receive the `SIGTERM` signal from `docker stop <container>`.
- Only one `CMD` allowed, or, the last will take effect.

