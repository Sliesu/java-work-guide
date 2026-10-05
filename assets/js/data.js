/* ============================================================
   CONTENT DATA
   块类型: lead / p / list / steps / table / code / note / viz
            case / flips / qa / split / sub
   ============================================================ */
window.DATA = [

/* ======================= 01 ======================= */
{
  no: '01', id: 'c1', title: '语言基础', sub: 'Java 的地基：类型系统、String、equals、异常。这些不复杂，但答错会显得基础不牢。',
  meta: [['块数', '7'], ['问答题', '6'], ['手写', '1']],
  blocks: [

  { t: 'lead', html: 'Java 里 <b>只有一个</b>地方会让你「以为值变了其实没变」——那就是对象与引用的关系。所有基础题都是这一件事的变体。' },

  { t: 'viz', id: 'v-ref', no: 0, title: '引用与值：栈里的变量指向堆里的对象' },

  { t: 'sub', h: '八种基本类型与包装', tag: 'BASIC' },
  { t: 'p', html: 'Java 是<b>强类型静态语言</b>。8 种基本类型（byte/short/int/long/float/double/char/boolean）在栈上存值，其余全部是引用类型。' },
  { t: 'table',
    caption: '基本类型对照表 —— 面试常让你现场写，别记混',
    head: ['类型', '字节', '取值范围', '默认值', '对应包装类', '缓存'],
    rows: [
      ['byte', '1', '-128 ~ 127', '0', 'Byte', '有'],
      ['short', '2', '-32768 ~ 32767', '0', 'Short', '无'],
      ['int', '4', '约 ±21 亿', '0', 'Integer', '有'],
      ['long', '8', '约 ±922 亿亿', '0', 'Long', '无'],
      ['float', '4', '3.4e38', '0.0f', 'Float', '无'],
      ['double', '8', '1.8e308', '0.0d', 'Double', '无'],
      ['char', '2', '0 ~ 65535', "'\u0000'", 'Character', '无'],
      ['boolean', '1', 'true / false', 'false', 'Boolean', '无']
    ]},

  { t: 'note', k: '高频坑', html: '<b>Integer 缓存范围是 -128 ~ 127</b>。所以 <code>Integer a=127,b=127; a==b → true</code>，但 <code>128==128 → false</code>。这个坑在笔试里出现频率极高。' },

  { t: 'code', fn: 'IntergerCacheDemo.java', code:
`Integer a = 127, b = 127;
System.out.println(a == b);          // true   都在缓存里，同一个对象

Integer c = 128, d = 128;
System.out.println(c == d);          // false  都 new 了新对象
System.out.println(c.equals(d));     // true   equals 比的是值

// 缓存来源：Integer.valueOf()
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];  // 复用缓存
    return new Integer(i);
}
// IntegerCache.high 在启动时 -XX:AutoBoxCacheMax=127（默认，上限 127）` },

  { t: 'sub', h: 'String：为什么不可变', tag: 'CORE' },
  { t: 'p', html: 'String 类被 <code>final</code> 修饰，内部 char/byte 数组不暴露，任何「修改」都返回新对象。这带来三个收益：<b>安全</b>（可作为 HashMap key）、<b>缓存友好</b>（常量池复用）、<b>线程安全</b>。' },
  { t: 'code', fn: 'StringDemo.java', code:
`String s1 = "abc";                        // 常量池
String s2 = "abc";
System.out.println(s1 == s2);               // true   同一个池中对象

String s3 = new String("abc");
System.out.println(s1 == s3);               // false  new 出来的
System.out.println(s1.equals(s3));          // true

// 编译期能确定的一律走常量池；运行期拼接才进 StringBuilder
String s4 = "ab" + "c";                      // true  编译期折叠成 "abc"
String s5 = "a" + variable;                 // false 走 StringBuilder

// intern 把运行期字符串塞回常量池
s3.intern();   // 返回常量池里的 "abc" 引用` },

  { t: 'flips', items: [
    { q: 'String 为什么不可变？', a: '类被 <em>final</em> 修饰；内部数组私有且不暴露；所有"修改"方法都 <code>return new String(...)</code>。收益：可做 HashMap key、安全、线程安全。' },
    { q: '== 和 equals 的区别？', a: '<code>==</code> 比<b>引用地址</b>；<code>equals</code> 比<b>内容</b>（Object 里是 == ，子类重写）。Integer 缓存 -128~127 会让 == 出现"看起来反直觉"的结果。' },
    { q: 'Java 参数传递是值还是引用？', a: '<em>都是值传递</em>。引用类型的"值"是那个地址的副本。所以 swap(a,b) 交换形参不会影响实参，list.add 改的是对象内部状态所以会生效。' },
    { q: '重载和重写的区别？', a: '重载：同类、同名、<b>参数列表不同</b>，编译期确定（静态多态）。重写：父子类、<b>方法签名相同</b>，运行期确定（动态多态），访问权限不能更严。' },
    { q: '抽象类和接口怎么选？', a: '接口：<b>能力/规范</b>，可以有多个实现，字段只能是常量（public static final）。抽象类：<b>模板+共性</b>，可以有状态（成员变量），只能单继承。Java8 后接口可以有 default/static 方法。' },
    { q: 'final 有什么用？', a: '修饰类：不可继承。修饰方法：不可重写。修饰变量：<b>只能赋值一次</b>（但对象内部状态仍可改，所以是引用不变而非对象不可变）。' }
  ]},

  { t: 'sub', h: '异常体系', tag: 'CORE' },
  { t: 'p', html: 'Throwable 下面分 <b>Error</b>（JVM 级，OOM / StackOverflow，一般不处理）和 <b>Exception</b>。Exception 又分<b>检查异常</b>（受检，IO 异常，必须 try/catch 或 throws）和<b>运行时异常</b>（非受检，NPE / 越界，编译器不强制）。' },
  { t: 'code', fn: 'ExceptionDemo.java', code:
`try {
    int[] a = {1, 2};
    System.out.println(a[5]);            // ArrayIndexOutOfBoundsException
} catch (NullPointerException e) {      // 顺序：子类在前！
    e.printStackTrace();
} catch (RuntimeException e) {
    // 更宽的兜底
} finally {
    // 一定会执行（除非 JVM 退出）
    // 注意：return 也会先执行 finally，finally 里 return 会覆盖原返回值
}

try-with-resources (Java7+)，自动关闭流，推荐：
try (BufferedReader br = new BufferedReader(new FileReader("f.txt"))) {
    br.readLine();
} catch (IOException e) {
    // br 会被自动 close，即使抛异常
}` },

  { t: 'note', k: '生产经验', html: '华为这边对代码规范比较看重。实际项目中<b>不要 catch (Exception e) {}</b> 空吞异常，也不要用 <code>e.printStackTrace()</code>，要用日志框架（SLF4J + Logback）。这是加分项。' }
  ]
},

/* ======================= 02 ======================= */
{
  no: '02', id: 'c2', title: '集合框架', sub: '面试的绝对重灾区。HashMap 的 8 个问题、ConcurrentHashMap 的 5 个问题，必须能画出来讲。',
  meta: [['块数', '8'], ['问答题', '7'], ['手写', '2']],
  blocks: [

  { t: 'lead', html: 'List / Set / Map 的区别你能背，但<b>「HashMap 为什么这样设计」</b>才是拉开差距的地方。下面全部用图讲。' },

  { t: 'sub', h: '三大体系速查', tag: 'BASIC' },
  { t: 'table',
    caption: '选型表 —— 面试「你会怎么选」的标准答案',
    head: ['需求', '选它', '底层结构', '关键特性'],
    rows: [
      ['按下标随机读', 'ArrayList', '动态数组', 'O(1) 读，O(n) 增删（中间）'],
      ['频繁首尾增删', 'LinkedList / ArrayDeque', '双向链表', 'Deque 优先，用作队列/栈别用 LinkedList'],
      ['去重', 'HashSet', 'HashMap + 一个空对象', '允许 null 一个，HashMap 允许 key=null'],
      ['键值对', 'HashMap', '数组+链表+红黑树', '非线程安全，key 需重写 hashCode/equals'],
      ['并发键值对', 'ConcurrentHashMap', 'CAS + synchronized 锁桶', '并发度 = 桶数，JDK8 已放弃分段锁'],
      ['要排序 / 范围查', 'TreeMap / LinkedHashMap', '红黑树 / 双向链表', 'O(log n)，前者 key 需 Comparable']
    ]},

  { t: 'note', k: '面试提醒', html: '被问「LinkedList 和 ArrayList 怎么选」时，不要只答"LinkedList 增删快"。正确答法：<b>LinkedList 的增删优势在实际中几乎用不到</b>，因为它是指针操作、缓存不友好；<b>栈和队列请用 ArrayDeque</b>，禁止用 Stack 和 LinkedList。' },

  { t: 'viz', id: 'hashmap', no: 0, title: 'HashMap put 全流程' },

  { t: 'sub', h: 'HashMap 必问八题', tag: 'HOT' },
  { t: 'qa', items: [
    { q: 'HashMap 的底层结构？为什么 8 变树、6 退化？', a: '数组 + 链表 + <b>红黑树</b>。链表节点数 ≥ <code>TREEIFY_THRESHOLD(8)</code> 且表长 ≥ <code>MIN_TREEIFY_CAPACITY(64)</code> 时树化（容量小先扩容更划算）；树节点数 ≤ <code>UNTREEIFY_THRESHOLD(6)</code> 时退化回链表（留 7~8 的缓冲避免反复转换）。目的：把 O(n) 降到 O(log n)。' },
    { q: '为什么容量总是 2 的幂？', a: '因为用 <code>(n-1) & hash</code> 代替取模定位桶。n 是 2 的幂时 n-1 全是 1，按位与等价于取模，且是 O(1) 的位运算。' },
    { q: 'HashMap 扩容机制？', a: '容量 <b>×2</b>（不是 ×1.5，那是负载因子相关的说法）。JDK8 扩容时保留原相对位置：<code>(hash & oldCap) == 0</code> 留在原位，否则 <code>+ oldCap</code>，所以<b>不需要倒序遍历链表</b>，这正是 JDK8 相比 JDK7 的优化点。' },
    { q: 'JDK7 和 JDK8 的区别？', a: '① 头插法 → 尾插法（头插在并发扩容时会形成环，<code>get</code> 死循环）；② 引入红黑树；③ 扩容不再重新 hash（用 oldCap 位运算）；④ 容量乘 2 而非 2n + 更高位。' },
    { q: 'HashMap 的 key 该怎么设计？', a: '必须<b>同时重写 hashCode 和 equals</b>。equals 相等 → hashCode 必须相等。若只用 String 这类已重写的类当 key 就没问题。不能用可变对象当 key（改了 hash 就找不到了）。' },
    { q: '为什么 key 最好是 String？', a: '① String 的 hashCode 有缓存，调用快；② equals 最终比 char，比自定义对象快；③ 不可变，hash 稳定；④ 天然支持更多集合实现（TreeMap 需要 Comparable）。' },
    { q: 'HashMap 支持 null 吗？ConcurrentHashMap 呢？', a: 'HashMap 允许一个 null key 和任意 null value（null 固定在 0 号桶）。<b>ConcurrentHashMap 不允许</b>，因为并发下无法区分"键不存在"和"值就是 null"，且 computeIfAbsent 遇 null 会 NPE。' },
    { q: 'HashMap 的负载因子为什么是 0.75？', a: '折中：太小 → 频繁扩容、内存利用率低；太大 → 冲突概率上升、链表变长。因为扩容是 ×2 后 <code>n-1</code> 的低位全变了，等于重新散列一次，所以 0.75 能在空间与时间之间取得较好平衡（泊松分布下平均碰撞 < 1）。' }
  ]},

  { t: 'sub', h: 'ConcurrentHashMap', tag: 'HOT' },
  { t: 'viz', id: 'chm', no: 0, title: 'ConcurrentHashMap 结构与计数' },
  { t: 'qa', items: [
    { q: 'CHM 怎么保证线程安全？', a: 'JDK8：<b>CAS + synchronized 锁单个桶头节点</b>。空桶直接 CAS 放入（无锁）；非空桶先 CAS 把头节点设为自己，再 <code>synchronized (f)</code> 阻塞该桶其他线程。锁粒度是<b>一个桶</b>，并发度 ≈ 容量。' },
    { q: '为什么放弃 Segment 分段锁？', a: '① 内存占用大（每个 Segment 独立 HashMap 结构，数据冗余）；② 并发度被固定为段数（默认 16），扩不上去；③ 扩容要重新分配 Segment，比锁桶复杂。JDK8 改成锁桶后并发度能随容量线性增长。' },
    { q: 'get() 需要加锁吗？', a: '<b>不需要</b>。table 和 node.val 都是 volatile，可见性有保证。get 读到 null 有两种可能：① 真的不存在；② 正在扩容，数据被移到了 ForwardingNode（新表）。所以 get 会跟进 ForwardingNode 去新表找。' },
    { q: 'CHM 的 size() 是精确的吗？', a: 'JDK8 <b>是</b>。用 <code>baseCount</code>（无竞争时的计数）+ <code>CounterCell[]</code>（有竞争时按线程散列计数），<code>sumCount()</code> 相加得到精确值。JDK7 是枚举求和后取模，误差可达 10%。' },
    { q: '为什么 CHM 不支持 null？', a: '① 并发环境下 <code>get(key)==null</code> 无法区分"没这个键"和"值是 null"，会产生歧义；② <code>computeIfAbsent</code> 对 null 会抛 NPE 甚至死循环；③ 违反 <code>get-or-put</code> 的原子语义。' }
  ]},

  { t: 'sub', h: '手写题', tag: 'CODE' },
  { t: 'code', fn: '手写LRU.java', code:
`// 面试高频：手写 LRU 缓存，要求 get/put 均为 O(1)
// 关键：HashMap + 双向链表，HashMap 定位，链表维护顺序

class LRUCache {
    private final int cap;
    private final Map<Integer, Node> map;
    private Node head, tail;   // 哨兵节点，省去空判断

    LRUCache(int capacity) {
        this.cap = capacity;
        this.map = new HashMap<>();
        head = new Node(-1, -1);
        tail = new Node(-1, -1);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        moveToHead(n);
        return n.val;
    }

    public void put(int key, int val) {
        Node n = map.get(key);
        if (n != null) { n.val = val; moveToHead(n); return; }
        n = new Node(key, val);
        map.put(key, n);
        addFirst(n);
        if (map.size() > cap) {          // 超容量，淘汰尾部
            Node last = tail.prev;
            remove(last);
            map.remove(last.key);
        }
    }

    private void moveToHead(Node n) { remove(n); addFirst(n); }
    private void addFirst(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }
    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }

    static class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
}
// 追问：用 LinkedHashMap 怎么写？
//   new LinkedHashMap<>(cap, 0.75f, true)  // true = accessOrder 按访问排序
//   覆写 removeEldestEntry 返回 size() > cap` },

  { t: 'note', k: '加分的延伸', html: '如果面试官接着问「为什么 LRU 不适合生产」——答：<b>LRU 对热点数据不友好</b>，一次批量扫描会把自己需要的热点全部挤出缓存。生产上常用 <b>W-TinyLFU</b> 或 <b>LRU-K</b>。Caffeine 就是 W-TinyLFU 的实现。' }
  ]
},

/* ======================= 03 ======================= */
{
  no: '03', id: 'c3', title: '并发编程', sub: 'JMM 三大问题 + synchronized 底层 + 线程池。面试里最容易讲得似是而非的部分。',
  meta: [['块数', '9'], ['问答题', '8'], ['手写', '1']],
  blocks: [

  { t: 'lead', html: '并发题的正确答法不是背定义，而是<b>「一句话结论 + 一个底层机制 + 一个生产案例」</b>三段式。下面每一题都按这个结构给。' },

  { t: 'viz', id: 'jmm', no: 0, title: 'JMM 与 volatile' },

  { t: 'sub', h: 'JMM 三大问题', tag: 'CORE' },
  { t: 'table',
    caption: '并发三大坑速查',
    head: ['问题', '典型症状', '关键字/方案', '底层原理'],
    rows: [
      ['原子性', 'i++ 结果小于预期', 'synchronized / AtomicInteger / CAS', 'monitorenter / CPU 原子指令'],
      ['可见性', '一个线程改，另一个读旧值', 'volatile / synchronized / final', '内存屏障（StoreLoad 等）'],
      ['有序性', 'new 后置代码先执行', 'volatile / final / 加锁', 'as-if-serial 语义'],
      ['原子性', 'SimpleDateFormat 多线程用错乱', 'DateTimeFormatter（不可变）', '避免共享可变状态'],
      ['可见性', '工作线程读不到主线程准备的数', 'CountDownLatch / Thread.sleep / join', '建立 happens-before 关系']
    ]},

  { t: 'qa', items: [
    { q: 'volatile 关键字的原理？', a: 'volatile 修饰的变量在读写时会插入<b>内存屏障</b>。写操作：StoreStore 屏障（保证之前的写先刷主内存）→ 写数据 → <b>StoreLoad 屏障</b>（最贵，保证写对所有线程可见）。读操作：读数据 → LoadLoad / LoadStore 屏障。作用：<b>保证可见性 + 禁止指令重排（有序性）</b>，但<b>不保证原子性</b>（<code>volatile int i; i++</code> 依然是错的）。' },
    { q: 'volatile 能替代锁吗？', a: '不能。volatile 不保证复合操作的原子性。<code>i++</code> = 读 + 加 + 写三步，多线程下必然丢数据。<b>规则</b>：只有一个线程写、其他线程只读时用 volatile；多个线程写就用锁或原子类。' },
    { q: 'i++ 为什么线程不安全？怎么解决？', a: '字节码是 <code>iload → iadd → istore</code>，三步可被线程切换打断。解法：① <code>synchronized</code> 锁住；② <code>AtomicInteger.incrementAndGet()</code>（CAS + volatile）；③ <code>LongAdder</code>（分段累加，高并发下比 AtomicLong 快得多，<b>但取数要用 sum() 不是 get()</b>）。' },
    { q: 'synchronized 和 ReentrantLock 区别？', a: '① synchronized 是关键字，JVM 实现，异常自动释放；ReentrantLock 是类，需手动 <code>finally unlock</code>。② synchronized 无法超时、不响应中断；Lock 可 <code>tryLock(timeout)</code> 和 <code>lockInterruptibly()</code>。③ synchronized 锁粒度是整个方法/块；<code>ReentrantLock</code> 可搭配 Condition 实现多个队列（如两个：notEmpty/notFull）。<b>性能上 JDK6 之后 synchronized 已不慢，优先用 synchronized。</b>' },
    { q: 'CAS 是什么？有什么 ABA 问题？', a: 'CAS = Compare-And-Swap，一条 CPU 原子指令，无锁自旋。ABA 问题：值从 A 变 B 又变回 A，CAS 以为没变过。解法加版本号：<code>AtomicStampedReference</code>。JDK 大量用于 AQS、ConcurrentHashMap、AtomicLong。' },
    { q: '线程池的核心参数和执行流程？', a: '7 个参数：corePoolSize、maximumPoolSize、keepAliveTime、unit、workQueue、threadFactory、handler。流程：<b>核心线程未满 → 创建核心线程；满了 → 入队；队列满 → 创建非核心线程到 max；还满 → 拒绝策略</b>。最容易被问反的就是这个顺序（先扩线程，后入队）。' },
    { q: '为什么不推荐用 Executors 创建线程池？', a: '<code>newFixedThreadPool</code> / <code>newSingleThreadExecutor</code> 用<b>无界队列 LinkedBlockingQueue</b>，maximumPoolSize 完全不生效，任务堆积到 OOM；<code>newCachedThreadPool</code> 用 SynchronousQueue 且 maximumPoolSize 是 Integer.MAX_VALUE，会创建海量线程同样 OOM。必须<b>有界队列 + 显式线程数</b>。' },
    { q: '怎么计算线程池大小？', a: '公式：<code>N = Ncpu × (1 + WT/ST)</code>。CPU 密集型（WT≈0）≈ N+1；IO 密集型（WT > ST）可设 N×(1+倍速)。但实践上<b>先给一个值（如 2×CPU）压测，再根据监控调整</b>，比套公式靠谱。' }
  ]},

  { t: 'viz', id: 'lock', no: 0, title: 'synchronized 底层与锁升级' },
  { t: 'viz', id: 'pool', no: 0, title: '线程池执行流程' },

  { t: 'sub', h: '手写题', tag: 'CODE' },
  { t: 'code', fn: '手写多线程交替打印.java', code:
`// 面试经典：用 wait/notify 实现 ABAB 交替，或者三个线程循环打印 123
// 关键点：while 循环判断条件（防止虚假唤醒）、notifyAll 优于 notify

class PrintTurn {
    private final int limit;
    private int cur = 1;
    PrintTurn(int limit) { this.limit = limit; }

    synchronized void print(int num) throws InterruptedException {
        // 注意必须用 while 不是 if
        while (num != cur) this.wait();
        System.out.print(num);
        cur = (cur == limit) ? 1 : cur + 1;
        this.notifyAll();     // 唤醒所有等待线程，避免只唤醒一个导致死锁
    }
}

public static void main(String[] a) throws Exception {
    PrintTurn t = new PrintTurn(3);
    for (int i = 1; i <= 3; i++) {
        final int n = i;
        new Thread(() -> {
            for (int j = 0; j < 5; j++) { try { t.print(n); } catch (Exception e) {} }
        }).start();
    }
}` },

  { t: 'note', k: '生产案例', html: '讲一个你用过的并发场景，比背十道题有用。比如：「我之前用线程池异步处理批量数据导入，7 个参数显式指定 + 有界队列，队列满时走 CallerRunsPolicy 让调用方自己跑，天然限流。」——<b>具体、有取舍、说得出为什么</b>，这才是面试官想听的。' }
  ]
},

/* ======================= 04 ======================= */
{
  no: '04', id: 'c4', title: 'JVM 内存与 GC', sub: '一面必问。图解为主，命令要能背下来。',
  meta: [['块数', '8'], ['问答题', '8'], ['图解', '2']],
  blocks: [

  { t: 'lead', html: 'JVM 问的从来不是"有哪些区域"，而是<b>"new 一个对象会发生什么"</b>和<b>"线上 Full GC 怎么排查"</b>。这两件事能答好，JVM 就过了。' },

  { t: 'viz', id: 'jvm', no: 0, title: 'new 一个对象，内存发生了什么' },
  { t: 'viz', id: 'gc', no: 0, title: 'GC 复制算法与分代回收' },

  { t: 'sub', h: '内存区域', tag: 'CORE' },
  { t: 'table',
    caption: '运行时数据区 —— 一张表记住线程私有 vs 共享',
    head: ['区域', '归属', '存什么', '异常'],
    rows: [
      ['虚拟机栈', '线程私有', '方法调用、局部变量表、操作数栈', 'StackOverflowError'],
      ['本地方法栈', '线程私有', 'Native 方法调用（JNI）', 'StackOverflowError'],
      ['程序计数器', '线程私有', '当前字节码行号（唯一不 OOM 的区）', '—'],
      ['堆', '线程共享', '所有对象实例和数组', 'OutOfMemoryError: Java heap space'],
      ['元空间', '线程共享', '类元信息、常量池、JIT 缓存', 'OutOfMemoryError: Metaspace'],
      ['直接内存', '—', 'NIO DirectByteBuffer，不受 -Xmx 限制', 'OutOfMemoryError: Direct buffer memory']
    ]},

  { t: 'qa', items: [
    { q: '堆和栈的区别？', a: '堆：线程共享，存对象，GC 管理，<code>-Xmx</code> 控制。栈：线程私有，存基本类型变量和引用，方法返回即销毁，<code>-Xss</code> 控制。<b>易错点</b>：栈里存的只是引用，真实对象在堆上；两个线程各有一个栈，但堆只有一个。' },
    { q: '对象的内存布局？', a: '<b>对象头</b>（Mark Word 8B 存 hashCode/GC 年龄/锁标志 + Klass 指针 4B）→ <b>实例数据</b> → <b>对齐填充</b>（8 的倍数，压缩指针时 4B 一条）。用 <code>JOL</code> 工具可以实际打印查看。' },
    { q: 'Minor GC 和 Full GC 的区别？触发时机？', a: 'Minor GC = Young GC，Eden 满就触发，只回收年轻代，<b>几乎无停顿</b>。Full GC = 老年代满 / 元空间满 / 显式 <code>System.gc()</code>，回收整个堆 + 方法区，<b>停顿秒级</b>。OOM 前往往伴随连续 Full GC。' },
    { q: '对象什么时候晋升老年代？', a: '① 每次 Minor GC 后 <code>age + 1</code>，达到 <code>MaxTenuringThreshold</code>（默认 15）晋升；② <b>大对象</b>（超过 Eden 容量一半）直接进老年代；③ 动态年龄判定：Survivor 中同龄对象总和超过一半时，阈值自动调低。' },
    { q: '常见 GC 收集器？', a: '<b>Serial</b>（单线程 Stop-The-World）、<b>ParNew</b>（多线程，CMS 唯一搭档）、<b>Parallel Scavenge</b>（多线程，吞吐优先，JDK8 默认）、<b>CMS</b>（并发标记清除，有碎片，已在 JDK14 移除）、<b>G1</b>（Region + 整理，可预测停顿，JDK9+ 默认）、<b>ZGC</b>（着色指针，毫秒级停顿，JDK11+）。<b>答法</b>：按"新生代 / 老年代"分组，重点讲 G1。' },
    { q: 'G1 垃圾回收器原理？', a: '把堆分成大小相等的 <b>Region</b>（ Eden/Survivor/Old 角色动态可换），然后用 <b>Remembered Set</b> 解决跨 Region 引用。分三阶段：初始标记 → <b>并发标记</b> → 重新标记。回收时用 <b>Remembered Set 写屏障</b> 记录引用，优先回收<b>垃圾最多的 Region</b>，从而实现可预测的停顿（<code>-XX:MaxGCPauseMillis</code>）。' },
    { q: '线上 CPU 飙高怎么排查？', a: '<code>top -Hp &lt;pid&gt;</code> 找到高 CPU 线程 → <code>printf "%x" &lt;tid&gt;</code> 转 16 进制 → <code>jstack &lt;pid&gt; | grep &lt;hex&gt;</code> 找栈。多半是<b>死循环</b>或<b>频繁 GC</b>。若是 GC 引起，用 <code>jstat -gcutil &lt;pid&gt; 1000</code> 确认。' },
    { q: '线上内存溢出怎么排查？', a: '<code>jstat -gcutil &lt;pid&gt; 1000</code> 看 FGC 次数 → <code>jmap -dump:live,format=b,file=a.hprof &lt;pid&gt;</code> 导出堆快照 → <b>MAT / JMC</b> 打开，Dominator Tree 找最大对象，Path to GC Roots 找引用链，看是不是被静态集合 / 缓存 / ThreadLocal 持有。常见根因：静态 Map 无上限、缓存无淘汰、动态类（CGLIB）元空间泄漏。' }
  ]},

  { t: 'sub', h: 'JVM 调优参数速查', tag: 'TOOL' },
  { t: 'code', fn: '常用启动参数.txt', code:
`# 堆内存
-Xms2g -Xmx2g                    # 初始=最大，避免运行中扩缩容抖动
-Xmn1g                          # 年轻代大小（不推荐，固定比例不灵活）
-XX:MaxGCPauseMillis=200         # G1 目标停顿
-XX:+UseG1GC                    # JDK9+ 默认

# 元空间（永久代在 JDK8 已移除）
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m        # 不设上限 → 无上限，容易被 CGLIB 撑爆

# GC 日志（排查第一步）
-Xlog:gc*,safepoint:file=gc.log:time,uptime:level,tags:filecount=10,filesize=20M

# 线程栈大小
-Xss512k                        # 递归深时调大

# 常用诊断命令
jps -l                           # 列出进程
jstat -gcutil 12345 1000         # GC 概览，每秒一次
jmap -histo:live 12345 | head    # 类的实例数排名（最快定位大对象）
jmap -dump:live,format=b,file=h.hprof 12345
jstack -l 12345 > t.txt
jcmd 12345 GC.class_histogram    # 同 jmap，但更轻量
jcmd 12345 VM.flags             # 实际生效的全部参数

# 判断 OOM 类型
java.lang.OutOfMemoryError: Java heap space       → 堆满，查内存泄漏
java.lang.OutOfMemoryError: Metaspace              → 类过多，查动态代理/热部署
java.lang.OutOfMemoryError: unable to create thread→ 线程过多，查线程池
java.lang.OutOfMemoryError: Direct buffer memory   → NIO 堆外内存未释放` }
  ]
},

/* ======================= 05 ======================= */
{
  no: '05', id: 'c5', title: 'Spring 生态', sub: 'OD 岗位几乎 100% 问 Spring。IoC、AOP、事务传播、循环依赖是四座大山。',
  meta: [['块数', '10'], ['问答题', '12'], ['图解', '1']],
  blocks: [

  { t: 'lead', html: 'Spring 不用背源码，要背<b>「什么时候发生什么」</b>。代理在哪一步生成、事务在哪一步生效、循环依赖怎么解——这三句能说清楚就够了。' },

  { t: 'sub', h: 'IoC 与 Bean', tag: 'CORE' },
  { t: 'viz', id: 'bean', no: 0, title: 'Bean 生命周期与循环依赖' },
  { t: 'qa', items: [
    { q: 'IOC 和 DI 的区别？', a: 'IoC 是<b>思想</b>（控制反转：容器创建对象而非业务代码 new）；DI 是 IoC 的<b>实现方式</b>（构造器 / Setter / 字段注入）。问「区别」时可以答：IoC 是原则，DI 是手段，IoC 容器通过 DI 完成控制反转。' },
    { q: 'Bean 的生命周期？', a: '① 实例化（构造器）→ ② 属性填充（<code>@Autowired</code>）→ ③ <code>BeanNameAware</code> → <code>BeanClassLoaderAware</code> → <code>BeanFactoryAware</code> → ④ <code>BeanPostProcessor#postProcessBeforeInitialization</code> → ⑤ 初始化（<code>@PostConstruct</code> → <code>InitializingBean</code> → <code>initMethod</code>）→ ⑥ <code>postProcessAfterInitialization</code>（<b>代理在这里生成</b>）→ ⑦ 使用 → ⑧ 销毁（<code>@PreDestroy</code> → <code>DisposableBean</code> → <code>destroyMethod</code>）。' },
    { q: 'Spring 如何解决循环依赖？', a: '<b>三级缓存</b>：一级存成品 Bean，二级存早期暴露的引用，三级存 ObjectFactory 工厂。流程：实例化 A（空对象）→ 放入三级缓存 → 填充属性时需要 B → 实例化 B → B 需要 A → 从三级缓存取到 A 的早期引用 → B 完成 → A 完成。<b>前提</b>：单例 + setter/字段注入。<b>构造器注入无法解决</b>，因为实例化阶段就需要对方。' },
    { q: '为什么需要三级缓存，两级不行？', a: '为了<b>延迟生成代理</b>。两级缓存要求提前放入代理对象，但此时 bean 还没填充完属性，代理对象和真实对象会不一致。三级缓存存的是工厂 lambda，在<b>真正被依赖时</b>（<code>getEarlyBeanReference</code>）才决定要不要生成代理，避免了对未被依赖 bean 的无意义代理开销。' },
    { q: 'Spring 2.6 为什么默认禁止循环依赖？', a: '因为「构造器循环依赖」和「prototype 循环依赖」本来就无解，与其运行时报错不如启动就报 <code>BeanCurrentlyInCreationException</code>。另外三级缓存在有 AOP 时确实可能产生代理与目标对象分离的问题。<b>正确做法是设计上去掉循环依赖</b>，比如抽第三层或用事件驱动。' },
    { q: 'BeanFactory 和 ApplicationContext 的区别？', a: 'BeanFactory 是基础容器，只管 Bean 生命周期；ApplicationContext 在它之上加了国际化、事件发布、资源加载、AOP 集成等。实际开发用 ApplicationContext（<code>ClassPathXmlApplicationContext</code> / <code>AnnotationConfigApplicationContext</code> / <code>SpringBootApplication</code>）。' },
    { q: 'Bean 的作用域有哪些？', a: '<code>singleton</code>（默认，全局一个）、<code>prototype</code>（每次 getBean 新建，<b>容器不管理其销毁</b>）、<code>request</code>、<code>session</code>（Web 专用）、<code>application</code>。注意 singleton 只在<b>容器层面</b>是单例，多线程访问依然要用 ThreadLocal 或并发容器保证安全。' }
  ]},

  { t: 'sub', h: 'AOP', tag: 'CORE' },
  { t: 'qa', items: [
    { q: 'AOP 的实现原理？', a: '动态代理。目标类<b>实现了接口</b> → 用 JDK 动态代理（<code>Proxy.newProxyInstance</code>，生成实现接口的代理）；<b>没实现接口</b> → 用 CGLib（生成目标类的子类）。Spring Boot 2.x 起默认强制用 CGLib，避免「注入时是接口类型，拿不到实现类独有方法」的问题。' },
    { q: 'JDK 代理和 CGLib 代理的区别？', a: 'JDK 代理只能代理接口方法，调用 `getClass()`/`toString()` 会走目标对象而不是代理；CGLib 能代理所有方法（含 final 之外的），但要求目标类<b>不能是 final、不能有 final 方法</b>、需要有可用的构造器。Spring 通过 <code>DefaultAopProxyFactory</code> 自动选择。' },
    { q: 'Spring AOP 的通知顺序？', a: '进入目标方法：环绕（before）→ 前置（@Before）→ 目标方法 → 后置（@AfterReturning）→ 环绕（after）。异常时：环绕（before）→ 前置 → 目标方法抛异常 → <b>环绕（异常分支）</b> → 后置（@AfterThrowing），@After 仍会执行。多层嵌套时<b>外层先执行</b>。' },
    { q: '@Transactional 什么时候会失效？', a: '六个高频：① <b>方法非 public</b>（Spring AOP 不代理）；② <b>自调用</b>（同类内部 this.xxx() 不走代理）；③ 类未被 Spring 管理；④ 异常类型不匹配（默认只回滚 RuntimeException 和 Error，需 <code>rollbackFor</code>）；⑤ 数据库引擎是 MyISAM；⑥ 多线程中事务上下文不跨线程。<b>解决</b>：改用 <code>TransactionTemplate</code>，或注入自己再自调。' }
  ]},

  { t: 'sub', h: 'Spring Boot', tag: 'CORE' },
  { t: 'code', fn: '自动装配原理', code:
`// 一句话：@SpringBootApplication = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan
// 核心是 @EnableAutoConfiguration → @Import(AutoConfigurationImportSelector)

// 关键路径：
//   META-INF/spring.factories          (Boot 2.x，key=EnableAutoConfiguration)
//   META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports  (Boot 3.x)
//
// 里面每行是一个"自动配置类"，例如：
//   org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
//   org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
//
// 每个自动配置类都有 @Conditional 注解做条件装配：
//   @ConditionalOnClass           类路径存在某类才装配
//   @ConditionalOnMissingBean    容器里没有这个 Bean 才装配（用户自定义优先）
//   @ConditionalOnProperty       配置项匹配才装配
//   @ConditionalOnWebApplication 是 Web 应用才装配

// 这套设计叫"约定优于配置"：什么都不配就有合理默认，配置了就用你的` },

  { t: 'qa', items: [
    { q: 'Spring Boot 怎么实现自动装配？', a: '<code>@EnableAutoConfiguration</code> 通过 <code>@Import</code> 导入 <code>AutoConfigurationImportSelector</code>，它从 <code>META-INF/spring.factories</code>（Boot 3 是 <code>*.imports</code>）读取所有自动配置类全限定名，逐个注册为 BeanDefinition。每个配置类上的 <code>@ConditionalOnClass / @ConditionalOnMissingBean / @ConditionalOnProperty</code> 决定是否真正装配。<b>关键：@ConditionalOnMissingBean 保证用户自定义的 Bean 优先。</b>' },
    { q: 'Spring Boot 怎么做到"启动快"？', a: '① <b>不需要 XML</b>，用注解 + 自动装配；② 内嵌 Tomcat，不用单独起容器；③ <code>spring-boot-starter</code> 依赖管理做了版本统一，避免冲突；④ <b>懒加载</b>（<code>spring.main.lazy-initialization=true</code>）把非核心 Bean 延迟到首次使用；⑤ AOT 编译 / 索引（<code>spring-context-indexer</code>）减少扫描。' },
    { q: 'Nacos / Eureka 有什么区别？', a: '<b>一致性</b>：Eureka AP（可用性优先），Nacos 默认 CAP 也支持 CP 模式。Nacos 有配置中心功能（这是最大区别）、支持 gRPC 推送更快、支持命名空间和分组。Eureka 已停止大规模维护（Netflix 宣布进入维护模式）。国内项目基本都用 <b>Nacos</b>。' },
    { q: '分布式事务怎么做？', a: '按优先级：① <b>尽量避免</b>（本地消息表 / 异步最终一致）；② <b>TCC</b>（Try-Confirm-Cancel，业务侵入大但性能好）；③ <b>可靠消息最终一致</b>（RocketMQ 事务消息 / 本地消息表）；④ <b>Seata</b>（AT 模式基于 undo_log 自动生成反向 SQL，对业务零侵入，牺牲部分隔离性）；⑤ 2PC/XA（性能差，一般不用）。<b>面试答法</b>：先说"我们通过消息队列做最终一致"，再解释为什么不用 2PC。' }
  ]}
  ]
},

/* ======================= 06 ======================= */
{
  no: '06', id: 'c6', title: '集合与并发容器（进阶选读）', sub: '把 03 章的并发容器和 02 章的集合打通，一线面试官偶尔会交叉问。',
  meta: [['块数', '4'], ['问答题', '4']],
  blocks: [
  { t: 'lead', html: '这一章内容量不大，但都是<b>「你没准备但他正好会问」</b>的类型。快速过一遍，留个印象即可。' },
  { t: 'table',
    caption: '并发容器对照',
    head: ['类', '并发手段', '适用场景', '注意点'],
    rows: [
      ['ConcurrentHashMap', 'CAS + synchronized 锁桶', '并发键值访问', 'size() 是精确的；不支持 null'],
      ['CopyOnWriteArrayList', '写时复制 + 读无锁', '读远多于写（配置项、监听器列表）', '写性能差；迭代器是快照，不反映后续修改'],
      ['ConcurrentLinkedQueue', 'CAS 无锁链表', '高并发非阻塞队列', '非阻塞队列不能用 poll(timeout)，要用 pollFirst(timeout)'],
      ['LinkedBlockingQueue', 'ReentrantLock 双锁', '生产者消费者（有界）', '<b>必须指定容量</b>，否则无界'],
      ['ArrayBlockingQueue', 'ReentrantLock 单锁', '同上，需要公平锁时选它', '有界，默认公平=false'],
      ['DelayQueue', 'ReentrantLock + PriorityQueue', '延时任务、订单超时取消', '元素需实现 Delayed 接口'],
      ['SynchronousQueue', 'CAS + 队列 transfer', '直接 handoff，不存储', '配合 newCachedThreadPool 或双线程池'],
      ['CountDownLatch', 'AQS 共享锁', '主线程等 N 个子线程完成', '<b>计数不可重置</b>，需重复用要换 CyclicBarrier'],
      ['CyclicBarrier', 'AQS 独占锁', 'N 个线程互相等待（栅栏）', '可重复使用；某线程失败会破坏栅栏'],
      ['Semaphore', 'AQS 共享锁', '限流（控制并发数）', '必须 finally release；获取顺序不保证公平']
    ]},
  { t: 'qa', items: [
    { q: 'CopyOnWriteArrayList 适合什么场景？', a: '<b>读多写少</b>，且集合不大。比如监听器列表、配置项、黑名单。写时会复制整个数组（O(n)），所以写频繁时性能很差。它的迭代器是<b>快照</b>，不会抛 ConcurrentModificationException，但也不反映后续修改。' },
    { q: 'CountDownLatch 和 CyclicBarrier 的区别？', a: 'CountDownLatch：<b>一个线程等 N 个线程</b>，计数器<b>不可重置</b>，到 0 就永久放行。CyclicBarrier：<b>N 个线程互相等</b>，到齐后一起放行，<b>可重复使用</b>（每轮结束自动重置）。' },
    { q: '怎么实现一个限流器？', a: '① 最简单：<code>Semaphore(n)</code>，<code>tryAcquire</code> 拿不到就快速失败。② 单机：Redis + Lua 脚本做令牌桶（<code>redis-cell</code> 模块或自己写）。③ 分布式：<b>Sentinel</b>（流控规则 + 匀速排队）。④ 网关层：Nginx <code>limit_req_zone</code>。<b>答法</b>：从简单到复杂讲，重点讲为什么需要分布式限流。' },
    { q: 'BlockingQueue 的四种阻塞方法？', a: '<code>put</code>（满则等）、<code>take</code>（空则等）、<code>offer</code>（满则返回 false）、<code>poll</code>（空则返回 null）。还有带超时的变体。<b>关键区别</b>：<b>非阻塞队列（ConcurrentLinkedQueue）不支持 put/take 的超时版本</b>，只有 offer/poll 立即返回版。' }
  ]}
  ]
},

/* ======================= 07 ======================= */
{
  no: '07', id: 'c7', title: 'MySQL 与 Redis', sub: '后端岗必问。重点是索引设计、事务隔离、缓存三大问题。',
  meta: [['块数', '8'], ['问答题', '10'], ['手写', '1']],
  blocks: [
  { t: 'lead', html: '这一章的内容<b>面试比项目里用得更深</b>。索引的 B+ 树、MVCC 的可见性判断、缓存穿透布隆过滤器，这三个必须能画图讲。' },

  { t: 'sub', h: '索引', tag: 'DB' },
  { t: 'table',
    caption: '索引类型 —— 最左前缀原则是重点',
    head: ['类型', '作用', '特点'],
    rows: [
      ['聚簇索引（主键）', '数据本身', '叶子节点存整行数据；<b>一张表只有一个</b>'],
      ['二级索引（普通）', '加速查询', '叶子存主键值，<b>要回表</b>'],
      ['联合索引', '多列加速', '<b>最左前缀</b>：a,b,c 索引可查 a / a,b / a,b,c'],
      ['覆盖索引', '不回表', '查询列都在索引里 → 速度极快'],
      ['前缀索引', '长字符串', '只索引前 N 字符，节省空间，不能排序'],
      ['全文索引', '文本搜索', 'MySQL 8.0.6+ 内置，复杂场景仍建议 ES']
    ]},
  { t: 'code', fn: '索引设计.sq', code:
`-- 最左前缀：定义 (a, b, c) 后，以下索引能用
SELECT * FROM t WHERE a = 1;              -- ✅ 用到 a
SELECT * FROM t WHERE a = 1 AND b = 2;   -- ✅ 用到 a, b
SELECT * FROM t WHERE a = 1 AND c = 3;   -- ⚠ 只用到 a（c 用不上）
SELECT * FROM t WHERE b = 2;              -- ❌ 完全用不上（最左失效）

-- 范围查询会中断后续索引
SELECT * FROM t WHERE a = 1 AND b > 2 AND c = 3;   -- ⚠ 用到 a,b，c 失效

-- 覆盖索引：查询列都在索引里，无需回表
CREATE INDEX idx ON orders(user_id, status, create_time);
SELECT user_id, status FROM orders WHERE user_id = 1;  -- ✅ 覆盖索引

-- 索引失效的常见写法
WHERE name LIKE '%abc'     -- ❌ 前置通配符
WHERE name LIKE 'abc%'     -- ✅
WHERE CAST(age AS CHAR) = '18'  -- ❌ 字段被函数包裹
WHERE age = '18' AND a = 1      -- ⚠ 类型隐式转换
WHERE a = 1 OR b = 2      -- ⚠ OR 两侧都无索引才失效
WHERE a <> 1 / NOT IN / IS NOT NULL  -- ⚠ 不走索引` },
  { t: 'qa', items: [
    { q: '为什么用 B+ 树不用 B 树或红黑树？', a: 'B+ 树：① <b>非叶节点只存索引</b>，单页能放更多键 → 树更矮，IO 次数少（3~4 层就能存千万级数据）；② 叶子节点<b>用链表串联</b>，范围查询高效（B 树做不到）；③ 非叶节点不存数据 → 缓存命中率高。' },
    { q: '聚簇索引和二级索引的区别？为什么要回表？', a: '聚簇索引叶子节点存<b>完整行数据</b>，二级索引叶子只存<b>主键值</b>。通过二级索引找到主键后再去聚簇索引查完整数据，这个过程叫<b>回表</b>。<b>覆盖索引</b>能避免回表：把需要的列都放进联合索引。' },
    { q: '四个隔离级别？MVCC 怎么实现？', a: '读未提交（脏读）、读已提交（不可重复读）、可重复读（幻读，MySQL 间隙锁解决）、串行化。MVCC 靠 <b>undo log 版本链 + ReadView</b> 实现：每行有隐藏列 <code>DB_TRX_ID / DB_ROLL_PTR</code>，读操作创建 ReadView 标记可见性边界，遍历版本链找到当前事务可见的版本。RC 每条 SQL 都建 ReadView，RR 只在事务第一次读时建一次。' },
    { q: 'RR 隔离级别怎么解决幻读？', a: '<b>间隙锁</b>。RR 下 <code>SELECT</code>（快照读）看不到新插入的行；要看到新行必须加锁读（<code>SELECT ... FOR UPDATE</code>），此时会用<b>临键锁（Next-Key Lock）= 记录锁 + 间隙锁</b>，锁住记录之间的间隙，阻止插入。⚠ 注意：<b>快照读本身不解决幻读</b>，是锁读解决的。' },
    { q: 'explain 怎么看？重点关注哪几列？', a: '重点：<code>type</code>（访问类型，<b>要达到 ref 及以上，最差 ALL 全表扫</b>）、<code>key</code>（实际用的索引）、<code>rows</code>（扫描行数）、<code>Extra</code>（<b>Using filesort</b> / <b>Using temporary</b> / <b>Using index</b> 都要警惕，前两者意味着排序或临时表）。' }
  ]},

  { t: 'sub', h: 'Redis', tag: 'CACHE' },
  { t: 'code', fn: 'Redis 五大数据结构', code:
`String   → SDS       简单字符串/计数器/分布式锁值。最大 512MB
Hash     → listpack(小) / hashtable(大)   对象、购物车
List     → quicklist  消息队列、时间轴。LPUSH + BRPOP 做简易 MQ
Set      → intset(小) / hashtable   去重、共同好友、抽奖(SRANDMEMBER)
ZSet     → skiplist + hashtable      排行榜（score 排序）、延时队列（score=时间戳）

-- ZSet 跳表：为什么不是红黑树？
--   1. 范围查询效率高（底层就是有序链表结构）
--   2. 实现简单，插入删除只需局部调整
--   3. 内存占用可通过 zset-max-listpack-entries 优化小对象

-- Redis 为什么快？
--   1. 纯内存操作
--   2. 单线程执行命令 → 无锁、无上下文切换
--   3. IO 多路复用（epoll）→ 可处理 10万+ 连接
--   4. 自定义高效数据结构

-- Redis 是单线程，那怎么有 10万 QPS？
--   单线程只执行命令（纳秒级），瓶颈在网络和内存带宽` },
  { t: 'qa', items: [
    { q: '缓存穿透、击穿、雪崩的区别和解决？', a: '<b>穿透</b>：查不存在的 key，每次都打到 DB → <b>布隆过滤器</b>（前置拦截）或缓存空值（设短 TTL）。<b>击穿</b>：某个热点 key 突然过期，大量请求同时打 DB → <b>互斥锁 / 逻辑过期</b>（永不过期 + 异步重建）。<b>雪崩</b>：大量 key 同时过期或 Redis 宕机 → <b>过期时间加随机值</b> + 多级缓存 + 熔断降级。' },
    { q: '怎么保证 Redis 和数据库的数据一致性？', a: '没有绝对一致，只有<b>最终一致</b>。常用方案：① <b>Cache Aside</b>（先更新 DB 再删缓存，最常用；<b>注意是删不是改</b>）；② <b>延迟双删</b>（更新 DB → 删缓存 → 延迟 500ms 再删一次，防并发写 + 删失败的漏删）；③ 订阅 binlog（Canal）异步删缓存，<b>最可靠</b>，但引入中间件。缓存是<strong>先更新 DB 再删除缓存</strong>，避免并发写导致旧值覆盖新值。' },
    { q: 'Redis 为什么不能用 SETNX 做分布式锁？', a: '① <b>没有过期时间</b> → 死锁；② 没有唯一 value 校验 → 误删别人的锁；③ 无法重入。<b>正确做法</b>：<code>SET key uuid NX PX 30000</code>，释放时用 Lua 脚本比对 value 再删（保证原子性）。<b>更好的选择</b>：直接用 <b>Redisson</b>，它有看门狗自动续期、可重入、公平锁、Redlock 算法等。' },
    { q: 'Redis 分布式锁怎么续期？Redlock 有什么问题？', a: 'Redisson 用<b>看门狗线程</b>：默认 30s 锁，每 10s 续期到 30s（可通过 <code>lockWatchdogTimeout</code> 调整），业务执行完主动释放。<b>Redlock 的争议</b>：时钟漂移、网络分区下可能误判加了多把锁；且依赖多个独立节点，运维成本高。<b>实际建议</b>：用单实例 + 看门狗（可用性优先），或用 ZooKeeper 临时节点（一致性优先）。' },
    { q: 'Redis 内存淘汰策略有哪些？', a: '8 种：<code>noeviction</code>（默认，报错）、<code>allkeys-lru</code>、<code>allkeys-lfu</code>、<code>volatile-lru</code>、<code>volatile-lfu</code>、<code>allkeys-random</code>、<code>volatile-random</code>、<code>volatile-ttl</code>。<code>volatile-*</code> 只对设了 TTL 的 key 生效。<b>推荐</b>：<code>allkeys-lru</code> 或 <code>allkeys-lfu</code>（LFU 对热点更友好）。' },
    { q: 'Redis 大 Key 有什么危害？', a: '危害：① <b>阻塞</b>——单线程，大 key 的读/删会卡住其他请求；② <b>网络带宽</b>——一次传输耗时长；③ <b>内存不均</b>——删除时主从同步流量大，可能导致主从切换。解决：拆分（Hash 按用户分片）、用 <code>UNLINK</code> 异步删除、排查用 <code>redis-cli --bigkeys</code> 和 <code>MEMORY USAGE</code>。' }
  ]}
  ]
},

/* ======================= 08 ======================= */
{
  no: '08', id: 'c8', title: '手写题 & 算法', sub: '笔试机试和面试手撕共用。华为 OD 机试通常 2~3 题，60 分钟。',
  meta: [['块数', '6'], ['手写', '12'], ['高频', '★★★★★']],
  blocks: [
  { t: 'lead', html: '机试不会考八股，只考<b>你能不能在 IDE 里把代码敲出来</b>。目标：看到题目能立刻说出思路，30 分钟内写完并通过样例。' },

  { t: 'sub', h: '必会手写（Java 版）', tag: '★★★★★' },
  { t: 'code', fn: 'SingleNumber.java', code:
`// ★ 位运算：数组中除一个元素外都出现两次，找出那个元素
class Solution {
    public int singleNumber(int[] nums) {
        int res = 0;
        for (int n : nums) res ^= n;   // 相同数异或为 0
        return res;
    }
}
// 变体①：只有两个数出现一次 → res & -res 分离低位，其余成对消掉
// 变体②：数字 1~n 出现一次，其余出现两次 → for(i=1;i<=n;i++) res ^= i^nums[i-1]` },

  { t: 'code', fn: 'TwoSum.java', code:
`// ★ 哈希表一遍遍历，O(n)
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[]{j, i};
            seen.put(nums[i], i);
        }
        throw new IllegalArgumentException("No solution");
    }
}
// 要点：边遍历边查，查不到再放；一次遍历比两次高效` },

  { t: 'code', fn: 'ReverseKGroup.java', code:
`// ★ 链表区间翻转 —— 笔试出现率最高
class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        if (head == null || head.next == null) return head;
        // 1. 找到第一组的末尾，倒转
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode cur = dummy;
        for (int i = 0; i < k; i++) {
            cur = cur.next;
            if (cur == null) return head;
        }
        ListNode tail = cur.next;
        cur.next = null;
        // 2. 递归后续分组，再接到反转后的头部
        ListNode rest = reverseKGroup(tail, k);
        ListNode prev = rest;
        ListNode curr = dummy.next;
        while (curr != null) {
            ListNode nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        dummy.next = prev;
        return dummy.next;
    }
}
// 技巧：头插法反转 + 哨兵节点简化边界处理` },

  { t: 'code', fn: 'MinStack.java', code:
`// ★ 最小栈 —— 进阶题，考察对栈的理解
class MinStack {
    private final Deque<Integer> stack = new ArrayDeque<>();
    private final Deque<Integer> minStack = new ArrayDeque<>();

    public void push(int v) {
        stack.push(v);
        // 核心：新元素 <= 栈顶最小值就压入 minStack（存重复值）
        if (minStack.isEmpty() || v <= minStack.peek()) minStack.push(v);
    }
    public int pop() {
        int v = stack.pop();
        if (!minStack.isEmpty() && v == minStack.peek()) minStack.pop();
        return v;
    }
    public int top()    { return stack.peek(); }
    public int getMin() { return minStack.peek(); }
}
// 变体：用单个栈，栈内存 [value, min, value, min...]，push 时同时压当前 min` },

  { t: 'sub', h: '其他高频', tag: '★★★' },
  { t: 'table',
    caption: '机试题单 —— 按出现频率排序',
    head: ['题目', '关键手法', '复杂度'],
    rows: [
      ['合并区间 / 区间重叠', '排序 + 一次遍历比较边界', 'O(n log n)'],
      ['三数之和', '排序 + 固定一个 + 双指针 + 去重', 'O(n²)'],
      ['最长无重复子串', '滑动窗口 + HashMap 存下标', 'O(n)'],
      ['岛屿数量 / 岛屿最大面积', 'DFS/BFS 洪水填充，注意 visited', 'O(mn)'],
      ['层序遍历二叉树', 'Queue 逐层处理，用 size 快照', 'O(n)'],
      ['二叉树第 N 层节点 / 深度', '递归返回；或 BFS 计数', 'O(n)'],
      ['LRU 缓存', 'HashMap + 双向链表', 'O(1)'],
      ['生产者消费者', 'BlockingQueue；wait/notify 手写', '—'],
      ['单例模式', '双重检查 + volatile / 枚举', '—'],
      ['字符串转整数（atoi）', '处理溢出、空白、非数字、前导零', 'O(n)'],
      ['括号匹配 / 表达式求值', '栈；求值要处理优先级', 'O(n)'],
      ['数组第 K 大', '小顶堆 O(n log k) 或快速选择 O(n)', '—']
    ]},

  { t: 'note', k: '机试策略', html: '<b>先读完全部题目再下手。</b>优先做「读题即有思路」的。写完<b>必须自己跑样例验证</b>，哪怕用 main 方法手动测。华为 OD 机试通常 <b>2 题 / 60 分钟 / ACM 模式</b>（只给输入输出，不给 main），记得写好 Scanner 读取和控制台输出。' },

  { t: 'code', fn: '机试模板.java', code:
`import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 用 BufferedReader 处理大输入更快
        // BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        // ... 你的逻辑
        System.out.println(result);
    }
}
// 提醒：华为 OD 有的题目会给你 "第一行一个整数 n"，一定要读
// n 之后的数据，不要假设格式。这是很多人机试挂掉的原因。` }
  ]
},

/* ======================= 09 ======================= */
{
  no: '09', id: 'c9', title: '面经话术 & 复盘', sub: '技术之外的部分。华为 OD 的面试流程、简历包装、如何回答"你还有什么问题"。',
  meta: [['块数', '6'], ['问答题', '8'], ['话术', '5']],
  blocks: [
  { t: 'lead', html: '技术可以慢慢补，但<b>流程和话术是决定你能不能进下一轮</b>的。华为 OD 通常是<b>简历初筛 → 机试（2题/60分钟）→ 技术一面 → 技术二面/主管面 → HR 面</b>。技术面通常 45~60 分钟。' },

  { t: 'sub', h: '自我介绍（90 秒版）', tag: 'SCRIPT' },
  { t: 'code', fn: '自我介绍框架', code:
`【结构：身份 → 技术栈 → 一个最有价值的项目 → 收获】

我是 XXX，XX 大学 XX 专业 2026 届毕业生。
主要使用 Java 后端开发，技术栈是 Spring Boot + MyBatis +
MySQL + Redis，之前在 XX 公司实习了 X 个月，做过 XX 系统。

重点项目是 XXX。简单说，它要解决的是 XXX 问题，
我负责的是 XXX 模块。
  · 技术难点一：XXX —— 我的方案是 XXX，收益是 XXX（能量化就量化）
  · 技术难点二：XXX —— 我用了 XXX 解决，学到了 XXX

技术之外，我平时会 XXX（刷题 / 看源码 / 写博客），
目前的习惯是 XXX。

【要点】
① 不要背稿，但要背结构 —— 讲的时候看 3 段式
② 项目一定要选"你做得最深"的那个，不是最宏大的
③ 一定要有一句"我在里面学到什么"，体现反思能力
④ 控制在 90 秒，面试官会打断，这是好事不是坏事` },

  { t: 'sub', h: '项目怎么讲（STAR）', tag: 'SCRIPT' },
  { t: 'table',
    caption: 'STAR 结构 —— 每个项目故事都用这个框架',
    head: ['部分', '说什么', '错误示范', '正确示范'],
    rows: [
      ['S 情境', '项目背景、规模、你的角色', '「我们做了一个电商系统」', '「日活 10 万的秒杀系统，我在里面负责库存扣减模块」'],
      ['T 任务', '你要解决的具体问题', '「我负责后端开发」', '「解决高并发下库存超卖，需要保证一致性且不牺牲性能」'],
      ['A 行动', '你做了什么 + 为什么这么做', '「我们用了 Redis」', '「先用 Redis 原子扣减挡住 99% 请求，DB 层再用唯一索引兜底最终一致」'],
      ['R 结果', '可量化的结果 + 你的收获', '「性能提升了很多」', '「P99 从 800ms 降到 90ms，超卖从每天 30 笔降到 0，学到了要分层设计兜底」']
    ]},
  { t: 'note', k: '关键提醒', html: '<b>A（行动）必须是"我"做的</b>，不是"我们"做的。面试官会追问细节，团队做的事你答不出来就露馅了。R（结果）<b>一定要能量化</b>，没数据就说"当时没做监控，但从 X 降到 Y 的压测结果"，不要说"效果不错"。' },

  { t: 'sub', h: '高频问题 & 答法', tag: 'FAQ' },
  { t: 'qa', items: [
    { q: '你为什么想来华为 / 华为 OD？', a: '不要说"华为大、平台好、想学习"这种空话。<b>具体答法</b>：① 技术上——华为 OD 的业务场景（嵌入式、车载、鸿蒙侧）和我做过的 XX 有共通点；② 成长上——我看过 XX 方向的技术分享/开源代码，想在更规范的工程体系里磨；③ 稳定性上——我了解 OD 岗位同样走正规研发流程，想做有长期价值的产品。<b>结尾一定要说"我查过 XX 业务"这类具体信息</b>。' },
    { q: '你的项目有什么不足？', a: '<b>必须有真缺点，且是你已经想过办法的</b>。示范：「我们早期把业务逻辑写在 Service 里，分支越来越多，后来抽成了策略模式 + 规则表。但重构不彻底，还有部分 if-else 在里面，后续计划继续拆。另外我们没有做完善的监控告警，是一次线上问题后补上的。」<b>能承认不足 + 展示改进意识，比假装完美可信得多。</b>' },
    { q: '你还有什么问题想问我们？', a: '<b>必问</b>，问不出问题等于没准备。推荐三个方向：<br>① <b>技术</b>：「团队现在的技术栈和主要挑战是什么？」（问完接一句"我看到你们用了 XX，想了解为什么这么选"）<br>② <b>成长</b>：「新人一般怎么成长？有 mentor 机制吗？」<br>③ <b>流程</b>：「如果我入职，前三个月的目标大概是什么？」<br><b>不要问</b>：加班多不多（问「团队的迭代节奏是怎样的」）、能涨薪吗、什么时候能转正。' },
    { q: '你有什么缺点？', a: '<b>选一个真实但可控、且正在改进的</b>。示范：「以前我会在代码里留很多 TODO 等后面优化，结果是最后都没动。现在我改成：任何 TODO 必须带负责人和 deadline，或者干脆当场拆成 TODO 卡片进迭代 backlog。」<b>关键是：缺点 + 具体改进动作 + 现在的状态。</b>不要说"我太追求完美"这种假缺点。' },
    { q: '如果面试官问到你不会的？', a: '<b>绝对不要编。</b>正确答法：「这块我目前还不太确定，我的理解是 XXX（说你知道的），但我不确定这个场景下会不会出问题。如果方便的话我想回去查一下再回复您。」<b>面试官更看重诚实和可培养性</b>，编的东西他追问两层就崩了。' },
    { q: '讲一个你解决过的难题。', a: '提前准备<b>至少 2 个</b>故事：一个技术难点，一个线上故障（体现应急能力）。故障故事用这个结构：现象 → 影响面 → 定位过程 → 根因 → 修复 → <b>复盘（怎么防止再发生）</b>。有复盘的故障故事，可信度远高于纯技术故事。' },
    { q: '你有什么技术上的不足？打算怎么补？', a: '结合实际情况答，比如：「JVM 调优这块我主要是看书和看文章，缺少真实线上经验。我想的做法是去读一遍《JVM 性能调优》+ 把我们项目的 GC 日志拉出来实际分析一遍。」<b>有具体计划</b>比"我会努力"好一万倍。' },
    { q: '你的技术栈匹配度怎么样？', a: '不要吹。正确答法：把岗位 JD 的要求逐条对照自己的掌握程度，<b>分三档说</b>：「JD 里的 A、B 我在实际项目里用过，能独立完成；C 我了解原理但没在生产用过（说了具体是哪个环节）；D 我没接触过，但同属一个领域，我的迁移能力是 XX（举一个你快速上手新东西的例子）。」' }
  ]},

  { t: 'sub', h: '面试前 3 天清单', tag: 'CHECK' },
  { t: 'list', items: [
    '<b>技术</b>：把本文 10 组图解全部能<b>不看内容讲出来</b>，48 道问答题过一遍',
    '<b>项目</b>：把简历上每个项目按 STAR 写好，至少 2 个能讲 5 分钟的',
    '<b>简历</b>：每条经历都要能回答"这个技术为什么用在这里""遇到什么问题怎么解决的"',
    '<b>手写</b>：LRU、二叉树、链表区间翻转、线程交替打印 —— 闭着眼睛能写出来',
    '<b>反问</b>：准备 3 个想问面试官的问题',
    '<b>设备</b>：提前 20 分钟测摄像头麦克风；IDE 装好 JDK8/17，配置好 Maven 镜像',
    '<b>心态</b>：面完就忘，不要为上一场复盘超过 10 分钟'
  ]},

  { t: 'sub', h: '最后一句', tag: 'NOTE' },
  { t: 'p', html: '技术面考察的是<b>「能不能把一件事讲清楚」</b>，不是「记住了多少」。所以每一个知识点，都练到能用一句话 + 一张图说出来的程度。讲不出来 = 没学会。' }
  ]
}

];
