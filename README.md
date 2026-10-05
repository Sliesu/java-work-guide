# 后端题库 · Java

> 依据 **386 条真实后端面经**反推的 Java 面试考点地图。12 章 · 128 道问答 · 12 组可交互 SVG 图解。

不是又一份 Java 教程。这里只放**面试一定会问、且答错了就凉**的点，每章都标注了它在真实面试里的出现频次——该背的标 ★★★★★，可以缓的先跳过。

## 为什么按题库组织

内容不是拍脑袋排的，而是对 386 条面经（约 40 场面试记录）做关键词统计后反推出的优先级：

| 考点 | 频次 | 章节 |
|---|---|---|
| MySQL / 索引 / 事务 | **52** | 07 |
| 算法 / 链表 / 二叉树 | **47** | 08 |
| Redis | **33** | 07 |
| 并发 / 线程 | 30 | 03 |
| 网络 / IO | 22 | 10 |
| 分布式 / 一致性 | 19 | 11 |
| JVM / GC | 19 | 04 |
| 中间件（Kafka / ES） | 16 | 11 |
| 系统设计 | 10 | 12 |
| 操作系统 / 进程 | 8 | 10 |

## 章节

```
01  语言基础            引用与值 / String / Integer 缓存 / 异常体系
02  集合框架            HashMap 八题 / ConcurrentHashMap / 手写 LRU
03  并发编程            JMM / synchronized 锁升级 / 线程池 / AQS
04  JVM 内存与 GC       new 一个对象 / 类加载 / 复制算法 / Full GC 排查
05  Spring 生态        IoC / Bean 生命周期 / AOP / 自动装配
06  集合与并发容器       进阶选读
07  MySQL 与 Redis      索引原理 / MVCC / 锁 / 持久化 / 缓存一致性
08  手写题 & 算法       按题库频次排序，含 30 道可跑代码
09  面经话术 & 复盘     自我介绍 / STAR / 高频提问 / 反问
10  网络与 IO          TCP / epoll / HTTPS / Nginx / 进程通信
11  分布式与中间件      限流降级 / 分布式锁 / Raft / Kafka / ES
12  系统设计           秒杀 / IM / 朋友圈 / 抽奖 / 排行榜
```

## 使用

纯静态页面，**零依赖**，直接双击 `index.html` 即可。

也可以起个本地服务（推荐，图解的懒加载在 `file://` 下偶有差异）：

```bash
python3 -m http.server 8080
# 然后打开 http://localhost:8080
```

### 交互

- **图解**（12 组）：点步进按钮、拖进度条，或悬停后按 <kbd>←</kbd> <kbd>→</kbd> 逐帧看，空格播放
- **问答**：128 道问答，点标题展开答案
- **闪卡**：点击翻面，答不上来就翻回去
- **搜索**：<kbd>/</kbd> 聚焦，索引了全部问答与代码片段
- **标记掌握**：点侧栏条目前的方框，进度存 localStorage
- **快捷键**：<kbd>/</kbd> 搜索 · <kbd>g</kbd> 显示 12 栏基准线 · <kbd>t</kbd> 明暗主题

## 设计

Swiss International（Vignelli）× 华为 VI。

- 配色取自华为官方手册：`#C7000B` 为唯一强调色（占比约 1:9），配四级灰
- Helvetica / PingFang SC 单一无衬线族，层级只靠字号（8 级），不靠颜色
- 圆角恒为 0，阴影恒为无
- 动效原则：**状态切换硬切（signage flip），只有物理过程才做线性插值**——不用弹跳曲线

## 目录结构

```
index.html
assets/css/main.css        设计 token + 布局 + 组件
assets/js/viz.js           SVG 图解引擎：步进播放器 + 微型 svg builder
assets/js/viz-*.js         12 组图解定义
assets/js/data*.js         内容数据（纯数据，与渲染解耦）
assets/js/render.js        block 类型 → DOM
assets/js/app.js           导航 / 搜索 / 进度 / 主题
.e2e/*.mjs                 端到端验证脚本
```

## 验证

用 `playwright-core` 复用本机 Chromium 做真实浏览器验证，零额外下载：

```bash
NODE_PATH=~/.workbuddy/binaries/node/workspace/node_modules \
  node .e2e/verify.mjs     # 功能全量
  node .e2e/overflow.mjs   # 图解文字越界（getBBox 渲染宽度）
  node .e2e/layout.mjs     # 布局重叠 / 顶栏避让 / 响应式
  node .e2e/bars.mjs       # 13 个宽度（360~1600）顶栏降级
```

内容一旦改动，跑一遍这四个即可回归。当前状态：全部 0 failure。

## 说明

- 内容基于公开面经整理，**答案给的是标准答法而非定义背诵**——面试时要能边画边说
- 算法题库里少数题目原标注"非正式数据"，思路清晰即可，不必抠边界条件
- 商标与版权：题目内容来自公开面经整理，代码示例均为自行编写
