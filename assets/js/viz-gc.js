/* ============================================================
   GC + Spring + 集合 补完图解
   ============================================================ */
(function (V) {
  'use strict';
  const R = (id, s) => V.register(id, s);
  const H = V.H, e = V.e;
  const C = V.C;
  const easeOut = V.easeOut, easeIn = V.easeIn, clamp01 = V.clamp01, lerp = V.lerp;

  /* ==========================================================
     7. GC：分代 + 复制算法
     ========================================================== */
  R('gc', {
    no: 7, title: 'GC 复制算法 + 分代回收', w: 900, h: 400, dur: 1900,
    steps: [
      {
        label: '分代思想', cap: '<b>分代假说</b>：绝大多数对象朝生夕死。年轻代用<b>复制</b>（无碎片），老年代用<b>标记清除/整理</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 堆分区
          const zones = [
            { n: 'Eden 伊甸园', s: '新对象 100% 先来这里', x: 20, w: 300, col: C.red, ratio: '8 : 1 : 1' },
            { n: 'Survivor S0', s: '活过一岁的往这搬', x: 336, w: 140, col: C.ink, ratio: '' },
            { n: 'Survivor S1', s: '', x: 492, w: 140, col: C.ink, ratio: '' },
            { n: '老年代 Old', s: 'GC 后还活着 / 大对象直接进', x: 648, w: 232, col: C.ink, ratio: '' }
          ];
          zones.forEach((z, k) => {
            const on = clamp01((t - k * 0.12) * 2.5);
            svg.appendChild(H.box(z.x, 48, z.w, 120, { stroke: z.col, sw: k === 0 ? 1.5 : 1, opacity: 0.35 + 0.65 * on }));
            svg.appendChild(H.box(z.x, 48, z.w, 4, { fill: z.col, opacity: on }));
            svg.appendChild(E(z.x + 12, 74, z.n, { size: 12, weight: 700, fill: z.col, opacity: on }));
            if (z.s) svg.appendChild(E(z.x + 12, 94, z.s, { size: 8, fill: C.gray1, opacity: on }));
            if (z.ratio) svg.appendChild(E(z.x + 12, 118, '默认 ' + z.ratio, { size: 9, mono: 1, fill: C.red, opacity: on }));
          });
          // Eden 里的小对象
          for (let k = 0; k < 16; k++) {
            const on = clamp01((t - 0.25 - (k % 8) * 0.04) * 3);
            if (on <= 0) continue;
            const cx = 34 + (k % 8) * 36, cy = 106 + Math.floor(k / 8) * 28;
            const alive = k === 2 || k === 5 || k === 9;
            svg.appendChild(H.circ(cx, cy, 7, { fill: alive ? C.red : C.gray3, stroke: alive ? C.red : C.gray2, opacity: on * 0.95 }));
          }
          svg.appendChild(E(20, 192, '小知识点：', { size: 10, weight: 700, fill: C.red }));
          svg.appendChild(E(90, 192, 'TLAB 分配优先在 Eden 内的线程私有区域，TLAB 用完才从 Eden 剩余空间申请', { size: 9, fill: C.gray1 }));
          svg.appendChild(E(20, 210, '大对象（超过 Eden 一半）直接进老年代；TLAB 剩余空间小于 25% 时也不再分配，需触发 GC', { size: 9, fill: C.gray1 }));
          // 收集器
          svg.appendChild(E(20, 244, '各收集器与分代的关系', { size: 10, weight: 700, ls: 1, opacity: o }));
          const cols = [
            ['新生代 Serial', 'Copying', '单线程，最快，Client 端'],
            ['新生代 ParNew', 'Copying', '多线程，唯一的 CMS 搭档'],
            ['新生代 Parallel Scavenge', 'Copying', '吞吐优先，JDK8 默认'],
            ['新生代 G1 / ZGC / Shenandoah', 'Copying + 整理', '全堆收集，目标低延迟']
          ];
          cols.forEach((c, k) => {
            const x = 20 + k * 218;
            svg.appendChild(H.box(x, 256, 202, 76, { stroke: k === 2 ? C.red : C.gray2, sw: k === 2 ? 1.5 : 1, opacity: o }));
            svg.appendChild(E(x + 12, 276, c[0], { size: 10, weight: 700, fill: k === 2 ? C.red : C.ink, opacity: o }));
            svg.appendChild(E(x + 12, 294, c[1], { size: 9, mono: 1, fill: C.gray1, opacity: o }));
            svg.appendChild(E(x + 12, 312, c[2], { size: 8, fill: C.gray2, opacity: o }));
          });
          svg.appendChild(E(20, 360, '老年代：CMS（标记-清除，有碎片）→ G1（Region + 整理）→ ZGC（着色指针 + 读屏障，毫秒级）', { size: 10, fill: C.gray1, opacity: o }));
        }
      },
      {
        label: 'Minor GC', cap: 'Minor GC = <b>Young GC</b>，只回收年轻代。Eden 里的对象复制到 Survivor，<b>活过 15 次（默认）</b>才晋升老年代。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // Eden
          svg.appendChild(H.box(20, 48, 240, 150, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(H.box(20, 48, 240, 4, { fill: C.red }));
          svg.appendChild(E(34, 74, 'Eden', { size: 12, weight: 700, fill: C.red }));
          for (let k = 0; k < 18; k++) {
            const die = k % 3 === 0;
            const on = clamp01((t - k * 0.02) * 2);
            if (on <= 0) continue;
            svg.appendChild(H.circ(46 + (k % 6) * 36, 100 + Math.floor(k / 6) * 34, 7, {
              fill: die ? 'none' : C.ink, stroke: die ? C.gray2 : C.ink,
              opacity: die ? (0.3 - clamp01((t - 0.3) * 2) * 0.3) : on
            }));
          }
          svg.appendChild(E(34, 186, '18 个对象', { size: 9, mono: 1, fill: C.gray1 }));
          // 箭头
          const mo = easeOut(clamp01((t - 0.2) * 2));
          svg.appendChild(H.path(`M 270 122 C 300 122, 300 100, 330 100`, { stroke: C.red, sw: 1.5, opacity: mo }));
          svg.appendChild(H.path(`M 270 150 C 310 150, 300 210, 330 210`, { stroke: C.red, sw: 1.5, opacity: mo }));
          svg.appendChild(E(272, 96, '存活', { size: 9, fill: C.red, weight: 700, opacity: mo }));
          svg.appendChild(E(272, 168, '死亡 → 回收', { size: 9, fill: C.gray2, opacity: mo }));
          // S0
          svg.appendChild(H.box(340, 48, 170, 130, { stroke: C.ink }));
          svg.appendChild(H.box(340, 48, 170, 4, { fill: C.ink }));
          svg.appendChild(E(354, 74, 'Survivor S0', { size: 12, weight: 700 }));
          for (let k = 0; k < 6; k++) {
            const on = clamp01((t - 0.35 - k * 0.05) * 3);
            svg.appendChild(H.circ(370 + (k % 3) * 40, 100 + Math.floor(k / 3) * 32, 7, { fill: C.red, opacity: on }));
          }
          svg.appendChild(E(354, 170, 'age = 0 开始计数', { size: 9, fill: C.gray2 }));
          // S1
          svg.appendChild(H.box(540, 48, 170, 130, { stroke: C.gray3, dash: '4 3' }));
          svg.appendChild(E(554, 74, 'Survivor S1', { size: 12, weight: 700, fill: C.gray1 }));
          svg.appendChild(E(554, 106, '空', { size: 11, fill: C.gray2 }));
          svg.appendChild(E(554, 130, '目标 S0:S1 = 1:1', { size: 8, fill: C.gray2 }));
          // 晋升
          const po = easeOut(clamp01((t - 0.6) * 2));
          svg.appendChild(H.box(740, 48, 140, 130, { stroke: C.ink, opacity: 0.3 + 0.7 * po }));
          svg.appendChild(H.box(740, 48, 140, 4, { fill: C.ink, opacity: po }));
          svg.appendChild(E(754, 74, 'Old', { size: 12, weight: 700, opacity: 0.3 + 0.7 * po }));
          svg.appendChild(E(754, 96, 'age > 15', { size: 9, mono: 1, fill: C.red, opacity: 0.3 + 0.7 * po }));
          svg.appendChild(E(754, 114, '-XX:MaxTenuring', { size: 8, mono: 1, fill: C.gray2, opacity: 0.3 + 0.7 * po }));
          svg.appendChild(E(754, 130, 'Threshold=15', { size: 8, mono: 1, fill: C.gray2, opacity: 0.3 + 0.7 * po }));
          svg.appendChild(H.path(`M 510 130 C 560 190, 680 190, 745 120`, { stroke: C.red, sw: 1.5, opacity: po }));
          // 细节
          const notes = [
            '每次 Minor GC 后，存活对象在 S0/S1 之间「身份互换」——S0 要空出来装新对象',
            '若 S0 装不下（对象都存活），部分对象直接进老年代；老年代也装不下 → Full GC',
            '晋升那一次不计入 age 判断前的 +1 逻辑细节：实际是 age 达到阈值才晋升',
            '年龄在每次 GC 后 +1；对象首次创建在 Eden，age = 0'
          ];
          notes.forEach((s, k) => {
            const no = clamp01((t - 0.7 - k * 0.06) * 3);
            svg.appendChild(H.box(20, 206 + k * 42, 860, 38, { stroke: k === 0 ? C.red : C.gray3, opacity: no }));
            svg.appendChild(H.box(20, 206 + k * 42, 4, 38, { fill: k === 0 ? C.red : C.gray3, opacity: no }));
            svg.appendChild(E(38, 222 + k * 42, s, { size: 10, fill: k === 0 ? C.ink : C.gray1, opacity: no }));
            if (k === 0) svg.appendChild(E(38, 236, '必背', { size: 8, fill: C.red, weight: 700, opacity: no }));
          });
        }
      },
      {
        label: '复制算法细节', cap: '复制算法<b>无内存碎片</b>，但需要一块额外空间，且<mark>每个对象都要复制一遍</mark>——存活率高时代价巨大。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // before
          svg.appendChild(E(20, 34, 'GC 前：From 区（Eden+S0，存活 20%）', { size: 10, weight: 700, ls: 1 }));
          svg.appendChild(H.box(20, 46, 380, 130, { stroke: C.gray2 }));
          for (let k = 0; k < 10; k++) {
            svg.appendChild(H.circ(46 + (k % 5) * 70, 80 + Math.floor(k / 5) * 46, 9, { fill: C.paper3, stroke: C.gray2 }));
          }
          for (let k = 0; k < 2; k++) {
            svg.appendChild(H.circ(46 + (k % 5) * 70, 80 + Math.floor(k / 5) * 46, 9, { fill: C.red, stroke: C.red }));
          }
          svg.appendChild(E(20, 194, '碎片化严重：存活对象被空洞隔开', { size: 9, fill: C.gray2 }));
          // 指针
          const mo = easeOut(clamp01((t - 0.15) * 2));
          svg.appendChild(H.path('M 400 90 C 470 90, 470 90, 530 90', { stroke: C.red, sw: 1.5, opacity: mo }));
          svg.appendChild(H.path(`M 530 90 l 8 4 l -8 4 z`, { fill: C.red, opacity: mo }));
          svg.appendChild(E(430, 80, 'compact', { size: 9, mono: 1, fill: C.red, weight: 700, opacity: mo }));
          // after
          svg.appendChild(E(550, 34, 'GC 后：To 区，存活对象紧凑排列', { size: 10, weight: 700, ls: 1, opacity: mo }));
          svg.appendChild(H.box(550, 46, 330, 130, { stroke: C.red, sw: 1.5, opacity: mo }));
          for (let k = 0; k < 2; k++) {
            const px = 578 + k * 34;
            svg.appendChild(H.circ(px, 84, 9, { fill: C.red, stroke: C.red, opacity: mo }));
          }
          for (let k = 0; k < 8; k++) {
            svg.appendChild(H.circ(700 + (k % 4) * 40, 122 + Math.floor(k / 4) * 40, 9, { fill: 'none', stroke: C.gray3, dash: '2 2', opacity: mo * .7 }));
          }
          svg.appendChild(E(550, 194, '无碎片 · 连续空间', { size: 9, fill: C.red, opacity: mo }));
          // 对比
          const alg = [
            ['复制算法 Copying', '无碎片', '需额外空间，存活率高时爆炸', C.red],
            ['标记清除 Mark-Sweep', '无额外空间', '有碎片，标记阶段会 STW', C.ink],
            ['标记整理 Mark-Compact', '无碎片', '移动对象 + 停顿长', C.ink],
            ['标记清除（CMS 并发）', '并发标记', '浮动垃圾 + 漏标问题', C.ink]
          ];
          alg.forEach((a, k) => {
            const y = 216 + k * 44;
            const on = clamp01((t - 0.35 - k * 0.08) * 3);
            svg.appendChild(H.box(20, y, 860, 38, { stroke: k === 0 ? C.red : C.gray3, opacity: on }));
            svg.appendChild(E(34, y + 24, a[0], { size: 11, weight: 700, fill: a[3], opacity: on }));
            svg.appendChild(E(340, y + 24, a[1], { size: 10, fill: C.ink, opacity: on }));
            svg.appendChild(E(520, y + 24, a[2], { size: 10, fill: C.gray1, opacity: on }));
          });
        }
      },
      {
        label: 'Full GC 排查', cap: '面试场景题：<b>线上服务频繁 Full GC 怎么排查？</b>标准答题路径。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const flow = [
            ['01', '看频次与耗时', 'jstat -gcutil <pid> 1000', 'FGC 次数突增 = 内存泄漏信号'],
            ['02', 'GC 日志', '-XX:+PrintGCDetails -Xlog:gc*:file=gc.log', '看晋升失败 / 元空间不足 / 大对象'],
            ['03', 'dump 内存', 'jmap -dump:live,format=b,file=a.hprof <pid>', '用 MAT / JMC 找 GC Root 引用链'],
            ['04', '线程栈', 'jstack -l <pid> > t.txt', '看有没有线程阻塞在锁上'],
            ['05', '看元空间', 'jcmd <pid> VM.metaspace summary', '动态类 / CGLIB 泄漏经典原因']
          ];
          flow.forEach((f, k) => {
            const y = 40 + k * 68;
            const on = clamp01((t * 6 - k) * 2);
            svg.appendChild(H.box(20, y, 860, 58, { stroke: k === 2 ? C.red : C.ink, sw: 1.5, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, y, 6, 58, { fill: k === 2 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(44, y + 26, f[0], { size: 18, weight: 700, fill: C.red, opacity: on }));
            svg.appendChild(E(100, y + 26, f[1], { size: 12, weight: 700, opacity: on }));
            svg.appendChild(E(300, y + 26, f[2], { size: 9, mono: 1, fill: C.ink, opacity: on }));
            svg.appendChild(E(300, y + 44, f[3], { size: 9, fill: C.gray1, opacity: on }));
            if (k < 4) svg.appendChild(H.line(53, y + 58, 53, y + 68, { stroke: C.red, sw: 1, opacity: on }));
          });
          svg.appendChild(H.box(20, 384, 860, 1, { fill: C.red }));
          svg.appendChild(E(20, 402, '常见根因 TOP3：静态集合无限增长 / 缓存无上限 / 动态代理类或 ThreadLocal 未清理', { size: 10, weight: 700, fill: C.red }));
        }
      }
    ]
  });

  /* ==========================================================
     8. Spring IoC + Bean 生命周期
     ========================================================== */
  R('bean', {
    no: 8, title: 'Spring Bean 生命周期 + 循环依赖', w: 900, h: 410, dur: 1700,
    steps: [
      {
        label: '容器启动', cap: '读取配置 → 解析成 <b>BeanDefinition</b>（一份"菜谱"，还没实例化）→ 存进 BeanFactory。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          const steps = [
            ['ClassPathXmlApplicationContext', '或 @ComponentScan / @Import 的入口'],
            ['BeanFactoryPostProcessor', '占位符替换、配置加密解密'],
            ['BeanDefinitionRegistry', '注册 beanDefinition 到 Map'],
            ['getBean() 触发实例化', '此时才真正 new 对象']
          ];
          steps.forEach((s, k) => {
            const y = 44 + k * 60;
            svg.appendChild(H.box(20, y, 440, 48, { stroke: C.ink, opacity: 0.4 + 0.6 * o }));
            svg.appendChild(H.box(20, y, 4, 48, { fill: C.ink, opacity: o }));
            svg.appendChild(E(40, y + 21, s[0], { size: 11, mono: 1, weight: 700, fill: C.red, opacity: o }));
            svg.appendChild(E(40, y + 39, s[1], { size: 8, fill: C.gray1, opacity: o }));
            if (k < 3) svg.appendChild(H.line(220, y + 48, 220, y + 60, { stroke: C.gray2, opacity: o }));
          });
          svg.appendChild(H.box(490, 44, 390, 178, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(490, 44, 390, 4, { fill: C.ink, opacity: o }));
          svg.appendChild(E(504, 70, 'BeanDefinition 里有什么', { size: 12, weight: 700, ls: .5, opacity: o }));
          ['className / beanClass（反射用）', 'scope（singleton / prototype）', 'lazyInit 是否懒加载', 'initMethod / destroyMethod',
            'dependsOn 依赖的 beanName', '是否 primary / priority'
          ].forEach((s, k) => svg.appendChild(E(504, 94 + k * 21, '· ' + s, { size: 9, mono: 1, fill: C.gray1, opacity: o })));
          svg.appendChild(H.box(20, 250, 860, 56, { stroke: C.red, opacity: o }));
          svg.appendChild(H.box(20, 250, 4, 56, { fill: C.red, opacity: o }));
          svg.appendChild(E(38, 274, 'BeanPostProcessor：Spring 扩展点之王', { size: 12, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(38, 296, 'AOP 代理、@Async、@Validated、@Value 注入全靠它。Aware 接口回调本质也是它做的', { size: 10, fill: C.gray1, opacity: o }));
          const scopes = [['singleton', '默认，容器启动时创建', '单例缓存 map'], ['prototype', '每次 getBean 都 new', '容器不管生命周期'], ['request', '每次请求', 'Web 场景'], ['session', '每个会话', 'Web 场景']];
          scopes.forEach((s, k) => {
            const x = 20 + k * 218;
            svg.appendChild(H.box(x, 326, 202, 60, { stroke: k === 0 ? C.red : C.gray2, sw: k === 0 ? 1.5 : 1, opacity: o }));
            svg.appendChild(E(x + 12, 348, s[0], { size: 11, mono: 1, weight: 700, fill: k === 0 ? C.red : C.ink, opacity: o }));
            svg.appendChild(E(x + 12, 366, s[1], { size: 8, fill: C.gray1, opacity: o }));
            svg.appendChild(E(x + 12, 380, s[2], { size: 8, fill: C.gray2, opacity: o }));
          });
        }
      },
      {
        label: '完整生命周期', cap: '这是<b>最高频面试题</b>。按顺序背下来，再理解每一步是谁在调。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const ph = [
            ['实例化', '反射 new / 构造器', '对象诞生，还没有任何依赖'],
            ['属性填充', 'populateBean', '注入 @Autowired / @Value 的值'],
            ['Aware 回调', 'Aware 接口', 'BeanNameAware → BeanClassLoaderAware → BeanFactoryAware'],
            ['BeanPostProcessor 前置', 'postProcessBeforeInitialization', '初始化前，此时 bean 还是原对象'],
            ['初始化', 'initMethod / @PostConstruct', 'InitializingBean.afterPropertiesSet() 在注解之前'],
            ['BeanPostProcessor 后置', 'postProcessAfterInitialization', 'AOP 代理就在这一步生成'],
            ['使用中', '暴露为单例', '正常业务'],
            ['销毁', '@PreDestroy / DisposableBean', '容器关闭时']
          ];
          const total = ph.length;
          ph.forEach((p, k) => {
            const on = clamp01((t * 9 - k) * 1.8);
            const y = 40 + k * 44;
            const last = k === total - 1;
            svg.appendChild(H.box(20, y, 560, 38, { stroke: last ? C.gray2 : C.ink, sw: 1, fill: last ? C.paper2 : 'none', opacity: 0.35 + 0.65 * on }));
            svg.appendChild(H.box(20, y, 4, 38, { fill: last ? C.gray2 : (k === 5 ? C.red : C.ink), opacity: on }));
            svg.appendChild(E(40, y + 24, p[0], { size: 11, weight: 700, fill: k === 5 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(170, y + 24, p[1], { size: 9, mono: 1, fill: C.gray1, opacity: on }));
            svg.appendChild(E(360, y + 24, p[2], { size: 8, fill: C.gray2, opacity: on }));
            if (k < total - 1) svg.appendChild(H.line(30, y + 38, 30, y + 44, { stroke: C.red, sw: 1, opacity: on }));
          });
          // 时间线
          const to = clamp01((t - 0.5) * 1.6);
          svg.appendChild(H.line(600, 44, 600, 356, { stroke: C.red, sw: 1, opacity: to }));
          svg.appendChild(H.path(`M 600 44 l -4 8 l 8 0 z`, { fill: C.red, opacity: to }));
          svg.appendChild(E(612, 60, '容器启动', { size: 9, weight: 700, fill: C.red, opacity: to }));
          ph.forEach((p, k) => {
            const y = 40 + k * 44 + 19;
            const on = clamp01((t * 9 - k) * 1.8) * to;
            if (on <= 0) return;
            svg.appendChild(H.circ(600, y, 3.5, { fill: C.red, opacity: on }));
          });
          svg.appendChild(E(612, 352, 'getBean() 首次调用', { size: 9, weight: 700, fill: C.red, opacity: to }));
          svg.appendChild(E(612, 372, '（singleton 只走一次）', { size: 8, fill: C.gray2, opacity: to }));
          // 注意
          svg.appendChild(H.box(600, 176, 282, 128, { stroke: C.red, opacity: to }));
          svg.appendChild(H.box(600, 176, 282, 4, { fill: C.red, opacity: to }));
          svg.appendChild(E(614, 200, '三个易错点', { size: 11, weight: 700, fill: C.red, opacity: to }));
          [['① 初始化顺序', '@PostConstruct → InitializingBean → initMethod'],
           ['② 代理在哪生成', 'postProcessAfterInitialization，@Transactional 靠它'],
           ['③ Aware 与注入', 'BeanFactoryAware 在 Aware 里，@Autowired 在它之前']
          ].forEach((s, k) => {
            svg.appendChild(E(614, 220 + k * 28, s[0], { size: 9, weight: 700, fill: C.ink, opacity: to }));
            svg.appendChild(E(614, 233 + k * 28, s[1], { size: 8, fill: C.gray1, opacity: to }));
          });
        }
      },
      {
        label: '循环依赖', cap: '三级缓存解决<b>单例</b>的 setter 注入循环依赖。原理：<b>提前暴露一个半成品 Bean 的早期引用</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(clamp01(t * 1.6));
          // A 依赖 B，B 依赖 A
          svg.appendChild(H.box(20, 44, 300, 130, { stroke: C.red, sw: 1.5, opacity: o }));
          svg.appendChild(H.box(20, 44, 300, 4, { fill: C.red, opacity: o }));
          svg.appendChild(E(34, 74, 'A.setB(B b)', { size: 13, mono: 1, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(34, 96, '1. 实例化 A（空对象）', { size: 10, mono: 1, fill: C.gray1, opacity: o }));
          svg.appendChild(E(34, 114, '2. 实例化 B', { size: 10, mono: 1, fill: C.gray1, opacity: o }));
          svg.appendChild(E(34, 132, '3. B.populate → 需要 A', { size: 10, mono: 1, fill: C.red, opacity: o }));
          svg.appendChild(E(34, 152, '4. getBean(A) → 一级缓存有！', { size: 10, mono: 1, fill: C.red, weight: 700, opacity: o }));
          svg.appendChild(E(34, 170, '5. 拿到 A 的早期引用，注入成功', { size: 10, mono: 1, fill: C.gray1, opacity: o }));
          // 三级缓存
          const caches = [
            ['一级', 'singletonObjects', '完整初始化后的成品 Bean', C.red],
            ['二级', 'earlySingletonObjects', '早期暴露（若被代理则已代理）', C.ink],
            ['三级', 'singletonFactories', 'ObjectFactory 工厂 lambda', C.ink]
          ];
          caches.forEach((c, k) => {
            const y = 44 + k * 82;
            svg.appendChild(H.box(360, y, 520, 68, { stroke: c[3], sw: 1.5, opacity: 0.4 + 0.6 * o }));
            svg.appendChild(H.box(360, y, 5, 68, { fill: c[3], opacity: o }));
            svg.appendChild(H.chip(374, y + 10, c[0], { w: 34, h: 20, size: 9, fill: c[3], tc: '#fff', stroke: c[3], opacity: o }));
            svg.appendChild(E(420, y + 24, c[1], { size: 10, mono: 1, weight: 700, opacity: o }));
            svg.appendChild(E(420, y + 44, c[2], { size: 9, fill: C.gray1, opacity: o }));
            svg.appendChild(E(420, y + 60, k === 2 ? 'getEarlyBeanReference() 在这里' : (k === 1 ? 'AOP 代理后的引用' : '成品'), { size: 8, fill: k === 0 ? C.red : C.gray2, opacity: o }));
          });
          svg.appendChild(H.line(360, 130, 330, 130, { stroke: C.red, sw: 1.5, opacity: o, dash: '3 3' }));
          // 为什么三级
          const wo = clamp01((t - 0.5) * 2);
          svg.appendChild(H.box(360, 300, 520, 96, { stroke: C.red, opacity: wo }));
          svg.appendChild(H.box(360, 300, 520, 4, { fill: C.red, opacity: wo }));
          svg.appendChild(E(374, 326, '为什么需要三级，两级不行吗？', { size: 11, weight: 700, fill: C.red, opacity: wo }));
          svg.appendChild(E(374, 346, '为了「没被依赖的 bean 也能被代理」。三级存的是工厂，getBean 时才决定要不要生成代理；', { size: 9, fill: C.gray1, opacity: wo }));
          svg.appendChild(E(374, 362, '如果只有二级，就得在放入二级缓存时就生成代理，此时还没走完 populateBean，', { size: 9, fill: C.gray1, opacity: wo }));
          svg.appendChild(E(374, 378, '拿不到最终 bean，代理对象和真实对象会分离（这就是 allowCircularReferences 的历史争议）。', { size: 9, fill: C.gray1, opacity: wo }));
        }
      },
      {
        label: '解决不了的情况', cap: '<b>Spring 2.6 后默认禁止循环依赖</b>。构造器注入、prototype 作用域、多例互相依赖都无解。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const cases = [
            { t: '构造器注入', ok: false, why: '实例化还没完成就要用另一个对象，最为致命', fix: '@Lazy 延迟到实际调用时' },
            { t: 'prototype 作用域', ok: false, why: '不走缓存，每次新建，缓存机制失效', fix: '改 singleton / 加 @Lazy' },
            { t: 'setter 注入 + singleton', ok: true, why: '三级缓存可以解决', fix: '保持现状即可' },
            { t: '多个 Bean 互相依赖（≥3）', ok: false, why: 'Spring2.6 后直接报 BeanCurrentlyInCreationException', fix: '考虑 @Lazy 或事件驱动解耦' }
          ];
          cases.forEach((c, k) => {
            const y = 44 + k * 78;
            const on = clamp01((t * 4.5 - k) * 2);
            svg.appendChild(H.box(20, y, 860, 66, { stroke: c.ok ? C.ink : C.red, sw: 1.5, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, y, 6, 66, { fill: c.ok ? C.ink : C.red, opacity: on }));
            svg.appendChild(H.chip(40, y + 12, c.ok ? 'OK' : 'FAIL', { w: 42, h: 20, size: 9, fill: c.ok ? C.ink : C.red, tc: '#fff', stroke: c.ok ? C.ink : C.red, opacity: on }));
            svg.appendChild(E(98, y + 28, c.t, { size: 12, weight: 700, opacity: on }));
            svg.appendChild(E(98, y + 48, c.why, { size: 9, fill: C.gray1, opacity: on }));
            svg.appendChild(H.line(460, y + 12, 460, y + 54, { stroke: C.gray3, sw: 0.5, opacity: on }));
            svg.appendChild(E(478, y + 30, '对策：' + c.fix, { size: 9, fill: c.ok ? C.gray1 : C.red, opacity: on }));
            svg.appendChild(E(478, y + 48, c.ok ? '（Spring2.6 默认仍允许）' : '（否则启动直接抛异常）', { size: 8, fill: C.gray2, opacity: on }));
          });
          svg.appendChild(H.box(20, 366, 860, 1, { fill: C.red }));
          svg.appendChild(E(20, 388, '真正该做的不是「怎么打开循环依赖」，而是「怎么把循环依赖消掉」—— 用事件驱动或抽第三层来解耦', { size: 10, weight: 700, fill: C.red }));
        }
      }
    ]
  });

  /* ==========================================================
     9. ConcurrentHashMap
     ========================================================== */
  R('chm', {
    no: 9, title: 'ConcurrentHashMap（JDK 8）', w: 900, h: 400, dur: 1700,
    steps: [
      {
        label: '对比 HashMap', cap: 'JDK 7 用 <b>Segment 数组分段锁</b>（16 段，锁粒度还是太大）；JDK 8 改成 <b>CAS + synchronized 锁单个桶</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // JDK7
          svg.appendChild(E(20, 34, 'JDK 7 — Segment 分段锁', { size: 11, weight: 700, ls: 1, opacity: o }));
          svg.appendChild(H.box(20, 44, 400, 150, { stroke: C.gray2, opacity: o }));
          for (let k = 0; k < 4; k++) {
            const x = 34 + k * 94;
            svg.appendChild(H.box(x, 60, 84, 120, { stroke: k === 1 ? C.red : C.gray3, sw: k === 1 ? 1.5 : 1, opacity: o }));
            svg.appendChild(E(x + 42, 78, 'Seg' + k, { size: 9, mono: 1, anchor: 'middle', fill: k === 1 ? C.red : C.gray2, opacity: o }));
            for (let j = 0; j < 4; j++) {
              svg.appendChild(H.box(x + 12, 88 + j * 22, 60, 16, { stroke: C.gray3, opacity: o * .7 }));
            }
            if (k === 1) {
              svg.appendChild(H.box(x - 6, 44, 96, 142, { stroke: C.red, sw: 2, fill: 'none', opacity: o }));
              svg.appendChild(E(x + 42, 200, 'Segment 0 被锁 → 整个段不可写', { size: 8, fill: C.red, anchor: 'middle', opacity: o }));
            }
          }
          svg.appendChild(E(20, 214, '问题：并发度被死死限制在 16；扩容要换 Segment（比 CHM 迁移更麻烦）', { size: 9, fill: C.red, opacity: o }));
          // JDK8
          svg.appendChild(E(460, 34, 'JDK 8 — CAS + synchronized 锁桶头节点', { size: 11, weight: 700, ls: 1, opacity: clamp01((t - 0.35) * 2.5) }));
          const o2 = clamp01((t - 0.35) * 2.5);
          svg.appendChild(H.box(460, 44, 420, 150, { stroke: C.red, opacity: o2 }));
          for (let k = 0; k < 8; k++) {
            const x = 474 + k * 50;
            const lock = k === 3;
            svg.appendChild(H.box(x, 60, 44, 100, { stroke: lock ? C.red : C.gray3, sw: lock ? 1.5 : 1, opacity: o2 }));
            svg.appendChild(E(x + 22, 78, k, { size: 8, mono: 1, anchor: 'middle', fill: lock ? C.red : C.gray2, opacity: o2 }));
            svg.appendChild(H.circ(x + 22, 100, 6, { fill: lock ? C.red : C.ink, opacity: o2 }));
            if (lock) {
              svg.appendChild(H.path(`M ${x - 8} 48 l 60 0`, { stroke: C.red, sw: 2, opacity: o2 }));
              svg.appendChild(E(x + 22, 132, 'synchronized', { size: 7, mono: 1, anchor: 'middle', fill: C.red, opacity: o2 }));
            }
          }
          svg.appendChild(E(474, 182, '只锁住一个桶的 head 节点；其他 7 个桶完全并发', { size: 9, fill: C.ink, opacity: o2 }));
          svg.appendChild(E(474, 200, '空桶 → 无需加锁，直接 CAS 放入', { size: 9, fill: C.gray1, opacity: o2 }));
          // 对比表
          const cmp = [['数据结构', 'Segment[] + HashEntry[]', 'Node[] + 桶头加锁', 0],
                     ['并发控制', 'Segment 粒度 ReentrantLock', 'CAS + synchronized', 1],
                     ['扩容', '重新 hash 到新 Segment', 'ForwardingNode，桶内拆分 lo/hi', 2],
                     ['size()', '先求和再取模（有误差）', 'baseCount + CounterCell（精确）', 3]];
          svg.appendChild(E(20, 250, '关键差异', { size: 10, weight: 700, ls: 1, opacity: o }));
          cmp.forEach((r, k) => {
            const y = 262 + k * 30;
            svg.appendChild(H.box(20, y, 860, 28, { stroke: C.gray3, opacity: 0.4 + 0.6 * o }));
            svg.appendChild(E(34, y + 18, r[0], { size: 10, weight: 700, opacity: o }));
            svg.appendChild(E(200, y + 18, r[1], { size: 9, mono: 1, fill: C.gray1, opacity: o }));
            svg.appendChild(E(580, y + 18, r[2], { size: 9, mono: 1, fill: C.red, opacity: o }));
          });
        }
      },
      {
        label: 'put 流程', cap: '空桶直接 CAS 放置；非空桶先 CAS 锁头节点，失败就自旋重试。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const flow = [
            ['① 计算 hash', 'spread(key.hashCode())', '0 if key == null', 0],
            ['② 桶为空？', 'table[i] == null', '→ 直接 new Node 并 CAS 放置', .18],
            ['③ 桶头是空节点？', 'f instanceof ReservationNode', 'JDK7 遗留的空占位 JDK8 已删', .34],
            ['④ CAS 锁头节点', 'synchronized (f)', '失败 → 自旋，重试直到成功', .48],
            ['⑤ 遍历链表', 'equals 判断 key', '相同 → 覆盖 value（返回旧值）', .64],
            ['⑥ 挂链表尾部', 'addCount 计数', '超过 8 且表 ≥64 → 树化', .8]
          ];
          flow.forEach((f, k) => {
            const y = 40 + k * 58;
            const on = clamp01((t * 6.5 - k * 1.1) * 2.2);
            svg.appendChild(H.box(20, y, 470, 48, { stroke: k === 1 || k === 3 ? C.red : C.ink, sw: 1.5, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, y, 4, 48, { fill: k === 1 || k === 3 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(40, y + 21, f[0], { size: 12, weight: 700, fill: k === 1 || k === 3 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(40, y + 40, f[1], { size: 9, mono: 1, fill: C.gray1, opacity: on }));
            svg.appendChild(H.line(510, y + 24, 560, y + 24, { stroke: C.gray3, dash: '3 3', opacity: on * .7 }));
            svg.appendChild(E(576, y + 28, f[2], { size: 9, fill: k === 3 ? C.red : C.gray1, opacity: on }));
            if (k < 5) svg.appendChild(H.line(255, y + 48, 255, y + 58, { stroke: C.gray2, opacity: on }));
          });
          // volatile
          const vo = clamp01((t - 0.3) * 2);
          svg.appendChild(H.box(20, 396 - 40, 860, 44, { stroke: C.red, opacity: vo }));
          svg.appendChild(E(34, 368, '三个 volatile 字段（源码）', { size: 10, weight: 700, fill: C.red, opacity: vo }));
          svg.appendChild(E(34, 388, 'volatile Node<K,V>[] table  |  volatile int sizeCtl（-1 扩容中 / 0 未初始化 / 阈值）|  volatile int baseCount', { size: 9, mono: 1, fill: C.gray1, opacity: vo }));
        }
      },
      {
        label: 'size() 为什么慢', cap: 'JDK7 的 size() 是<b>估算值</b>（CountingCell 求和取模，误差可达 10%）；JDK8 用 <b>baseCount + CounterCell 数组</b>，做到精确。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 弱一致
          svg.appendChild(H.box(20, 44, 420, 300, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(20, 44, 420, 4, { fill: C.ink, opacity: o }));
          svg.appendChild(E(34, 70, 'size() 的三种语义（高频追问）', { size: 12, weight: 700, ls: .5, opacity: o }));
          [['size()', '元素个数', 'JDK8 精确；JDK7 是估算'], ['isEmpty()', '是否为空', '其实用 size() == 0'],
           ['containsKey / containsValue', '存在性', 'O(1) / O(n)'], ['get()', '取值', '返回 null（不抛异常）']
          ].forEach((r, k) => {
            const y = 88 + k * 40;
            svg.appendChild(H.box(34, y, 392, 34, { stroke: C.gray3, opacity: o }));
            svg.appendChild(E(48, y + 22, r[0], { size: 10, mono: 1, weight: 700, fill: k === 0 ? C.red : C.ink, opacity: o }));
            svg.appendChild(E(250, y + 22, r[1], { size: 9, fill: C.gray2, opacity: o }));
            svg.appendChild(E(330, y + 22, r[2], { size: 8, fill: C.gray1, opacity: o }));
          });
          svg.appendChild(E(34, 268, '为什么 CHM 不支持 null key / value？', { size: 11, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(34, 288, '① 并发下 null 无法区分「不存在」还是「值就是 null」', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(E(34, 304, '② computeIfAbsent 遇 null 会 NPE 死循环', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(E(34, 320, '③ 强行放 null 会让 containsKey 永远返回 false', { size: 9, fill: C.gray1, opacity: o }));
          // CounterCell
          svg.appendChild(H.box(470, 44, 410, 300, { stroke: C.red, opacity: o }));
          svg.appendChild(H.box(470, 44, 410, 4, { fill: C.red, opacity: o }));
          svg.appendChild(E(484, 70, 'CounterCell 精确计数原理', { size: 12, weight: 700, fill: C.red, ls: .5, opacity: o }));
          svg.appendChild(H.chip(484, 84, 'baseCount', { w: 100, h: 24, size: 10, fill: C.ink, tc: '#fff', stroke: C.ink, opacity: o }));
          svg.appendChild(E(600, 100, '无竞争时的快速计数', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(H.path(`M 534 116 l 0 16 l 60 0 l 0 0`, { stroke: C.red, opacity: o }));
          svg.appendChild(E(560, 146, '检测到竞争（CAS 失败）', { size: 9, fill: C.red, opacity: o }));
          for (let k = 0; k < 4; k++) {
            svg.appendChild(H.chip(484 + k * 100, 162, 'cell' + k, { w: 88, h: 24, size: 9, stroke: C.gray2, tc: C.gray1, opacity: o }));
          }
          svg.appendChild(E(484, 208, '每个线程（按 probe 值）分到一个 cell，各自 CAS 累加', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(E(484, 226, 'sumCount() 把 baseCount + 所有 cell 值相加', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(E(484, 244, '→ 结果精确，且把热点打散到多个变量上（伪共享规避）', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(H.box(484, 262, 382, 70, { fill: C.red, opacity: o }));
          svg.appendChild(E(498, 286, '对比 LongAdder：同一个套路', { size: 11, weight: 700, fill: '#fff', opacity: o }));
          svg.appendChild(E(498, 308, '热点分散到 Cell[]，sum 时再累加', { size: 9, fill: '#fff', opacity: o }));
          svg.appendChild(E(498, 326, '面试可类比：为什么 ConcurrentHashMap 也能做分布式锁的参考', { size: 8, fill: '#fff', opacity: o }));
        }
      }
    ]
  });

})(window.VIZ);
