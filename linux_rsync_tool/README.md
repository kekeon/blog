### 安装

在 Ubuntu 下安装 rsync 通过以步骤可以实现：

```
sudo apt-get install rsync xinetd
```

默认情况下 Ubuntu 安装了 rsync，因此只需安装 xinetd

#### 服务器端配置

1.编辑/etc/default/rsync 启动 rsync 作为使用 xinetd 的守护进程

```
打开rsync
sudo vim /etc/default/rsync
# 编辑rsync
RSYNC_ENABLE=inetd
```

2.创建/etc/xinetd.d/rsync, 通过 xinetd 使 rsync 开始工作

```
# 创建并打开文件
sudo vim /etc/xinetd.d/rsync
# 编辑内容
service rsync
{
    disable         = no
    socket_type     = stream
    wait            = no
    user            = root
    server          = /usr/bin/rsync
    server_args     = --daemon
    log_on_failure  += USERID
}
```

3.创建/etc/rsyncd.conf,并填写配置信息

```
# 创建并打开文件
sudo vim /etc/rsyncd.conf
# 编辑配置信息
max connections = 2
log file = /var/log/rsync.log
timeout = 300

[share] # 模块名
comment = Public Share
# path为需要同步的文件夹路径
path = /home/share
read only = no
list = yes
uid = root
gid = root
# 必须和 rsyncd.secrets中的用户名对应
auth users = user
secrets file = /etc/rsyncd.secrets
```

4.创建/etc/rsyncd.secrets，配置用户名和密码.

```
# 创建并打开
sudo vim /etc/rsyncd.secrets
# 配置用户名和密码，密码可以任意设置
user:password

```

5.修改 rsyncd.secrets 文件的权限

```
sudo chmod 600 /etc/rsyncd.secrets
```

6.启动/重启 xinetd

```
sudo /etc/init.d/xinetd restart
```

#### 客户端配置

由于我用的系统是 windows，所以需要在 windows 上安装 rsync 的客户端 cwRsync

1.下载并安装 cwRsync

2.安装后将其添加到环境变量 path 中，我的 cwRsync 安装在 D:\cwRsync 目录下，将 D:\cwRsync\bin 添加到环境变量 path 中

#### 测试

在客户端运行下面的命令检查，确认 rsync 配置成功

```
# user是在服务器中rsyncd.secrets文件中配置的用户名
# xx.xx.xx.xx 是服务器的ip地址，也可以填写服务器对应的域名
# share 是rsyncd.conf中定义的模块


rsync user@xx.xx.xx.xx::share
```

输入密码后，如果输出以下类似内容，说明配置成功

drwxr-xr-x 4096 2006/12/13 09:41:59 .
drwxr-xr-x 4096 2006/11/23 18:00:03 folders

#### 同步

> 1.将本地文件同步至服务器

将当前目录下 public 路径下的全部内容，同步至服务器，服务器的同步路径在 rsyncd.conf 中指定

```
rsync -av ./public/ user@xx.xx.xx.xx::share
```

> 2.将服务器文件同步至本地

```
rsync -cvazu --progress user@xx.xx.xx.xx::share /rsyn
```
