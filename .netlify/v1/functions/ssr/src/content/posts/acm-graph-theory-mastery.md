---
title: "图论算法完全指南"
description: "从邻接矩阵到最短路径，从 DFS 到最小生成树。本文结合 ACM 竞赛实战，深入解析图论的核心算法与数据结构实现。"
publishedAt: "2025-12-21T09:00:00"
category: "tech"
---

图（Graph）是计算机科学中最强大、最复杂，也是 ACM/ICPC 竞赛中考察频率最高的数据结构之一。无论是社交网络的好友推荐，还是地图导航的最短路径，背后都离不开图论的支持。

本文将用最通俗易懂的语言，带你系统梳理图论的核心知识体系。

## 1. 图的基本概念：到底什么是图？

别被“图论”这个高大上的名字吓到了。**图**其实就是用来描述“**关系**”的。

想象一下微信好友列表：

- **顶点 (Vertex)**：就是你和你的朋友们。
- **边 (Edge)**：就是你们之间的“好友关系”。

我们可以把图看作是从 **链表**（一条线）和 **树**（分叉的树枝）拓展而来的更自由的**网络**。

### 常见的分类

1.  **无向图 vs 有向图**：

    - **无向图**：双向奔赴。比如微信好友，我加了你，你也就加了我。A 和 B 是平等的。
    - **有向图**：单相思。比如微博关注，我关注了明星，明星不一定关注我。箭头是有方向的 (A -> B)。

2.  **无权图 vs 有权图**：

    - **有权图**：关系有“分量”。比如地图上两个城市之间，不仅连通，还有**距离**（权重）。或者两个人之间不仅认识，还有**亲密度**（权重）。

3.  **连通图 vs 非连通图**：
    - **连通图**：从任何一个点出发，都能走到其他任何一个点。
    - **非连通图**：像几座孤岛，岛与岛之间没有桥。

### 核心术语

- **度 (Degree)**：一个点连了几条线。
  - 在有向图中，**入度**是谁指向我，**出度**是我指向谁。
- **路径 (Path)**：从起点走到终点经过的路线。

---

## 2. 图的存储：怎么把图塞进代码里？

在 ACM 竞赛中，选对存图方式至关重要。选错了，要么代码写死人，要么内存爆掉。

### 2.1 邻接矩阵 (Adjacency Matrix) —— 简单粗暴的二维数组

想象一个表格，行是起点，列是终点。表格里的数字表示有没有边（或者权重）。

- **特点**：简单直观。`g[i][j] = 1` 表示 i 和 j 连通。
- **优点**：查得快！想知道 i 和 j 连不连？直接看表格。
- **缺点**：太费地儿！如果有 10000 个点，就要开 `10000 * 10000` 的数组，内存直接爆炸。
- **适用**：点很少的图（点数 N <= 1000）。

```cpp
// C++ 邻接矩阵示例
const int INF = 0x3f3f3f3f;
int g[1005][1005];

void init() {
    // 刚开始谁都不挨着谁
    memset(g, 0x3f, sizeof(g));
}

void add_edge(int u, int v, int w) {
    g[u][v] = w;
    g[v][u] = w; // 无向图记得反过来也要存一下
}
```

### 2.2 邻接表 (Adjacency List) —— 也就是 Vector

每个点都有一个小本本（Vector），上面记着它连着谁。

- **特点**：按需分配。只存存在的边，省内存。
- **优点**：空间利用率高，大部分题目都用它。
- **缺点**：想知道 i 和 j 连不连？得翻 i 的小本本，稍微慢一点点。

```cpp
// C++ vector 实现邻接表
struct Edge {
    int to;     // 连到谁
    int weight; // 权重多少
};
vector<Edge> adj[100005]; // 每个点都有一个 vector

void add_edge(int u, int v, int w) {
    adj[u].push_back({v, w});
    // 无向图加上这一句: adj[v].push_back({u, w});
}
```

### 2.3 链式前向星 (Chain Forward Star) —— 数组模拟链表（高手必备）

这是 ACM 选手最爱用的存图方式，虽然名字听起来很中二，但效率极高！

它的本质是**用数组来模拟链表**。为什么不用 Vector？因为 Vector 动态扩容有点慢，而数组是静态的，快！

**想象一下：**
你要寄信（边）。

- `head[u]`：你（点 u）寄出的**第一封信**的编号。
- `next[e]`：信 e 下面压着的**下一封信**的编号。
- `to[e]`：信 e 是寄给谁的。
- `val[e]`：信 e 的权重。

**插入边的时候（头插法）：**
每次有新边，都把它插到最前面，变成新的“第一封信”，然后让它指向原来的“第一封信”。

```cpp
// 链式前向星模板
const int N = 100005;  // 最大点数
const int M = 200005;  // 最大边数

int head[N]; // 存储每个点的第一条边的索引，初始化为 -1
struct Edge {
    int to;   // 这条边去哪
    int next; // 下一条同起点的边在哪
    int w;    // 权重
} edges[M];   // 边集数组

int cnt = 0; // 边的计数器

// 初始化
void init() {
    memset(head, -1, sizeof(head));
    cnt = 0;
}

// 加边函数：把 u -> v，权重 w 的边加入
void add(int u, int v, int w) {
    edges[cnt].to = v;
    edges[cnt].w = w;
    edges[cnt].next = head[u]; // 新边的下一条指向原本的第一条（头插法）
    head[u] = cnt;             // 更新 u 的第一条边为当前新边
    cnt++;
}

// 遍历 u 的所有出边
void traverse(int u) {
    // i = head[u] 开始，只要 i != -1 就继续，每次跳到 next[i]
    for (int i = head[u]; i != -1; i = edges[i].next) {
        int v = edges[i].to;
        int w = edges[i].w;
        // 这里处理边 (u, v)
        cout << "从 " << u << " 到 " << v << " 权重 " << w << endl;
    }
}
```

**为什么叫“前向星”？** 因为它是从某个点出发，像星星的光芒一样向前（Forward）发散出去。虽然代码稍显复杂，但**速度最快**，**内存最省**，是打比赛的终极武器。

---

## 3. 图的遍历：怎么在图里溜达？

有了图，我们得进去走走。

### 3.1 深度优先搜索 (DFS) —— 钻牛角尖

**口诀**：“不撞南墙不回头”。
一条路走到黑，走不通了再退回来换条路走。

**用途**：

- 走迷宫（找能不能走通）。
- 全排列（把所有可能性都试一遍）。

```cpp
bool vis[100005]; // 记录走没走过，防止转圈圈

void dfs(int u) {
    vis[u] = true; // 标记：我来过啦

    // 遍历 u 的所有邻居
    for (auto& edge : adj[u]) {
        int v = edge.to;
        if (!vis[v]) { // 如果邻居没去过
            dfs(v);    // 接着往下钻
        }
    }
}
```

### 3.2 广度优先搜索 (BFS) —— 地毯式搜索

**口诀**：“层层递进”。
先把离我最近的一圈全走完，再走第二圈。

**用途**：

- **找最短路径**（仅限边权为 1 的图）。比如游戏里找最近的怪。

```cpp
void bfs(int start) {
    queue<int> q;
    q.push(start);
    vis[start] = true;

    while (!q.empty()) {
        int u = q.front(); q.pop(); // 取出队头

        for (auto& edge : adj[u]) {
            int v = edge.to;
            if (!vis[v]) {
                vis[v] = true; // 标记
                q.push(v);     // 加入队列，以后再处理
            }
        }
    }
}
```

---

## 4. 经典算法实战（伪代码）

光说不练假把式。这里给出 ACM 竞赛中最常用的核心算法模板，**建议背诵全文**！

### 4.1 最短路径算法

#### (1) Dijkstra 算法 —— 正权图的最短路之王

**适用**：没有负权边的图。

**核心思想**：贪心。每次从未被标记的点中，找到距离起点最近的那个点 `u`，然后用 `u` 去更新它的邻居们。

**生活比喻**：你想去学校，先看看离家最近的车站 A 有多远，到了 A 之后，再看看通过 A 去其他地方会不会更近。

```cpp
// 堆优化 Dijkstra (复杂度 O(E log E))
// dis[i] 存储起点到 i 的最短距离
int dis[N];
bool vis[N];
// 小根堆，自动按距离从小到大排序
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

void dijkstra(int start) {
    memset(dis, 0x3f, sizeof(dis)); // 初始化无穷大
    dis[start] = 0;
    pq.push({0, start}); // {距离, 点编号}

    while (!pq.empty()) {
        int u = pq.top().second; // 拿出距离最近的点
        pq.pop();

        if (vis[u]) continue; // 如果处理过了就跳过
        vis[u] = true;

        for (auto& edge : adj[u]) {
            int v = edge.to;
            int w = edge.w;
            // 松弛操作：如果通过 u 走到 v 更近
            if (dis[v] > dis[u] + w) {
                dis[v] = dis[u] + w;
                pq.push({dis[v], v});
            }
        }
    }
}
```

#### (2) SPFA 算法 —— 负权边的克星

**适用**：存在负权边，但没有负环的图。

**核心思想**：队列优化的 Bellman-Ford。只有当一个点的最短距离变小了，它才可能去更新它的邻居，所以把它加入队列。

**注意**：在网格图或构造数据中容易退化成 `O(VE)`，比赛时慎用（除非有负权边）。

```cpp
bool in_queue[N]; // 记录是否在队列中
void spfa(int start) {
    memset(dis, 0x3f, sizeof(dis));
    dis[start] = 0;
    queue<int> q;
    q.push(start);
    in_queue[start] = true;

    while (!q.empty()) {
        int u = q.front(); q.pop();
        in_queue[u] = false; // 出队

        for (auto& edge : adj[u]) {
            int v = edge.to;
            int w = edge.w;
            if (dis[v] > dis[u] + w) {
                dis[v] = dis[u] + w;
                // 如果 v 已经在队列里，就不用重复加了
                if (!in_queue[v]) {
                    q.push(v);
                    in_queue[v] = true;
                }
            }
        }
    }
}
```

#### (3) Floyd-Warshall 算法 —— 多源最短路

**适用**：求任意两点间的最短路，点数 `N <= 300`。

**核心思想**：动态规划。对于每一对 `(i, j)`，看看能不能找个中间商 `k`，使得 `i -> k -> j` 比直接 `i -> j` 更短。

**记忆口诀**：**“中间商 k 在最外层”**。

```cpp
// dp[i][j] 表示 i 到 j 的最短距离
void floyd(int n) {
    // k 必须在最外层循环！
    for (int k = 1; k <= n; k++) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j]);
            }
        }
    }
}
```

### 4.2 最小生成树 (MST)

#### (1) Kruskal 算法 —— 加边法

**适用**：稀疏图（边少）。

**核心思想**：贪心。把所有路按造价从小到大排序，选最便宜且不构成环的路（用并查集维护）。

```cpp
struct Edge { int u, v, w; };
bool cmp(Edge a, Edge b) { return a.w < b.w; } // 按权重排序
int fa[N];
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }

void kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end(), cmp);
    for (int i = 1; i <= n; i++) fa[i] = i;

    int count = 0, total_weight = 0;
    for (auto& e : edges) {
        int root_u = find(e.u);
        int root_v = find(e.v);
        if (root_u != root_v) {
            fa[root_u] = root_v;
            total_weight += e.w;
            count++;
            if (count == n - 1) break;
        }
    }
}
```

#### (2) Prim 算法 —— 加点法

**适用**：稠密图（边多）。

**核心思想**：类似 Dijkstra。每次寻找距离“当前生成树”最近的那个点，把它加入集合。

```cpp
int dist[N]; // 点到生成树的最小距离
bool vis[N]; // 是否已加入生成树

int prim(int n) {
    memset(dist, 0x3f, sizeof(dist));
    int res = 0;
    dist[1] = 0; // 从点 1 开始

    for (int i = 0; i < n; i++) {
        int t = -1;
        // 寻找离集合最近的点
        for (int j = 1; j <= n; j++) {
            if (!vis[j] && (t == -1 || dist[j] < dist[t]))
                t = j;
        }

        if (i && dist[t] == INF) return INF; // 图不连通
        if (i) res += dist[t];
        vis[t] = true;

        // 用这个新点去更新其他点到集合的距离
        for (int j = 1; j <= n; j++)
            dist[j] = min(dist[j], g[t][j]); // g 是邻接矩阵
    }
    return res;
}
```

### 4.3 图的连通性

#### Tarjan 算法 —— 强连通分量 (SCC)

**适用**：有向图缩点。

**核心思想**：DFS 序 + 追溯值。如果一个点走了一圈能回到自己（或祖先），说明有个环。

```cpp
int dfn[N], low[N], timestamp;
stack<int> stk;
bool in_stk[N];
int scc_cnt, id[N]; // 强连通分量编号

void tarjan(int u) {
    dfn[u] = low[u] = ++timestamp;
    stk.push(u); in_stk[u] = true;

    for (int v : adj[u]) {
        if (!dfn[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (in_stk[v]) {
            low[u] = min(low[u], dfn[v]);
        }
    }

    // 找到一个 SCC 的根
    if (dfn[u] == low[u]) {
        scc_cnt++;
        int y;
        do {
            y = stk.top(); stk.pop();
            in_stk[y] = false;
            id[y] = scc_cnt;
        } while (y != u);
    }
}
```

### 4.4 最近公共祖先 (LCA)

#### 倍增法

**核心思想**：预处理出每个节点的第 $2^i$ 个祖先。查询时，先让深度深的跳到同一层，然后一起向上跳。

```cpp
int fa[N][20], depth[N]; // fa[u][i] 表示 u 向上跳 2^i 步的祖先

void bfs_lca(int root) {
    memset(depth, 0x3f, sizeof(depth));
    depth[0] = 0; depth[root] = 1;
    queue<int> q; q.push(root);

    while (q.size()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (depth[v] > depth[u] + 1) {
                depth[v] = depth[u] + 1;
                q.push(v);
                fa[v][0] = u; // 跳 2^0 = 1 步就是父节点
                for (int k = 1; k <= 15; k++)
                    fa[v][k] = fa[fa[v][k-1]][k-1]; // 2^k = 2^(k-1) + 2^(k-1)
            }
        }
    }
}

int lca(int a, int b) {
    if (depth[a] < depth[b]) swap(a, b);
    // 先把 a 跳到和 b 同一层
    for (int k = 15; k >= 0; k--)
        if (depth[fa[a][k]] >= depth[b])
            a = fa[a][k];
    if (a == b) return a;
    // 一起向上跳，直到父亲相同
    for (int k = 15; k >= 0; k--)
        if (fa[a][k] != fa[b][k]) {
            a = fa[a][k];
            b = fa[b][k];
        }
    return fa[a][0];
}
```

### 4.5 拓扑排序 (Topological Sort)

**问题**：排课表。必须先修 A 才能修 B。

**核心思想**：入度为 0 的点入队，删边，更新邻居入度。

```cpp
int in_degree[N];

void topo_sort(int n) {
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (in_degree[i] == 0) q.push(i);
    }

    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";

        for (auto& edge : adj[u]) {
            int v = edge.to;
            in_degree[v]--;
            if (in_degree[v] == 0) q.push(v);
        }
    }
}
```
