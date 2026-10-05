/* ============================================================
   核心图解集合
   ============================================================ */
(function (V) {
  'use strict';
  const R = (id, s) => V.register(id, s);
  const H = V.H, e = V.e;
  const C = V.C;   // shared live reference — readColors() runs on mount
  const easeOut = V.easeOut, easeIn = V.easeIn, clamp01 = V.clamp01, lerp = V.lerp;

  /* ==========================================================
     1. JVM 内存与对象的一生
     ========================================================== */
  R('jvm', {
    no: 1, title: 'new 一个对象，内存发生了什么', w: 900, h: 400, dur: 1600,
    steps: [
      {
        label: '线程开始', cap: 'JVM 启动后，<b>每个线程</b>独享一块栈内存和一个本地方法栈引用。堆是全局共享的。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          svg.appendChild(H.box(20, 40, 400, 300, { stroke: C.ink }));
          svg.appendChild(E(30, 32, 'JVM 运行时数据区（简化）', { size: 11, weight: 700, ls: 1 }));
          // 线程区
          svg.appendChild(H.box(36, 60, 200, 260, { fill: C.paper2, stroke: C.gray2 }));
          svg.appendChild(E(44, 78, '线程私有', { size: 10, fill: C.gray1, ls: 1 }));
          svg.appendChild(H.box(46, 88, 180, 44, { stroke: C.ink }));
          svg.appendChild(E(56, 106, '虚拟机栈', { size: 11, weight: 700 }));
          svg.appendChild(E(56, 120, 'main() 栈帧 · 局部变量表', { size: 9, fill: C.gray1 }));
          svg.appendChild(H.box(46, 142, 180, 44, { stroke: C.gray3, dash: '3 3' }));
          svg.appendChild(E(56, 160, '本地方法栈', { size: 11, fill: C.gray2 }));
          svg.appendChild(E(56, 174, 'Native 调用', { size: 9, fill: C.gray2 }));
          svg.appendChild(H.box(46, 196, 180, 44, { stroke: C.gray3, dash: '3 3' }));
          svg.appendChild(E(56, 214, '程序计数器', { size: 11, fill: C.gray2 }));
          svg.appendChild(E(56, 228, '当前字节码行号', { size: 9, fill: C.gray2 }));
          svg.appendChild(H.box(46, 250, 180, 44, { stroke: C.gray3, dash: '3 3' }));
          svg.appendChild(E(56, 268, '堆 →', { size: 11, fill: C.gray2 }));
          svg.appendChild(E(56, 282, '所有线程共享', { size: 9, fill: C.gray2 }));
          // 共享区
          svg.appendChild(H.box(250, 60, 156, 160, { fill: C.red, stroke: C.red, opacity: 0.06 }));
          svg.appendChild(H.box(250, 60, 156, 160, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(E(260, 78, '堆 HEAP', { size: 11, weight: 700, fill: C.red }));
          svg.appendChild(E(260, 96, '对象 · 数组 · 实际数据', { size: 9, fill: C.gray1 }));
          svg.appendChild(H.chip(260, 110, '年轻代', { w: 60, h: 20, size: 9, fill: C.red, tc: '#fff', stroke: C.red }));
          svg.appendChild(H.chip(326, 110, '老年代', { w: 60, h: 20, size: 9, stroke: C.gray2, tc: C.gray1 }));
          svg.appendChild(H.box(250, 234, 156, 86, { stroke: C.gray2 }));
          svg.appendChild(E(260, 252, '元空间 METASPACE', { size: 10, weight: 700 }));
          svg.appendChild(E(260, 268, '类元信息 · 常量池', { size: 9, fill: C.gray1 }));
          svg.appendChild(E(260, 282, 'JDK8 前叫永久代(堆内)', { size: 9, fill: C.red }));
          svg.appendChild(E(260, 296, 'JDK8+ 用本地内存', { size: 9, fill: C.gray2 }));
          // 右侧说明
          svg.appendChild(H.line(430, 40, 430, 340, { stroke: C.gray3, sw: 0.5 }));
          svg.appendChild(E(450, 62, '一句话记住', { size: 10, fill: C.gray2, ls: 1 }));
          const notes = [
            ['线程私有', '栈：方法调用 + 局部变量 + 操作数栈', C.ink],
            ['线程共享', '堆：所有对象，GC 主战场', C.red],
            ['本地内存', '元空间：类加载后常驻，不受 -Xmx 限制', C.ink],
            ['会 OOM 的地方', '栈 → StackOverflowError', C.ink],
            ['', '堆 → OutOfMemoryError: Java heap space', C.ink],
            ['', '元空间 → OutOfMemoryError: Metaspace', C.ink]
          ];
          notes.forEach((n, k) => svg.appendChild(E(450, 90 + k * 26, n[0], { size: 10, weight: 700, fill: n[2] })));
          notes.forEach((n, k) => { if (n[1]) svg.appendChild(E(530, 90 + k * 26, n[1], { size: 10, fill: C.gray1 })); });
        }
      },
      {
        label: 'new：检查类', cap: '执行 <code>new User()</code>：先在<b>方法区</b>查这个类是否已加载。没有 → 触发类加载；有 → 直接用。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // 代码
          svg.appendChild(H.box(20, 40, 300, 90, { fill: C.code }));
          svg.appendChild(E(36, 66, 'User u = new User();', { size: 13, mono: 1, fill: '#fff' }));
          svg.appendChild(E(36, 92, '// 栈 ← 引用 u', { size: 10, mono: 1, fill: C.gray2 }));
          // 步骤 1
          const s1 = easeOut(t * 3);
          svg.appendChild(H.box(370, 40, 500, 60, { stroke: C.gray3, dash: '4 3', opacity: 0.3 + 0.7 * s1 }));
          svg.appendChild(H.box(370, 40, 20, 60, { fill: C.red, opacity: s1 }));
          svg.appendChild(E(400, 66, 'STEP 1  解析 new 指令 → 查方法区', { size: 12, weight: 700, fill: C.red, opacity: s1 }));
          svg.appendChild(E(400, 84, '类是否已加载？ → 元空间', { size: 10, fill: C.gray1, opacity: s1 }));
          // 结果
          if (t > 0.25) {
            const o = clamp01((t - 0.25) * 3);
            svg.appendChild(H.box(370, 116, 500, 56, { stroke: C.ink, opacity: o }));
            svg.appendChild(E(400, 142, '类已存在 → 跳过加载，直接下一步', { size: 11, fill: C.ink, opacity: o }));
            svg.appendChild(E(400, 160, '若不存在 → ClassLoader 双亲委派加载（第 2 张图）', { size: 9, fill: C.gray2, opacity: o }));
          }
          svg.appendChild(E(20, 190, '关键：判断这一步是「类是否在内存」，不是「类是否存在硬盘」', { size: 10, fill: C.red, weight: 700 }));
        }
      },
      {
        label: '分配堆内存', cap: '类确认后，在<b>堆</b>划一块内存存对象。分配方式取决于<b>逃逸分析</b>：不逃逸 → 栈上分配。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          svg.appendChild(E(20, 32, '堆内存分配的三种路径（面试高频）', { size: 11, weight: 700, ls: 1 }));
          const paths = [
            { t: '指针碰撞', d: '内存绝对连续 → 一个指针后移', hot: 'Serial / ParNew', col: C.red },
            { t: '空闲列表', d: '内存不连续 → 记录空闲块，find first fit', hot: 'CMS / G1', col: C.ink },
            { t: 'TLAB', d: '每个线程预先分配一块私有区域，避���频繁 CAS', hot: '所有收集器默认', col: C.ink }
          ];
          paths.forEach((p, k) => {
            const y = 56 + k * 84;
            const on = t * 3 > k ? 1 : 0;
            svg.appendChild(H.box(20, y, 440, 70, { stroke: on ? p.col : C.gray3, sw: on ? 1.5 : 1, opacity: 0.35 + 0.65 * on }));
            svg.appendChild(H.box(20, y, 4, 70, { fill: p.col, opacity: on }));
            svg.appendChild(E(38, y + 26, p.t, { size: 13, weight: 700, fill: p.col }));
            svg.appendChild(E(38, y + 44, p.d, { size: 10, fill: C.gray1 }));
            svg.appendChild(H.chip(330, y + 12, p.hot, { w: 112, h: 20, size: 9, stroke: C.gray2, tc: C.gray1 }));
          });
          // 指针碰撞示意
          if (t > 0.35) {
            const o = clamp01((t - 0.35) * 2.5);
            svg.appendChild(E(500, 32, '指针碰撞示意', { size: 10, fill: C.gray2, ls: 1, opacity: o }));
            const bx = 500, by = 56, w = 370, h = 34;
            svg.appendChild(H.box(bx, by, w, h, { stroke: C.ink, opacity: o }));
            const used = 120 + 200 * easeIn(o);
            svg.appendChild(H.box(bx + 1, by + 1, used, h - 2, { fill: C.paper3, opacity: o }));
            svg.appendChild(H.line(bx + used, by - 6, bx + used, by + h + 6, { stroke: C.red, sw: 1.5, opacity: o }));
            svg.appendChild(H.path(`M ${bx + used} ${by - 6} l 6 10 l -12 0 z`, { fill: C.red, opacity: o }));
            svg.appendChild(E(bx + 8, by + 22, '已分配', { size: 9, fill: C.gray1, opacity: o }));
            svg.appendChild(E(bx + used + 12, by + 22, '空闲区', { size: 9, fill: C.gray1, opacity: o }));
            svg.appendChild(E(bx, by + h + 22, '每次分配 = 移动指针 + 一次 CAS', { size: 10, fill: C.red, weight: 700, opacity: o }));
          }
        }
      },
      {
        label: '构造与内存零值', cap: '① <b>内存先全部置零</b>（这就是 int 默认 0、boolean 默认 false 的来源）② 执行构造方法赋值 ③ 栈中压入引用。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 栈
          svg.appendChild(H.box(20, 44, 180, 120, { stroke: C.ink }));
          svg.appendChild(E(32, 62, '栈 main() 栈帧', { size: 10, fill: C.gray1, ls: 1 }));
          svg.appendChild(H.box(34, 72, 152, 76, { stroke: C.gray2 }));
          svg.appendChild(E(44, 90, '局部变量表', { size: 9, fill: C.gray1 }));
          svg.appendChild(E(44, 108, 'u  →  引用 0x0012', { size: 11, mono: 1, fill: C.red, opacity: o }));
          svg.appendChild(E(44, 126, '(引用指向堆中对象首地址)', { size: 8, fill: C.gray2, opacity: o }));
          // 箭头
          const ax = lerp(186, 250, o);
          svg.appendChild(H.line(186, 104, ax, 104, { stroke: C.red, sw: 1.5, arrow: false, opacity: o }));
          svg.appendChild(H.path(`M ${ax} 104 l 8 5 l -16 0 z`, { fill: C.red, opacity: o, transform: `translate(-8 0)` }));
          // 堆
          svg.appendChild(H.box(250, 44, 300, 120, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(E(262, 62, '堆 — User 实例', { size: 10, fill: C.red, weight: 700, ls: 1 }));
          // 内存布局
          const fields = [['header', 'Mark Word + Class', 130], ['int age', '32 位', 100], ['String name', '引用 8B', 160], ['boolean alive', '1 位', 120]];
          let yy = 72;
          fields.forEach((f, k) => {
            const fo = clamp01((t - 0.2 - k * 0.15) * 4);
            svg.appendChild(H.box(262, yy, f[2], 20, { fill: k === 0 ? C.paper3 : 'none', stroke: C.gray2, opacity: fo }));
            svg.appendChild(E(270, yy + 14, f[0], { size: 9, mono: 1, fill: C.ink, opacity: fo }));
            svg.appendChild(E(262 + f[2] - 8, yy + 14, f[1], { size: 8, fill: C.gray2, opacity: fo, anchor: 'end' }));
            yy += 22;
          });
          // 右
          svg.appendChild(E(580, 60, '三个「零」记住', { size: 10, fill: C.gray2, ls: 1 }));
          [['① 内存清零', 'int=0 / boolean=false / 对象=null'],
           ['② 执行 <init>', '字段赋值、代码块、构造器体'],
           ['③ 压栈引用', '栈帧里存的是地址，不是对象']
          ].forEach((r, k) => {
            const ro = clamp01((t - 0.3 - k * 0.18) * 3.5);
            svg.appendChild(E(580, 88 + k * 46, r[0], { size: 11, weight: 700, fill: k === 0 ? C.red : C.ink, opacity: ro }));
            svg.appendChild(E(580, 106 + k * 46, r[1], { size: 9, fill: C.gray1, mono: 0, opacity: ro }));
          });
          // 排版
          svg.appendChild(E(20, 220, '对象内存布局（64 位 HotSpot，压缩指针）', { size: 10, fill: C.gray2, ls: 1 }));
          const seg = [['对象头', 'Mark Word 8B', 130, C.red], ['对象头', 'Klass 指针 4B', 110, C.ink], ['对齐', '8B', 60, C.gray2], ['数据区', '实例字段', 300, C.ink]];
          let sx = 20;
          seg.forEach(s => {
            svg.appendChild(H.box(sx, 236, s[2], 40, { fill: s[3] === C.red ? C.red : 'none', stroke: s[3], sw: 1.5, opacity: 0.3 + 0.7 * o }));
            svg.appendChild(E(sx + 10, 256, s[0], { size: 9, weight: 700, fill: s[3] === C.red ? '#fff' : C.ink, opacity: o }));
            svg.appendChild(E(sx + 10, 268, s[1], { size: 8, fill: s[3] === C.red ? '#fff' : C.gray1, opacity: o, mono: 0 }));
            sx += s[2] + 8;
          });
          svg.appendChild(E(20, 300, 'JOL 工具验证：java -XX:+PrintFlagsFinal -version | grep -i objectalignment', { size: 9, mono: 1, fill: C.gray2, opacity: o }));
        }
      }
    ]
  });

  /* ==========================================================
     2. 类加载：双亲委派
     ========================================================== */
  R('classload', {
    no: 2, title: '双亲委派：类加载器怎么找类', w: 900, h: 380, dur: 1700,
    steps: [
      {
        label: '发起加载', cap: '任何类都要<b>先经过加载 → 验证 → 准备 → 解析 → 初始化</b> 五个阶段，加载阶段就是找 Class 文件。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const stages = [['加载', '读 Class 文件'], ['验证', '文件格式 / 字节码'], ['准备', 'static 赋默认值 0'], ['解析', '常量池 → 直接引用'], ['初始化', '执行 static 代码块']];
          stages.forEach((s, k) => {
            const x = 20 + k * 174;
            const on = t * 5 > k ? 1 : 0;
            svg.appendChild(H.box(x, 48, 158, 76, { stroke: k === 0 ? C.red : C.ink, sw: k === 0 ? 1.5 : 1, opacity: 0.3 + 0.7 * on }));
            svg.appendChild(H.box(x, 48, 158, 4, { fill: k === 0 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(x + 14, 76, `0${k + 1}  ${s[0]}`, { size: 14, weight: 700, fill: k === 0 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(x + 14, 100, s[1], { size: 10, fill: C.gray1, opacity: on }));
            if (k < 4) svg.appendChild(H.line(x + 158, 86, x + 174, 86, { stroke: C.gray2, arrow: true, opacity: on }));
          });
          svg.appendChild(E(20, 160, '面试常问：解析阶段会发生什么？→ 常量池中的符号引用替换为直接引用（可延迟到使用前）', { size: 10, fill: C.gray1 }));
          svg.appendChild(E(20, 178, '哪些类是「不遵循双亲委派」的？→ JDBC Driver、Servlet 容器（JSP/Tomcat）、JDK9+ 的 Platform ClassLoader（部分）', { size: 10, fill: C.gray1 }));
          svg.appendChild(H.box(20, 200, 860, 46, { stroke: C.red }));
          svg.appendChild(H.box(20, 200, 4, 46, { fill: C.red }));
          svg.appendChild(E(38, 222, '准备阶段给 static 赋「默认值」而不是「初始值」—— 但 final static 基本类型/字符串在准备阶段就是常量值', { size: 10, fill: C.ink }));
          svg.appendChild(E(38, 238, 'static final int a = 128  → 准备阶段 a = 128；    static final int b = a + 1  → 准备阶段 b = 0（编译期常量折叠）', { size: 9, mono: 1, fill: C.gray1 }));
        }
      },
      {
        label: '向上委派', cap: 'Application ClassLoader <b>不自己找，先问父加载器</b>。这就是「双亲委派」—— 优先让更「权威」的加载器去加载。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const loaders = [
            { n: 'AppClassLoader', s: 'classpath 下的类（我们写的代码）', col: C.red },
            { n: 'PlatformClassLoader', s: 'JDK9+：java.* / javax.* 等平台模块', col: C.ink },
            { n: 'BootStrapClassLoader', s: 'C/C++ 实现，rt.jar 核心类', col: C.ink }
          ];
          loaders.forEach((L, k) => {
            const x = 60 + k * 260, y = 60 + k * 30;
            const on = t * 3.5 > k ? 1 : 0;
            svg.appendChild(H.box(x, y, 240, 64, { stroke: L.col, sw: k === 0 ? 1.5 : 1, opacity: 0.35 + 0.65 * on }));
            svg.appendChild(H.box(x, y, 4, 64, { fill: L.col, opacity: on }));
            svg.appendChild(E(x + 16, y + 26, L.n, { size: 12, weight: 700, fill: L.col, mono: 1, opacity: on }));
            svg.appendChild(E(x + 16, y + 44, L.s, { size: 9, fill: C.gray1, opacity: on }));
            if (k < 2) {
              const ay = y - 12;
              svg.appendChild(H.line(x + 120, y - 4, x + 120, ay, { stroke: C.gray2, arrow: true, opacity: on }));
            }
          });
          // 请求线
          svg.appendChild(H.path('M 300 200 C 300 260, 620 260, 620 200', { stroke: C.red, sw: 1.5, dash: '4 3', opacity: 0.4 + 0.6 * t }));
          svg.appendChild(E(300, 288, 'loadClass("com.huawei.Foo")', { size: 10, mono: 1, fill: C.gray1, anchor: 'middle', opacity: t }));
          svg.appendChild(E(620, 288, '找不到才回头 findClass', { size: 10, mono: 0, fill: C.red, weight: 700, anchor: 'middle', opacity: t }));
          svg.appendChild(E(60, 336, '安全性设计：即使你自定义同名类 java.lang.String，也永远加载不到，避免核心类被替换', { size: 10, fill: C.gray1 }));
        }
      },
      {
        label: '委派失败', cap: '父加载器都找不到 → <b>子类自己找</b>（URLClassPath → 类路径），找到后链接、初始化。整个过程有缓存（findLoadedClass）。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          svg.appendChild(H.box(20, 44, 400, 130, { stroke: C.ink, opacity: o }));
          svg.appendChild(E(34, 66, 'AppClassLoader.findClass()', { size: 12, weight: 700, mono: 1, opacity: o }));
          ['① 检查 findLoadedClass() 缓存', '② 读取 classpath 下的 .class 字节流', '③ defineClass() 定义为 Class 对象', '④ 返回给调用方']
            .forEach((s, k) => svg.appendChild(E(34, 92 + k * 20, s, { size: 10, fill: k === 0 ? C.red : C.gray1, mono: 0, opacity: o })));
          svg.appendChild(H.box(440, 44, 420, 130, { stroke: C.red, sw: 1.5, opacity: o }));
          svg.appendChild(H.box(440, 44, 420, 4, { fill: C.red, opacity: o }));
          svg.appendChild(E(454, 74, 'Class 对象 = 类的唯一身份', { size: 12, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(454, 98, '两个类「长得一样」但加载器不同 →  强制类型转换必然 ClassCastException', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(454, 120, 'Tomcat 里的 WebAppClassLoader 共享同一份 Tomcat 类 → 内存泄漏经典原因', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(454, 142, '排查命令：jcmd <pid> VM.classloaders  /  -verbose:class', { size: 9, mono: 1, fill: C.gray2, opacity: o }));
          svg.appendChild(H.box(20, 200, 840, 54, { stroke: C.gray2, dash: '4 3', opacity: o }));
          svg.appendChild(E(34, 224, '面试标准答：为什么要有双亲委派？→ 保证类的唯一性 + 安全性 + 避免核心类被重复加载浪费内存', { size: 11, weight: 500, opacity: o }));
          svg.appendChild(E(34, 244, 'Spring 打破了吗？→ Spring 的 @Configuration 用 CGLib 重写 @Bean 方法，但它不是 ClassLoader，仍遵守双亲委派', { size: 10, fill: C.gray1, opacity: o }));
        }
      }
    ]
  });

  /* ==========================================================
     3. HashMap：put 一次发生了什么
     ========================================================== */
  R('hashmap', {
    no: 3, title: 'HashMap put 全流程（JDK 8）', w: 900, h: 350, dur: 1500,
    steps: [
      {
        label: '算 hash', cap: '<code>hash = (h = key.hashCode()) ^ (h >>> 16)</code>。高 16 位异或到低 16 位，让 32 位哈希的高位也参与运算，<b>减少碰撞</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 二进制演示
          svg.appendChild(E(20, 36, '为什么要有 >>> 16 这一步', { size: 11, weight: 700, ls: 1 }));
          const hc = ['A'.charCodeAt(0)];
          const h1 = hc[0];
          const h2 = (h1 ^ (h1 >>> 16)) & 0xFFFF;
          const rows = [
            ['key.hashCode()  "A"', `0x${h1.toString(16).toUpperCase().padStart(4, '0')}`, C.ink],
            ['h >>> 16', '0x0000', C.gray1],
            ['h ^ (h>>>16)', `0x${h2.toString(16).toUpperCase().padStart(4, '0')}`, C.red],
            ['(n-1) & hash', `0x${h2.toString(16).toUpperCase().padStart(4, '0')} & 0x0F = ${h2 & 15}`, C.ink]
          ];
          rows.forEach((r, k) => {
            const y = 56 + k * 40;
            svg.appendChild(H.box(20, y, 400, 32, { stroke: C.gray3, opacity: 0.4 + 0.6 * o }));
            svg.appendChild(E(32, y + 21, r[0], { size: 10, mono: 1, fill: C.gray1, opacity: o }));
            svg.appendChild(E(408, y + 21, r[1], { size: 11, mono: 1, weight: 700, fill: r[2], anchor: 'end', opacity: o }));
          });
          // 解释
          svg.appendChild(H.box(450, 56, 410, 152, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(450, 56, 4, 152, { fill: C.red, opacity: o }));
          svg.appendChild(E(468, 80, '直觉', { size: 11, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(468, 102, '容量默认 16，(16-1)&hash 只会用到 hash 的低 4 位，', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(468, 120, '高位完全浪费 → 哈希分布不均 → 链表变长。', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(468, 138, '>>> 16 把高 16 位"折叠"进低 16 位，让容量变大时', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(468, 156, '取位也能吃到高位信息。', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(468, 186, '面试可以主动提：这是 JDK 7 的遗留修补，代价极小（一次异或）', { size: 9, fill: C.gray2, opacity: o }));
          // 索引
          svg.appendChild(E(20, 250, '下标 = (n - 1) & hash  ——  用位运算代替取模', { size: 11, weight: 700, opacity: o }));
          ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'].forEach((s, k) => {
            svg.appendChild(H.box(20 + k * 54, 264, 50, 26, { stroke: C.gray3, opacity: o }));
            svg.appendChild(E(45 + k * 54, 281, s, { size: 9, mono: 1, fill: C.gray1, anchor: 'middle', opacity: o }));
          });
          const idx = h2 & 15;
          svg.appendChild(H.box(20 + idx * 54, 264, 50, 26, { fill: C.red, stroke: C.red, opacity: o }));
          svg.appendChild(E(45 + idx * 54, 281, (15).toString(16).toUpperCase(), { size: 9, mono: 1, fill: '#fff', anchor: 'middle', opacity: o }));
          svg.appendChild(E(20 + idx * 54, 306, '↑ 命中 ' + idx, { size: 9, weight: 700, fill: C.red, anchor: 'middle', opacity: o }));
        }
      },
      {
        label: '放桶内', cap: '桶为空 → 直接 new Node 放入；桶非空 → 判断 key 是否 equals，相同则覆盖 value，不同则挂到链表尾部。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          svg.appendChild(E(20, 34, 'table[16]  ——  Node<K,V>[]', { size: 11, weight: 700, mono: 1, ls: 1 }));
          for (let k = 0; k < 16; k++) {
            const x = 20 + k * 54, y = 48;
            const hit = k === 11;
            svg.appendChild(H.box(x, y, 50, 100, { stroke: hit ? C.red : C.gray3, sw: hit ? 1.5 : 1 }));
            svg.appendChild(H.line(x, y + 22, x + 50, y + 22, { stroke: C.gray3, sw: 0.5 }));
            svg.appendChild(E(x + 25, y + 15, k, { size: 9, mono: 1, fill: hit ? C.red : C.gray2, anchor: 'middle', weight: hit ? 700 : 400 }));
            if (hit) {
              const n1 = clamp01(t * 3), n2 = clamp01((t - 0.3) * 3);
              svg.appendChild(H.box(x + 8, y + 30, 34, 18, { fill: C.red, opacity: n1 }));
              svg.appendChild(E(x + 25, y + 43, 'null', { size: 7, fill: '#fff', anchor: 'middle', opacity: 1 - n1 }));
              svg.appendChild(H.box(x + 8, y + 30, 34, 18, { stroke: C.red, opacity: n2 }));
              svg.appendChild(E(x + 25, y + 43, 'A:1', { size: 8, mono: 1, fill: C.red, anchor: 'middle', opacity: n2 }));
            }
          }
          // 链表
          const l1 = easeOut(clamp01((t - 0.15) * 2));
          const nx = 20 + 11 * 54;
          svg.appendChild(H.line(nx + 50, 98, nx + 50, 130, { stroke: C.red, opacity: l1 }));
          svg.appendChild(H.box(nx + 8, 130, 34, 22, { stroke: C.red, opacity: l1 }));
          svg.appendChild(E(nx + 25, 145, 'A:1', { size: 8, mono: 1, fill: C.red, anchor: 'middle', opacity: l1 }));
          svg.appendChild(E(nx + 48, 145, '← 头节点', { size: 8, fill: C.gray2, opacity: l1 }));
          // 右侧伪码
          svg.appendChild(H.box(20, 180, 440, 170, { fill: C.code }));
          const code = [
            ['if (table == null) resize();', C.gray2],
            ['n = table.length;', C.gray2],
            ['i = (n - 1) & hash;', C.gray2],
            ['', C.gray2],
            ['for (Node e = tab[i]; e != null; e = e.next) {', '#fff'],
            ['  if (Objects.equals(k, e.key)) {', '#fff'],
            ['    V old = e.value; e.value = v; return old;', C.codeRed],
            ['  }', '#fff'],
            ['}', '#fff'],
            ['tab[i] = newNode(hash, key, v, tab[i]);', C.codeRed],
            ['if (++size > threshold) resize();', C.gray2]
          ];
          code.forEach((c, k) => {
            const hi = k === 5 || k === 9;
            const op = t * 11 > k ? 1 : 0;
            svg.appendChild(E(34, 204 + k * 14, c[0], { size: 10, mono: 1, fill: c[1], opacity: 0.3 + 0.7 * op, weight: hi ? 700 : 400 }));
          });
          // 右侧
          svg.appendChild(E(500, 200, '插入前必看：', { size: 11, weight: 700, fill: C.red }));
          ['① table 为 null → 首次分配，容量 16',
           '② 记录 size，size > threshold(0.75n) → resize',
           '③ JDK7 头插法 → 并发死循环',
           '   JDK8 尾插法 → 丢失数据（覆盖问题）',
           '④ null key 永远存在 0 号桶，可遍历删除'].forEach((s, k) =>
            svg.appendChild(E(500, 224 + k * 22, s, { size: 10, fill: k === 3 ? C.red : C.gray1, mono: 0 })));
        }
      },
      {
        label: '树化', cap: '链表长度 ≥ <b>TREEIFY_THRESHOLD (8)</b> 且数组长度 ≥ <b>MIN_TREEIFY_CAPACITY (64)</b> 时，红黑树接管；<b>退化阈值 6</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 条件 1
          svg.appendChild(H.box(20, 40, 300, 70, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(20, 40, 4, 70, { fill: C.ink, opacity: o }));
          svg.appendChild(E(38, 66, '条件 A：链表长度 ≥ 8', { size: 12, weight: 700, opacity: o }));
          svg.appendChild(E(38, 88, '负载因子已把链表养得很长', { size: 10, fill: C.gray1, opacity: o }));
          // 条件 2
          svg.appendChild(H.box(20, 124, 300, 70, { stroke: o > 0.5 ? C.red : C.gray3, sw: 1.5, opacity: o }));
          svg.appendChild(H.box(20, 124, 4, 70, { fill: C.red, opacity: o * (t > 0.3 ? 1 : 0.2) }));
          svg.appendChild(E(38, 150, '条件 B：数组长度 ≥ 64', { size: 12, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(38, 172, '容量小 → 只是运气不好，先扩容更划算', { size: 10, fill: C.gray1, opacity: o }));
          // 决策
          if (t > 0.45) {
            const d = clamp01((t - 0.45) * 2.5);
            svg.appendChild(H.path('M 330 75 L 380 105 L 330 159 L 380 213', { stroke: C.ink, dash: '3 3', opacity: d }));
            svg.appendChild(H.box(390, 60, 200, 56, { stroke: C.red, sw: 1.5, opacity: d }));
            svg.appendChild(H.box(390, 60, 200, 4, { fill: C.red, opacity: d }));
            svg.appendChild(E(404, 84, 'A ✓  B ✓  → 树化', { size: 12, weight: 700, fill: C.red, opacity: d }));
            svg.appendChild(E(404, 102, 'Node 变成 TreeNode', { size: 9, fill: C.gray1, opacity: d }));
            svg.appendChild(H.box(390, 128, 200, 56, { stroke: C.gray2, opacity: d }));
            svg.appendChild(E(404, 152, 'A ✓  B ✗  → resize 扩容', { size: 12, weight: 700, fill: C.gray1, opacity: d }));
            svg.appendChild(E(404, 170, '长度 ≥ 64 后再重新判断树化', { size: 9, fill: C.gray2, opacity: d }));
          }
          // 红黑树示意
          if (t > 0.6) {
            const d = clamp01((t - 0.6) * 2);
            const bx = 640;
            svg.appendChild(H.box(bx, 40, 230, 260, { stroke: C.ink, opacity: d }));
            svg.appendChild(E(bx + 14, 62, '红黑树（O(log n)）', { size: 10, weight: 700, ls: 1, opacity: d }));
            const nodes = [[bx + 115, 100, '5', 1], [bx + 55, 160, '3', 0], [bx + 175, 160, '8', 0], [bx + 30, 220, '1', 0], [bx + 80, 220, '4', 0]];
            const edges = [[0, 1], [0, 2], [1, 3], [1, 4]];
            edges.forEach(ed => svg.appendChild(H.line(nodes[ed[0]][0], nodes[ed[0]][1] + 14, nodes[ed[1]][0], nodes[ed[1]][1] - 14, { stroke: C.gray1, opacity: d })));
            nodes.forEach((n, k) => {
              const ro = clamp01((t - 0.65 - k * 0.06) * 4);
              if (ro <= 0) return;
              svg.appendChild(H.circ(n[0], n[1], 14, { fill: n[3] ? C.red : C.paper, stroke: n[3] ? C.red : C.ink, sw: 1.5, opacity: ro }));
              svg.appendChild(E(n[0], n[1] + 4, n[2], { size: 10, mono: 1, weight: 700, anchor: 'middle', fill: n[3] ? '#fff' : C.ink, opacity: ro }));
            });
            svg.appendChild(E(bx + 14, 262, '红节点 = 额外信息位；树化后查找 8→log', { size: 8, fill: C.gray2, opacity: d }));
            svg.appendChild(E(bx + 14, 276, 'UNTREEIFY：节点数 ≤ 6 时退化回链表', { size: 8, fill: C.red, opacity: d }));
          }
        }
      },
      {
        label: '扩容', cap: '<b>扩容为原容量 ×2</b>。JDK8 不再头插，而是保留原相对位置：<code>(e.hash & oldCap) == 0</code> 不动，否则 <code>+ oldCap</code>——<b>无需倒序遍历</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // ===== 左上：旧表 =====
          svg.appendChild(E(20, 34, '旧 table   n = 4', { size: 11, weight: 700, mono: 1 }));
          for (let k = 0; k < 4; k++) {
            const x = 20 + k * 58;
            svg.appendChild(H.box(x, 44, 52, 74, { stroke: C.gray3, opacity: o }));
            svg.appendChild(E(x + 26, 60, k, { size: 9, mono: 1, fill: C.gray2, anchor: 'middle', opacity: o }));
            if (k === 3) {
              svg.appendChild(H.box(x + 5, 68, 42, 20, { stroke: C.red, opacity: o }));
              svg.appendChild(E(x + 26, 82, '3 → 11', { size: 8, mono: 1, fill: C.red, anchor: 'middle', opacity: o }));
              svg.appendChild(H.box(x + 5, 92, 42, 20, { stroke: C.gray2, opacity: o }));
              svg.appendChild(E(x + 26, 106, '1 → 9', { size: 8, mono: 1, fill: C.gray1, anchor: 'middle', opacity: o }));
            }
          }
          svg.appendChild(H.box(20, 130, 226, 32, { stroke: C.gray2, dash: '3 3', opacity: o }));
          svg.appendChild(E(30, 150, '链表：A→C→3→1（被拆开）', { size: 9, fill: C.gray1, opacity: o }));

          // ===== 右上：拆分逻辑 =====
          svg.appendChild(H.box(268, 34, 296, 128, { stroke: C.red, sw: 1.5, opacity: o }));
          svg.appendChild(H.box(268, 34, 4, 128, { fill: C.red, opacity: o }));
          svg.appendChild(E(284, 58, '为什么不用倒序遍历？', { size: 11, weight: 700, fill: C.red, opacity: o }));
          [['hash & oldCap == 0', '索引不变 → 位置 lo', C.ink],
           ['hash & oldCap != 0', '索引 + oldCap → 位置 hi', C.red]
          ].forEach((r, k) => {
            svg.appendChild(E(284, 84 + k * 38, r[0], { size: 10, mono: 1, weight: 700, fill: r[2], opacity: o }));
            svg.appendChild(E(284, 100 + k * 38, r[1], { size: 9, fill: C.gray1, opacity: o }));
          });

          // ===== 中部：新表 =====
          svg.appendChild(E(20, 196, '新 table   n = 8  （原桶拆成 lo / hi 两条链）', { size: 11, weight: 700, mono: 1, opacity: o }));
          const NW = 62, GAP = 6;
          for (let k = 0; k < 8; k++) {
            const x = 20 + k * (NW + GAP);
            svg.appendChild(H.box(x, 208, NW, 66, { stroke: C.gray3, opacity: o }));
            svg.appendChild(E(x + NW / 2, 224, k, { size: 9, mono: 1, fill: C.gray2, anchor: 'middle', opacity: o }));
            svg.appendChild(H.line(x, 232, x + NW, 232, { stroke: C.gray3, sw: 0.5, opacity: o }));
          }
          const cell = (idx, row, label, alpha) => {
            if (alpha <= 0) return;
            const x = 20 + idx * (NW + GAP);
            const y = 236 + row * 17;
            svg.appendChild(H.box(x + 4, y, NW - 8, 15, { fill: C.red, stroke: C.red, opacity: alpha }));
            svg.appendChild(E(x + NW / 2, y + 11, label, { size: 8, mono: 1, fill: '#fff', anchor: 'middle', opacity: alpha }));
          };
          const a1 = clamp01((t - 0.2) * 3), a2 = clamp01((t - 0.35) * 3), a3 = clamp01((t - 0.55) * 3);
          // 桶 3 保留（lo），然后移动到桶 1
          cell(3, 0, '3', a1);
          cell(3, 1, 'A, C', a2);
          cell(1, 0, '1', a3);
          // 动画：从桶3 的第二行移到 桶1 的第二行
          const mv = clamp01((t - 0.55) * 2.4);
          if (mv > 0) {
            const x1 = 20 + 1 * (NW + GAP), x3 = 20 + 3 * (NW + GAP);
            const cx = lerp(x3 + NW / 2, x1 + NW / 2, mv);
            const cy = lerp(244 + 7, 236 + 24, mv);
            svg.appendChild(H.box(cx - (NW - 8) / 2, cy - 7, NW - 8, 15, { fill: C.red, stroke: C.red, opacity: 1 - mv * .3 }));
            svg.appendChild(E(cx, cy + 4, '1', { size: 8, mono: 1, fill: '#fff', anchor: 'middle' }));
            svg.appendChild(H.path(`M ${x1 + NW / 2} 236 l 0 -8 l -4 6 l 8 0 z`, { fill: C.red }));
          }

          // ===== 右侧答案列 =====
          const bw = 268;
          svg.appendChild(H.box(612, 34, bw, 240, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(612, 34, bw, 4, { fill: C.ink, opacity: o }));
          svg.appendChild(E(626, 60, '面试标准答案', { size: 11, weight: 700, ls: 1, opacity: o }));
          ['容量永远 ×2，不是 +1', 'JDK7 头插 → 并发死链', 'JDK8 尾插 → 数据丢失',
           'threshold = 0.75n', '最大容量 2³⁰，超出抛异常', 'transfer 建议 -1.0f 而非默认'
          ].forEach((s, k) => {
            svg.appendChild(H.box(624, 74 + k * 30, 244, 26, { stroke: C.gray3, opacity: o * (0.4 + 0.6 * ((t * 6 - k) > 0 ? 1 : 0)) }));
            svg.appendChild(E(636, 91 + k * 30, s, {
              size: 9, fill: k < 3 ? C.red : C.gray1,
              mono: k === 0 || k === 3 || k === 4 || k === 5 ? 1 : 0,
              opacity: o * (0.4 + 0.6 * ((t * 6 - k) > 0 ? 1 : 0))
            }));
          });

          // ===== 底部结论 =====
          svg.appendChild(H.box(20, 290, 572, 44, { stroke: C.red, opacity: clamp01((t - 0.7) * 3) }));
          svg.appendChild(H.box(20, 290, 4, 44, { fill: C.red, opacity: clamp01((t - 0.7) * 3) }));
          svg.appendChild(E(38, 312, '一句话：JDK7 扩容要倒序遍历头插，JDK8 因为「lo/hi 原地拆」省掉了倒序，也顺带避免了死循环', {
            size: 10, fill: C.ink, opacity: clamp01((t - 0.7) * 3)
          }));
        }
      }
    ]
  });

})(window.VIZ);
