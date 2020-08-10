### MIT 6.824 分布式系统笔记

1. 参考资料: [哔哩哔哩](https://www.bilibili.com/video/BV1R7411t71W?t=1274)

## P1 课程介绍

#### 课程结构

1. 课堂授课
2. 论文阅读及 2 次考试
3. 3 次实验
4. 期末考试作业

#### 实验内容

1. MapReduce
2. Raft
3. K/V 存储服务器
4. 分布式 K/V 存储服务器

### CAP 原则

1. 一致性（Consistency）

```md
1. 多副本
2. 强一致性
3. 弱一致性
```

2. 可用性（Availability）

```md
1. 系统容错
2. 故障恢复（非易失性故障存储）
```

3. 分区容错性（Partition tolerance）

> CAP 原则指的是，这三个要素最多只能同时实现两点，不可能三者兼顾。

## p2

1. golang/进程/线程/线程共享/锁

## p3 GFS

1. google file system

2. 顺序读写大文件读写系统

3. master 和 work 工作关系、容错机制

### master 用来标记 work 的信息， 数据分片， 执行信息，数据持久化

1. 顺序读写，每个文件分 64 M

#### master data

// 主要有 2 个 table：

1. 是 filename 到 chunk id (chunk handle)的数组映射(nv)

2. chunk list： 记录了 chunk handle 到一些数据的映射，其中一项是 chunk server 列表、每个 chunk 的版本号(nv)、chunk primary、lease expiration

3. master 在每个磁盘上的 log

### 创建快照的方式 执行恢复，从 log 的 EOF 恢复

### read

1. 第一步是吧文件名 和 偏移量 发送给 master:
   master 从文件表里查询文件名，每个 chunk 是 64 MB，利用偏移量初一 64MB 来查找是那个 chunk, 然后在从 chunk list 表里找到 check server， 再把包含这些数据的副本的 chunk server 列表返回给客户端， 所以第一步是把文件名和偏移量发送给 master

2. master 发送 chunk handle(记作 H) 和 server 列表（客户端），然后发送请求到那个副本上，客户端会 cache 这些结果, 如果它尝试再次读取这个 chunk 的花，客户端可能从返回的 chunk 中读取 1MB 或者是 64 kb 的片段， 所欲需要缓存给定的 chunk 所对应的 server, 对于相同的数据就不需要一遍一遍的查询。

3. 客户端 和 chunk server 进行通信， 发送一个chunk handle 以及一个偏移chunk server 存储这些chunk , 每个chunk 在磁盘上都有个独立的linux 文件，位于普通的linux 的文件系统中， 最后返回数据给客户端