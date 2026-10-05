/* ============================================================
   网络 / IO 图解
   ============================================================ */
(function (V) {
  'use strict';
  const R = (id, s) => V.register(id, s);
  const H = V.H, e = V.e;
  const C = V.C;
  const easeOut = V.easeOut, easeIn = V.easeIn, clamp01 = V.clamp01, lerp = V.lerp;

  /* ==========================================================
     TCP 三次握手 / 四次挥手 —— 状态机
     ========================================================== */
  R('tcp', {
    no: 10, title: 'TCP 连接与关闭：为什么必须三次握手', w: 900, h: 420, dur: 2100,
    steps: [
      {
        label: '两次握手', cap: '如果只有两次，<b>服务端无法确认客户端是否收到自己的 SYN-ACK</b>，也无法确认客户端是真实客户端而非历史连接的残留。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const cL = 170, cR = 700;
          svg.appendChild(H.box(cL - 110, 40, 220, 54, { stroke: C.ink, sw: 1.5 }));
          svg.appendChild(E(cL, 66, '客户端 Client', { size: 12, weight: 700, anchor: 'middle' }));
          svg.appendChild(E(cL, 84, 'CLOSED', { size: 10, mono: 1, fill: C.gray2, anchor: 'middle' }));
          svg.appendChild(H.box(cR - 110, 40, 220, 54, { stroke: C.ink, sw: 1.5 }));
          svg.appendChild(E(cR, 66, '服务端 Server', { size: 12, weight: 700, anchor: 'middle' }));
          svg.appendChild(E(cR, 84, 'LISTEN', { size: 10, mono: 1, fill: C.gray2, anchor: 'middle' }));
          // 轴
          svg.appendChild(H.line(cL, 96, cL, 360, { stroke: C.gray3, dash: '4 3' }));
          svg.appendChild(H.line(cR, 96, cR, 360, { stroke: C.gray3, dash: '4 3' }));

          const p1 = easeOut(clamp01(t * 2.5));
          // SYN
          svg.appendChild(H.line(cL, 130, lerp(cL, cR, p1), 130, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(H.path(`M ${lerp(cL, cR, p1)} 130 l -8 -4 l 0 8 z`, { fill: C.red, opacity: p1 }));
          svg.appendChild(E(cL + 8, 124, 'SYN(seq=x)  seq=0', { size: 10, mono: 1, fill: C.red, opacity: p1 }));
          // SYN-ACK
          const p2 = easeOut(clamp01((t - 0.28) * 2.5));
          svg.appendChild(H.line(cR, 175, lerp(cR, cL, p2), 175, { stroke: C.red, sw: 1.5, opacity: p2 }));
          svg.appendChild(H.path(`M ${lerp(cR, cL, p2)} 175 l 8 -4 l 0 8 z`, { fill: C.red, opacity: p2 }));
          svg.appendChild(E(cR - 8, 169, 'SYN+ACK(seq=y, ack=x+1)  seq=0', { size: 10, mono: 1, fill: C.red, anchor: 'end', opacity: p2 }));

          // 状态
          const a1 = clamp01((t - 0.12) * 4), a2 = clamp01((t - 0.34) * 4);
          svg.appendChild(H.chip(cL - 46, 108, 'SYN-SENT', { w: 92, h: 20, size: 9, stroke: C.gray2, tc: C.gray1, mono: 1, opacity: a1 }));
          svg.appendChild(H.chip(cR - 46, 153, 'SYN-RECEIVED', { w: 92, h: 20, size: 9, stroke: C.gray2, tc: C.gray1, mono: 1, opacity: a2 }));

          // 缺口标记
          const g = clamp01((t - 0.55) * 2.5);
          if (g > 0) {
            const my = 218;
            svg.appendChild(H.line(cL, my, cL, my + 24, { stroke: C.red, sw: 2, dash: '5 3', opacity: g }));
            svg.appendChild(H.path(`M ${cL} ${my + 24} l -6 -9 l 12 0 z`, { fill: C.red, opacity: g }));
            svg.appendChild(E(cL + 12, my + 16, '第三次 ACK 缺失', { size: 10, weight: 700, fill: C.red, opacity: g }));
            // 历史连接场景
            svg.appendChild(H.box(20, 270, 400, 92, { stroke: C.red, sw: 1.5, opacity: g }));
            svg.appendChild(H.box(20, 270, 4, 92, { fill: C.red, opacity: g }));
            svg.appendChild(E(38, 294, '为什么必须第三次', { size: 11, weight: 700, fill: C.red, opacity: g }));
            svg.appendChild(E(38, 314, '① 服务端无法确认客户端收到了 SYN-ACK', { size: 10, fill: C.gray1, opacity: g }));
            svg.appendChild(E(38, 330, '② 服务端会为一个早已关闭的连接白白分配资源', { size: 10, fill: C.gray1, opacity: g }));
            svg.appendChild(E(38, 350, '③ 客户端无法确认服务端收到了自己的 SYN', { size: 10, fill: C.gray1, opacity: g }));
          }
          // 右栏
          svg.appendChild(H.box(440, 108, 440, 254, { stroke: C.ink }));
          svg.appendChild(H.box(440, 108, 440, 4, { fill: C.ink }));
          svg.appendChild(E(454, 134, 'ISN 怎么生成（面试爱追问）', { size: 11, weight: 700, ls: .5 }));
          [['4 元组', '时间戳 + 主机 IP + 端口 + 随机数', C.red],
           ['5 元组', '再加密一个客户端标识', C.ink]
          ].forEach((r, k) => {
            const y = 152 + k * 44;
            svg.appendChild(E(454, y, r[0], { size: 11, weight: 700, mono: 1, fill: r[2] }));
            svg.appendChild(E(530, y, r[1], { size: 9, fill: C.gray1 }));
          });
          svg.appendChild(E(454, 252, '为什么不能是 2 次？答：', { size: 10, weight: 700, fill: C.red }));
          svg.appendChild(E(454, 272, '两个 ISN 各自只能证明「我发的对方收到了」，', { size: 9, fill: C.gray1 }));
          svg.appendChild(E(454, 288, '无法证明「对方发的我收到了」。三次是达到双向', { size: 9, fill: C.gray1 }));
          svg.appendChild(E(454, 304, '确认所需的最小次数。', { size: 9, fill: C.gray1 }));
          svg.appendChild(E(454, 332, 'SYN Flood：伪造大量 SYN 耗尽半连接队列', { size: 9, mono: 1, fill: C.gray2 }));
          svg.appendChild(E(454, 350, '→ 缓解：SYN_COOKIE / syncookies=1', { size: 9, mono: 1, fill: C.gray2 }));
        }
      },
      {
        label: '三次握手', cap: '第三次握手让服务端<b>确认客户端的 SYN 已被自己收到</b>，同时让客户端确认服务端的 SYN-ACK 已被收到——双向确认完成。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const cL = 170, cR = 700;
          svg.appendChild(H.box(cL - 110, 40, 220, 50, { stroke: C.ink, sw: 1.5 }));
          svg.appendChild(E(cL, 70, '客户端', { size: 12, weight: 700, anchor: 'middle' }));
          svg.appendChild(H.box(cR - 110, 40, 220, 50, { stroke: C.ink, sw: 1.5 }));
          svg.appendChild(E(cR, 70, '服务端', { size: 12, weight: 700, anchor: 'middle' }));
          svg.appendChild(H.line(cL, 92, cL, 340, { stroke: C.gray3, dash: '4 3' }));
          svg.appendChild(H.line(cR, 92, cR, 340, { stroke: C.gray3, dash: '4 3' }));

          const msgs = [
            [118, 1, '① SYN   seq=x', C.red],
            [158, -1, '② SYN+ACK   seq=y ack=x+1', C.red],
            [198, 1, '③ ACK   ack=y+1', C.red],
            [244, 1, '④ ESTABLISHED  可以发数据了', C.ink]
          ];
          msgs.forEach((m, k) => {
            const p = easeOut(clamp01((t - k * 0.16) * 2.6));
            if (p <= 0) return;
            const x1 = m[1] > 0 ? cL : cR, x2 = m[1] > 0 ? cR : cL;
            svg.appendChild(H.line(x1, m[0], lerp(x1, x2, p), m[0], { stroke: m[3], sw: 1.5, opacity: p }));
            svg.appendChild(H.path(`M ${lerp(x1, x2, p)} ${m[0]} l ${m[1] > 0 ? -8 : 8} -4 l 0 8 z`, { fill: m[3], opacity: p }));
            svg.appendChild(E(m[1] > 0 ? cL + 8 : cR - 8, m[0] - 6, m[2], {
              size: 9.5, mono: 1, weight: 700, fill: m[3], opacity: p,
              anchor: m[1] > 0 ? 'start' : 'end'
            }));
          });
          // 状态
          svg.appendChild(H.chip(cL - 46, 210, 'ESTABLISHED', { w: 92, h: 20, size: 9, fill: C.red, tc: '#fff', stroke: C.red, opacity: clamp01((t - 0.5) * 3) }));
          svg.appendChild(H.chip(cR - 46, 210, 'ESTABLISHED', { w: 92, h: 20, size: 9, fill: C.red, tc: '#fff', stroke: C.red, opacity: clamp01((t - 0.5) * 3) }));

          // 缓冲区
          const b = clamp01((t - 0.6) * 2.5);
          svg.appendChild(H.box(20, 262, 390, 100, { stroke: C.ink, opacity: b }));
          svg.appendChild(H.box(20, 262, 4, 100, { fill: C.ink, opacity: b }));
          svg.appendChild(E(38, 286, '连接建立后发生了什么', { size: 11, weight: 700, opacity: b }));
          svg.appendChild(E(38, 308, '双方各有两个缓冲区：SendBuffer / RecvBuffer', { size: 9.5, fill: C.gray1, opacity: b }));
          svg.appendChild(E(38, 328, '发送方 → SendBuffer → 网络 → RecvBuffer → 接收方', { size: 9, mono: 1, fill: C.gray1, opacity: b }));
          svg.appendChild(E(38, 350, '滑动窗口做流量控制（rwnd）', { size: 9, fill: C.ink, opacity: b }));
          svg.appendChild(E(38, 366, '拥塞控制做网络控制（cwnd）', { size: 9, fill: C.red, opacity: b }));

          // 右栏：放在时序图下方，互不遮挡
          svg.appendChild(H.box(430, 250, 450, 160, { stroke: C.ink }));
          svg.appendChild(H.box(430, 250, 450, 4, { fill: C.ink }));
          svg.appendChild(E(444, 274, '四次挥手 & TIME_WAIT', { size: 11, weight: 700, ls: .5 }));
          const fin = [
            ['① FIN', '客户端无数据要发', C.ink],
            ['② ACK', '服务端确认收到 FIN', C.ink],
            ['③ FIN', '服务端把剩余数据发完后发 FIN', C.red],
            ['④ ACK', '客户端回 ACK，然后进 TIME_WAIT', C.red]
          ];
          fin.forEach((f, k) => {
            const y = 296 + k * 22;
            svg.appendChild(E(444, y, f[0], { size: 9.5, mono: 1, weight: 700, fill: f[2] }));
            svg.appendChild(E(506, y, f[1], { size: 8.5, fill: C.gray1 }));
          });
          svg.appendChild(E(444, 396, 'TIME_WAIT 持续 2MSL（约 60s）：确保最后一个 ACK 到达 + 让迷路报文消散', { size: 8.5, fill: C.gray2 }));
        }
      },
      {
        label: '拥塞控制', cap: '四个算法控制发送速率：<b>慢启动 → 拥塞避免 → 快重传 → 快恢复</b>。发送窗口从指数增长变成线性增长。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          svg.appendChild(E(20, 34, '拥塞窗口 cwnd 随时间变化（经典三阶段）', { size: 11, weight: 700, ls: 1 }));
          // 坐标轴
          const X0 = 60, Y0 = 250, W = 800, HGT = 180;
          svg.appendChild(H.line(X0, Y0 - HGT, X0, Y0, { stroke: C.ink }));
          svg.appendChild(H.line(X0, Y0, X0 + W, Y0, { stroke: C.ink }));
          svg.appendChild(E(X0 - 10, Y0 - HGT - 8, 'cwnd', { size: 9, mono: 1, fill: C.gray2, anchor: 'end' }));
          svg.appendChild(E(X0 + W, Y0 + 20, '时间 RTT', { size: 9, mono: 1, fill: C.gray2, anchor: 'end' }));
          // 网格
          for (let k = 1; k <= 4; k++) {
            svg.appendChild(H.line(X0, Y0 - k * HGT / 4, X0 + W, Y0 - k * HGT / 4, { stroke: C.gray3, sw: 0.5 }));
            svg.appendChild(E(X0 - 8, Y0 - k * HGT / 4 + 3, String(1 << (k + 1)), { size: 8, mono: 1, fill: C.gray2, anchor: 'end' }));
          }
          // 慢启动：指数
          const phase1 = easeOut(clamp01(t * 1.6));
          const ssthresh = 20, sMax = 64;
          const expX = 200;
          if (phase1 > 0) {
            svg.appendChild(H.path(`M ${X0} ${Y0} Q ${X0 + expX * 0.5} ${Y0 - 34}, ${X0 + expX} ${Y0 - HGT / 2}`,
              { stroke: C.red, sw: 2, fill: 'none', opacity: phase1 }));
            svg.appendChild(E(X0 + expX / 2, Y0 - HGT / 2 - 12, '① 慢启动 指数增长 cwnd+=1', { size: 10, weight: 700, fill: C.red, anchor: 'middle', opacity: phase1 }));
            svg.appendChild(E(X0 + expX + 6, Y0 - HGT / 2 + 4, 'ssthresh=20', { size: 9, mono: 1, fill: C.gray2, opacity: phase1 }));
            // 阈值线
            svg.appendChild(H.line(X0 + expX, Y0 - HGT / 2, X0 + W - 120, Y0 - HGT / 2, { stroke: C.red, dash: '4 3', opacity: phase1 * .8 }));
          }
          // 拥塞避免：线性
          const phase2 = easeOut(clamp01((t - 0.3) * 1.5));
          if (phase2 > 0) {
            svg.appendChild(H.path(`M ${X0 + expX} ${Y0 - HGT / 2} L ${X0 + expX + 200} ${Y0 - HGT * 0.86}`,
              { stroke: C.red, sw: 2, fill: 'none', opacity: phase2 }));
            svg.appendChild(E(X0 + expX + 110, Y0 - HGT * 0.88, '② 拥塞避免 线性 cwnd+=1/cwnd', { size: 10, weight: 700, fill: C.red, anchor: 'middle', opacity: phase2 }));
          }
          // 超阈值后减半
          const phase3 = easeOut(clamp01((t - 0.62) * 1.5));
          if (phase3 > 0) {
            svg.appendChild(H.path(`M ${X0 + expX + 200} ${Y0 - HGT * 0.86} L ${X0 + expX + 300} ${Y0 - HGT * 0.86}`,
              { stroke: C.red, sw: 2, fill: 'none', opacity: phase3 }));
            svg.appendChild(H.path(`M ${X0 + expX + 300} ${Y0 - HGT * 0.86} C ${X0 + expX + 340} ${Y0 - HGT * 0.84}, ${X0 + expX + 350} ${Y0 - HGT / 2}, ${X0 + expX + 400} ${Y0 - HGT / 2}`,
              { stroke: C.red, sw: 2, fill: 'none', opacity: phase3 }));
            svg.appendChild(E(X0 + expX + 300, Y0 - HGT * 0.86 - 10, '检测到丢包', { size: 9, fill: C.gray1, anchor: 'middle', opacity: phase3 }));
            svg.appendChild(E(X0 + expX + 420, Y0 - HGT / 2 - 12, '③ 快重传+快恢复 cwnd 减半', { size: 10, weight: 700, fill: C.red, opacity: phase3 }));
            svg.appendChild(E(X0 + expX + 420, Y0 - HGT / 2 + 6, 'ssthresh = cwnd/2', { size: 9, mono: 1, fill: C.gray2, opacity: phase3 }));
            svg.appendChild(H.path(`M ${X0 + expX + 400} ${Y0 - HGT / 2} L ${X0 + W} ${Y0 - HGT * 0.68}`,
              { stroke: C.red, sw: 2, fill: 'none', opacity: phase3 }));
            svg.appendChild(E(X0 + expX + 490, Y0 - HGT * 0.72, '继续线性增长', { size: 9, fill: C.gray1, opacity: phase3 }));
          }
          // 底部四算法
          const alg = [
            ['慢启动', 'cwnd 从 1 开始，每个 RTT 翻倍', '已发送字节 < 慢启动阈值'],
            ['拥塞避免', '每个 RTT 只 +1 MSS', '超过慢启动阈值后'],
            ['快重传', '收到 3 个重复 ACK 立即重传', '不用等 RTO 超时'],
            ['快恢复', 'cwnd 减半后继续线性增', '避免回到 1，Karn 算法']
          ];
          const aon = clamp01((t - 0.72) * 3);
          alg.forEach((a, k) => {
            const x = 20 + k * 218;
            svg.appendChild(H.box(x, 280, 202, 88, { stroke: C.gray2, opacity: aon }));
            svg.appendChild(E(x + 12, 302, (k + 1) + '. ' + a[0], { size: 11, weight: 700, fill: C.red, opacity: aon }));
            svg.appendChild(E(x + 12, 322, a[1], { size: 8.5, fill: C.gray1, opacity: aon }));
            svg.appendChild(E(x + 12, 340, '条件：' + a[2], { size: 8, fill: C.gray2, opacity: aon }));
            svg.appendChild(E(x + 12, 358, ['1/2/3/4 轮面试都问', '', '收到 3 个重复 ACK', '面试官爱问「为什么是 3」'][k], {
              size: 8, mono: 1, fill: k === 0 ? C.red : C.gray3, opacity: aon
            }));
          });
        }
      }
    ]
  });

  /* ==========================================================
     epoll vs select
     ========================================================== */
  R('epoll', {
    no: 11, title: 'epoll vs select vs poll：IO 多路复用', w: 900, h: 400, dur: 1900,
    steps: [
      {
        label: 'select 的问题', cap: 'select 每次调用都要<b>把 fd 集合从用户态全量拷到内核态</b>，返回后还要<b>全量遍历</b>找就绪事件——fd 越多越慢。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // 用户态 fd 集合
          svg.appendChild(H.box(20, 40, 300, 200, { stroke: C.ink }));
          svg.appendChild(H.box(20, 40, 300, 4, { fill: C.ink }));
          svg.appendChild(E(34, 66, '用户态进程', { size: 11, weight: 700, ls: .5 }));
          for (let k = 0; k < 6; k++) {
            const on = clamp01((t * 3 - k * 0.12) * 2);
            svg.appendChild(H.box(34 + (k % 2) * 140, 80 + Math.floor(k / 2) * 46, 128, 38, { stroke: C.gray2, opacity: 0.3 + 0.7 * on }));
            svg.appendChild(E(46 + (k % 2) * 140, 104 + Math.floor(k / 2) * 46, 'fd ' + k, { size: 10, mono: 1, opacity: 0.3 + 0.7 * on }));
          }
          // 箭头：全量拷贝
          const cp = easeOut(clamp01(t * 1.6));
          svg.appendChild(H.line(320, 120, 560, 120, { stroke: C.red, sw: 1.5 }));
          svg.appendChild(H.path('M 560 120 l -9 -4 l 0 8 z', { fill: C.red, opacity: cp }));
          svg.appendChild(E(440, 110, '每次都要全量拷贝 fd_set', { size: 10, weight: 700, fill: C.red, anchor: 'middle', opacity: cp }));
          // 内核态
          svg.appendChild(H.box(570, 40, 310, 200, { stroke: C.ink }));
          svg.appendChild(H.box(570, 40, 310, 4, { fill: C.ink }));
          svg.appendChild(E(584, 66, '内核态', { size: 11, weight: 700, ls: .5 }));
          for (let k = 0; k < 6; k++) {
            const on = clamp01((t * 3 - k * 0.12) * 2);
            svg.appendChild(H.box(584 + (k % 2) * 140, 80 + Math.floor(k / 2) * 46, 128, 38, { stroke: C.gray2, opacity: 0.3 + 0.7 * on }));
            // 有一个 fd 就绪
            const ready = k === 3;
            if (ready && on > 0.8) svg.appendChild(H.box(584 + (k % 2) * 140, 80 + Math.floor(k / 2) * 46, 128, 38, { fill: C.red, stroke: C.red }));
            svg.appendChild(E(596 + (k % 2) * 140, 104 + Math.floor(k / 2) * 46, 'fd ' + k + (ready ? '  可读' : ''), {
              size: 10, mono: 1, fill: ready && on > 0.8 ? '#fff' : C.ink, opacity: 0.3 + 0.7 * on
            }));
          }
          // 遍历箭头
          const tr = easeOut(clamp01((t - 0.4) * 1.8));
          if (tr > 0) {
            svg.appendChild(H.path('M 700 130 L 600 130 L 740 130', { stroke: C.red, sw: 1.5, fill: 'none', opacity: tr }));
            svg.appendChild(H.path('M 740 130 l -8 -4 l 0 8 z', { fill: C.red, opacity: tr }));
            svg.appendChild(E(725, 148, '返回后要全量遍历才知道哪个就绪', { size: 9.5, fill: C.red, anchor: 'middle', opacity: tr }));
          }
          // 底部三宗罪
          const sins = [
            ['① O(n) 拷贝', '每次调用全量搬运 fd_set，n 大时 CPU 浪费严重'],
            ['② O(n) 遍历', '返回后要线性扫描整个集合才能找出就绪项'],
            ['③ 1024 上限', 'fd_set 是位图，FD_SETSIZE 固定 1024，超了要改内核']
          ];
          sins.forEach((s, k) => {
            const on = clamp01((t - 0.55 - k * 0.1) * 3);
            svg.appendChild(H.box(20, 268 + k * 44, 860, 38, { stroke: C.gray3, opacity: on }));
            svg.appendChild(H.box(20, 268 + k * 44, 4, 38, { fill: C.red, opacity: on }));
            svg.appendChild(E(38, 292 + k * 44, s[0], { size: 11, weight: 700, fill: C.red, opacity: on }));
            svg.appendChild(E(200, 292 + k * 44, s[1], { size: 10, fill: C.gray1, opacity: on }));
          });
        }
      },
      {
        label: 'epoll 三件套', cap: 'epoll 的核心是：<b>fd 只需注册一次就不用再传</b>（红黑树），就绪事件单独放<b>就绪链表</b>（返回时只遍历就绪的）。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          // epoll_create
          const step1 = clamp01(t * 2);
          svg.appendChild(H.box(20, 40, 250, 120, { stroke: C.red, sw: 1.5, opacity: step1 }));
          svg.appendChild(H.box(20, 40, 4, 120, { fill: C.red, opacity: step1 }));
          svg.appendChild(E(38, 64, '① int epfd = epoll_create()', { size: 10, mono: 1, weight: 700, fill: C.red, opacity: step1 }));
          svg.appendChild(E(38, 84, '创建一个 epoll 实例，内核中对应', { size: 9, fill: C.gray1, opacity: step1 }));
          svg.appendChild(E(38, 100, '一个 struct eventpoll（内核对象）', { size: 9, fill: C.gray1, opacity: step1 }));
          svg.appendChild(E(38, 122, 'int = 就是一个文件描述符', { size: 9, mono: 1, fill: C.gray2, opacity: step1 }));

          // 内部结构
          const step2 = clamp01((t - 0.2) * 2);
          svg.appendChild(H.box(300, 40, 580, 214, { stroke: C.ink, opacity: step2 }));
          svg.appendChild(H.box(300, 40, 580, 4, { fill: C.ink, opacity: step2 }));
          svg.appendChild(E(314, 66, 'struct eventpoll 内核结构', { size: 11, weight: 700, mono: 1, opacity: step2 }));
          // 红黑树
          svg.appendChild(H.box(314, 78, 270, 160, { stroke: C.gray3, opacity: step2 }));
          svg.appendChild(E(326, 98, '红黑树 —— 所有被监听的 fd', { size: 10, weight: 700, fill: C.ink, opacity: step2 }));
          [[450, 130, 'fd 1', 1], [396, 168, 'fd 2', 0], [504, 168, 'fd 3', 0], [372, 202, 'fd 4', 0], [450, 202, 'fd 5', 1], [528, 202, 'fd 6', 0]]
            .forEach((n, k) => {
              const on = clamp01((t - 0.3 - k * 0.06) * 3);
              if (on <= 0) return;
              svg.appendChild(H.line(450, 124 + 12, n[0], n[1] - 12, { stroke: C.gray2, opacity: on * .7 }));
              svg.appendChild(H.circ(n[0], n[1], 11, { fill: n[3] ? C.red : C.paper, stroke: n[3] ? C.red : C.ink, sw: 1.5, opacity: on }));
              svg.appendChild(E(n[0], n[1] + 4, n[2], { size: 8, mono: 1, anchor: 'middle', fill: n[3] ? '#fff' : C.ink, opacity: on }));
            });
          svg.appendChild(E(326, 230, 'O(log n) 增删查，只在注册时走一次', { size: 8.5, fill: C.gray2, opacity: step2 }));

          // 就绪链表
          svg.appendChild(H.box(600, 78, 266, 160, { stroke: C.red, opacity: step2 }));
          svg.appendChild(H.box(600, 78, 266, 4, { fill: C.red, opacity: step2 }));
          svg.appendChild(E(612, 100, '就绪链表 rdllist —— 已就绪的 fd', { size: 10, weight: 700, fill: C.red, opacity: step2 }));
          svg.appendChild(E(612, 122, 'epoll_wait 只遍历这一条链', { size: 9, fill: C.gray1, opacity: step2 }));
          const ready = clamp01((t - 0.5) * 2.5);
          if (ready > 0) {
            ['fd 1', 'fd 5', 'fd 3'].forEach((s, k) => {
              const on = clamp01((t - 0.5 - k * 0.1) * 3);
              svg.appendChild(H.chip(612, 136 + k * 26, s + '  可读', { w: 120, h: 20, size: 9, fill: C.red, tc: '#fff', stroke: C.red, opacity: on }));
              if (k < 2) svg.appendChild(H.line(672, 156 + k * 26, 672, 162 + k * 26, { stroke: C.red, opacity: on }));
            });
          }

          // 三步流程
          const flow = [
            ['② epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev)', '把 fd 加进红黑树，并注册关心的事件'],
            ['③ epoll_wait(epfd, events, max, timeout)', '阻塞直到有事件；返回时只拷贝就绪链表里的 fd']
          ];
          flow.forEach((f, k) => {
            const y = 276 + k * 52;
            const on = clamp01((t - 0.62 - k * 0.12) * 3);
            svg.appendChild(H.box(20, y, 860, 44, { stroke: C.gray3, opacity: on }));
            svg.appendChild(E(36, y + 20, f[0], { size: 10, mono: 1, weight: 700, opacity: on }));
            svg.appendChild(E(36, y + 36, f[1], { size: 9, fill: C.gray1, opacity: on }));
          });
        }
      },
      {
        label: '水平触发 vs 边缘触发', cap: '这是 Nginx / Netty / Redis 都有的经典题。LT 通知「有数据」，ET 通知「数据变化了」——ET 必须一次读干净，否则会丢事件。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const modes = [
            { n: '水平触发 LT', s: 'Level-Triggered', d: '只要缓冲区还有数据就持续通知', col: C.ink, key: '只要没读完 → 一直通知 → 不会丢事件' },
            { n: '边缘触发 ET', s: 'Edge-Triggered', d: '只在数据「到达」时通知一次', col: C.red, key: '通知一次就结束 → 必须一次读完' }
          ];
          modes.forEach((m, k) => {
            const x = 20 + k * 440;
            svg.appendChild(H.box(x, 40, 420, 236, { stroke: m.col, sw: 1.5 }));
            svg.appendChild(H.box(x, 40, 420, 4, { fill: m.col }));
            svg.appendChild(E(x + 16, 68, m.n, { size: 15, weight: 700, fill: m.col }));
            svg.appendChild(E(x + 16, 88, m.s, { size: 9, mono: 1, fill: C.gray2 }));
            // 缓冲区
            svg.appendChild(E(x + 16, 116, 'socket 接收缓冲区', { size: 9, fill: C.gray2 }));
            svg.appendChild(H.box(x + 16, 124, 388, 34, { stroke: C.gray3 }));
            const fillOn = clamp01((t - 0.2) * 2.5);
            svg.appendChild(H.box(x + 16, 124, 388 * 0.7 * fillOn, 34, { fill: m.col, opacity: .3 * fillOn }));
            svg.appendChild(E(x + 30, 146, 'ABCD  EFGH', { size: 10, mono: 1, fill: m.col, opacity: fillOn }));
            // 通知次数
            const nt = k === 0 ? 6 : 1;
            svg.appendChild(E(x + 16, 182, '通知次数：', { size: 10, weight: 700 }));
            for (let i = 0; i < nt; i++) {
              const on = clamp01((t - 0.4 - (k === 0 ? i * 0.08 : 0)) * 3);
              svg.appendChild(H.chip(x + 90 + i * 30, 168, '!', { w: 22, h: 16, size: 9, fill: m.col, tc: '#fff', stroke: m.col, opacity: on }));
            }
            svg.appendChild(E(x + 16, 208, m.d, { size: 9.5, fill: C.gray1 }));
            svg.appendChild(E(x + 16, 228, '代表：', { size: 9, fill: C.gray2 }));
            svg.appendChild(E(x + 16, 246, m.key, { size: 9, fill: k === 0 ? C.ink : C.red, weight: k === 1 ? 700 : 400 }));
            svg.appendChild(E(x + 16, 264, k === 0 ? 'select / poll 默认是 LT' : 'epoll 可选；Nginx 用 ET + 非阻塞 IO', { size: 8.5, fill: C.gray2 }));
          });
          // ET 正确写法
          const w = clamp01((t - 0.62) * 2.5);
          if (w > 0) {
            svg.appendChild(H.box(20, 300, 860, 96, { fill: C.codeBg, stroke: C.codeBg, opacity: w }));
            svg.appendChild(E(36, 322, 'ET 的唯一正确写法：非阻塞 + 循环读到 EAGAIN', { size: 11, weight: 700, fill: '#fff', opacity: w }));
            const code = [
              '// ET 下只 read 一次 → 剩余数据永远不再通知 → 事件丢失！',
              'while ((n = read(fd, buf, sizeof buf)) > 0) { write(fd, buf, n); }',
              'if (n == -1 && errno == EAGAIN) { /* 读干净了，正常退出循环 */ }'
            ];
            code.forEach((s, k) => svg.appendChild(E(36, 346 + k * 16, s, {
              size: 9, mono: 1, fill: k === 0 ? '#E8493C' : '#CFC8C4', opacity: w
            })));
          }
        }
      }
    ]
  });

  /* ==========================================================
     分布式限流
     ========================================================== */
  R('limit', {
    no: 12, title: '分布式限流：100w 总量如何分到 100 台机', w: 900, h: 480, dur: 1900,
    steps: [
      {
        label: '单机能做什么', cap: '单机限流（令牌桶 / 滑动窗口）只能保护<b>自己这一台</b>。100 台机各有 1w 配额，加起来还是 100w——总量没被约束住。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          svg.appendChild(H.arrowheadRed());
          // 需求
          svg.appendChild(H.box(20, 40, 860, 50, { fill: C.red, stroke: C.red }));
          svg.appendChild(E(36, 64, '需求：全集群总量 100w / 秒，均匀分到 100 台机', { size: 13, weight: 700, fill: '#fff' }));
          svg.appendChild(E(36, 82, '→ 每台机拿到 10000/s 的配额，但机器数会动态扩缩容，静态分配就不准了', { size: 9.5, fill: '#fff' }));

          // 方案对比
          const plans = [
            ['✗ 静态均分', '启动时按机器数除以总量', '扩容后新机器不知道自己的配额；缩容后老机器还占着份额浪费'],
            ['✗ 各自为战', '每台机独立限 1w/s', '集群上限 = 10000 × 实例数，机器越多上限越高'],
            ['△ 固定预留', '按最大机器数预留，超出部分共享池', '需要预估容量上限，扩容到超过预留就崩'],
            ['✓ 中央令牌', 'Redis 统一发令牌，各机来抢', '总量精确，但 Redis 成为单点热点']
          ];
          plans.forEach((p, k) => {
            const y = 108 + k * 56;
            const on = clamp01((t * 5 - k) * 2.2);
            const good = p[0][0] === '✓';
            const mid = p[0][0] === '△';
            const col = good ? C.red : mid ? C.gray1 : C.gray2;
            svg.appendChild(H.box(20, y, 860, 48, { stroke: good ? C.red : C.gray3, opacity: on }));
            svg.appendChild(H.box(20, y, 5, 48, { fill: col, opacity: on }));
            svg.appendChild(E(40, y + 21, p[0], { size: 12, weight: 700, mono: 1, fill: col, opacity: on }));
            svg.appendChild(E(190, y + 21, p[1], { size: 10, fill: C.ink, opacity: on }));
            svg.appendChild(E(190, y + 39, p[2], { size: 9, fill: C.gray1, opacity: on }));
          });
        }
      },
      {
        label: '令牌桶分配', cap: '核心思路：<b>Redis 存一个全局令牌桶，各机来「借」令牌</b>。借到的额度就是它这一轮允许通过的量。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          svg.appendChild(H.arrowheadRed());
          // Redis 中心
          const o = easeOut(clamp01(t * 1.6));
          svg.appendChild(H.box(330, 44, 240, 118, { fill: C.red, stroke: C.red, opacity: o }));
          svg.appendChild(E(450, 70, 'Redis 全局令牌桶', { size: 12, weight: 700, fill: '#fff', anchor: 'middle', opacity: o }));
          svg.appendChild(E(450, 92, 'capacity=1000000  rate=1000000/s', { size: 9.5, mono: 1, fill: '#fff', anchor: 'middle', opacity: o }));
          svg.appendChild(E(450, 112, 'available 当前余额', { size: 9, mono: 1, fill: '#fff', anchor: 'middle', opacity: o }));
          const av = clamp01((t - 0.3) * 2);
          svg.appendChild(E(450, 134, '取走 → ' + Math.round(1000000 * (1 - av * 0.6)), { size: 10, mono: 1, weight: 700, fill: '#fff', anchor: 'middle', opacity: o }));

          // 机器
          for (let k = 0; k < 4; k++) {
            const x = 20 + k * 116, y = 214;
            const on = clamp01((t - 0.2 - k * 0.1) * 2.5);
            svg.appendChild(H.box(x, y, 100, 62, { stroke: C.ink, opacity: on }));
            svg.appendChild(H.box(x, y, 4, 62, { fill: C.ink, opacity: on }));
            svg.appendChild(E(x + 52, y + 24, '机器 ' + (k + 1), { size: 9.5, weight: 700, anchor: 'middle', opacity: on }));
            // 借到多少：总量 100w / 4 台 = 25w/台，每台再分 3 轮借
            const got = clamp01((t - 0.35 - k * 0.1) * 2.5);
            const total = 1000000, per = Math.round(total / 4 * got);
            svg.appendChild(E(x + 52, y + 44, per.toLocaleString(), { size: 9.5, mono: 1, weight: 700, fill: C.red, anchor: 'middle', opacity: on }));
            svg.appendChild(E(x + 52, y + 57, 'tokens', { size: 7.5, mono: 1, fill: C.gray2, anchor: 'middle', opacity: on }));
            // 连线
            const px = x + 50, py = y;
            svg.appendChild(H.path(`M ${px} ${py} C ${px} ${py - 34}, 450 190, 450 164`, { stroke: C.red, sw: 1.5, fill: 'none', opacity: on * 0.8 }));
            svg.appendChild(H.path(`M 450 164 l -4 9 l 8 0 z`, { fill: C.red, opacity: on * 0.8 }));
          }
          // 回到 450 右侧
          svg.appendChild(E(530, 296, '每轮（1s）流程', { size: 10.5, weight: 700, fill: C.red }));
          const steps = [
            'Redis 按 rate 匀速补充令牌',
            '各机用 Lua 原子地「取」一批',
            '取到的额度存本地，下一轮再来借',
            '本地桶按自己的额度再限一层'
          ];
          steps.forEach((s, k) => {
            const on = clamp01((t - 0.5 - k * 0.1) * 2.5);
            const y = 316 + k * 17;
            svg.appendChild(E(530, y, (k + 1) + '. ' + s + '  →  ' +
              ['总量不超 100w', '并发安全不超发', '减少 Redis 调用', '兜底防单机被打爆'][k],
              { size: 8.5, fill: C.ink, opacity: on }));
          });
          // Lua
          const l = clamp01((t - 0.8) * 3);
          if (l > 0) {
            svg.appendChild(H.box(20, 388, 860, 78, { fill: C.codeBg, stroke: C.codeBg, opacity: l }));
            svg.appendChild(E(34, 410, '-- 取令牌的 Lua 脚本（必须原子，否则并发下会超发）', { size: 9.5, mono: 1, fill: '#E8493C', opacity: l }));
            svg.appendChild(E(34, 428, 'local n = tonumber(redis.call("GET", KEYS[1]) or 0)   local want = tonumber(ARGV[1])', { size: 9, mono: 1, fill: '#CFC8C4', opacity: l }));
            svg.appendChild(E(34, 446, 'if n >= want then redis.call("DECRBY", KEYS[1], want) return want else return -1 end', { size: 9, mono: 1, fill: '#CFC8C4', opacity: l }));
          }
        }
      },
      {
        label: '平滑的替代方案', cap: '不想让 Redis 承受全部压力，还有<b>单机算法 + 动态配额协商</b>和<b>网关层统一限流</b>两条路。',
        draw(svg, { t, e: E }) {
          svg.appendChild(H.arrowhead());
          const alts = [
            {
              n: '方案 A  动态配额协商', col: C.red,
              pts: ['每个机实例启动时注册到 Redis，携带自己的实例数', 'Nacos / ZK 维护当前存活实例数 N', '每台机每轮从 Redis 取 total/N 的额度', '某个机挂了 → 下轮自动均摊，浪费的额度被回收'],
              pro: '额度始终贴合真实容量，扩缩容自动适配',
              con: '依赖注册中心与配置同步，有秒级延迟'
            },
            {
              n: '方案 B  网关层统一限流', col: C.ink,
              pts: ['Nginx / API Gateway 按 path 做令牌桶', '令牌桶用 Lua + shared dict 存（每 worker 独立）', '或用 Nginx Plus / APISIX / Kong 走 Redis 集中计数', '限流在流量入口，业务代码零感知'],
              pro: '业务无侵入，规则改动不用发版',
              con: '单机网关也要多机，规则要同步'
            }
          ];
          alts.forEach((a, k) => {
            const x = 20 + k * 440;
            const on = clamp01((t * 2.4 - k) * 2.2);
            svg.appendChild(H.box(x, 40, 420, 300, { stroke: a.col, sw: 1.5, opacity: on }));
            svg.appendChild(H.box(x, 40, 420, 4, { fill: a.col, opacity: on }));
            svg.appendChild(E(x + 16, 68, a.n, { size: 13, weight: 700, fill: a.col, opacity: on }));
            a.pts.forEach((p, i) => {
              const pon = clamp01((t * 2.4 - k - i * 0.08) * 2.2);
              svg.appendChild(E(x + 16, 96 + i * 42, (i + 1) + '', { size: 10, mono: 1, weight: 700, fill: C.red, opacity: pon }));
              svg.appendChild(E(x + 38, 96 + i * 42, p.length > 26 ? p.slice(0, 26) : p, { size: 9, fill: C.ink, opacity: pon }));
              if (p.length > 26) svg.appendChild(E(x + 38, 109 + i * 42, p.slice(26), { size: 9, fill: C.ink, opacity: pon }));
            });
            svg.appendChild(H.box(x + 16, 264, 388, 30, { fill: a.col, opacity: on * .1 }));
            svg.appendChild(E(x + 26, 284, '✓ ' + a.pro, { size: 9, fill: C.ink, opacity: on }));
            svg.appendChild(H.box(x + 16, 300, 388, 30, { stroke: C.gray3, opacity: on }));
            svg.appendChild(E(x + 26, 320, '✗ ' + a.con, { size: 9, fill: C.gray1, opacity: on }));
          });
          // 底部：答法
          const b = clamp01((t - 0.6) * 2.5);
          svg.appendChild(H.box(20, 356, 860, 50, { fill: C.red, stroke: C.red, opacity: b }));
          svg.appendChild(E(36, 378, '面试答法：先说清「单机限流不够，因为总量没约束」→ 再给中心化方案 → 主动讲出它的缺点（Redis 热点 / 同步延迟）→ 最后说生产上我们怎么权衡', {
            size: 10, weight: 700, fill: '#fff', opacity: b
          }));
          svg.appendChild(E(36, 396, '主动说出取舍，比只说优点更像有经验的人。', { size: 9, fill: '#fff', opacity: b }));
        }
      }
    ]
  });

})(window.VIZ);
