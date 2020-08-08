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