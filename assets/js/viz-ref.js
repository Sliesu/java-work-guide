/* ============================================================
   10. 引用与值 —— 全书第一张图
   ============================================================ */
(function (V) {
  'use strict';
  const R = (id, s) => V.register(id, s);
  const H = V.H;
  const C = V.C;
  const easeOut = V.easeOut, easeIn = V.easeIn, clamp01 = V.clamp01, lerp = V.lerp;

  R('v-ref', {
    no: 0, title: '引用与值：栈里的变量指向堆里的对象', w: 900, h: 400, dur: 1700,
    steps: [
      {
        label: '一次赋值', cap: '<code>User u = new User()</code> 执行完：栈帧里的 <code>u</code> 存的是<b>堆上对象的地址</b>，不是对象本身。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 栈
          svg.appendChild(H.box(20, 48, 280, 130, { stroke: C.ink, opacity: o }));
          svg.appendChild(H.box(20, 48, 280, 4, { fill: C.ink, opacity: o }));
          svg.appendChild(E(36, 74, '虚拟机栈 · main() 栈帧', { size: 10, weight: 700, ls: .5, opacity: o }));
          svg.appendChild(H.box(36, 86, 248, 32, { stroke: C.gray3, opacity: o }));
          svg.appendChild(E(48, 100, '局部变量表', { size: 8, fill: C.gray2, opacity: o }));
          svg.appendChild(E(48, 112, 'slot0', { size: 8, mono: 1, fill: C.gray2, opacity: o }));
          const refO = easeOut(clamp01((t - 0.25) * 2));
          svg.appendChild(H.box(36, 124, 248, 40, { fill: C.red, stroke: C.red, opacity: refO }));
          svg.appendChild(E(48, 140, 'u', { size: 12, mono: 1, weight: 700, fill: '#fff', opacity: refO }));
          svg.appendChild(E(78, 140, '→', { size: 11, mono: 1, fill: '#fff', opacity: refO }));
          svg.appendChild(E(100, 140, '0x0000f100', { size: 12, mono: 1, weight: 700, fill: '#fff', opacity: refO }));
          svg.appendChild(E(48, 158, '（一个地址值）', { size: 8, fill: '#fff', opacity: refO }));
          // 箭头
          const ao = easeOut(clamp01((t - 0.35) * 2));
          svg.appendChild(H.path('M 290 144 C 350 144, 350 144, 410 144', { stroke: C.red, sw: 1.5, opacity: ao }));
          svg.appendChild(H.path('M 410 144 l 8 4 l -8 4 z', { fill: C.red, opacity: ao }));
          // 堆
          const hO = easeOut(clamp01((t - 0.15) * 2));
          svg.appendChild(H.box(430, 48, 300, 130, { stroke: C.red, sw: 1.5, opacity: hO }));
          svg.appendChild(H.box(430, 48, 300, 4, { fill: C.red, opacity: hO }));
          svg.appendChild(E(446, 74, '堆 · 0x0000f100', { size: 10, weight: 700, fill: C.red, mono: 1, ls: .5, opacity: hO }));
          const fields = [['int id', '1'], ['String name', '0x00a2'], ['boolean active', 'true']];
          fields.forEach((f, k) => {
            const fo = clamp01((t - 0.45 - k * 0.1) * 3);
            svg.appendChild(H.box(446, 86 + k * 28, 268, 24, { stroke: C.gray2, opacity: fo }));
            svg.appendChild(E(456, 102 + k * 28, f[0], { size: 9, mono: 1, fill: C.ink, opacity: fo }));
            svg.appendChild(E(704, 102 + k * 28, f[1], { size: 9, mono: 1, fill: C.gray1, anchor: 'end', opacity: fo }));
          });
          // 右侧
          const rO = easeOut(clamp01((t - 0.6) * 2));
          svg.appendChild(H.box(760, 48, 120, 130, { stroke: C.gray3, opacity: rO }));
          svg.appendChild(E(774, 74, '一句话', { size: 10, weight: 700, fill: C.red, opacity: rO }));
          svg.appendChild(E(774, 96, '变量 = 名字', { size: 9, fill: C.gray1, opacity: rO }));
          svg.appendChild(E(774, 114, '引用 = 地址', { size: 9, fill: C.gray1, opacity: rO }));
          svg.appendChild(E(774, 132, '对象 = 数据', { size: 9, fill: C.gray1, opacity: rO }));
          svg.appendChild(E(774, 158, '三者都不是一回事', { size: 8, fill: C.red, opacity: rO }));
          // 关键
          const kO = easeOut(t * 1.4);
          svg.appendChild(H.box(20, 206, 860, 66, { stroke: C.red, opacity: kO }));
          svg.appendChild(H.box(20, 206, 4, 66, { fill: C.red, opacity: kO }));
          svg.appendChild(E(38, 230, '所以：', { size: 12, weight: 700, fill: C.red, opacity: kO }));
          svg.appendChild(E(90, 230, 'u.name = "张三"  会改到堆里的对象 → 生效', { size: 11, fill: C.ink, opacity: kO }));
          svg.appendChild(E(38, 254, '但 u = anotherUser 只是把栈里的地址改了 → 原对象不受影响，这就是「Java 全是值传递」的来源', { size: 11, fill: C.gray1, opacity: kO }));
          // 底部
          const bO = clamp01((t - 0.75) * 2.5);
          svg.appendChild(E(20, 306, 'Java 是「值传递」，但值有两种：基本类型的值 = 数字本身；引用类型的值 = 地址的副本', { size: 11, weight: 700, opacity: bO }));
          const demo = [
            'void swap(User a, User b) { User t = a; a = b; b = t; }   // 外部无影响（改的是形参）',
            'void rename(User a)      { a.setName("李四"); }             // 外部有影响（改的是对象内容）'
          ];
          demo.forEach((s, k) => {
            svg.appendChild(H.box(20, 322 + k * 34, 860, 28, { stroke: k === 0 ? C.gray3 : C.red, opacity: bO * (k === 0 ? 1 : 1.1) }));
            svg.appendChild(E(34, 340 + k * 34, s, { size: 10, mono: 1, fill: k === 0 ? C.gray1 : C.red, opacity: bO }));
          });
        }
      },
      {
        label: '两个变量', cap: '两个引用指向<b>同一个</b>对象时，改一个另一个立刻可见 —— 这也是「为什么用 HashMap 不安全」的根本原因。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const o = easeOut(t * 2);
          // 栈
          svg.appendChild(H.box(20, 48, 320, 110, { stroke: C.ink, opacity: o }));
          svg.appendChild(E(36, 72, '栈', { size: 10, weight: 700, ls: 1, opacity: o }));
          svg.appendChild(H.box(36, 84, 130, 34, { fill: C.red, stroke: C.red, opacity: o }));
          svg.appendChild(E(48, 106, 'a → 0xf100', { size: 10, mono: 1, fill: '#fff', opacity: o }));
          svg.appendChild(H.box(180, 84, 130, 34, { fill: C.red, stroke: C.red, opacity: o }));
          svg.appendChild(E(192, 106, 'b → 0xf100', { size: 10, mono: 1, fill: '#fff', opacity: o }));
          svg.appendChild(E(36, 142, '两个变量，同一个地址', { size: 9, fill: C.gray1, opacity: o }));
          // 连线
          [[101, 0xf100], [245, 0xf100]].forEach((l, k) => {
            svg.appendChild(H.path(`M ${l[0]} 118 C ${l[0]} 150, 500 150, 500 172`, { stroke: C.red, sw: 1.5, opacity: o, dash: '4 3' }));
          });
          // 堆
          svg.appendChild(H.box(420, 172, 240, 120, { stroke: C.red, sw: 1.5, opacity: o }));
          svg.appendChild(E(436, 196, 'User @ 0xf100', { size: 10, weight: 700, fill: C.red, mono: 1, opacity: o }));
          svg.appendChild(H.box(436, 206, 208, 30, { stroke: C.gray2, opacity: o }));
          svg.appendChild(E(446, 226, 'name = ', { size: 10, mono: 1, fill: C.ink, opacity: o }));
          const nameO = easeOut(clamp01((t - 0.3) * 2));
          svg.appendChild(E(524, 226, '张三 → 李四', { size: 10, mono: 1, weight: 700, fill: C.red, opacity: nameO }));
          svg.appendChild(H.box(436, 242, 208, 26, { stroke: C.gray2, opacity: o }));
          svg.appendChild(E(446, 260, 'age = 23', { size: 10, mono: 1, fill: C.ink, opacity: o }));
          // 观察者
          const rO = easeOut(clamp01((t - 0.5) * 2));
          svg.appendChild(H.box(690, 172, 190, 120, { stroke: C.gray2, opacity: rO }));
          svg.appendChild(E(704, 196, 'b.name 读到', { size: 10, fill: C.gray1, opacity: rO }));
          svg.appendChild(E(704, 222, '李四', { size: 20, weight: 700, fill: C.red, opacity: rO }));
          svg.appendChild(E(704, 250, '因为是同一个对象', { size: 8, fill: C.gray2, opacity: rO }));
          // 推论
          const pO = clamp01((t - 0.7) * 2.5);
          svg.appendChild(H.box(20, 300, 860, 88, { stroke: C.red, opacity: pO }));
          svg.appendChild(H.box(20, 300, 4, 88, { fill: C.red, opacity: pO }));
          svg.appendChild(E(38, 324, '这个"共享"就是并发 bug 的根源', { size: 12, weight: 700, fill: C.red, opacity: pO }));
          svg.appendChild(E(38, 346, '非线程安全的 HashMap 存进成员变量 → 多个线程 put/get 同一张表 → 扩容时环形链表或数据丢失', { size: 10, fill: C.gray1, opacity: pO }));
          svg.appendChild(E(38, 364, '所以「线程安全」的本质不是「加锁」，而是「明确谁来保证状态的可见性和一致性」', { size: 10, fill: C.gray1, opacity: pO }));
          svg.appendChild(E(38, 382, '解法：换成 ConcurrentHashMap（CAS + 锁桶），或用 ThreadLocal 让每个线程持有独立副本', { size: 10, fill: C.ink, opacity: pO }));
        }
      }
    ]
  });
})(window.VIZ);
