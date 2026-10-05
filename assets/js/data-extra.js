/* ============================================================
   新增章节：网络与 IO / 分布式与中间件 / 系统设计
   依据：字节后端面经题库（386 条真实面试记录）考点分布
   ============================================================ */
window.EXTRA = [

/* ======================= 10 ======================= */
{
  no: '10', id: 'c10', title: '网络与 IO', sub: '题库 22+ 次高频。TCP、epoll、HTTP 是应届生最容易答得含糊的一块——因为平时用得少，但面试必问。',
  meta: [['块数', '9'], ['问答题', '14'], ['图解', '2']],
  blocks: [

  { t: 'lead', html: '这一章的正确答法是<b>「说清机制 + 说清为什么这么设计 + 说清生产怎么用」</b>。只背"三次握手四次挥手"没有意义，面试官追问一句就露。' },

  { t: 'sub', h: 'TCP 连接', tag: 'CORE' },
  { t: 'viz', id: 'tcp', no: 0, title: 'TCP 三次握手 / 四次挥手 / 拥塞控制' },

  { t: 'qa', items: [
    { q: '为什么必须三次握手？两次不行吗？', a: '两次握手时，服务端发出 SYN-ACK 后就认为连接建立并分配了资源，但<b>它无法确认客户端是否收到</b>。如果这个 SYN-ACK 在网络中丢失，客户端其实没收到，服务端却已经在等客户端发数据了——这会浪费服务端资源。更极端的情况：客户端早已关闭连接，只是延迟的 SYN 到达服务端，服务端会为一个已死的连接白白维持。若三次握手，服务端发出 ACK 后仍需等对端确认才真正投入服务。' },
    { q: '为什么挥手要四次而握手只要三次？', a: '因为 TCP 是<b>全双工</b>。收到 FIN 只表示"对方没有数据要发了"，本方可能还有数据没发完。所以服务端先回 ACK（此时只是半关闭），等剩余数据发完后再单独发一个 FIN + ACK。这一步无法与 ACK 合并。握手时两次就够是因为 SYN-ACK 可以同时承载"确认你的 SYN"和"我的 SYN 标识"两个语义。' },
    { q: 'TIME_WAIT 有什么用？为什么是 2MSL？', a: '① <b>确保最后一个 ACK 能到达对方</b>——若 ACK 丢失，对端会重发 FIN，此时处于 TIME_WAIT 可以重新响应；② <b>让本次连接的迷路报文在网络中消散</b>——若不等待，相同四元组的旧连接报文可能进入新连接。2MSL 是"报文在网络中最长存活时间 × 2"，MSL 由 RFC 793 规定为 2 分钟，实际 Linux 默认约 60s。' },
    { q: 'SYN Flood 是什么？怎么防御？', a: '攻击者伪造大量 SYN 但不完成三次握手，耗尽服务端<b>半连接队列</b>。防御：① <b>SYN_COOKIE</b>（net.ipv4.tcp_syncookies=1）——不维护半连接队列，把状态编码在 ISN 里；② 增大 backlog；③ 限速 + 封禁可疑源；④ 网关层清洗。' },
    { q: 'TCP 拥塞控制四个算法？', a: '<b>慢启动</b>（cwnd 从 1 开始指数增长）→ <b>拥塞避免</b>（超过 ssthresh 后每个 RTT 只 +1 MSS）→ <b>快重传</b>（收到 3 个重复 ACK 立即重传，不等 RTO）→ <b>快恢复</b>（cwnd 减半而非归 1）。另外要说清<b>流量控制</b>（接收方能力，rwnd 滑动窗口）和<b>拥塞控制</b>（网络能力，cwnd）的区别——实际发送窗口取两者较小值。' }
  ]},

  { t: 'sub', h: 'socket 与 IO 模型', tag: 'HOT' },
  { t: 'viz', id: 'epoll', no: 0, title: 'select / poll / epoll 与 LT/ET' },

  { t: 'qa', items: [
    { q: 'socket 建立过程？', a: '<b>客户端</b>：创建 socket → bind（可省略，connect 时自动分配）→ connect（发 SYN，内核完成三次握手）→ send/recv。<b>服务端</b>：socket → <b>bind</b>（显式绑定端口）→ <b>listen</b>（进入 LISTEN，backlog 为半连接队列）→ <b>accept</b>（从全连接队列取出已建连的连接，返回新的 fd）→ send/recv。accept 成功后客户端与服务端各持有一个 fd，指向同一连接，但读写缓冲区独立。' },
    { q: '为什么要有 listen backlog？', a: '内核维护两个队列：<b>半连接队列</b>（收到 SYN 但未完成握手的，backlog 控制其上限）和<b>全连接队列</b>（已完成三次握手等待 accept 的）。backlog 设太小会丢包（客户端重传），太大则内存消耗高且被攻击面大。' },
    { q: '五种 IO 模型？Java NIO 属于哪种？', a: '① 阻塞 IO ② 非阻塞 IO ③ IO 多路复用（select/poll/epoll）④ 信号驱动 IO（SIGIO，Linux 支持但不常用）⑤ 异步 IO（AIO，内核完成拷贝后通知）。<b>Java NIO 是第三种</b>——虽然叫"非阻塞"，但底层用 epoll 做多路复用，数据拷贝仍由 CPU 执行。真正的 AIO（如 Netty 的 LinuxNativeAIO）才是第四种/第五种。' },
    { q: 'epoll 为什么比 select 快？', a: '三个维度：① <b>无需重复传入 fd</b>——epoll_ctl 注册一次后，fd 存在内核的红黑树里，后续 epoll_wait 不用再传；② <b>返回就绪事件而非全部 fd</b>——就绪的放在 rdllip 链表，只遍历就绪的；③ <b>无 1024 限制</b>——select 的 fd_set 是固定大小位图。epoll_wait 本身的复杂度是 O(就绪数)，注册是 O(log n)。' },
    { q: 'epoll 是 LT 还是 ET？Netty 用哪个？', a: '<b>Netty 默认 ET</b>（Linux），Nginx 也用 ET。ET 效率更高（事件只通知一次），但必须配合<b>非阻塞 IO + 循环读到 EAGAIN</b>，否则剩余数据永远不再触发事件，造成事件丢失。LT 更安全，只要没读完就会一直通知。' },
    { q: '如何高效处理大量 socket 连接？', a: '<b>IO 多路复用</b>（单线程 epoll 也能扛 10w 连接）而非"每个连接一个线程"。但单线程有瓶颈（一个慢请求阻塞全部），所以实际是<b>多 Reactor + 多线程</b>：主线程（boss）只负责 accept 和建连，从线程（worker）用 epoll 处理读写。Netty 的线程模型、Reactor/Proactor 模式就是这个。' },
    { q: '零拷贝了解吗？', a: '传统读文件发网络要 4 次拷贝（磁盘→page cache→用户 buffer→socket buffer）+ 2 次系统调用。<b>零拷贝</b>：① <code>mmap</code>（省一次拷贝，但仍有 2 次）② <code>sendfile</code>（内核内部直接传输，2 次拷贝都省了）③ <b>DMA</b>（配合 scatter-gather，去掉内核 buffer 到用户 buffer 的拷贝）。Kafka 大量使用 sendfile，Nginx 用 sendfile + tcp_nopush/tcp_nodelay。' }
  ]},

  { t: 'sub', h: 'HTTP 与 HTTPS', tag: 'CORE' },
  { t: 'qa', items: [
    { q: 'HTTP 和 HTTPS 的区别？', a: '① 加密：HTTP 明文，HTTPS = HTTP + TLS；② 端口：80 / 443；③ 证书：HTTPS 需要 CA 签发证书做身份认证；④ 性能：多一次 TLS 握手（1-RTT 或 0-RTT）。<b>但现在看</b>：HTTP/2 单独用明文也很快，安全性应通过 HSTS 全站强制跳转实现，不要只保护表单提交。' },
    { q: 'HTTPS 建立连接的过程？TLS 握手做了什么？', a: '<b>核心目的只有两个：确认对方身份（防中间人）+ 协商出共享密钥（防窃听）。</b>以 TLS 1.2 为例：<br>① <b>ClientHello</b>：随机数、支持的密码套件、SNI、是否支持扩展<br>② <b>ServerHello</b>：随机数、选定密码套件、证书<br>③ 客户端<b>验证证书链</b>（是否由受信 CA 签发、是否过期、域名是否匹配），再发 <b>ClientKeyExchange</b>（RSA 加密 premaster，或 ECDHE 交换公钥）<br>④ <b>ChangeCipherSpec</b> → 双方用 premaster 派出会话密钥<br>⑤ <b>Finished</b>：用会话密钥加密的校验值<br>→ 此后对称加密传输。TLS 1.3 砍掉了 RSA 密钥传输、压缩，把 1-RTT 优化到 0-RTT（resumption）。' },
    { q: 'HTTPS 传输数据用对称还是非对称加密？', a: '<b>非对称用于握手阶段协商密钥（RSA / ECDHE），对称用于数据传输（AES-GCM / ChaCha20）。</b>因为非对称运算慢（RSA 2048 位每秒几千次），对称快（AES-NI 可达 GB/s）。这个组合叫<b>混合加密</b>。' },
    { q: 'TCP 重传、滑动窗口、粘包问题？', a: '<b>粘包</b>不是 TCP 的问题，而是"字节流没有消息边界"的必然结果。应用层四种解法：① <b>固定长度</b>（简单但浪费）② <b>分隔符</b>（\\n，HTTP 用）③ <b>长度前缀</b>（Dubbo/Redis 用，最常用）④ <b>自定义协议</b>（TLV，二进制，Netty 常用）。<b>拆包</b>是反过来的问题：把一次写入拆成多次读取，Netty 的 FixedLengthFrameDecoder 等就是解决这个。' },
    { q: '浏览器从输入 URL 到页面渲染的完整过程？', a: '① 解析 URL、检查缓存 ② DNS 解析（浏览器缓存→系统 hosts→DNS 服务器，递归+迭代查询）③ 建立 TCP 连接（三次握手）④ HTTPS 则再 TLS 握手 ⑤ 发送 HTTP 请求报文 ⑥ 服务端处理并返回响应 ⑦ 浏览器解析 HTML → 触发预加载 CSS/JS/图片 ⑧ 解析 CSS 生成 CSSOM、解析 JS（生成 AST→字节码）→ 合成 Render Tree → Layout（计算布局）→ Paint → Composite（分层合成）⑨ 途中如果 CSS/JS 阻塞渲染则暂停 ⑩ 服务器推送（HTTP/2）。<b>优化点</b>：减少 DNS、CDN、HTTP/2 多路复用、代码分割、预加载关键资源。' }
  ]},

  { t: 'sub', h: 'Nginx 与服务器', tag: 'SR' },
  { t: 'qa', items: [
    { q: 'Nginx 和 Apache 的区别？', a: '① <b>模型</b>：Nginx 事件驱动异步非阻塞（一个 worker 靠 epoll 管上万连接）；Apache 传统 prefork（每连接一进程）或 worker（每连接一线程），也有 event 模式但历史包袱重。② <b>内存</b>：Nginx 静态文件零拷贝（sendfile），内存占用小。③ <b>动态支持</b>：Apache 更强（mod_php 直接跑 PHP）；Nginx 需反向代理到 PHP-FPM。④ <b>配置</b>：Nginx 简洁、reload 平滑；Apache 灵活但复杂。' },
    { q: 'Nginx 如何做性能优化？', a: '① <b>零拷贝</b>：sendfile + tcp_nopush + tcp_nodelay 组合（<code>tcp_nopush on; sendfile on; tcp_nodelay on;</code>）<br>② <b>压缩</b>：gzip（静态资源）/ brotli（更小）；文本类才压，已压缩的不要再压<br>③ <b>缓存</b>：expires + Cache-Control + ETag，静态资源长缓存带 hash<br>④ <b>连接复用</b>：keepalive_timeout + upstream keepalive<br>⑤ <b>负载均衡</b>：upstream + least_conn / ip_hash，upstream keepalive 复用后端连接<br>⑥ <b>限流</b>：limit_req_zone（漏桶）/ limit_conn_zone（连接数）<br>⑦ 隐藏版本号、关闭多余模块、worker 数量设 CPU 核数。<br>面试要点：<b>说出每个优化针对什么瓶颈</b>，比罗列配置有用得多。' },
    { q: 'Nginx 如何处理一个请求？', a: '① accept 接收连接 ② 按 server_name 匹配虚拟主机 ③ location 匹配（<b>精确 → ^~ 前缀 → ~ 正则 → / 前缀</b>，正则按顺序第一个命中就停）④ 若是静态文件 → 走 sendfile 零拷贝返回；若是动态请求 → <b>反向代理到 upstream 后端</b>（先查 keepalive 连接池，没有则新建并加入池）⑤ 后端返回后 Nginx 边收边发给客户端（响应头已发就不能再改状态码——这解释了为什么"后端出错时 Nginx 只能报 502 而不能改 404"）⑥ 关闭或归还 keepalive 连接。' },
    { q: '如何查看系统性能？', a: '<b>uptime</b> 或 <b>w</b>：第一行三个数字是 <b>1/5/15 分钟平均负载</b>，即运行队列长度。判断标准：<b>load / CPU 核数 &gt; 1</b> 说明过载。<br><b>top</b>：实时，C 键切换显示完整命令，%Cpu(s) 里的 us/sy/id 要看懂。<br><b>free -h</b>：重点看 available 和 swap（用了 swap 就是内存不够的信号）。<br><b>vmstat 1</b>：bi/bo 是块设备读写，cs 是上下文切换，r 是运行队列。<br><b>iostat -x 1</b>：%util 接近 100 说明磁盘饱和，await 高说明有 IO 等待。<br><b>jstat / jmap / jstack</b>：JVM 层面（见 JVM 章）。<br>排查顺序：<b>先看 CPU 和 load → 再看内存 → 再看 IO → 最后看网络</b>。' },
    { q: '进程间通信（IPC）方式？', a: '① <b>管道 pipe</b>（半双工，匿名管道只能父子进程，命名管道 FIFO 可跨进程）② <b>消息队列</b>（System V msgqueue、POSIX mqueue）③ <b>共享内存</b>（shm，IPC 家族唯一需要同步机制的数据交换，快但要配信号量）④ <b>信号量</b>（semaphore，PV 操作，做互斥）⑤ <b>信号</b>（signal，异步通知）⑥ <b>socket</b>（可跨机器，通用）。<b>Java 里</b>：管道对应 PipedInputStream/PipedOutputStream（线程级），跨进程只能靠本地文件或 RMI/socket。' },
    { q: '管道如何使用？有什么特点？', a: '<code>ls | grep java</code>——数据在内核缓冲区流动，两个命令并发执行，grep 一边来一边处理。特点：<b>半双工</b>、只能<b>先进先出</b>、通常只能父子进程或兄弟进程间使用、写满或读空会阻塞。<b>区别</b>：命名管道（FIFO）通过文件系统路径跨进程；<code>pipe()</code> 返回匿名管道只能有亲缘关系。' },
    { q: '用户态和内核态？为什么需要切换？', a: 'CPU 提供两种运行级别：<b>用户态（Ring 3）</b>不能访问特权指令和硬件，<b>内核态（Ring 0）</b>可以。应用跑在用户态，操作系统内核跑在内核态。切换的必要性：<b>保护硬件 + 保证系统稳定性</b>（防止应用误操作搞崩机器）。代价是上下文切换（保存/恢复寄存器、页表）。<b>系统调用</b>（read/write/socket）就是从用户态陷入内核态再返回，单次切换约几百纳秒——所以<b>减少系统调用是性能优化重要手段</b>（零拷贝、DMA 都是这个思路）。' }
  ]}
  ]
},

/* ======================= 11 ======================= */
{
  no: '11', id: 'c11', title: '分布式与中间件', sub: '题库 19+16 次。分布式一致性、限流降级、Kafka、ES——这一块决定你是"会写代码"还是"能扛系统"。',
  meta: [['块数', '10'], ['问答题', '18'], ['图解', '1']],
  blocks: [

  { t: 'lead', html: '分布式题的关键不是背概念，而是<b>说清"引入了什么问题、怎么解决、还有什么代价"</b>。面试官问的是你的取舍能力，不是你的知识量。' },

  { t: 'sub', h: '限流 / 降级 / 熔断', tag: 'HOT' },
  { t: 'viz', id: 'limit', no: 0, title: '分布式限流：100w 总量如何分到 100 台机' },

  { t: 'table',
    caption: '三个概念的边界 —— 面试最爱问"它们的区别"',
    head: ['概念', '解决什么', '触发条件', '典型实现'],
    rows: [
      ['限流', '控制单位时间请求量，保护自身', '超过设定阈值', '令牌桶 / 漏桶 / 滑动窗口 / Sentinel'],
      ['熔断', '下游已经挂了，别再打它', '错误率 / 慢调用比例超阈值', 'Hystrix / Sentinel / Resilience4j'],
      ['降级', '资源不够时返回兜底结果', '主动或被动触发', '返回缓存/默认值/静态页'],
      ['隔离', '故障不扩散（舱壁模式）', '按依赖划分资源池', '线程池隔离 / 信号量隔离 / 独立服务']
    ]},

  { t: 'qa', items: [
    { q: '分布式限流怎么实现？100w 总量分到 100 台机？', a: '核心是<b>总量控制必须集中，单机限流只是二次保护</b>。方案：① <b>Redis 令牌桶 + Lua 原子取</b>——各机每轮从 Redis 借一批额度存本地，Lua 保证并发下不超发；缺点是 Redis 承受全量请求（可用本地桶放大倍数降低频率）。② <b>动态配额协商</b>——实例注册到注册中心，按存活数 N 分配 total/N，某机挂了配额自动回收。③ <b>网关层统一限流</b>——Nginx/APISIX 做入口限流，业务零感知。生产上一般是①+③组合。' },
    { q: '服务降级方案？如何指定降级优先级？', a: '<b>降级</b>是主动返回兜底：关闭非核心功能、返回缓存/静态数据、返回默认值。<b>优先级排序原则</b>（这是答��重点）：<br>① <b>按重要性</b>：核心交易功能 > 辅助功能 > 统计日志<br>② <b>按调用链深度</b>：越上游越重要（下游降级影响面小）<br>③ <b>按恢复成本</b>：优先降级恢复慢的<br>实现：Sentinel 按 <code>degradeRule</code> 配置规则（RT / 异常比例 / 异常数），K8s 用 HPA 自动扩缩容作为降级的替代手段。<b>关键原则：降级必须可回退、有埋点、降级开关要能快速关</b>。' },
    { q: '线上服务器挂掉怎么处理？', a: '① <b>先止损</b>：摘流量（Nacos 自动摘除 / K8s readiness 探针失败）<br>② <b>保留现场</b>：dump 内存、jstack、jmap、GC 日志、CPU profile（火焰图）<br>③ <b>定位</b>：内存泄漏→MAT 分析引用链；CPU 高→火焰图找热点；GC 频繁→jstat 看 GC 情况<br>④ <b>预案</b>：回滚上一版本 / 切流量到备用节点 / 降级非核心功能<br>⑤ <b>复盘</b>：加监控告警、加压测、上线前 code review、加自动化测试。<br><b>面试要点</b>：说清"止损优先于定位"，这是线上处理的基本原则。' },
    { q: '服务依赖不可用怎么治理？', a: '四层防护：<b>① 超时控制</b>（必须设，且要设得比下游 P99 略高；没有超时是雪崩最大诱因）<b>② 重试限制</b>（重试会放大流量，必须配退避 + 只对幂等接口重试）<b>③ 熔断降级</b>（错误率超阈值直接快速失败，不再打下游）<b>④ 舱壁隔离</b>（每个依赖独立线程池，弱依赖耗尽不影响强依赖）。再往上：核心链路做<b>强弱依赖梳理</b>，弱依赖全部可以降级。' }
  ]},

  { t: 'sub', h: '分布式锁与事务', tag: 'HOT' },
  { t: 'qa', items: [
    { q: '分布式锁怎么实现？Redis 方案的弊病？', a: '<b>正确实现三步</b>：① <code>SET key uuid NX PX 30000</code>（原子加锁 + 唯一标识 + 自动过期）② 执行业务 ③ <b>Lua 脚本比对 uuid 再删除</b>（保证原子释放，避免误删别人的锁）。<br><b>弊病</b>：<br>① <b>业务没执行完锁就过期</b>（30s 不够）→ Redisson <b>看门狗线程</b>自动续期<br>② <b>主从切换丢锁</b>（锁写在主节点，异步复制到从节点，主挂了锁没了）→ Redlock 算法（向 N 个独立节点加锁，超过半数成功才算加锁成功）<br>③ <b>不能重入</b> → Redisson 用 hash 记录持有者线程 ID<br>④ <b>GC 停顿 / 网络抖动</b>导致误判删除 → 校验 value 里的唯一标识。<br><b>ZooKeeper 方案</b>：临时顺序节点 + Watch 监听，<b>强一致</b>，但性能不如 Redis。选型：<b>可用性优先用 Redis，强一致优先用 ZK</b>。' },
    { q: '分布式事务有哪些方案？', a: '按优先级：<br>① <b>最终一致：本地消息表 / 事务消息</b>——业务和消息在同一本地事务，异步重试。RocketMQ 事务消息做这个。<br>② <b>TCC</b>——Try 预留资源 / Confirm 确认 / Cancel 释放，<b>性能最好但业务侵入大</b>（每个操作都要实现三段，且要处理空回滚、幂等、悬挂问题）。<br>③ <b>Seata AT</b>——基于 undo_log 自动生成反向 SQL，对业务零侵入，代价是隔离性降为读已提交。<br>④ <b>可靠消息最终一致（RocketMQ / Canal）</b>。<br>⑤ <b>2PC / XA</b>——强一致但性能差、阻塞时间长，一般不用。<br><b>答法</b>：先说"我们通过 MQ 做最终一致"，再解释为什么不用 2PC（同步阻塞、协调者单点）。' },
    { q: 'TCC 的原理？', a: 'Try：预留资源（不能真正扣减，只冻结，如余额减 0、库存标记为"已锁定"）；Confirm：把冻结转成真实扣减；Cancel：解冻。<b>三个必须处理的问题</b>：<b>空回滚</b>（Try 未到达先收到 Cancel → 记录一个空标记，Cancel 直接返回，后续 Try 检测到标记直接失败）、<b>幂等</b>（用业务唯一键 + 事务记录表）、<b>悬挂</b>（Cancel 先于 Try 执行完，Try 完成后发现已 Cancel → 拒绝执行）。' },
    { q: 'Raft 协议过程？如何选主？', a: '<b>Raft 三种状态</b>：Follower / Candidate / Leader。<b>选主</b>：Follower 收不到心跳 → 变 Candidate → 发起投票 → <b>获得超过半数票</b>则成为 Leader。<b>关键限制</b>：<b>每个 term 最多投一票</b>（防重复投票），<b>任期号单调递增</b>（拒绝旧 term 的请求）。<b>日志复制</b>：Leader 给 Follower 发 AppendEntries，Follower 一致才复制。<b>安全性</b>：Leader 只能提交「自己任期内的日志」且需多数确认（CommitIndex 规则），避免已提交日志被覆盖。<b>脑裂</b>：两个 Leader 各持少数，少数派成为 Follower 后发现 term 更小，主动退位。<br>对比 Paxos：Raft 更易理解（强 Leader + 日志复制），Paxos 更精炼但难实现。Etcd / Consul / ZooKeeper(ZAB) 都是 Raft 变体。' },
    { q: 'RPC 框架的底层架构？线程怎么管理？', a: '<b>核心三步</b>：① <b>动态代理</b>——把接口调用转成网络请求（Dubbo 用 JDK 动态代理 + 泛化调用，gRPC 用编译生成 stub）② <b>序列化 + 网络传输</b>（Kryo/Hessian/Protobuf 序列化，Netty 传输）③ <b>线程池处理 + 解码回填</b>。<br><b>线程模型</b>：<b>Netty 的主从 Reactor</b>——boss 线程组（单线程）只负责 accept 建连，worker 线程组负责读写事件；<b>业务处理</b>可选：① 在 worker 线程直接处理（快，但阻塞操作会卡死整个 event loop）② <b>业务线程池池化</b>（Dubbo 默认，通过 ThreadPoolExecutor 隔离）③ 虚拟线程（Java21，Loom 项目）。<br><b>面试要点</b>：说清"为什么不能在 event loop 里做阻塞 IO"——一个慢请求会拖垮该连接上的所有请求。' }
  ]},

  { t: 'sub', h: '消息队列', tag: 'MQ' },
  { t: 'qa', items: [
    { q: 'Kafka 原理？数据怎么存的？', a: '<b>存储</b>：<b>顺序写 + 零拷贝</b>。消息按 topic-partition 组织，partition 内部追加写日志文件（<code>log.start.offset</code> 记录消费位点）。不按「每条消息一个文件」，而是<b>顺序追加 + 稀疏索引</b>（每 4096 字节建一个 index 稀疏索引，定位时二分查找 + 顺序读），因此吞吐极高。<br><b>流程</b>：producer → <b>acks</b>（0 不等 / 1 等 leader 落盘 / -1/all 等所有 ISR 落盘）→ leader 写日志 → 异步复制到 follower → <b>ISR</b>（in-sync replicas）机制。<br><b>高可用</b>：acks=all + min.insync.replicas=2（至少 2 个副本同步才 ack），配合 Controller 监控 ISR，落后太多的 follower 被踢出 ISR。<br><b>特点</b>：高吞吐、高可靠、弱顺序（只保证 partition 内有序）、不支持海量 topic（ZooKeeper 模式下元数据压力大，KRaft 模式已改善）。' },
    { q: 'Kafka 怎么保证消息不丢？', a: '<b>三段都要防</b>：<br>① <b>Producer 端</b>：<code>acks=all</code> + <code>retries>0</code>；如果业务要求不丢，还要加 <b>事务或幂等生产</b>（enable.idempotence=true）<br>② <b>Broker 端</b>：<code>min.insync.replicas >= 2</code> + <b>禁用自动创建 topic</b> 的情况下手动建副本；单副本 + 宕机必丢<br>③ <b>Consumer 端</b>：<b>先落库再提交 offset</b>（手动提交），但这样可能重复消费 → 必须业务<b>幂等</b>。<br>反问"完全避免重复"是不现实的，正确答案是<b>至少一次 + 幂等 = 业务上的恰好一次</b>。' },
    { q: 'Kafka 怎么水平扩容？', a: 'partition 是扩容单位。增节点后：① 先加机器 → ② <b>用 kafka-reassign-partitions.sh 把部分 partition 迁移到新机器</b>（分批迁移，避免全量复制导致雪崩）→ ③ 元数据变更通过 Controller 广播给所有 broker。<b>限制</b>：partition 数量只能增不能减；单 partition 的吞吐有上限（受顺序写约束），所以要预估总吞吐 / 单 partition 吞吐来定数量。<b>Consumer 扩容</b>超过 partition 数则多余线程空闲。' },
    { q: '常见 MQ 怎么选？', a: '① <b>Kafka</b>——高吞吐日志/埋点/流式，强顺序按 partition，延迟低（ms），但功能少（无消息过滤、无优先级）<br>② <b>RocketMQ</b>——阿里开源，事务消息、延迟消息、消息过滤、消息回溯，业务功能最全，适合业务消息<br>③ <b>RabbitMQ</b>——AMQP 协议，路由灵活（Exchange 交换机），延迟低，生态好，适合中小规模业务<br>④ <b>Redis Stream</b>——轻量，适合中小规模、有 Redis 基础设施的场景<br>⑤ <b> Pulsar</b>——存算分离、多租户、云原生<br><b>选型维度</b>：吞吐、延迟、功能需求、运维成本、团队技术栈。' },
    { q: '怎么保证消息只消费一次？', a: '<b>做不到严格的"exactly once"（除非用事务且代价极高）</b>。MQ 的语义是 <b>at-least-once</b>。工程上的标准做法：<b>消费端幂等</b>。<br>幂等实现：① 唯一索引（如订单号，重复插入直接失败）② 乐观锁（版本号 / 状态机，只允许 PENDING→DONE）③ 去重表（Redis SETNX + 过期时间）④ 业务天然幂等（<code>SET</code> 而非 <code>INCR</code>，覆盖写）。<br><b>面试答法</b>："我认为不该追求 MQ 的 exactly-once，而应在消费端做幂等，这是更经济可靠的方案。"' }
  ]},

  { t: 'sub', h: 'Elasticsearch', tag: 'SR' },
  { t: 'qa', items: [
    { q: 'ES 和关系型数据库的区别？ES 特性？', a: '① <b>数据模型</b>：ES 是文档（JSON）而非表，<b>倒排索引</b>，适合全文检索；RDB 是 B+ 树，适合精确查询和事务。<br>② <b>写入</b>：ES 先写内存 buffer + translog，近实时（refresh 默认 1s 后可见）；RDB 原地更新。<br>③ <b>事务</b>：ES 无 ACID（单文档操作原子，跨文档不保证）；RDB 强事务。<br>④ <b>关联查询</b>：ES 弱（嵌套文档代价高），RDB 强。<br>⑤ <b>聚合分析</b>：ES 原生支持（terms/bucket），RDB 弱。<br><b>特性</b>：近实时（near real-time）、分布式多分片副本、倒排索引、文档原 JSON、RESTful API。<br><b>结论</b>：ES 做<b>检索和分析</b>，RDB 做<b>数据源和事务</b>，双写最终一致。' },
    { q: 'ES 去重算法为什么有误差？', a: 'ES 的去重是<b>近似</b>，因为要兼顾性能和内存。<br><b>机制</b>：如果字段配置了 <code>keyword</code>，ES 会为每个唯一值维护一个小的 <b>global ordinal</b> 映射（把字符串映射成小整数，省内存），用 <b>HyperLogLog++</b>（HLL）做基数估算，精度约 ±0.5%~1%。<br><b>误差来源</b>：① HLL 本身就是概率算法，<b>基数越大误差越大</b>；② <code>cardinality</code> 聚合基于每个分片的局部 HLL 再合并，合并误差累加；③ 分片数变化时精度下降。<br><b>要精确</b>：<code>cardinality_precision</code> 参数调到 4000（内存换精度），或直接用 <code>Composite Aggregation</code> 分页遍历（精确但要多次请求）。' },
    { q: '倒排索引怎么工作？', a: '以「猫」为例：<b>字典（term dictionary）</b>存所有词 → 拿到 posting list <code>[doc1, doc3, doc9]</code> → <b>跳表（skip list）或倒排索引帧</b>做快速定位。<b>关键设计</b>：① 倒排索引是不可变的（更新 = 删除 + 新增）② 段（segment）不可变，周期性 merge 成大段，merge 时清除已删除文档标记 ③ <b>doc_values</b> 单独存储字段值用于排序聚合（不走倒排）④ <b>index：index</b> 跳过不可能命中的 term。<br>写入流程：<b>分词 → 倒排 → 写入 Lucene segment（内存）→ refresh 到 filesystem cache（可见）→ merge → flush 到 translog/disk</b>。' }
  ]}
  ]
},

/* ======================= 12 ======================= */
{
  no: '12', id: 'c12', title: '系统设计', sub: '题库 10 次系统设计题。这是三面的主战场——考的是你能不能把前面所有知识串起来。',
  meta: [['块数', '8'], ['问答题', '10'], ['设计', '5']],
  blocks: [

  { t: 'lead', html: '系统设计题的评分不在于你给的多完美，而在于<b>你能不能主动澄清需求、逐步演进、说出每个方案的取舍</b>。面试官看的是<b>思考过程</b>。' },

  { t: 'sub', h: '答题框架', tag: 'METHOD' },
  { t: 'code', fn: '系统设计答题四步法', code:
`// 面试官问"设计一个秒杀系统"，标准节奏（30~45 分钟）：

【第 1 步 · 澄清需求】2~3 分钟，不写代码
  · 规模多少？  预计 QPS？ 读写比例？
  · 库存多少？ 是否允许超卖？ 一人一单还是可重复？
  · 活动是否可预热？ 是否需要实时统计？
  ❗ 不问就开写 = 送分丢分。题库里有面试官明确说
     "没有给背景，给了一些条件，要求 qps 怼到 20000，瓶颈在哪，
      怎么优化，如何保持一致性" —— 就是在考你会不会问。

【第 2 步 · 画图 & 定指标】5 分钟
  · 画出部署拓扑：客户端 → 网关 → 应用集群 → 缓存 → DB → MQ
  · 算出量级：100w 库存 / 10w QPS → 需要几台机器？
  · 定 SLA：P99 < 200ms，可用性 99.9%

【第 3 步 · 逐层演进】20 分钟
  每一层都先说"最朴素的怎么做"，再说"问题是什么"，再说"怎么优化"
  不要一上来就说最复杂的方案，面试官会觉得你没想清楚

【第 4 步 · 主动提取舍】5~10 分钟
  · 这个方案牺牲了什么？
  · 如果流量再涨 10 倍，哪里先崩？
  · 如果某个依赖挂了怎么兜底？
  ❗ 主动说缺点 = 加分。面试官最反感"我这个方案很完美"

// 面试官会追问的通用问题：
//   如果你的服务要重启，正在跑的请求怎么办？
//   缓存挂了怎么办？DB 挂了怎么办？
//   你的方案怎么保证不超卖/不重复？` },

  { t: 'sub', h: '高频设计题', tag: 'DESIGN' },
  { t: 'qa', items: [
    { q: '设计一个秒杀系统，QPS 10w', a: '<b>五层架构</b>：<br>① <b>前端</b>：按钮置灰 + 倒计时 + 验证码（打散到达峰值）<br>② <b>网关</b>：限流（令牌桶，只放行每秒 10w）、黑名单<br>③ <b>应用层</b>：<b>库存扣减走 Redis 原子操作</b>（Lua 脚本 `DECR` + 判断），扣减成功才发消息；<b>关键：用户是否已购用 Redis Set 记录</b><br>④ <b>MQ</b>：削峰，订单异步落库<br>⑤ <b>数据层</b>：MySQL 用<b>乐观锁</b>（`UPDATE ... SET stock=stock-1 WHERE stock>0`）作为最终兜底，或库存分段（1000 库存拆成 10 段各 100，随机选段扣减，冲突概率降到 1/10）<br><b>防超卖三道锁</b>：前端置灰（体验）→ Redis 原子扣减（性能）→ DB 条件更新（正确性）。<br><b>防重复下单</b>：用户 ID + 活动 ID 作为唯一索引。<br><b>必答的取舍</b>："Redis 扣减成功但 MQ 消息丢了怎么办？"→ 用本地消息表/事务消息保证最终落库；"DB 压力过大？"→ 读写分离、分库分表（活动 ID 取模）。' },
    { q: '100 万流量如何在 100 台机器上做总��限流？', a: '见本章限流图解。<b>核心矛盾</b>：单机限流只是二次保护，总量必须集中控制。<b>三级方案</b>：① 单机令牌桶（本地桶，按 Redis 下发的额度再限一层，减少 Redis 调用）② <b>Redis 集中发令牌</b>（Lua 原子性保证不超发）③ <b>按存活实例数动态均分</b>（注册中心维护 N，每台取 total/N，挂了自动回收）。<br><b>主动说缺点</b>：Redis 成为热点 → ① 一次借一批（比如 1 秒的量）降低 QPS 到 1w ② Redis Cluster 分片 ③ 超卖兜底：允许一定超发（令牌桶可以配成"借不到就快速失败"）。' },
    { q: '设计 IM 的群聊：如何实现"x 人已读、y 人未读"？', a: '<b>数据模型</b>：<br>① <b>消息表</b>：`message(id, group_id, sender_id, content, seq, create_time)`，<code>seq</code> 是<b>群内单调递增序列号</b>（用雪花 ID 或数据库序列，按 group_id 分段），客户端按 seq 断点续传<br>② <b>成员表</b>：`group_member(group_id, user_id, last_read_seq, joined_at)`<br>③ <b>已读统计</b>：<b>不存"已读列表"</b>（M 人 × N 消息爆炸）。改为存 <code>last_read_seq</code>：<br>   · <b>未读数</b> = <code>当前最大 seq - last_read_seq</code>（Redis 缓存）<br>   · <b>已读人数</b> = <code>COUNT(members WHERE last_read_seq >= seq)</code><br>   · <b>谁已读</b> = 按 seq 查询 `last_read_seq >= seq` 的成员<br><b>关键</b>：seq 天然支持"只拉增量"（客户端记 last_seq，请求时带上来），也支持多端同步。<br><b>扩展</b>：群成员上万时，统计人数用 Redis 计数器（成员变更时维护）或位图（bitmap 按 user_id 位），避免 DB count。<br><b>已读回执</b>：大群不做逐条回执（消息风暴），只回"xxx 读了第 N 条"（合并）。' },
    { q: '设计微信朋友圈：一条朋友圈要支持多少赞和评论？', a: '<b>核心难点：粉丝数无上限但要控制查询成本。</b><br><b>分层设计</b>：<br>① <b>存储</b>：粉丝列表存 <b>Bitmap 或 RoaringBitmap</b>（1 亿粉丝 = 12MB 压缩位图），读取时一次 IO<br>② <b>分表</b>：消息表按 <code>user_id</code> 哈希分 64 张表；<b>互动表（点赞/评论）单独分表</b>，与消息解耦<br>③ <b>拉取 vs 推送</b>：<b>拉模式</b>（进朋友圈时查一次）简单，<b>推模式</b>（发布时给粉丝发通知）实时但写扩散严重 → 采用<b>混合</b>：大 V 发布走推（写扩散可控），普通用户走拉<br>④ <b>Feed 流</b>：优先从 <b>离线库</b>读（用户提前拉取关注人的动态存本地），在线时合并请求期间的增量（拉模式 + 小推送）<br>⑤ <b>性能优化</b>：合并多次查询为一次批量；分页用游标（记录最后一条的 time+id）而非 offset。<br><b>加分点</b>：说出"如果粉丝数到千万级，位图也不够用怎么办" → 分层存储热点粉丝、普通粉丝降级。' },
    { q: '设计一个抽奖系统（题库多次出现）', a: '<b>四步</b>：<b>资格校验 → 权重随机 → 扣减库存 → 结果落库</b>。<br>① <b>资格</b>：Redis Set 判断是否已参与（SISMEMBER，天然去重）<br>② <b>权重</b>：<b>关键难点</b>。不能用 <code>Random.nextInt()</code> 直接算——要做<b>累计概率区间</b>：把权重累加成一个数组，随机落在 [0, total) 上，二分查找落在哪个区间。数学期望正确，<b>避免"概率是概率但实际奖品被抽空"</b>的问题<br>③ <b>库存</b>：Redis 原子扣减（Lua），扣不到则回滚资格<br>④ <b>落库</b>：MQ 异步写中奖记录<br><b>公平性保证</b>：① 幂等（用户 ID 唯一）② 库存不能超发（Redis DECR + 监控库存偏差）③ <b>可复现</b>——用 <code>hash(userId + activityId + secret)</code> 生成确定性随机数，获奖后能验证没作弊。<b>加分点</b>：主动说"如果要做抽奖公示，需要第三方可验证的随机源"。' },
    { q: '设计一个排行榜，QPS 十万怎么解决？', a: '<b>首选 Redis ZSet</b>：<code>ZADD key score member</code>，<code>ZREVRANGE key 0 99 WITHSCORES</code> 取 Top N，<code>ZREVRANK</code> 查排名，<b>O(log n)</b>。<br><b>QPS 10w 的优化</b>：<br>① <b>写合并</b>——用户分数变化不立即写，攒到内存队列按批（1000 条/100ms）合并，减少 Redis 写<br>② <b>读缓存</b>——Top 榜本身变化慢，缓存结果 1~10s；但"我的排名"要实时算（<code>ZCOUNT</code> 二分）<br>③ <b>分片</b>——单个 ZSet 元素过多时按时间窗口分片（如日榜/周榜/月榜）<br>④ <b>大 V 场景</b>——如果只看头部，<b>只维护 Top 1000</b>（Redis ZSet 定期裁剪），实时算完再更新<br><b>替代方案</b>：榜单规模大（千万级）且要求强实时 → <b>MySQL + 排序字段索引</b>或专门的有序集合引擎（Twitter 的 <b>Raindrop / RankedSet</b>）。<b>加分点</b>：提到"榜单要防作弊"——异常高分需要风控规则过滤。' },
    { q: '设计"主动断开长连接：20 秒无数据响应"（题库原题）', a: '<b>三种实现</b>：<br>① <b>Netty 的 IdleStateHandler</b>（推荐）——<code>readerIdleTime</code> 读空闲 / <code>writerIdleTime</code> 写空闲 / <code>allIdleTime</code> 全部空闲，超时触发 <code>IdleStateEvent</code>，直接关 channel。<b>零成本</b>：内部有定时任务只维护"最小空闲时间"的那条连接，不会 O(n) 扫描。<br>② <b>ScheduledExecutor + 时间戳</b>——每个连接记 <code>lastActiveTime</code>，定时任务批量扫描（<b>用时间轮 / DelayQueue 避免 O(n)</b>），超时关闭。<br>③ <b>借助 Redis / 心跳表</b>——多实例部署时，每个实例定期上报心跳到 Redis，某个实例负责检查自己名下连接的超时。<br><b>注意</b>：TCP keepalive 默认 2 小时太长且不看业务状态，要设 <code>SO_KEEPALIVE</code> + 应用层心跳。<br><b>加分点</b>：主动说"关闭时要先发一个 FIN 让客户端优雅下线，直接 RST 会让客户端报错"。' },
    { q: '怎么设计消息推送保证送达？', a: '<b>推送的本质是"至少一次送达 + 幂等去重"。</b><br>① <b>离线消息先落库</b>（用户消息表，status=0），保证不丢——这是根本，APNs/FCM 只是投递通道<br>② <b>三段保证</b>：<b>生产可靠</b>（MQ 事务消息/本地消息表）→ <b>存储可靠</b>（落库 + 主从）→ <b>投递可靠</b>（推送失败重试，指数退避）<br>③ <b>推送策略</b>：<b>延迟推送</b>（用户不在线 → 合并攒批，避免 100 条消息发 100 次推送）<br>④ <b>幂等</b>：客户端按 message_id 去重<br>⑤ <b>降级</b>：APNs/FCM 不可用时（尤其墙内）→ 降级为<b>轮询</b>或长连接自建推送<br><b>加分点</b>：提到 iOS 的 <b>APNs 不可靠</b>（系统可能丢弃，且只有 iOS 10+ 支持富媒体推送），所以必须"以落库为准，推送只是加速手段"。' },
    { q: '服务部署结构？资源怎么分配？', a: '<b>部署</b>：<b>物理机 / 虚拟机（云 ECS）</b>、<b>容器化（K8s）</b>、<b>Serverless</b>。<br><b>K8s 的核心价值</b>：自愈（探针 + 副本）、弹性（HPA）、发布（滚动更新 + 灰度）、服务发现（自动 DNS + Endpoints）。<br><b>资源配置</b>：<b>CPU</b>（Java 服务经验值：核数 = 核数 + 1，压测定）、<b>内存</b>（<code>-Xmx</code> = 容器 limit 的 70%，留出 Metaspace + 线程栈 + 直接内存），<b>关键约束</b>：<code>HeapDumpOnOutOfMemoryError</code> + <code>-XX:+HeapDumpPath=/data/dump</code>（dump 目录要挂盘）。<br><b>指标</b>：<b>request</b>（调度依据）vs <b>limit</b>（限制）；Java 进程要 <code>-XX:MaxRAMPercentage=70</code> 而非固定 XMX（适配不同规格的 Pod）。<br><b>加分点</b>：主动说"容器内跑 JVM 的三个坑"——<b>① 堆感知 cgroup 内存；② CPU limit 造成线程抖动（超时被 throttle）；③ 健康检查不能用 JVM 堆接口，会被假死拖垮</b>。' }
  ]}
  ]
}

];
