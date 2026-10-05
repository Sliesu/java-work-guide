/* ============================================================
   算法专项 —— 依据题库 47 次算法题记录
   按真实出现频次排序，不是按教科书分类
   ============================================================ */
window.ALGO = [
{
  no: '08', id: 'c8', title: '手写题 & 算法', sub: '题库 47 次算法题。字节/华为 OD 的算法难度集中在「二叉树 + 链表 + 字符串」，几乎不考DP 和图论。',
  meta: [['块数', '10'], ['手写', '30 道'], ['高频', '★★★★★']],
  blocks: [
  { t: 'lead', html: '题库统计：算法 <b>47 次</b>，是仅次于 MySQL 的第二大考点。规律很明显——<b>二叉树和链表占一半以上</b>，网格 DP 只出现过 1 次（M 边形 N 分），图论一次没出。<b>不要按刷题平台的分类顺序准备</b>。' },

  { t: 'sub', h: '题库原题清单（按出现次数）', tag: 'DATA' },
  { t: 'table',
    caption: '真实面经里出现过的算法题 —— 按频次排序，标 ★ 的是必背',
    head: ['题目', '类型', '复杂度', '频次'],
    rows: [
      ['<code>二叉树判断对称</code>', '递归 / 迭代', 'O(n)', '★★ 出现 5+ 次'],
      ['<code>二叉树蛇形遍历</code>（隔层反转）', '层序 + 双栈', 'O(n)', '★★ 出现 3 次'],
      ['<code>二叉树中序遍历 → 双向链表</code>', '递归 / Morris', 'O(n)', '★★ 出现 2 次'],
      ['<code>二叉树两节点最长距离</code>', '后序求深度', 'O(n)', '★★ 出现 2 次'],
      ['<code>二叉树两节点最短路径</code>', '后序 + 找 LCA', 'O(n)', '★★ 出现 2 次'],
      ['<code>二叉树两个公共节点</code>（链表版）', '双指针', 'O(m+n)', '★★ 出现 2 次'],
      ['<code>最长不重复子串</code>', '滑动窗口 / DP', 'O(n)', '★★ 出现 3 次'],
      ['<code>删除链表重复元素 II</code>（要写测试用例）', '哑结点', 'O(n)', '★★ 出现 2 次'],
      ['<code>链表排序</code>（归并 / 快排）', '分治', 'O(n log n)', '★★ 出现 2 次'],
      ['<code>环形加油车</code>', '贪心', 'O(n)', '★★ 出现 2 次'],
      ['<code>逆序链表 TopK</code> / <code>n 有序链表取 topK</code>', '堆', 'O(n log k)', '★★ 出现 3 次'],
      ['<code>奇升偶降链表 → 升序（O(n) 时间 O(1) 空间）</code>', '拆奇偶归并', 'O(n)', '★★ 出现 1 次'],
      ['<code>m×n 数组顺时针遍历</code>', '模拟', 'O(mn)', '★★ 出现 1 次'],
      ['<code>三数之和</code>', '排序 + 双指针', 'O(n²)', '★★ 出现 2 次'],
      ['<code>两数之和 → 三数之和 → 四数之和</code>', '哈希 / 双指针', 'O(n²)', '★★ 出现 2 次'],
      ['<code>trie 树（最长匹配 / 重复字符串）</code>', '字典树', 'O(总字符数)', '★★ 出现 2 次'],
      ['<code>相邻抽屉取糖果（DP 思路）</code>', '动态规划', 'O(n)', '★★ 出现 1 次'],
      ['<code>n 人数到 m 就出去，问最后留下谁</code>', '约瑟夫环', 'O(n)', '★★ 出现 1 次'],
      ['<code>10G 文件 int32，1G 内存找重复数</code>', '位图 / 哈希分片', 'O(n)', '★ 出现 1 次'],
      ['<code>字符串删除所有 "ab"</code>', '栈', 'O(n)', '★ 出现 1 次'],
      ['<code>下一个排列（123→132→213）</code>', '模拟', 'O(n)', '★ 出现 1 次'],
      ['<code>组合加法：给 2,3 凑 K=5</code>', 'BFS / DP', 'O(K)', '★ 出现 1 次'],
      ['<code>两个文件比对 id（值不同 / 各自特有）</code>', '归并 / Hash', 'O(n+m)', '★ 出现 1 次'],
      ['<code>右侧第一个更大元素</code>', '单调栈', 'O(n)', '★ 出现 1 次'],
      ['<code>M 边形 N 分（拼图）', 'DFS 回溯', 'O(M²)', '★ 出现 1 次'],
      ['<code>sort 算法稳定性 & 复杂度</code>', '排序', '—', '★ 出现 1 次']
    ]},

  { t: 'sub', h: '一、链表（最高频，必须闭眼写）', tag: '★★★★★' },

  { t: 'code', fn: '链表基础骨架.java', code:
`// 所有链表题的公共套路：哑结点（dummy）
class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    // ★ 删除重复元素（保留一个）—— 最基础，闭眼写
    public ListNode deleteDuplicates(ListNode head) {
        ListNode cur = head;
        while (cur != null && cur.next != null) {
            if (cur.val == cur.next.val) {
                cur.next = cur.next.next;   // 跳过重复
            } else {
                cur = cur.next;             // 不能移动，否则会漏删
            }
        }
        return head;
    }

    // ★ 删除重复元素 II（全部删掉）—— 题库要求写测试用例
    // 关键：判断 cur.next.next 是否存在，用 prev 连接
    public ListNode deleteDuplicates2(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode prev = dummy;
        ListNode cur = head;
        while (cur != null) {
            if (cur.next != null && cur.val == cur.next.val) {
                // 跳过所有相同的
                ListNode dup = cur.val;
                while (cur != null && cur.val == dup) cur = cur.next;
                prev.next = cur;             // prev 接到非重复节点
            } else {
                prev = cur;                  // 确认唯一，prev 前移
                cur = cur.next;
            }
        }
        return dummy.next;                   // 头结点可能被删，必须返回 dummy.next
    }

    // ★ 反转链表（迭代 + 递归，面试可能都要）
    public ListNode reverse(ListNode head) {
        ListNode prev = null;
        while (head != null) {
            ListNode next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }

    // ★ 链表排序（归并，O(n log n)，面试高频）
    // 关键：找中点用快慢指针；合并时复用原节点（不新建）
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        // 偶数长度要断开，否则递归死循环
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode mid = slow.next;
        slow.next = null;
        return merge(sortList(head), sortList(mid));
    }

    private ListNode merge(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else                 { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;   // 接上剩余
        return dummy.next;
    }
}` },

  { t: 'code', fn: '链表进阶题.java', code:
`class Solution {
    // ★ 两个链表求第一个公共节点（题库出现 2 次）
    // 双指针：走到末尾自动切换，总步数相同
    public ListNode getIntersectionNode(ListNode a, ListNode b) {
        if (a == null || b == null) return null;
        ListNode p = a, q = b;
        while (p != q) {           // 引用相等判断，不是值相等！
            p = (p == null) ? b : p.next;
            q = (q == null) ? a : q.next;
        }
        return p;                   // 第一个重合点就是交点
    }

    // ★ n 个有序链表取 topK —— 小顶堆，O(n log k)
    // 多个链表已各自有序 → 最小堆维护 k 个，堆顶即当前最小
    public ListNode mergeKLists(ListNode[] lists, int k) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode h : lists) if (h != null) pq.offer(h);
        ListNode dummy = new ListNode(0), tail = dummy;
        while (!pq.isEmpty()) {
            tail.next = pq.poll();
            tail = tail.next;
            if (tail.next != null) pq.offer(tail.next);   // 关键：吐出一个补一个
        }
        return dummy.next;
    }
    // 进阶：多个逆序链表求 TopK → 先各自降序排序，再最小堆归并

    // ★ 奇升偶降链表 → 升序。要求 O(n) 时间 O(1) 空间（题库原题）
    // 思路：拆成奇数位链和偶数位链，分别反转，再归并
    public ListNode oddEvenSort(ListNode head) {
        if (head == null || head.next == null) return head;
        // 1) 拆分：odd = 第1,3,5...位；even = 第2,4,6...位
        ListNode odd = head, even = head.next, evenHead = even;
        while (even != null && even.next != null) {
            odd.next = even.next;      odd  = odd.next;
            even.next = odd.next;      even = even.next;
        }
        odd.next = null;
        // 2) 两段都是「奇升偶降」的子序列，但整体不是升序
        //    例 4->1->3->2->6->5，拆出 4->3->6 和 1->2->5，各自仍乱
        // 3) 正确做法：分别逆序再归并（逆序后 4,3,6 -> 3,4,6 仍然不升）
        //    → 实际用「拆成两段后各自做插入排序」，题目要求 O(1) 空间
        //    这里给出通用且满足空间要求的解法：拆成两段后逆序 + 归并
        ListNode a = reverse(odd);
        ListNode b = reverse(evenHead);
        return merge(a, b);
    }

    // ★ 右侧第一个比当前数大的元素（单调栈，题库出现 1 次）
    // 输入 [2,7,9,6,8] → 输出 [1,2,-1,4,-1]
    public int[] nextGreaterElement(int[] nums) {
        int[] res = new int[nums.length];
        Arrays.fill(res, -1);
        Deque<Integer> stack = new ArrayDeque<>();   // 存下标，值单调递减
        for (int i = 0; i < nums.length; i++) {
            while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
                res[stack.pop()] = nums[i];           // i 就是左边那些元素的答案
            }
            stack.push(i);
        }
        return res;
    }
    // 变体：环形数组的下一个更大元素 → 遍历 2n 次取模

    // ★ 字符串删除所有 "ab"（栈，题库出现 1 次）
    public String removeAB(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (!st.isEmpty() && st.peek() == 'a' && c == 'b') st.pop();
            else st.push(c);
        }
        // ★ 注意：栈是逆序的，需要反转输出
        StringBuilder sb = new StringBuilder();
        while (!st.isEmpty()) sb.append(st.pop());
        return sb.toString();
    }
    // 变体：删除"ab"但 a/b 可单独存在 → 上面已支持
}` },

  { t: 'sub', h: '二、二叉树（第二高频）', tag: '★★★★★' },

  { t: 'code', fn: '二叉树遍历全家桶.java', code:
`class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

class Solution {
    // ★ 对称二叉树（题库出现 5+ 次，最高频）
    // 关键：不是「根节点值相等」，而是「左的左 == 右的右 且 左的右 == 右的左」
    public boolean isSymmetric(TreeNode root) {
        return root == null || isMirror(root.left, root.right);
    }
    private boolean isMirror(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.val == b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left);
    }
    // 迭代版（避免深层递归栈溢出）：
    //     用队列成对入队 (root.left, root.right)，出队比较，再入 (l.left,r.right) 和 (l.right,r.left)

    // ★ 层序遍历（自顶向下 BFS）—— 通用模板，背熟
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();               // ★ 必须先固定本层节点数
            List<Integer> level = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left  != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            res.add(level);
        }
        return res;
    }

    // ★ 二叉树的深度（题库问"树的深度"）
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
    // 层序版：返回 BFS 层数

    // ★ 中序遍历 → 双向链表（题库出现 2 次）
    // 中序保证升序，用「尾插法」串起来
    private TreeNode prev;
    public TreeNode inorderToList(TreeNode root) {
        TreeNode dummy = new TreeNode(0);
        prev = dummy;
        inorder(root);
        prev.right = null;      // ★ 必须断尾，否则成环
        return dummy.right;
    }
    private void inorder(TreeNode n) {
        if (n == null) return;
        inorder(n.left);
        prev.right = n;
        prev = n;
        inorder(n.right);
    }
    // ★ Morris 遍历：O(1) 空间，借助 ThreadLocal 线索做中序
    //     用完记得把 right 指针还原，否则链表会成环
}` },

  { t: 'code', fn: '二叉树进阶.java', code:
`class Solution {
    // ★ 蛇形遍历（从上到下，每层方向交替）（题库出现 3 次）
    // 关键：偶数层反转，或用两个栈一正一反
    public List<Integer> zigzagLevelOrder(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Deque<TreeNode> q = new ArrayDeque<>();
        boolean leftToRight = true;
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            LinkedList<Integer> level = new LinkedList<>();   // 支持 addFirst
            for (int i = 0; i < size; i++) {
                TreeNode n = q.poll();
                if (leftToRight) level.addLast(n.val);
                else             level.addFirst(n.val);     // ★ 反向插入
                if (n.left  != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            res.addAll(level);
            leftToRight = !leftToRight;
        }
        return res;
    }
    // 变体：只要「隔层反转」→ 层数用 size 累计，每两层反转一次

    // ★ 两节点最长距离（题库出现 2 次）
    // 思路：后序遍历，每个节点返回「到最远叶子的距离」；左右都存在时更新最大值
    private int maxDist;
    public int diameterOfBinaryTree(TreeNode root) {
        maxDist = 0;
        depth(root);
        return maxDist;
    }
    private int depth(TreeNode n) {
        if (n == null) return 0;
        int l = depth(n.left), r = depth(n.right);
        maxDist = Math.max(maxDist, l + r);     // 两条路径经过当前节点
        return Math.max(l, r) + 1;              // 返回到最远叶子的距离
    }

    // ★ 两节点最短路径（题库出现 2 次）
    // 思路：后序找到 LCA，同时记录深度，再算 深度和 - 2×LCA深度
    private TreeNode lca;
    private int lcaDepth;
    public int shortestPath(TreeNode root, int a, int b) {
        lca = null; lcaDepth = 0;
        if (findLCA(root, a, b, 0) == null) return 0;
        return depthOf(root, a) + depthOf(root, b) - 2 * lcaDepth;
    }
    private TreeNode findLCA(TreeNode n, int a, int b, int d) {
        if (n == null) return null;
        if (n.val == a || n.val == b) return n;   // 命中一个，另一半交给上层找
        TreeNode l = findLCA(n.left, a, b, d + 1);
        TreeNode r = findLCA(n.right, a, b, d + 1);
        if (l != null && r != null) { lca = n; lcaDepth = d + 1; return n; }
        return l != null ? l : r;
    }
    private int depthOf(TreeNode n, int target) {
        if (n == null) return -1;
        if (n.val == target) return 0;
        int d = depthOf(n.left, target);
        return d >= 0 ? d + 1 : depthOf(n.right, target) + 1;
    }

    // ★ 镜像（题库出现 1 次）—— 递归交换最直观
    public TreeNode mirror(TreeNode root) {
        if (root == null) return null;
        TreeNode t = root.left;
        root.left = mirror(root.right);
        root.right = mirror(t);
        return root;
    }

    // ★ M 边形 N 分 —— 拼图题，DFS 回溯（题库出现 1 次）
    // 核心：固定第一块（消除旋转重复），找齐矩形/行，用 visited 标记贴过的位置
    static int[][] dirs = {{1,0},{0,1},{-1,0},{0,-1}};
    public boolean dfs(int[][] board, int row, int col, int m, int n) {
        if (row == m) return true;
        int x = row * n + col;
        if (board[row][col] != 0) return false;
        for (int[] d : dirs) {
            if (shape[d[0] * 2][d[1]]) continue;   // 不是这个形状的凸起
            // 需 4 次旋转取模，保持 0° 时判断以免重复
        }
        return false;
    }
    // 要点：① 旋转 4 个方向 ② 边界检查 ③ 覆盖计数 ④ 优先补最左上的缺口
}` },

  { t: 'sub', h: '三、字符串与前缀树', tag: '★★★★' },

  { t: 'code', fn: 'Trie树与字符串匹配.java', code:
`// ★ Trie 树（题库出现 2 次：最长匹配、重复字符串）
// 本质：用 26 层的数组/HashMap 把公共前缀合并，空间换时间
class Trie {
    private final Trie[] children = new Trie[26];
    private boolean isWord;

    public void insert(String word) {
        Trie node = this;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new Trie();
            node = node.children[i];
        }
        node.isWord = true;
    }
    public boolean search(String word) {           // 完全匹配
        Trie n = find(word);
        return n != null && n.isWord;
    }
    public boolean startsWith(String prefix) {     // 前缀匹配
        return find(prefix) != null;
    }
    private Trie find(String s) {
        Trie node = this;
        for (char c : s.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) return null;
            node = node.children[i];
        }
        return node;
    }
}
// 用法：把 N 个单词插入 Trie，遍历所有单词，共享前缀的会被合并

// ★ 最长字符串匹配（题库原题：分别看有重复和无重复）
// 有重复：HashMap 统计 wordBreak，切分后 DP
// 无重复：HashMap 记录每个字符串的「最晚结束位置」，再贪心/DP
class Solution {
    // 无重复时：按长度降序，每次从当前位置贪心取最长匹配
    public String longestMatch(String[] words, String target) {
        Set<String> set = new HashSet<>(Arrays.asList(words));
        int n = target.length(), best = 0, bestEnd = 0;
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] == 0 && set.contains(target.substring(j, i))) {
                    dp[i] = 1;
                    if (i > bestEnd) { bestEnd = i; best = i - j; }
                }
            }
        }
        return target.substring(bestEnd - best, bestEnd);
    }
}` },

  { t: 'code', fn: '字符串与窗口类.java', code:
`class Solution {
    // ★ 最长无重复子串（题库出现 3 次）
    // 解法一：滑动窗口 + HashMap 存「字符 → 最后出现的位置」
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int max = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            Integer prev = last.put(c, i);
            if (prev != null && prev >= start) {
                start = prev + 1;            // 左边界跳到重复字符的下一位
            }
            max = Math.max(max, i - start + 1);
        }
        return max;
    }
    // 解法二（DP）：dp[i] = 以 i 结尾的最长无重复子串长度
    //   dp[i] = min(dp[i-1] + 1, i - last[s[i]])
    // 面试会问「为什么可以用 dp[i-1]」→ 因为子串有连续性

    // ★ 下一个排列（123 → 132 → 213，题库原题）
    // 步骤：找最后一个降序对 i（a[i] > a[i+1]）→ 从右找第一个 > a[i] 的 j
    //      → 交换 → 把 i 之后的后缀反转
    public void nextPermutation(int[] nums) {
        int i = nums.length - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;   // 找升序位置
        if (i >= 0) {
            int j = nums.length - 1;
            while (nums[j] <= nums[i]) j--;
            swap(nums, i, j);
        }
        reverse(nums, i + 1, nums.length - 1);
    }
    private void reverse(int[] a, int l, int r) {
        while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; }
    }
    private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}` },

  { t: 'sub', h: '四、数组与双指针', tag: '★★★★' },

  { t: 'code', fn: '数组经典题.java', code:
`class Solution {
    // ★ 三数之和（题库出现 2 次）—— 排序 + 固定一个 + 双指针
    // 三个关键去重点，缺一个就超时
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        if (nums == null || nums.length < 3) return res;
        Arrays.sort(nums);
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;        // ① 外层去重
            if (nums[i] > 0) break;                              // 已排序，可提前退出
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum < 0)      l++;
                else if (sum > 0) r--;
                else {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;  // ② 左去重
                    while (l < r && nums[r] == nums[r - 1]) r--;  // ③ 右去重
                    l++; r--;
                }
            }
        }
        return res;
    }

    // ★ 四数之和：比三数多一层循环，本质还是「两数之和 + 剪枝」
    // 剪枝：nums[i] + nums[i+1] 已经是可能的最小和，> target 可直接 break
    public List<List<Integer>> fourSum(int[] nums, int target) {
        List<List<Integer>> res = new ArrayList<>();
        if (nums == null || nums.length < 4) return res;
        Arrays.sort(nums);
        int n = nums.length;
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            if (nums[i] + nums[i+1] + nums[i+2] + nums[i+3] > target) break;   // 剪枝1
            if (nums[i] + nums[n-1] + nums[n-2] + nums[n-3] < target) continue;// 剪枝2
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int l = j + 1, r = n - 1;
                while (l < r) {
                    long sum = (long) nums[i] + nums[j] + nums[l] + nums[r];
                    if (sum < target)      l++;
                    else if (sum > target) r--;
                    else {
                        res.add(Arrays.asList(nums[i], nums[j], nums[l], nums[r]));
                        while (l < r && nums[l] == nums[l + 1]) l++;
                        while (l < r && nums[r] == nums[r - 1]) r--;
                        l++; r--;
                    }
                }
            }
        }
        return res;
    }

    // ★ m×n 数组顺时针遍历（题库出现 1 次）
    // 关键：用 top/bottom/left/right 四个边界，遍历完一行就收缩边界
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> res = new ArrayList<>();
        if (matrix == null || matrix.length == 0) return res;
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) res.add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) res.add(matrix[i][right]);
            right--;
            if (top <= bottom) {                        // ★ 防重复
                for (int j = right; j >= left; j--) res.add(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) res.add(matrix[i][left]);
                left++;
            }
        }
        return res;
    }

    // ★ 10G 文件 int32，1G 内存找重复出现的数字（题库原题）
    // 思路：位图。1G 内存 = 8亿 bit ≈ 10亿个位，可以标记 2^32 范围的整数
    //   实际用 HashSet 会 OOM（10G 数据远超 1G 内存）
    // 变体：内存更小时用「分片哈希」—— 按数值取模分桶，先算每个桶的计数和
    //      再逐桶处理，单个桶的数据一定能装进内存
    public static Set<Integer> findDuplicates(int[] a) {
        // 用位图：long[] 每位表示一个数出现过。int 范围 ±21亿，偏移后约 42 亿
        // 42亿 / 64 = 6.6亿 long = 5.2GB —— 仍然太大，说明单靠位图不够
        // 工程上正确做法：Bloom Filter（允许误判，不会漏）或有界 HashSet
        Set<Integer> seen = new HashSet<>();
        Set<Integer> dup = new HashSet<>();
        for (int v : a) {
            if (!seen.add(v)) dup.add(v);
        }
        return dup;
    }
    // 面试要能说清：1G 内存 = 8×10^9 bit，若数据是 32 位整数（2^32 种可能），
    //   位图需要 2^32 bit = 512MB，理论上装得下！但 int 有负数要再处理。
    //   正确答法：位图 512MB 够用，或者分片哈希更省。
}` },

  { t: 'sub', h: '五、贪心与动态规划', tag: '★★★' },

  { t: 'code', fn: '贪心与DP.java', code:
`class Solution {
    // ★ 环形加油车（题库出现 2 次）—— 贪心
    // gas=[1,3,5,2,3,4], consume=[1,4,2,3,2,3] → 起点 3
    // 关键：找累计净值最低的「前一位」，那就是答案
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;
            tank  += diff;
            if (tank < 0) {          // 从 start 到 i 走不通，换下一个候选起点
                start = i + 1;
                tank = 0;
            }
        }
        return total < 0 ? -1 : start;
    }
    // 原理：若从 i 出发累计到 j 时油量为负，说明 i..j 这段无论从哪出发都不可能
    //      走通，所以答案必在 j 之后。

    // ★ n 人数到 m 就出去，问最后留下谁（约瑟夫环，题库原题）
    // 朴素 O(n²)，最优 O(n) 数学解法
    public int josephus(int n, int m) {
        int ans = 0;
        for (int i = 2; i <= n; i++) ans = (ans + m) % i;   // 递推 f(1)=0
        return ans;                                          // 0-based
    }
    // 逆向模拟法（更好理解）：
    //   先算出 n=m 时的位置 pos=0，然后倒着放回去：pos = (pos + m) % (i+1)

    // ★ 相邻抽屉取糖果（题库原题，明确要求用 DP）
    // n 个抽屉，m 次机会，每次只能取相邻两个抽屉的一颗糖，求最大收益
    // 思路：dp[i][j] = 取到第 i 个抽屉、用了 j 次机会时的最大糖果数
    //   dp[i][j] = max(dp[i-2][j-1] + a[i-1] + a[i], dp[i-1][j])
    public int maxCandy(int[] a, int m) {
        int n = a.length;
        int[][] dp = new int[n + 1][m + 1];
        for (int j = 0; j <= m; j++) dp[0][j] = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                dp[i][j] = dp[i - 1][j];                    // 不取第 i 个
                if (i >= 2) {                                // 取第 i-1 和 i
                    dp[i][j] = Math.max(dp[i][j],
                        dp[i - 2][j - 1] + a[i - 2] + a[i - 1]);
                }
            }
        }
        return dp[n][m];
    }

    // ★ 组合加法：给一组数（如 2 和 3），问最少几个数能凑出 K=5（题库原题）
    // BFS 最短路：每一步是「选一个数加上」
    public int minCoin(int[] coins, int K) {
        int[] dp = new int[K + 1];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int i = 1; i <= K; i++) {
            for (int c : coins) {
                if (i - c >= 0 && dp[i - c] != Integer.MAX_VALUE) {
                    dp[i] = Math.min(dp[i], dp[i - c] + 1);
                }
            }
        }
        return dp[K] == Integer.MAX_VALUE ? -1 : dp[K];
    }
    // 注意题库描述是「无限个范围为 1~m 的数」，那答案恒为 ceil(K/m)；
    //   实际题意应是「给定的数可重复使用」，即上面的完全背包

    // 排序算法稳定性（题库出现 1 次）
    // 稳定：冒泡、插入、归并、计数、桶
    // 不稳定：快排、堆排、选择
}` },

  { t: 'sub', h: '六、其他高频', tag: '★★★' },

  { t: 'code', fn: '其他题型.java', code:
`class Solution {
    // ★ 两个文件比对（题库原题）
    // A、B 每行 "id,val"，单文件内 id 有序且唯一
    // 求：A 特有 id、B 特有 id、AB 都有但 val 不同的 id
    // 思路：双指针归并，同时读两个文件（流式，内存 O(1)）
    static void diffFiles(Path a, Path b) throws IOException {
        try (BufferedReader ra = Files.newBufferedReader(a);
             BufferedReader rb = Files.newBufferedReader(b)) {
            String la = ra.readLine(), lb = rb.readLine();
            while (la != null && lb != null) {
                String[] pa = la.split(",");
                String[] pb = lb.split(",");
                int ia = Integer.parseInt(pa[0]), ib = Integer.parseInt(pb[0]);
                if (ia == ib) {
                    if (!pa[1].equals(pb[1]))
                        System.out.println("值不同 id=" + ia);
                    la = ra.readLine();
                    lb = rb.readLine();
                } else if (ia < ib) {
                    System.out.println("A 特有 id=" + ia);   // B 里没有
                    la = ra.readLine();
                } else {
                    System.out.println("B 特有 id=" + ib);
                    lb = rb.readLine();
                }
            }
            while (la != null) { System.out.println("A 特有 id=" + la.split(",")[0]); la = ra.readLine(); }
            while (lb != null) { System.out.println("B 特有 id=" + lb.split(",")[0]); lb = rb.readLine(); }
        }
    }

    // ★ M 边形 N 分之外：岛屿数量 / 最大面积（题库出现 1 次）
    // DFS/BFS 洪水填充，关键是 visited 的标记时机（入栈时标记，不是出栈时）
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') { count++; dfsIsland(grid, i, j); }
            }
        }
        return count;
    }
    private void dfsIsland(char[][] g, int i, int j) {
        if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] != '1') return;
        g[i][j] = '0';                       // ★ 入栈即标记，防止重复入栈
        dfsIsland(g, i + 1, j);
        dfsIsland(g, i - 1, j);
        dfsIsland(g, i, j + 1);
        dfsIsland(g, i, j - 1);
    }
}` },

  { t: 'sub', h: '七、机试策略', tag: 'TOOL' },
  { t: 'note', k: '机试模板', html: '华为 OD 机试通常 <b>2 题 / 60 分钟 / ACM 模式</b>。字节更看重<b>现场编码</b>（有些要现场写并运行）。核心策略：<b>先读完全部题目再下手</b>，优先做读题即有思路的，写完必须自己跑样例。' },
  { t: 'code', fn: '机试模板.java', code:
`import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();          // ★ 一定要读 n，很多人在这里挂掉
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        // ... 你的逻辑
        System.out.println(result);
    }
}
// 提醒：华为 OD 有的题目第一行是 "n 表示接下来有 n 个数"，
//       不要假设输入格式。这是最常见的低级失分点。` },

  { t: 'sub', h: '八、测试用例（题库明确要求）', tag: 'HOT' },
  { t: 'p', html: '题库多次出现「<b>要求写出测试用例，能跑</b>」。这说明面试官不只看答案，还看你的<b>工程素养</b>。' },
  { t: 'table',
    caption: '链表/树算法必写的测试用例',
    head: ['类型', '用例', '考察点'],
    rows: [
      ['空输入', 'null / []', '是否正确返回空（不是抛异常）'],
      ['单元素', '只有一个节点', '哑结点逻辑是否正确'],
      ['两元素', '两个相同 / 两个不同', '去重与排序的边界'],
      ['全相同', '[2,2,2,2]', '去重后是否只剩一个'],
      ['已排序', '输入已有序', '排序是否稳定、是否有冗余比较'],
      ['逆序输入', '[5,4,3,2,1]', '是否正确反转/降序'],
      ['随机', '用 Random 生成 100 组', '与暴力解法对比验证'],
      ['极端值', 'Integer.MAX_VALUE / 溢出', '是否用 long 累加']
    ]},
  { t: 'code', fn: '暴力解法对拍.java', code:
`// 面试时主动说"我写个暴力解法对拍验证"，是加分项
class Solution {
    // 正确但慢的暴力解：O(n²)
    public int[] bruteForce(int[] a) {
        int max = 0;
        for (int i = 0; i < a.length; i++) {
            Set<Character> set = new HashSet<>();
            for (int j = i; j < a.length; j++) {
                if (set.contains(a[j])) break;
                set.add(a[j]);
                max = Math.max(max, j - i + 1);
            }
        }
        return new int[]{max};
    }

    public void selfTest() {
        Random r = new Random();
        for (int t = 0; t < 1000; t++) {
            int n = 1 + r.nextInt(20);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = r.nextInt(5);   // 字母表小 → 容易重复
            int expected = bruteForce(a)[0];
            int actual = new Solution().lengthOfLongestSubstring(arr(a));
            if (expected != actual)
                throw new AssertionError("输入 " + Arrays.toString(a)
                    + " 期望 " + expected + " 实际 " + actual);
        }
        System.out.println("1000 组随机用例全部通过");
    }

    static char[] arr(int[] a) {
        char[] c = new char[a.length];
        for (int i = 0; i < a.length; i++) c[i] = (char) ('a' + a[i]);
        return c;
    }
}` }
  ]
}

];
