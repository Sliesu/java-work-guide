/* ============================================================
   并发 + Spring 图解
   ============================================================ */
(function (V) {
  'use strict';
  const R = (id, s) => V.register(id, s);
  const H = V.H, e = V.e;
  const C = V.C;
  const easeOut = V.easeOut, easeIn = V.easeIn, clamp01 = V.clamp01, lerp = V.lerp;

  /* ==========================================================
     4. JMM 内存模型 & volatile
     ========================================================== */
  R('jmm', {
    no: 4, title: '可见性 / 有序性 / 原子性', w: 900, h: 400, dur: 1700,
    steps: [
      {
        label: '三个问题', cap: '并发三大坑：<b>原子性</b>（i++ 不是原子）、<b>可见性</b>（一个线程改，另一个看不到）、<b>有序性</b>（指令重排）。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const items = [
            ['原子性', 'i++ / 复合操作', 'JMM 保证', 'synchronized / AtomicXxx / CAS'],
            ['可见性', '一个线程改完另一个读不到', '硬件本质', 'volatile / synchronized / final'],
            ['有序性', 'new 后代码可能先跑', '编译器 + CPU', 'volatile / 内存屏障']
          ];
          items.forEach((it, k) => {
            const y = 44 + k * 108;
            const on = t * 3.4 > k ? 1 : 0;
            svg.appendChild(H.box(20, y, 860, 92, { stroke: k === 0 ? C.ink : C.gray3, sw: on ? 1.5 : 1, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, y, 5, 92, { fill: k === 0 ? C.ink : C.gray3, opacity: on }));
            svg.appendChild(E(44, y + 30, it[0], { size: 18, weight: 700, fill: k === 0 ? C.ink : C.gray1, ls: -.02 }));
            svg.appendChild(E(44, y + 52, it[1], { size: 10, fill: C.gray1, opacity: on }));
            svg.appendChild(H.line(240, y + 16, 240, y + 76, { stroke: C.gray3, sw: 0.5, opacity: on }));
            svg.appendChild(E(258, y + 30, it[2], { size: 11, weight: 700, fill: C.red, opacity: on }));
            svg.appendChild(E(258, y + 52, '→ ' + it[3], { size: 10, mono: 1, fill: C.gray1, opacity: on }));
            svg.appendChild(E(700, y + 30, ['JMM 八大原子操作', 'JMM 内存模型规范', 'as-if-serial 语义'][k], { size: 10, fill: C.gray2, opacity: on }));
            svg.appendChild(E(700, y + 48, ['read/write 锁定', '主内存 ←→ 工作内存', 'happens-before'][k], { size: 9, fill: C.gray2, opacity: on }));
          });
        }
      },
      {
        label: 'JMM 主内存', cap: 'JMM 规定：共享变量在<b>主内存</b>，每个线程有<b>私有工作内存</b>。线程间只能通过主内存交换数据。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // 主内存
          svg.appendChild(H.box(20, 30, 860, 92, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(H.box(20, 30, 860, 4, { fill: C.red }));
          svg.appendChild(E(34, 54, '主内存 MAIN MEMORY（物理上在堆中，逻辑抽象）', { size: 11, weight: 700, fill: C.red, ls: .5 }));
          for (let k = 0; k < 5; k++) {
            svg.appendChild(H.box(34 + k * 168, 64, 152, 44, { stroke: C.gray2 }));
            svg.appendChild(E(46 + k * 168, 82, k === 0 ? 'flag  (volatile)' : 'i' + k, { size: 10, mono: 1, fill: C.ink }));
            svg.appendChild(E(46 + k * 168, 98, k === 0 ? 'volatile 保证可见' : '普通变量', { size: 8, fill: k === 0 ? C.red : C.gray2 }));
          }
          // 工作内存（三个线程）
          const WORK = [[20, 'T1', 0], [310, 'T2', 1], [600, 'T3', 2]];
          WORK.forEach((w, k) => {
            const on = t * 3 > k ? 1 : 0;
            svg.appendChild(H.box(w[0], 182, 260, 84, { stroke: C.ink, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(w[0], 182, 4, 84, { fill: C.ink, opacity: on }));
            svg.appendChild(E(w[0] + 14, 202, '线程 ' + w[1] + ' 私有工作内存', { size: 11, weight: 700, opacity: on }));
            svg.appendChild(H.box(w[0] + 14, 210, 232, 42, { stroke: C.gray3, dash: '3 3', opacity: on }));
            svg.appendChild(E(w[0] + 24, 235, k === 0 ? 'flag = true' : 'flag（副本 = false）', { size: 10, mono: 1, fill: k === 0 ? C.red : C.gray1, opacity: on }));
          });
          // 箭头：T1 写回主内存（红），主内存 → T2/T3（灰）
          const a1 = clamp01((t - 0.3) * 3);
          if (a1 > 0) {
            svg.appendChild(H.path(`M 280 208 C 280 152, 110 152, 110 122`, { stroke: C.red, sw: 1.5, dash: '4 3', fill: 'none', opacity: a1 }));
            svg.appendChild(H.path('M 110 122 l -4 9 l 8 0 z', { fill: C.red, opacity: a1 }));
            svg.appendChild(E(292, 158, 'write 写回', { size: 9, mono: 1, fill: C.red, weight: 700, opacity: a1 }));
          }
          const a2 = clamp01((t - 0.55) * 3);
          if (a2 > 0) {
            svg.appendChild(H.path(`M 110 122 C 110 152, 440 152, 440 182`, { stroke: C.gray1, sw: 1.5, dash: '4 3', fill: 'none', opacity: a2 }));
            svg.appendChild(H.path('M 440 182 l -4 -9 l 8 0 z', { fill: C.gray1, opacity: a2 }));
            svg.appendChild(E(452, 158, 'read 读取最新值', { size: 9, mono: 1, fill: C.gray1, opacity: a2 }));
            svg.appendChild(H.path(`M 730 182 L 730 122`, { stroke: C.gray1, sw: 1.5, dash: '4 3', opacity: a2 * .6 }));
            svg.appendChild(H.path('M 730 122 l -4 9 l 8 0 z', { fill: C.gray1, opacity: a2 * .6 }));
          }
          // 结论
          const con = clamp01((t - 0.7) * 3);
          if (con > 0) {
            svg.appendChild(H.box(20, 284, 860, 40, { fill: C.red, stroke: C.red, opacity: con }));
            svg.appendChild(E(34, 309, '没有 volatile 时：T2/T3 的副本永远是 false —— 编译期把 flag 优化成了常量', { size: 11, weight: 700, fill: '#fff', opacity: con }));
          }
          // 八大操作
          svg.appendChild(E(20, 352, '8 个原子操作（只需记住这 8 个）', { size: 10, weight: 700, ls: 1 }));
          svg.appendChild(E(20, 372, 'lock / unlock：主内存与线程私有内存间的同步动作', { size: 9, fill: C.gray1 }));
          const ops = ['read', 'write', 'readAfterWrite', 'writeAfterRead', 'readAfterRead', 'writeAfterWrite'];
          ops.forEach((o, k) => {
            svg.appendChild(H.chip(500 + (k % 3) * 128, 342 + Math.floor(k / 3) * 24, o, { w: 118, h: 19, size: 8.5, stroke: C.gray2, tc: C.gray1, mono: 1 }));
          });
        }
      },
      {
        label: 'volatile 内存屏障', cap: 'volatile 靠<b>内存屏障</b>实现：写之前插 StoreStore/StoreLoad 屏障，读之后插 LoadLoad/LoadStore 屏障。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const acts = [
            ['普通读', 'read', '—', '可能被重排到后'],
            ['volatile 读', 'LoadLoad 屏障', '读数据', '禁止与后续读重排'],
            ['volatile 写', 'StoreStore 屏障', '写数据', '前面的写先刷出去'],
            ['volatile 写后', 'StoreLoad 屏障', '—', '代价最大，但保证可见']
          ];
          acts.forEach((a, k) => {
            const y = 48 + k * 76;
            const on = t * 4.5 > k ? 1 : 0;
            svg.appendChild(H.box(20, y, 400, 62, { stroke: k === 0 || k === 3 ? C.gray3 : C.red, sw: 1.5, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(E(34, y + 26, a[0], { size: 12, weight: 700, fill: k === 0 || k === 3 ? C.gray1 : C.red, opacity: on }));
            svg.appendChild(E(34, y + 46, a[2] + '  ' + a[1], { size: 10, mono: 1, fill: C.gray1, opacity: on }));
            svg.appendChild(H.box(440, y, 440, 62, { stroke: C.gray3, dash: '3 3', opacity: on * 0.8 }));
            svg.appendChild(E(454, y + 38, a[3], { size: 11, fill: k === 3 ? C.red : C.gray1, weight: k === 3 ? 700 : 400, opacity: on }));
          });
          // 指令序列
          const o = easeOut(clamp01((t - 0.3) * 2));
          svg.appendChild(E(20, 368, 'volatile 写的指令序列', { size: 10, weight: 700, ls: 1, opacity: o }));
          const seq = [['普通写', C.gray2], ['StoreStore', C.red], ['value = 1', C.ink], ['StoreLoad', C.red], ['后续读 flag', C.gray1]];
          let x = 190;
          seq.forEach((s, k) => {
            svg.appendChild(H.box(x, 354, 128, 26, { fill: s[1] === C.red ? C.red : 'none', stroke: s[1] === C.red ? C.red : C.gray2, opacity: o }));
            svg.appendChild(E(x + 64, 371, s[0], { size: 9, mono: 1, anchor: 'middle', fill: s[1] === C.red ? '#fff' : C.ink, opacity: o }));
            x += 136;
          });
        }
      },
      {
        label: '经典单例', cap: '<b>双重检查锁定（DCL）</b>：两次判空，中间加锁，<b>instance 必须加 volatile</b>——否则指令重排会返回半初始化对象。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // 无 volatile
          svg.appendChild(H.box(20, 40, 400, 148, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(H.box(20, 40, 400, 4, { fill: C.red }));
          svg.appendChild(E(34, 66, '为什么必须 volatile', { size: 12, weight: 700, fill: C.red }));
          const code1 = [
            'public class Single {',
            '  private static Single instance;',
            '  public static Single get() {',
            '    if (instance == null) {',
            '      synchronized (Single.class) {',
            '        if (instance == null) {',
            '          instance = new Single();',
            '        }',
            '      }',
            '    }',
            '    return instance;',
            '  }',
            '}'
          ];
          code1.forEach((l, k) => svg.appendChild(E(34, 84 + k * 0, '', { size: 1 })));
          svg.appendChild(H.box(440, 40, 420, 148, { stroke: C.ink }));
          svg.appendChild(H.box(440, 40, 420, 4, { fill: C.ink }));
          svg.appendChild(E(454, 66, 'new 的字节码被重排成三步', { size: 12, weight: 700 }));
          const steps3 = [['① new', '分配内存', C.gray1], ['② invokespecial', '执行构造方法', C.gray1], ['③ astore', '把引用赋给 instance', C.red]];
          steps3.forEach((s, k) => {
            const x = 454 + k * 136;
            svg.appendChild(H.box(x, 80, 126, 52, { stroke: k === 2 ? C.red : C.gray2, sw: k === 2 ? 1.5 : 1 }));
            svg.appendChild(E(x + 10, 100, s[0], { size: 10, mono: 1, weight: 700, fill: k === 2 ? C.red : C.ink }));
            svg.appendChild(E(x + 10, 118, s[1], { size: 8, fill: C.gray1 }));
            if (k < 2) svg.appendChild(H.line(x + 126, 106, x + 136, 106, { stroke: C.gray2, arrow: true }));
          });
          const o = easeOut(clamp01((t - 0.4) * 2.5));
          svg.appendChild(H.box(20, 104, 400, 76, { fill: C.redTint, stroke: C.red, opacity: o }));
          svg.appendChild(E(34, 128, '若没有 volatile：', { size: 11, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(34, 148, '线程 B 走完 ① 就在 ③ 之后读到了引用，', { size: 10, fill: C.gray1, opacity: o }));
          svg.appendChild(E(34, 164, '但 ② 还没执行 → instance != null 却全是默认值', { size: 10, fill: C.gray1, opacity: o }));
          // 推荐方案
          svg.appendChild(H.box(20, 208, 840, 60, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(20, 208, 4, 60, { fill: C.red, opacity: o }));
          svg.appendChild(E(38, 232, '面试最佳答案（直接背）：枚举单例', { size: 12, weight: 700, opacity: o }));
          svg.appendChild(E(38, 256, 'public enum Single { INSTANCE; private Single(){} }  ——  JVM 保证只 new 一次，天然线程安全，还能防反射与反序列化破坏', { size: 10, mono: 1, fill: C.gray1, opacity: o }));
          svg.appendChild(H.box(20, 284, 840, 60, { stroke: C.gray2, dash: '3 3', opacity: o }));
          svg.appendChild(E(38, 308, '《Effective Java》明确：单元素枚举是首选实现方式（Item 3）', { size: 11, fill: C.gray1, opacity: o }));
          svg.appendChild(E(38, 330, 'Holder 静态内部类也可以：利用类加载的懒初始化 + JVM 线程安全保证', { size: 10, fill: C.gray2, opacity: o }));
        }
      }
    ]
  });

  /* ==========================================================
     5. synchronized 锁升级
     ========================================================== */
  R('lock', {
    no: 5, title: 'synchronized 底层：对象头与锁升级', w: 900, h: 400, dur: 1500,
    steps: [
      {
        label: '对象头 Mark Word', cap: '64 位 JVM 的 Mark Word 里存的不只是哈希码，还有<b>锁状态标志</b>、GC 年龄、偏向线程 ID。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          svg.appendChild(E(20, 34, 'Mark Word  64 bit 布局（JDK 8 / 64 位）', { size: 11, weight: 700, ls: 1 }));
          const seg = [
            ['hash', '25 bit', 200, C.gray2],
            ['年龄', '4 bit', 110, C.gray2],
            ['偏向位', '1 bit', 90, C.red],
            ['锁标志', '2 bit', 100, C.ink]
          ];
          let x = 20;
          seg.forEach((s, k) => {
            svg.appendChild(H.box(x, 48, s[2], 46, { fill: k === 3 ? C.red : 'none', stroke: s[3], sw: 1.5, opacity: o }));
            svg.appendChild(E(x + 10, 68, s[0], { size: 10, weight: 700, fill: k === 3 ? '#fff' : C.ink, opacity: o }));
            svg.appendChild(E(x + 10, 84, s[1], { size: 8, fill: k === 3 ? '#fff' : C.gray1, mono: 1, opacity: o }));
            x += s[2] + 6;
          });
          // 锁标志表
          const tbl = [
            ['000', '无锁', '无', '—'],
            ['001', '偏向锁', '有（1 bit 标记）', 'JDK15 起默认关闭，JDK18 移除'],
            ['010', '轻量级锁', '有', '栈帧锁记录 + 复制对象头'],
            ['011', '重量级锁', '有', 'ObjectMonitor，依赖 OS mutex'],
            ['100', '已锁定', '有', '重量级锁的四种情况之一'],
            ['101', '偏向锁（轻）', '—', '—'],
            ['110', '偏向锁（重）', '—', '—'],
            ['111', '轻量级锁（膨胀标记）', '—', '—']
          ];
          svg.appendChild(E(20, 130, '锁标志位真值表（2 bit）', { size: 10, weight: 700, ls: 1, opacity: o }));
          tbl.forEach((r, k) => {
            const y = 142 + k * 30;
            const hot = k === 0 || k === 1 || k === 2 || k === 3;
            svg.appendChild(H.box(20, y, 860, 28, { stroke: C.gray3, opacity: 0.4 + 0.6 * o }));
            svg.appendChild(H.box(20, y, 58, 28, { fill: hot && k > 0 ? C.red : C.ink, stroke: C.ink, opacity: o }));
            svg.appendChild(E(49, y + 18, r[0], { size: 10, mono: 1, anchor: 'middle', fill: '#fff', opacity: o }));
            svg.appendChild(E(94, y + 18, r[1], { size: 10, weight: hot ? 700 : 400, fill: hot ? C.ink : C.gray1, opacity: o }));
            svg.appendChild(E(300, y + 18, r[2], { size: 10, fill: C.gray1, opacity: o }));
            svg.appendChild(E(500, y + 18, r[3], { size: 9, fill: k === 0 ? C.red : C.gray2, opacity: o }));
          });
        }
      },
      {
        label: '无锁 → 偏向', cap: 'JDK 6 起，<b>只要一个线程进入</b>，就在 Mark Word 里记下这个线程 ID（bias），后续该线程再进入只需比对 ID，不加锁。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const stages = [
            { n: '01 无锁', d: '对象刚 new 出来，没有竞争', mark: 'bias=0  flags=000' },
            { n: '02 偏向锁', d: '线程 A 首次 synchronized → 记录 threadId=A', mark: 'bias=1  flags=001' },
            { n: '03 轻量级锁', d: '线程 B 来了 → 撤销偏向，创建锁记录', mark: 'flags=010' },
            { n: '04 重量级锁', d: '竞争加剧，自旋失败 → 膨胀为 OS 互斥', mark: 'flags=110' }
          ];
          stages.forEach((s, k) => {
            const x = 20 + k * 218;
            const on = t * 4.2 > k ? 1 : 0;
            svg.appendChild(H.box(x, 48, 200, 120, { stroke: k === 3 ? C.red : C.ink, sw: k === 3 ? 1.5 : 1, opacity: 0.35 + 0.65 * on }));
            svg.appendChild(H.box(x, 48, 200, 4, { fill: k === 3 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(x + 14, 76, s.n, { size: 13, weight: 700, fill: k === 3 ? C.red : C.ink, opacity: on }));
            // 线程图标
            svg.appendChild(H.circ(x + 30, 106, 12, { fill: C.red, opacity: on * 0.9 }));
            svg.appendChild(E(x + 30, 110, 'T', { size: 9, weight: 700, anchor: 'middle', fill: '#fff', opacity: on }));
            if (k >= 2) {
              svg.appendChild(H.circ(x + 62, 106, 12, { fill: C.ink, opacity: on * 0.9 }));
              svg.appendChild(E(x + 62, 110, 'B', { size: 9, weight: 700, anchor: 'middle', fill: '#fff', opacity: on }));
            }
            svg.appendChild(E(x + 14, 138, s.mark, { size: 9, mono: 1, fill: C.red, opacity: on }));
            svg.appendChild(E(x + 14, 156, s.d.length > 22 ? s.d.slice(0, 22) : s.d, { size: 8, fill: C.gray2, opacity: on }));
          });
          // 升级箭头
          for (let k = 0; k < 3; k++) {
            const p = clamp01((t - 0.25 - k * 0.22) * 3);
            if (p <= 0) continue;
            svg.appendChild(H.line(220 + k * 218, 108, 234 + k * 218, 108, { stroke: C.red, sw: 1.5, opacity: p }));
            svg.appendChild(H.path(`M ${234 + k * 218} 108 l 6 4 l -6 4 z`, { fill: C.red, opacity: p }));
          }
          svg.appendChild(E(20, 210, '关键词：只能<b>单向升级</b>，不能降级（无锁 → 偏向 → 轻量级 → 重量级）', { size: 0, opacity: 0 }));
          svg.appendChild(E(20, 206, '只能单向升级，不能降级 —— 所以要减少锁的粒度，而不是依赖「锁会自己变轻」', { size: 11, weight: 700, fill: C.red }));
          const boxes = [
            ['为什么要有偏向锁', '无竞争时省掉 CAS 开销（偏向撤销 = 一次 CAS）'],
            ['为什么 JDK15 移除', '现代应用偏向锁几乎无收益，维护成本高；-XX:+UseBiasedLocking 已失效'],
            ['自旋多久放弃', '自适应自旋，由「上一次成功自旋次数」决定，不固定'],
            ['自旋的意义', '避免线程切换；但如果持锁时间很短，切换反而更贵']
          ];
          boxes.forEach((b, k) => {
            const x = 20 + (k % 2) * 440, y = 230 + Math.floor(k / 2) * 78;
            const on = clamp01((t - 0.5 - k * 0.08) * 3);
            svg.appendChild(H.box(x, y, 420, 64, { stroke: C.gray2, opacity: on }));
            svg.appendChild(H.box(x, y, 4, 64, { fill: k === 1 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(x + 16, y + 24, b[0], { size: 11, weight: 700, fill: k === 1 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(x + 16, y + 44, b[1], { size: 9, fill: C.gray1, opacity: on }));
          });
        }
      },
      {
        label: '重量级锁原理', cap: '膨胀后竞争线程进入 <code>ObjectMonitor</code>：CAS 抢 EntryList 入口 → 抢到持锁(owner) → 抢不到进 WaitSet(等待) → notify 移入 EntryList 竞争。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(clamp01(t * 1.6));
          svg.appendChild(H.box(20, 40, 460, 300, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(20, 40, 460, 4, { fill: C.ink, opacity: o }));
          svg.appendChild(E(34, 66, 'ObjectMonitor 三个区域', { size: 12, weight: 700, ls: .5, opacity: o }));
          // EntryList
          svg.appendChild(H.box(34, 80, 200, 70, { stroke: C.red, sw: 1.5, opacity: o }));
          svg.appendChild(E(46, 100, 'EntryList', { size: 11, weight: 700, fill: C.red, mono: 1, opacity: o }));
          svg.appendChild(E(46, 118, '竞争锁的线程在这排队', { size: 9, fill: C.gray1, opacity: o }));
          ['T1', 'T2', 'T3'].forEach((s, k) => {
            const on = clamp01((t - 0.3 - k * 0.12) * 3);
            svg.appendChild(H.box(46 + k * 56, 124, 44, 20, { stroke: C.red, opacity: on }));
            svg.appendChild(E(68 + k * 56, 138, s, { size: 9, mono: 1, anchor: 'middle', fill: C.red, opacity: on }));
          });
          // WaitSet
          svg.appendChild(H.box(250, 80, 200, 70, { stroke: C.gray2, opacity: o }));
          svg.appendChild(E(262, 100, 'WaitSet', { size: 11, weight: 700, mono: 1, fill: C.gray1, opacity: o }));
          svg.appendChild(E(262, 118, '调用 wait() 的线程', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(H.chip(262, 124, 'T4  waiting', { w: 100, h: 20, size: 9, stroke: C.gray2, tc: C.gray1, mono: 1, opacity: clamp01((t - 0.5) * 3) }));
          // owner
          svg.appendChild(H.box(34, 166, 416, 66, { fill: C.red, stroke: C.red, opacity: o * 0.9 }));
          svg.appendChild(E(46, 190, 'owner  当前持锁线程', { size: 11, weight: 700, fill: '#fff', mono: 1, opacity: o }));
          svg.appendChild(E(46, 212, 'T0 —— 等它 release 时 Exit → owner=null → 唤醒 EntryList 头结点', { size: 9, fill: '#fff', opacity: o }));
          // 流程
          svg.appendChild(E(34, 262, '六个字段（源码）', { size: 10, weight: 700, fill: C.red, ls: 1, opacity: o }));
          ['owner  持有者引用', 'EntryList 阻塞队列', 'WaitSet 等待集合', 'recursions 重入计数', 'HashCode 保存值', 'Waiter 结点计数']
            .forEach((s, k) => svg.appendChild(E(34, 282 + (k % 3) * 18, s, { size: 9, mono: 1, fill: C.gray1, opacity: o, x: 34 + Math.floor(k / 3) * 210 })));
          // 右侧
          svg.appendChild(H.box(510, 40, 370, 300, { stroke: C.gray3, opacity: o }));
          svg.appendChild(E(524, 66, '字节码入口', { size: 12, weight: 700, ls: .5, opacity: o }));
          const bc = [
            ['monitorenter', '同步方法/代码块入口', C.red],
            ['monitorexit', '同步方法/代码块出口', C.red],
            ['ACC_SYNCHRONIZED', '同步方法用标志位，不走指令', C.ink]
          ];
          bc.forEach((b, k) => {
            const y = 84 + k * 62;
            svg.appendChild(H.box(524, y, 342, 50, { stroke: k === 0 ? C.red : C.gray3, sw: k === 0 ? 1.5 : 1, opacity: o }));
            svg.appendChild(E(538, y + 22, b[0], { size: 11, mono: 1, weight: 700, fill: b[2], opacity: o }));
            svg.appendChild(E(538, y + 40, b[1], { size: 9, fill: C.gray1, opacity: o }));
          });
          svg.appendChild(E(524, 288, '面试追问：notify() 的线程为什么不是立刻获得锁？', { size: 10, weight: 700, fill: C.red, opacity: o }));
          svg.appendChild(E(524, 308, '→ 它只是从 WaitSet 移到 EntryList 重新竞争，避免饥饿', { size: 9, fill: C.gray1, opacity: o }));
          svg.appendChild(E(524, 326, '→ 优先级：wait() 的优先级低于正在 EntryList 排队的', { size: 9, fill: C.gray1, opacity: o }));
        }
      },
      {
        label: '锁优化', cap: 'JVM 做了大量锁优化：<b>锁消除</b>、<b>锁粗化</b>、<b>自适应自旋</b>、<b>轻量级锁的锁消除</b>。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const items = [
            ['锁消除', '局部变量加 synchronized，但逃逸分析发现不会跨线程 → 直接删掉锁字节码', 'StringBuffer → StringBuilder'],
            ['锁粗化', '循环体内频繁加解锁同一对象 → 扩到循环外，一次加锁', 'for 里 append → 循环外 append'],
            ['自适应自旋', '自旋次数由「同一把锁上一次成功自旋的次数」动态决定', '持锁时间短时省掉切换'],
            ['轻量级锁 CAS', '无竞争时用一次 CAS 替代阻塞；栈帧里存锁记录（Displaced Mark Word）', 'HashMap 的 resize 用它']
          ];
          items.forEach((it, k) => {
            const y = 44 + k * 80;
            const on = t * 4.5 > k ? 1 : 0;
            svg.appendChild(H.box(20, y, 860, 68, { stroke: k === 0 ? C.red : C.ink, sw: on ? 1.5 : 1, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, y, 5, 68, { fill: k === 0 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(44, y + 30, it[0], { size: 15, weight: 700, fill: k === 0 ? C.red : C.ink, ls: -.02, opacity: on }));
            svg.appendChild(E(44, y + 50, it[1], { size: 10, fill: C.gray1, opacity: on }));
            svg.appendChild(H.line(700, y + 14, 700, y + 54, { stroke: C.gray3, sw: 0.5, opacity: on }));
            svg.appendChild(E(714, y + 38, it[2], { size: 9, mono: 1, fill: C.red, opacity: on }));
          });
          svg.appendChild(H.box(20, 366, 860, 1, { fill: C.red }));
          svg.appendChild(E(20, 388, '并发编程的实用建议：能用原子类就别用锁，能用 ConcurrentHashMap 别用 HashMap + synchronized', { size: 10, weight: 700, fill: C.red }));
        }
      }
    ]
  });

  /* ==========================================================
     6. 线程池 ThreadPoolExecutor
     ========================================================== */
  R('pool', {
    no: 6, title: '线程池执行流程 + 7 个参数', w: 900, h: 440, dur: 1900,
    steps: [
      {
        label: '7 个参数', cap: '阿里巴巴规约：<b>线程池必须显式指定</b>，不许用 <code>Executors</code>（会造无界队列或可无限创建线程的池）。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const p = [
            ['corePoolSize', '核心线程数', '即使空闲也保留（除非 allowCoreThreadTimeOut）', 100],
            ['maximumPoolSize', '最大线程数', '必须 > corePoolSize，否则只涨到 core', 150],
            ['keepAliveTime', '非核心空闲存活时间', '配合 allowCoreThreadTimeOut 也能回收核心', 60],
            ['unit', '时间单位', 'TimeUnit.SECONDS', 60],
            ['workQueue', '任务队列', '决定「排队」还是「扩容」的先后顺序', 230],
            ['threadFactory', '线程工厂', 'AliSimpleThreadFactory：命名 threadName-N', 250],
            ['handler', '拒绝策略', 'Abort / CallerRuns / Discard / DiscardOldest', 180]
          ];
          p.forEach((x, k) => {
            const on = t * 7 > k ? 1 : 0;
            svg.appendChild(H.box(20, 42 + k * 48, 860, 40, { stroke: C.gray3, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, 42 + k * 48, x[3], 40, { fill: k === 4 ? C.red : C.ink, opacity: on }));
            svg.appendChild(E(34, 67 + k * 48, x[0], { size: 11, mono: 1, weight: 700, fill: k === 4 ? '#fff' : C.red, opacity: on }));
            svg.appendChild(E(180, 67 + k * 48, x[1], { size: 11, weight: 700, opacity: on }));
            svg.appendChild(E(340, 67 + k * 48, x[2], { size: 10, fill: C.gray1, opacity: on }));
          });
          svg.appendChild(E(20, 400, 'JDK 构造校验：maximumPoolSize ≤ 0 或 ≤ corePoolSize → 抛 IllegalArgumentException', { size: 10, fill: C.red, weight: 700 }));
        }
      },
      {
        label: '执行流程', cap: '核心要点：<b>先扩容线程，再入队</b>；队列满了才继续扩到最大线程数；再满才拒绝。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const cx = 300;                       // 主干轴
          const RX = 118, RY = 32;              // 菱形半宽/半高
          const AX = 560, AW = 320;              // 右侧动作列
          svg.appendChild(H.path(`M ${cx} 26 L ${cx} 74`, { stroke: C.ink, sw: 1.5, arrow: true }));
          svg.appendChild(E(cx, 18, 'execute(task)', { size: 10, mono: 1, weight: 700, anchor: 'middle', fill: C.ink }));

          const dec = (y, label, yes, no, on) => {
            const g = V.e('g', { opacity: on });
            g.appendChild(H.path(`M ${cx} ${y} L ${cx + RX} ${y + RY} L ${cx} ${y + RY * 2} L ${cx - RX} ${y + RY} Z`,
              { fill: C.paper, stroke: C.red, sw: 1.5 }));
            g.appendChild(E(cx, y + RY + 3.5, label, { size: 10, weight: 700, anchor: 'middle', fill: C.ink }));
            g.appendChild(E(cx + RX * 0.55, y + 9, yes, { size: 9, mono: 1, fill: C.red, weight: 700 }));
            g.appendChild(E(cx - RX * 0.55, y + RY * 2 - 6, no, { size: 9, mono: 1, fill: C.gray2 }));
            return g;
          };

          const y1 = 74, y2 = 202, y3 = 300;
          const d1 = clamp01(t * 3);
          svg.appendChild(dec(y1, 'core < count?', '是', '否', d1));
          const d2 = clamp01((t - 0.25) * 3);
          const d3 = clamp01((t - 0.55) * 3);

          // 否 → 下一级
          if (d2 > 0) {
            svg.appendChild(H.path(`M ${cx} ${y1 + RY * 2} L ${cx} ${y2 - 4}`, { stroke: C.ink, sw: 1.5, arrow: true, opacity: d2 }));
          }
          svg.appendChild(dec(y2, 'workQueue.offer() 成功?', '是', '否', d2));
          if (d3 > 0) {
            svg.appendChild(H.path(`M ${cx} ${y2 + RY * 2} L ${cx} ${y3 - 4}`, { stroke: C.ink, sw: 1.5, arrow: true, opacity: d3 }));
          }
          svg.appendChild(dec(y3, 'count < max?', '是', '否', d3));

          // 右侧动作列
          const acts = [
            [y1 + RY, 'corePoolSize.addWorker(task, true)', '创建核心线程执行', 0],
            [y2 + RY, 'task 留在队列中', '等核心线程空闲时取出', .25],
            [y3 + RY, 'maximumPoolSize.addWorker(task, false)', '创建非核心线程执行', .55]
          ];
          acts.forEach(a => {
            const on = clamp01((t - a[3]) * 3);
            if (on <= 0) return;
            svg.appendChild(H.path(`M ${cx + RX} ${a[0]} L ${AX} ${a[0]}`, { stroke: C.gray2, dash: '3 3', opacity: on * .8 }));
            svg.appendChild(H.box(AX, a[0] - 19, AW, 38, { stroke: C.ink, opacity: on }));
            svg.appendChild(E(AX + 12, a[0] - 4, a[1], { size: 9, mono: 1, fill: C.ink, opacity: on }));
            svg.appendChild(E(AX + 12, a[0] + 11, a[2], { size: 8, fill: C.gray1, opacity: on }));
          });

          // 拒绝：向左下走，避开菱形与动作列
          const ron = clamp01((t - 0.8) * 3);
          if (ron > 0) {
            const ry = y3 + RY * 2 + 26;
            svg.appendChild(H.path(`M ${cx - RX} ${y3 + RY} L ${cx - RX - 40} ${y3 + RY} L ${cx - RX - 40} ${ry}`,
              { stroke: C.red, sw: 1.5, opacity: ron, fill: 'none' }));
            svg.appendChild(H.path(`M ${cx - RX - 40} ${ry - 8} l -4 8 l 8 0 z`, { fill: C.red, opacity: ron }));
            svg.appendChild(H.box(20, ry + 8, 300, 42, { fill: C.red, stroke: C.red, opacity: ron }));
            svg.appendChild(E(32, ry + 26, 'handler.rejectedExecution()', { size: 9, mono: 1, fill: '#fff', opacity: ron }));
            svg.appendChild(E(32, ry + 42, 'AbortException / CallerRunsPolicy', { size: 8, fill: '#fff', opacity: ron }));
          }

          // 强调：顺序
          const eon = clamp01((t - 0.15) * 3);
          if (eon > 0) {
            svg.appendChild(H.box(20, 20, 210, 52, { stroke: C.red, opacity: eon }));
            svg.appendChild(E(32, 40, '⚠ 最容易被问反的顺序', { size: 10, weight: 700, fill: C.red, opacity: eon }));
            svg.appendChild(E(32, 58, '是「先建线程，后入队」', { size: 9, fill: C.gray1, opacity: eon }));
          }
          svg.appendChild(E(AX, 424, '横轴 = 任务提交后的处理路径；三个菱形是三个判断点', { size: 9, fill: C.gray2 }));
        }
      },
      {
        label: '工作过程', cap: '看图说话：前 5 个任务进队列，队列满了才创建第 6 个线程，超过最大线程数直接拒绝。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // 线程行
          svg.appendChild(E(20, 34, '线程', { size: 10, fill: C.gray2, ls: 1 }));
          svg.appendChild(E(160, 34, 'T1   T2   T3   T4   T5   T6   T7   T8   T9', { size: 10, mono: 1, fill: C.gray2 }));
          svg.appendChild(E(760, 34, '队列', { size: 10, fill: C.gray2, ls: 1 }));
          svg.appendChild(E(810, 34, '1..5 满', { size: 10, mono: 1, fill: C.gray2 }));
          const rows = [
            { n: 'T1', y: 50, a: 0, b: 3 },
            { n: 'T2', y: 82, a: 1, b: 4 },
            { n: 'T3', y: 114, a: 2, b: 5 },
            { n: 'T4', y: 146, a: 4, b: 6 },
            { n: 'T5', y: 178, a: 5, b: 7 },
            { n: 'T6', y: 210, a: 7, b: 8 }
          ];
          const colW = 60, x0 = 160;
          // 队列柱
          const qx = 810;
          for (let k = 0; k < 5; k++) {
            svg.appendChild(H.box(qx + k * 12, 46, 10, 190, { stroke: C.gray3, opacity: .7 }));
          }
          const qFill = easeOut(clamp01((t - 0.15) * 2));
          svg.appendChild(H.box(qx, 46, 12 * 5 * qFill, 190, { fill: C.paper3 }));
          rows.forEach((r, k) => {
            const on = clamp01((t - 0.05 - k * 0.07) * 2.5);
            svg.appendChild(E(20, r.y + 18, r.n, { size: 12, mono: 1, weight: 700, fill: k >= 4 ? C.red : C.ink, opacity: on }));
            svg.appendChild(H.line(150, r.y + 14, qx - 10, r.y + 14, { stroke: C.gray3, sw: 0.5, opacity: on * .6 }));
            // busy bar
            const xa = x0 + r.a * colW, xb = x0 + r.b * colW;
            svg.appendChild(H.box(xa, r.y, xb - xa, 28, { fill: C.red, opacity: 0.9 * on }));
            svg.appendChild(E(xa + 6, r.y + 18, 'T' + (r.a + 1), { size: 9, mono: 1, fill: '#fff', opacity: on }));
            svg.appendChild(E(xa + 34, r.y + 18, '→', { size: 9, mono: 1, fill: '#fff', opacity: on }));
            svg.appendChild(E(xb + 6, r.y + 18, 'T' + (r.b + 1), { size: 9, mono: 1, fill: C.gray1, opacity: on }));
          });
          // 拒绝标记
          const ron = clamp01((t - 0.6) * 2.5);
          svg.appendChild(H.box(160, 250, 480, 40, { fill: C.red, stroke: C.red, opacity: ron }));
          svg.appendChild(E(174, 275, '任务 7、8、9 → 队列满 且 线程数=6=max → 走拒绝策略', { size: 11, weight: 700, fill: '#fff', opacity: ron }));
          // 队列标注
          svg.appendChild(H.line(qx + 60, 46, qx + 60, 236, { stroke: C.gray2, dash: '3 3', opacity: clamp01(t * 2) }));
          svg.appendChild(E(qx + 4, 260, 'ArrayBlockingQueue(5)', { size: 9, mono: 1, fill: C.gray1, opacity: clamp01(t * 2) }));
          // 底部说明
          const notes = [
            ['为什么不用 LinkedBlockingQueue', '无界队列 → maximumPoolSize 永远不生效 → OOM 风险'],
            ['线程数怎么定', 'CPU 密集 = N+1；IO 密集 ≈ N × (1 + WT/ST)，WT=等待 ST=计算'],
            ['为什么要自定义 ThreadFactory', '默认 Thread-0 不好排查；必须显式命名']
          ];
          notes.forEach((n, k) => {
            const no = clamp01((t - 0.7 - k * 0.08) * 3);
            svg.appendChild(H.box(20, 302 + k * 32, 840, 28, { stroke: C.gray3, opacity: no }));
            svg.appendChild(E(34, 320 + k * 32, n[0], { size: 10, weight: 700, fill: k === 0 ? C.red : C.ink, opacity: no }));
            svg.appendChild(E(280, 320 + k * 32, n[1], { size: 9, fill: C.gray1, opacity: no }));
          });
        }
      },
      {
        label: '拒绝策略', cap: '四种内置策略 + Ali 第五种。<b>华为 OD 常问：线程池满了业务怎么办？</b>',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const pol = [
            ['AbortPolicy', '默认', '抛 RejectedExecutionException', '调用方需自己 catch，可能丢失请求', C.red],
            ['CallerRunsPolicy', '推荐', '提交任务的线程自己跑', '天然限流！调用方变慢就等于降速', C.red],
            ['DiscardPolicy', '静默丢弃', '什么都不做', '数据丢失，但系统不崩', C.ink],
            ['DiscardOldestPolicy', '丢最老的', '丢队首再重试', '要处理重试逻辑，不常用', C.ink]
          ];
          pol.forEach((p, k) => {
            const y = 44 + k * 66;
            const on = t * 4.5 > k ? 1 : 0;
            svg.appendChild(H.box(20, y, 860, 56, { stroke: p[4], sw: 1.5, opacity: 0.4 + 0.6 * on }));
            svg.appendChild(H.box(20, y, 6, 56, { fill: p[4], opacity: on }));
            svg.appendChild(E(42, y + 24, p[0], { size: 13, mono: 1, weight: 700, fill: p[4], opacity: on }));
            svg.appendChild(H.chip(220, y + 16, p[1], { w: 76, h: 22, size: 9, fill: p[4], tc: '#fff', stroke: p[4], opacity: on }));
            svg.appendChild(E(312, y + 32, p[2], { size: 11, weight: 500, opacity: on }));
            svg.appendChild(E(600, y + 32, p[3], { size: 9, fill: C.gray1, opacity: on }));
          });
          const o = clamp01((t - 0.55) * 2.5);
          svg.appendChild(H.box(20, 314, 860, 60, { fill: C.red, stroke: C.red, opacity: o }));
          svg.appendChild(E(34, 338, '阿里规约强制要求：自定义 RejectedExecutionHandler', { size: 12, weight: 700, fill: '#fff', opacity: o }));
          svg.appendChild(E(34, 360, '拒绝时打印堆栈 + 上报监控（Trace / 告警），让问题暴露在调用方，而不是默默丢', { size: 10, fill: '#fff', opacity: o }));
        }
      }
    ]
  });

})(window.VIZ);
