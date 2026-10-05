/* ============================================================
   MySQL / Redis 深化 —— 对应题库 52 + 33 次
   ============================================================ */
window.DEEP = [
{
  no: '07', id: 'c7', title: 'MySQL 与 Redis', sub: '题库最高频：MySQL 52 次、Redis 33 次。这一章的深度直接决定面试的第一印象。',
  meta: [['块数', '12'], ['问答题', '26'], ['频次', '★★★★★']],
  blocks: [
  { t: 'lead', html: '题库里 MySQL 出现 <b>52 次</b>，是所有考点里最高的。而且问法很一致：<b>「索引为什么这么设计」「事务怎么实现」「怎么优化」</b>——考的是设计取舍，不是 API 熟练度。' },

  { t: 'sub', h: '索引原理', tag: '★★★★★' },
  { t: 'table',
    caption: '索引类型速查',
    head: ['类型', '叶子节点存什么', '特点'],
    rows: [
      ['<b>聚簇索引</b>', '整行数据', 'InnoDB 独有；一张表<b>只有一个</b>；决定了行的物理顺序'],
      ['<b>二级索引</b>', '索引列 + 主键值', '要<b>回表</b>；叶子不存行数据所以更小'],
      ['联合索引', '按最左前缀有序', '<b>最左前缀</b>规则；覆盖索引可免回表'],
      ['主键索引', '整行数据', '默认用主键做聚簇索引'],
      ['唯一索引', '索引列 + 主键', '保证唯一；可作二级索引'],
      ['前缀索引', '前 N 个字符', '只索引部分值；不能排序和覆盖'],
      ['全文索引', '倒排索引', 'MySQL 8.0.6+ 内置；复杂场景仍建议 ES']
    ]},
  { t: 'qa', items: [
    { q: '为什么 MySQL 一定建议有主键？用自增还是 UUID？', a: '<b>InnoDB 没有主键会怎样</b>：① 选第一个非空唯一索引 ② 都没有则用<b>隐藏的 6 字节 row_id</b>。<b>问题</b>：row_id 是随机生成的，每次插入都要随机写页，还会写溢出页，<b>页分裂严重、聚簇索引顺序与插入顺序无关</b>，导致写放大。<br><b>自增 ID</b>：顺序插入，页分裂最少（永远往尾部追加），B+ 树结构更紧凑，<b>空间利用率高、范围查询友好</b>。<br><b>UUID</b>：① 36 字符太长，索引体积翻倍；② <b>无序 → 随机 IO → 页分裂 → 性能下降</b>；③ B+ 树相邻 key 逻辑相邻但物理分散，范围查询全失效。<br><b>折中</b>：<b>有序 UUID</b>（时间在前 + 随机在后，如 MySQL 8.0 的 <code>UUID_TO_BIN(uuid, 1)</code>）或雪花 ID（有趋势递增，分布式友好）。' },
    { q: '聚簇索引和二级索引的区别？为什么二级索引要回表？', a: '<b>聚簇索引</b>：叶子节点存<b>完整行数据</b>，一个表只有一个。物理上按主键顺序存储 → 范围查询极快。<br><b>二级索引</b>：叶子节点存<b>索引列 + 主键值</b>，不是行数据。<b>回表</b>就是拿着主键再去聚簇索引查完整行。<br><b>为什么要这么设计</b>：如果二级索引也存完整行，每建一个索引就要复制全表数据，空间爆炸。存主键则索引体积最小。<br><b>如何避免回表</b>：<b>覆盖索引</b>——把查询需要的列都放进联合索引，查完直接返回不回表。<br><b>面试加分</b>：说清”回表是随机 IO，一次回表约一次磁盘随机读，所以要尽量避免”，并给出优化手段（覆盖索引、延迟关联）。' },
    { q: '为什么用 B+ 树？不用 B 树、平衡二叉树、红黑树？', a: '<b>为什么不用 B 树</b>：B 树的数据存在非叶节点上，<b>无法做到只有叶子节点形成范围链表</b>，范围查询要中序遍历多次。 B+ 树非叶只存索引 → <b>单页能放更多键 → 树更矮</b>（3~4 层存千万级）→ IO 次数少。<br><b>为什么不用红黑树/平衡二叉树</b>：这类树是二叉的，<b>1000 万数据需要 24 层</b>，每次查询 24 次磁盘 IO，完全不可用。B+ 树是多路平衡，层数极少。<br><b>B+ 树三个优势</b>：① 非叶只存索引，单页容纳更多键，树更矮 ② 叶子节点用链表串联，<b>范围查询天然高效</b> ③ 叶子节点即数据（非叶也指向叶子），查询路径长度恒定。<br><b>加分</b>：能说出”3~4 层是因为 16KB/4KB 页 ÷ 每个键长度 ≈ 上千个键”这个估算过程。' },
    { q: '最左前缀原则？为什么 IN 不影响？', a: '<b>原理</b>：联合索引 <code>(a,b,c)</code> 是按 a→b→c 的顺序<b>排序存储</b>的，物理上 a 相同才能排 b，b 相同才能排 c。<b>范围查询会中断后续列的排序可用性</b>（因为范围内无法确定顺序）。<br><b>IN 为什么不影响</b>：<code>IN (1,2,3)</code> 是<b>等值查询</b>，不是范围。优化器会把多个 IN 值<b>排序后做多次「等值」查找</b>（本质是 range 优化成多个 point），b 的有序性仍然可用。实际上 MySQL 8.0 对 IN 做了 range→equality 的优化，<code>explain</code> 仍显示 range。<br><b>顺序建议</b>：区分度高的列放最左（如身份证 > 性别），等值在前范围在后。' },
    { q: '索引失效的场景有哪些？', a: '① <b>最左前缀不匹配</b>（a,b,c 索引查 b）② <b>范围查询中断</b>（a>1 后 b,c 失效）③ <b>函数/运算包裹字段</b>（<code>WHERE YEAR(create_time)=2024</code>）④ <b>隐式类型转换</b>（varchar 列传数字）⑤ <b>前导通配符</b>（<code>LIKE ‘%abc’</code>，后置可以）⑥ <b>OR 连接无索引列</b>（改成 UNION 更快）⑦ <b>不等于 / NOT IN / IS NOT NULL</b>（不完全失效，但选择性差时不走）⑧ <b>优化器判断全表扫描更快</b>（小表）。<br><b>加分</b>：主动提「5 和 6 是最容易踩的」，并给出优化（改写 SQL、用函数索引、UNION 替代 OR）。' },
    { q: 'explain 重点看哪几列？', a: '<b>type</b>（访问类型，从差到好：ALL 全表扫 < index 全索引扫 < range < ref < eq_ref < const）—— <b>目标是 ref 及以上</b>。<br><b>key</b>：实际使用的索引。若为 NULL 说明没用上。<br><b>key_len</b>：使用了索引的前几个字段，<b>可以算实际用了联合索引的哪几列</b>。<br><b>rows</b>：预估扫描行数。<br><b>Extra</b>：<code>Using filesort</code>（额外排序，要优化）、<code>Using temporary</code>（用临时表，大坑）、<code>Using index</code>（覆盖索引，好）、<code>Using where</code>（Server 层过滤）。' },
    { q: '怎么分析优化慢查询？', a: '<b>四步</b>：<br>① <b>开启慢查询日志</b>：<code>slow_query_log=ON</code> + <code>long_query_time=0.1</code><br>② <b>explain 分析</b>：看 type / key / rows / Extra<br>③ <b>用 profiling 或索引优化</b>：加合适的索引、改写 SQL（<code>SELECT *</code> → 只查需要的列，避免 <code>OR</code>）<br>④ <b>验证</b>：改完再 explain 一次对比。<br><b>大表加索引的坑</b>：<code>ALTER TABLE</code> 会锁表（用 <code>pt-online-schema-change</code> 或 <code>gh-ost</code> 在线改表）；加索引前用 <code>sys.schema_unused_indexes</code> 看有没有冗余索引。<br><b>加分</b>：提到 <code>INVISIBLE INDEX</code>（MySQL 8.0 可以把索引设为不可见做灰度验证）。' }
  ]},

  { t: 'sub', h: '事务与锁', tag: '★★★★★' },
  { t: 'table',
    caption: '四个隔离级别 —— 必背，注意「幻读」和「不可重复读」的区别',
    head: ['级别', '脏读', '不可重复读', '幻读', '实现机制'],
    rows: [
      ['读未提交 RU', '✗ 会', '✗ 会', '✗ 会', '直接读最新数据，无锁'],
      ['读已提交 RC', '✓ 不会', '✗ 会', '✗ 会', '每条 SQL 单独创建 ReadView'],
      ['<b>可重复读 RR</b>', '✓ 不会', '✓ 不会', '<b>部分避免</b>', '事务内共用一个 ReadView'],
      ['串行化', '✓ 不会', '✓ 不会', '✓ 不会', '所有读加共享锁']
    ]},
  { t: 'qa', items: [
    { q: 'MVCC 原理？出现在什么级别？', a: '<b>RR 和 RC</b>。<br><b>三个核心组件</b>：<br>① <b>隐藏列</b>：每行有 <code>DB_TRX_ID</code>（最后修改的事务 ID）+ <code>DB_ROLL_PTR</code>（回滚指针，指向 undo log）<br>② <b>undo log 版本链</b>：每次更新生成新版本，指针串成链表<br>③ <b>ReadView</b>：记录 <code>m_ids</code>（活跃事务）、<code>min_trx_id</code>、<code>max_trx_id</code>、<code>creator_trx_id</code>。<br><b>可见性判断</b>：对当前行的事务 ID，<b>小于 min → 可见</b>；<b>大于 max → 不可见</b>；<b>落在 [min, max) → 看是否在 m_ids 中</b>（在说明活跃，不可见；不在说明已提交，可见）；<b>等于 creator → 可见（自己改的）</b>。<br><b>RC vs RR 的差别只在于 ReadView 创建时机</b>：RC 每条 SQL 都创建新的，RR 只在事务第一次读时创建一次。' },
    { q: 'RR 级别怎么解决幻读？', a: '<b>注意：快照读本身不解决幻读</b>。RR 下的<b>快照读</b>（普通 SELECT）看不到新插入的行；能看到的只有<b>当前读</b>（<code>SELECT ... FOR UPDATE</code> / <code>LOCK IN SHARE MODE</code> / <code>UPDATE</code> / <code>DELETE</code>）。<br><b>当前读靠间隙锁（Gap Lock）阻止插入</b>：InnoDB 在 RR 下用<b>临键锁（Next-Key Lock）= 记录锁 + 间隙锁</b>，锁住记录之间的间隙，让新行插不进去。<br><b>间隙锁特点</b>：<b>间隙之间不冲突</b>（两个事务可以同时持有不同间隙的锁），只有插入时才会冲突。所以间隙锁主要用于<b>防幻读</b>，防重复读靠 MVCC。<br><b>死锁来源</b>：两个事务按不同顺序锁相同的两行。避免：<b>统一加锁顺序</b>、缩短事务、减少锁范围。<code>SHOW ENGINE INNODB STATUS</code> 看最近一次死锁。' },
    { q: 'InnoDB 的锁有哪些？', a: '<b>按粒度</b>：<br>· <b>表级锁</b>：表锁（显式 LOCK TABLES）、意向锁（IS/IX，事务锁表级、只需锁行级、只需表意向）。意向锁的作用是<b>让「要加表锁」和「要加行锁」不冲突</b>——加表锁前先查有没有意向锁。<br>· <b>行级锁</b>：<code>Record Lock</code>（锁索引行）、<code>Gap Lock</code>（锁间隙）、<code>Next-Key Lock</code>（前两者组合，默认）、<code>Insert Intention Lock</code>（INSERT 时的意向间隙锁）。<br><b>关键点</b>：<b>行锁锁的是「索引」，不是「数据行」</b>。如果 WHERE 条件没走索引，会<b>锁全表所有行</b>（这是很多生产事故的根源）。<br><b>共享锁 / 排他锁</b>：读加 S 锁，写加 X 锁，S 与 X 不兼容。' },
    { q: '事务的 ACID 怎么实现的？', a: '<b>A 原子性</b> → <b>undo log</b>（记录反向操作，失败时回滚）<br><b>C 一致性</b> → 是前三者的最终结果，由应用层保证<br><b>I 隔离性</b> → <b>MVCC（读）+ 锁（写）</b>；RR/RC 靠 ReadView，串行化靠加锁<br><b>D 持久性</b> → <b>redo log + WAL（Write-Ahead Logging）</b><br><b>★ 重点讲 redo log</b>：物理日志，记录「某页做了什么修改」。MySQL 更新内存页后<b>不立即刷盘</b>，而是先写 redo log（顺序写，快），由后台线程按 checkpoint 慢慢刷数据页。<b>崩溃恢复</b>：启动时用 redo log 重放，把已提交但未刷盘的改动补上。<br><b>对比 binlog</b>：redo log 是<b>物理</b>日志、<b>循环写</b>（写满覆盖）、只属于 InnoDB；binlog 是<b>逻辑</b>日志、<b>追加写</b>、属于 Server 层（主从复制用）。<b>两阶段提交</b>：为了保证 redo log 和 binlog 一致，先写 redo（prepare）→ 写 binlog → 提交 redo。' },
    { q: '主从复制原理？主从延迟怎么解决？', a: '<b>原理（三步）</b>：① 主库把变更写 binlog（<b>用 GTID 或 File+Position 标记位点</b>）② 从库 IO 线程读 binlog 存到 <b>relay log</b> ③ SQL 线程重放 relay log。<br><b>延迟原因</b>：单线程重放、从库并行度不够、大事务、DDL 阻塞、从库硬件差。<br><b>解决</b>：① <b>从库并行复制</b>（MySQL 5.6 单线程 → 5.7 <code>LOGICAL_CLOCK</code> → 8.0 <code>WRITESET</code>）② <b>延迟位点监控</b>（<code>Seconds_Behind_Master</code> 不准，要看 <code>pt-heartbeat</code> 的表）③ <b>读写分离做降级</b>（延迟 > 阈值就禁写或走主库）④ <b>大事务拆分</b>⑤ <b>从库硬件加强</b>。<br><b>面试要点</b>：能说出”读写分离后，刚写完立刻读可能读到旧数据”→ 解法是<b>强制读主库</b>或<b>延迟时间后读从库</b>。' },
    { q: '存储引擎有哪些？区别？', a: '<b>InnoDB</b>（默认）：行级锁、事务、MVCC、外键、聚簇索引、崩溃恢复（redo log）。<br><b>MyISAM</b>：表级锁、无事务、全表扫描计数快、有表级缓存。<br><b>Memory</b>：内存表，重启丢失，仅支持等值查询和全表扫描。<br><b>CSV/Archive</b>：特殊用途。<br><b>加分</b>：提到 MySQL 8.0 默认字符集改 utf8mb4、默认排序规则改 <code>utf8mb4_0900_ai_ci</code>；以及 <b>InnoDB 的 <code>innodb_flush_log_at_trx_commit</code></b> 三个取值对持久性的影响（1=每次提交都写盘最安全，0=每秒，2=OS 缓存每秒）。' },
    { q: '一条 SQL 从执行到返回经历了什么？', a: '① <b>连接器</b>：认证、鉴权，<code>wait_timeout</code> 控制空闲断开<br>② <b>分析器</b>：词法/语法分析，检查语义<br>③ <b>优化器</b>：<b>选索引、决定执行顺序</b>（如 5.6 引入 CBO，用统计信息估算代价）<br>④ <b>执行器</b>：调存储引擎接口，走 MVCC 或锁读数据<br>⑤ <b>存储引擎</b>：InnoDB 从 Buffer Pool 读，不在就读 Buffer Pool→OS Cache→磁盘（<b>三段</b>）<br>⑥ 返回。<br><b>加分</b>：提到<b>查询缓存</b>（8.0 已移除）、<b>Buffer Pool</b> 是 InnoDB 的核心（默认 128M，<code>innodb_buffer_pool_size</code>）。' }
  ]},

  { t: 'sub', h: 'Redis 原理', tag: '★★★★★' },
  { t: 'code', fn: 'Redis 核心问答.java', code:
`// Redis 五大数据结构（底层实现，题库高频）
// String  → SDS      简单字符串/计数器/分布式锁值。最大 512MB
// Hash    → listpack(小) / hashtable(大)   对象字段、购物车
// List    → quicklist = ziplist 的链表化   消息队列、时间轴
// Set     → intset(小整数) / hashtable      去重、共同好友、抽奖
// ZSet    → skiplist + hashtable            排行榜、延时队列

// ★ 为什么 ZSet 用跳表而不是红黑树？（题库出现 3 次）
// 答：
//  1. 范围查询效率高 —— 跳表底层是有序链表，range 操作直接遍历
//  2. 实现简单 —— 插入删除只调整局部指针，红黑树要维护复杂的旋转和变色
//  3. 内存可通过 zset-max-listpack-entries 优化小对象
//  4. 跳表是可调整的（level 随机决定），并发友好
//  5. 支持 ziplist/listpack 编码 —— 数据量小时用连续内存，极其省内存

// ★ Redis 为什么单线程还这么快？（题库出现 2 次）
//  1. 纯内存操作 —— 无磁盘 IO
//  2. 单线程执行命令 —— 无锁、无上下文切换、无竞态
//  3. IO 多路复用（epoll）—— 可处理 10 万+ 连接
//  4. 高效的数据结构 —— 哈希表/跳表/ziplist 都是为内存优化过的
//  5. 瓶颈在网络和内存带宽，不在 CPU
// 注意：Redis 6.0 后 IO 线程化了（多线程处理网络读写），但命令执行仍是单线程

// ★ 内存淘汰策略（题库问“有哪些”）
//  8 种：noeviction（默认报错）
//       allkeys-lru / allkeys-lfu / allkeys-random
//       volatile-lru / volatile-lfu / volatile-random / volatile-ttl
//  LRU vs LFU：LRU 淘汰最久未用的；LFU 淘汰访问频率最低的
//             LFU 对热点更友好（LFU + LRU 混合算法，Redis 4.0+ 的 allkeys-lfu）
// 推荐：allkeys-lru 或 allkeys-lfu` },

  { t: 'qa', items: [
    { q: 'Redis 持久化 RDB 和 AOF 有什么区别？AOF 太大怎么优化？', a: '<b>RDB</b>：<b>快照</b>，默认保存「最近一次快照之后被修改过的数据」的全量副本。优点：文件小、恢复快。缺点：<b>两次快照之间的数据会丢</b>；保存时 fork 子进程<b>会阻塞（COW 写时复制，大数据量可能导致 OOM）</b>。<br><b>AOF</b>：<b>追加日志</b>，记录每条写命令（实际是协议格式）。优点：数据完整性最好（<code>appendfsync always</code> 每次都刷盘 = 不丢数据）。缺点：文件大、恢复慢、<b>追加写会降低性能</b>。<br><b>AOF 重写（BGREWRITEAOF）</b>：因为 AOF 是命令追加，会把 <code>SET a 1</code> 重复 1000 次记录 1000 条。重写是用当前内存数据<b>重新生成一份最小 AOF</b>，只保留最终状态。<br><b>AOF 太大怎么优化</b>：<b>① 开启 AOF 重写</b>（默认开启，<code>auto-aof-rewrite-min-size 64mb</code> + <code>auto-aof-rewrite-percentage 100</code> 触发阈值）<b>② 用 appendfsync everysec</b> 折中（丢失最多 1 秒）<b>③ 混合持久化</b>（RDB + AOF，Redis 4.0+，重写时前半 RDB 后半 AOF，恢复快且体积小）<b>④ 归档到对象存储</b>（大内存实例常用）。' },
    { q: 'Redis 过期删除策略？内存满了怎么淘汰？', a: '<b>三种过期删除策略</b>（不是三选一，是同时用）：<br>① <b>惰性删除</b>——访问时发现已过期就删。<b>缺点</b>：不访问的 key 永远占内存<br>② <b>定期删除</b>——每 100ms 抽样 20 个 key，删掉过期的。属于<b>折中方案</b><br>③ <b>主从异步删除</b>——从库读到过期 key 直接删（避免主库已删从库还在导致读到脏数据）<br><b>补充</b>：已过期的 key 内存<b>不会立即释放</b>，但<b>可以被读取到时返回 nil</b>。<br><b>内存淘汰</b>：见上表 8 种策略，触发条件是 <code>maxmemory</code> 达到上限。<br><b>常见生产配置</b>：<code>maxmemory-policy allkeys-lru</code>，但要注意<b>如果实例是纯缓存用，可以被淘汰；如果存了数据（队列/锁），淘汰会导致数据丢失</b>。' },
    { q: 'Redis Cluster 架构？有多少个 slot？master-slave 怎么选主？', a: '<b>数据分片</b>：<b>16384 个 hash slot</b>，每个 master 负责一部分。key 的 slot = <code>CRC16(key) mod 16384</code>。<b>为什么是 16384 而不是 65536</b>：① 客户端要提前知道所有节点映射，bitmap 越大传输越慢 ② 大集群下 slot 稀疏时 bit 的利用率低 ③ 单个 master 承载的 slot 数量不宜过多（16384/节点数合理）。<br><b>高可用</b>：每个 master 配 N 个 slave，<b>slave 只读</b>。master 故障时，集群内其他节点<b>投票选举</b>新的 master（<b>Raft 变体</b>）。<br><b>为什么用 Raft 而不是主从复制</b>：主从复制是异步的，主挂了可能丢数据；Raft 用多数派确认保证一致性。<b>代价</b>：写性能下降（少数派才能写）。<br><b>选主规则</b>：优先选 slave 1（离 master 最近、复制偏移最小），数据最完整。<br><b>通信</b>：<b>gossip 协议</b>（每个节点随机 ping 其他节点）维护状态，16384 个 slot 的归属信息缓存在客户端（Cluster Nodes）。' },
    { q: 'Redis list 的 list 结构？为什么做快速列表？', a: '<b>quicklist = ziplist 的链表化</b>。ziplist 内存紧凑但每次插入删除都要移动后续元素（<b>连锁更新</b>），链表插入快但每个节点有指针开销。<br>quicklist 的折中：<b>每个节点（listpack）里存若干元素</b>，节点之间用链表串起来。这样既享受 ziplist 的内存紧凑，又避免整体搬移。Redis 7.0 引入 <b>listpack</b> 彻底替代 ziplist（ziplist 存在溢出链式更新 bug）。<br><b>配置</b>：<code>list-max-listpack-size</code> 控制每个节点最多存多少元素。<br><b>题库关联</b>：用 list 做消息队列时，<code>LPUSH + BRPOP</code>，但<b>不支持 ack 和重试</b>，所以生产上还是用 Kafka/RocketMQ。' },
    { q: '怎么保证 Redis 和数据库的数据一致性？', a: '<b>没有强一致，只有最终一致。</b>标准方案：<br><b>① Cache Aside（旁路缓存，最常用）</b>：<b>先更新 DB，再删除缓存</b>。<br>为什么是「删」不是「改」：改会有并发写覆盖问题（两个请求分别改了缓存和 DB，顺序不一致导致脏数据）。<br>为什么「先 DB 后缓存」：如果先删缓存再更新 DB，删的瞬间另一个请求会读到旧 DB 并把旧值写回缓存。<br><b>② 延迟双删</b>：更新 DB → 删缓存 → 延迟 500ms 再删一次。解决「并发写 + 删缓存失败」的漏删问题。问题是延迟时间不好定。<br><b>③ 订阅 binlog（Canal / Debezium）</b>：binlog 变更 → MQ → 消费者删缓存。<b>最可靠</b>（不依赖应用代码，重启/异常不会漏），但引入中间件复杂度。<br><b>生产建议</b>：强一致场景用方案③；一般场景用①+缓存 TTL 兜底。<br><b>加分</b>：主动说清”这是 CAP 里的取舍——为了可用性放弃强一致，业务上用幂等兜底”。' },
    { q: '缓存穿透、击穿、雪崩的区别和解决？', a: '<b>穿透</b>：查<b>不存在</b>的 key，每次都打到 DB → <b>布隆过滤器</b>（前置拦截，误判率可调）或<b>缓存空值</b>（设短 TTL，如 60s）。<br><b>击穿</b>：某个<b>热点 key</b> 突然过期，大量请求同时打 DB → <b>互斥锁</b>（只放一个线程去重建，其他等）或<b>逻辑过期</b>（value 里存过期时间，过期后返回旧值 + 后台异步重建）。<br><b>雪崩</b>：<b>大量 key 同时过期</b>或 <b>Redis 宕机</b> → ① <b>过期时间加随机值</b>（避免同一时刻批量失效）② <b>多级缓存</b>（Redis + 本地 Caffeine）③ <b>熔断降级</b>（Redis 挂了返回兜底数据）④ <b>Redis 高可用</b>（主从+哨兵/Cluster）。<br><b>面试要点</b>：这三个<b>触发原因完全不同</b>，能说清区别就是及格。' }
  ]},

  { t: 'sub', h: '大 Key 与热点 Key', tag: '★★★' },
  { t: 'qa', items: [
    { q: '大 Key 有什么危害？热点 Key 怎么解决？', a: '<b>大 Key 危害</b>：① <b>阻塞</b>——单线程，一个大 key 的读/删会卡住其他所有请求 ② <b>网络带宽</b>——一次传输耗时长，拖垮带宽 ③ <b>主从延迟</b>——删除时主从同步流量大，可能触发切换 ④ <b>内存不均</b>。<br><b>解决</b>：① <b>拆分</b>（Hash 按用户分片，list 分段）② <b>UNLINK</b> 异步删除（4.0+）③ <code>SCAN</code> 渐进遍历代替 <code>KEYS</code> ④ 排查用 <code>redis-cli --bigkeys</code> 和 <code>MEMORY USAGE key</code>。<br><b>热点 Key 危害</b>：单实例 CPU 打满（单机 10w QPS 就可能打满）。<br><b>解决</b>：① <b>本地缓存</b>（Caffeine，牺牲一致性换性能）② <b>打散</b>（key 加随机后缀分成 N 份）③ <b>读写分离</b>（主从分流读）④ <b>限流降级</b>。<br><b>加分</b>：主动说出”找到热 key”的方法：<code>redis-cli --hotkeys</code>（依赖 LFU 策略）、APM 监控、客户端埋点。' },
    { q: 'Redis 和 Memcache 的区别？', a: '① <b>数据结构</b>：Redis 5 种，Memcached 只有 String（但可存序列化对象）<br>② <b>持久化</b>：Redis 有 RDB/AOF，Memcached <b>纯内存无持久化</b><br>③ <b>集群</b>：Redis Cluster 原生，Memcached 需要一致性哈希中间件<br>④ <b>线程</b>：Redis 单线程，Memcached 多线程（多核利用更好）<br>⑤ <b>功能</b>：Redis 支持发布订阅、脚本、Lua、地理位置（GEO）、Stream 消息队列；Memcached 更纯粹、<b>内存效率略高</b>（元数据开销更小）、<b>多线程下吞吐更高</b>。<br><b>选型</b>：纯缓存、极高吞吐、内存敏感 → Memcached；需要数据结构、持久化、原子操作 → Redis。' }
  ]}
  ]
}

];
