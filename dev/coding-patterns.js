const CODING_PATTERNS = {
  "hash-map-lookup": {
    name: "Hash Map Lookup",
    keywords: ["two sum", "pair", "complement", "target sum", "contains duplicate", "anagram", "frequency", "count occurrences", "group by"],
    whenToUse: "Need to find a complement/pair, check existence, or count frequencies in O(1) lookup",
    levels: [
      {
        name: "Brute Force",
        approach: "Check every pair with nested loops",
        complexity: { time: "O(n²)", space: "O(1)" },
        java: `for (int i = 0; i < nums.length; i++) {
    for (int j = i + 1; j < nums.length; j++) {
        if (nums[i] + nums[j] == target) {
            return new int[]{i, j};
        }
    }
}`,
        walkthrough: [
          "Try every pair — straightforward but slow",
          "Two nested loops, compare each combination",
          "Works but interviewer will ask to optimize"
        ]
      },
      {
        name: "Hash Map — One Pass",
        approach: "Store seen values in map, check complement exists",
        complexity: { time: "O(n)", space: "O(n)" },
        java: `Map<Integer, Integer> map = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];
    if (map.containsKey(complement)) {
        return new int[]{map.get(complement), i};
    }
    map.put(nums[i], i);
}`,
        walkthrough: [
          "For each number, calculate what we NEED (target - current)",
          "Check if we've already seen that needed number",
          "If yes, we found our pair. If no, store current for future lookups",
          "Single pass through array — O(n) time, O(n) space"
        ]
      }
    ]
  },

  "two-pointers": {
    name: "Two Pointers",
    keywords: ["sorted array", "two sum sorted", "palindrome", "container with most water", "remove duplicates", "merge sorted", "three sum", "closest sum", "pair in sorted"],
    whenToUse: "Array is sorted (or can be sorted), need to find pairs/triplets, or shrink search space from both ends",
    levels: [
      {
        name: "Brute Force",
        approach: "Nested loops checking all pairs",
        complexity: { time: "O(n²)", space: "O(1)" },
        java: `for (int i = 0; i < nums.length; i++) {
    for (int j = i + 1; j < nums.length; j++) {
        if (nums[i] + nums[j] == target) {
            return new int[]{nums[i], nums[j]};
        }
    }
}`,
        walkthrough: [
          "Check every pair — doesn't exploit sorted property",
          "Interviewer will push: the array is sorted, can you use that?"
        ]
      },
      {
        name: "Two Pointers",
        approach: "Left pointer at start, right at end. Move inward based on sum comparison",
        complexity: { time: "O(n)", space: "O(1)" },
        java: `int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) {
        return new int[]{left, right};
    } else if (sum < target) {
        left++;
    } else {
        right--;
    }
}`,
        walkthrough: [
          "Start with widest window — smallest + largest",
          "Sum too small? Move left pointer right (need bigger number)",
          "Sum too big? Move right pointer left (need smaller number)",
          "Pointers converge — O(n) time, O(1) space"
        ]
      }
    ]
  },

  "sliding-window": {
    name: "Sliding Window",
    keywords: ["substring", "subarray", "contiguous", "window", "longest", "shortest", "maximum sum subarray", "minimum window", "without repeating", "at most k", "consecutive"],
    whenToUse: "Finding optimal contiguous subarray/substring. Fixed or variable window size. Often involves 'longest/shortest with constraint'",
    levels: [
      {
        name: "Brute Force",
        approach: "Check every possible subarray/substring",
        complexity: { time: "O(n²) or O(n³)", space: "O(1)" },
        java: `int maxLen = 0;
for (int i = 0; i < s.length(); i++) {
    Set<Character> seen = new HashSet<>();
    for (int j = i; j < s.length(); j++) {
        if (seen.contains(s.charAt(j))) break;
        seen.add(s.charAt(j));
        maxLen = Math.max(maxLen, j - i + 1);
    }
}`,
        walkthrough: [
          "Try every starting position, extend until constraint violated",
          "Works but redundant — we re-check overlapping subarrays"
        ]
      },
      {
        name: "Sliding Window",
        approach: "Expand right pointer, shrink left when constraint violated",
        complexity: { time: "O(n)", space: "O(k) where k = charset" },
        java: `Map<Character, Integer> window = new HashMap<>();
int left = 0, maxLen = 0;
for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    window.merge(c, 1, Integer::sum);
    while (window.get(c) > 1) {
        char leftChar = s.charAt(left);
        window.merge(leftChar, -1, Integer::sum);
        left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
}`,
        walkthrough: [
          "Right pointer expands the window — add character",
          "If constraint violated (duplicate found), shrink from left",
          "Window always contains valid substring",
          "Each element enters and leaves window once — O(n)"
        ]
      }
    ]
  },

  "binary-search": {
    name: "Binary Search",
    keywords: ["sorted", "search", "find position", "rotated", "first occurrence", "last occurrence", "peak element", "minimum in rotated", "search insert position", "sqrt", "koko eating bananas"],
    whenToUse: "Sorted input, or search space that can be halved. Also: 'minimum/maximum that satisfies condition' (binary search on answer)",
    levels: [
      {
        name: "Linear Scan",
        approach: "Check every element",
        complexity: { time: "O(n)", space: "O(1)" },
        java: `for (int i = 0; i < nums.length; i++) {
    if (nums[i] == target) return i;
}
return -1;`,
        walkthrough: [
          "Simple scan — doesn't use sorted property",
          "Interviewer: it's sorted, can we do better?"
        ]
      },
      {
        name: "Binary Search",
        approach: "Halve search space each step by comparing with middle",
        complexity: { time: "O(log n)", space: "O(1)" },
        java: `int left = 0, right = nums.length - 1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] == target) {
        return mid;
    } else if (nums[mid] < target) {
        left = mid + 1;
    } else {
        right = mid - 1;
    }
}
return -1;`,
        walkthrough: [
          "Compare target with middle element",
          "Target bigger? Search right half. Smaller? Search left half",
          "Halve search space each time — O(log n)",
          "Watch out: use left + (right - left) / 2 to avoid integer overflow"
        ]
      },
      {
        name: "Binary Search on Answer",
        approach: "When searching for min/max value that satisfies a condition, binary search the answer space",
        complexity: { time: "O(n log m) where m = answer range", space: "O(1)" },
        java: `int left = 1, right = maxValue;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (canFinish(mid)) {
        right = mid;
    } else {
        left = mid + 1;
    }
}
return left;`,
        walkthrough: [
          "Not searching in array — searching in answer space",
          "Define a predicate: can we solve with this value?",
          "Binary search for the minimum value where predicate is true",
          "Common in: Koko eating bananas, split array largest sum, capacity to ship"
        ]
      }
    ]
  },

  "fast-slow-pointers": {
    name: "Fast & Slow Pointers",
    keywords: ["linked list cycle", "middle of linked list", "happy number", "cycle detection", "floyd", "palindrome linked list", "find duplicate"],
    whenToUse: "Cycle detection in linked list or sequence. Finding middle element. Detecting start of cycle",
    levels: [
      {
        name: "Hash Set",
        approach: "Track visited nodes in a set",
        complexity: { time: "O(n)", space: "O(n)" },
        java: `Set<ListNode> visited = new HashSet<>();
ListNode curr = head;
while (curr != null) {
    if (visited.contains(curr)) return true;
    visited.add(curr);
    curr = curr.next;
}
return false;`,
        walkthrough: [
          "Store every node in a set, check if we revisit one",
          "Works but uses O(n) extra space",
          "Interviewer: can you do it in O(1) space?"
        ]
      },
      {
        name: "Floyd's Tortoise & Hare",
        approach: "Slow pointer moves 1 step, fast moves 2. If cycle, they meet",
        complexity: { time: "O(n)", space: "O(1)" },
        java: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
}
return false;

// To find cycle START: after they meet, move one pointer to head
// and advance both by 1 — they meet at cycle start`,
        walkthrough: [
          "Two pointers, different speeds — fast will lap slow if cycle exists",
          "No cycle? Fast hits null. Cycle? They meet inside the cycle",
          "To find cycle start: reset one to head, move both by 1 until they meet",
          "Also used for finding middle: when fast reaches end, slow is at middle"
        ]
      }
    ]
  },

  "stack": {
    name: "Stack",
    keywords: ["parentheses", "brackets", "valid parentheses", "next greater", "daily temperatures", "min stack", "evaluate expression", "decode string", "monotonic stack", "trapping rain water", "largest rectangle"],
    whenToUse: "Matching brackets/parentheses, next greater/smaller element, or maintaining monotonic order",
    levels: [
      {
        name: "Stack — Matching/Validation",
        approach: "Push opening brackets, pop and compare on closing brackets",
        complexity: { time: "O(n)", space: "O(n)" },
        java: `Deque<Character> stack = new ArrayDeque<>();
Map<Character, Character> map = Map.of(')', '(', ']', '[', '}', '{');
for (char c : s.toCharArray()) {
    if (map.containsValue(c)) {
        stack.push(c);
    } else {
        if (stack.isEmpty() || stack.pop() != map.get(c)) {
            return false;
        }
    }
}
return stack.isEmpty();`,
        walkthrough: [
          "Opening bracket? Push to stack",
          "Closing bracket? Pop and check if it matches",
          "Stack empty at end? All brackets matched"
        ]
      },
      {
        name: "Monotonic Stack",
        approach: "Maintain stack in increasing/decreasing order to find next greater/smaller efficiently",
        complexity: { time: "O(n)", space: "O(n)" },
        java: `// Next Greater Element / Daily Temperatures
int[] result = new int[nums.length];
Deque<Integer> stack = new ArrayDeque<>(); // stores indices
for (int i = 0; i < nums.length; i++) {
    while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
        int idx = stack.pop();
        result[idx] = i - idx; // or nums[i] for the value
    }
    stack.push(i);
}`,
        walkthrough: [
          "Stack maintains indices of elements waiting for their 'next greater'",
          "New element bigger than stack top? Pop — this element is the answer for popped items",
          "Each element pushed and popped at most once — O(n) total",
          "Decreasing stack for next greater, increasing stack for next smaller"
        ]
      }
    ]
  },

  "prefix-sum": {
    name: "Prefix Sum",
    keywords: ["subarray sum", "range sum", "sum equals k", "contiguous sum", "cumulative", "running total", "product of array except self"],
    whenToUse: "Range sum queries, counting subarrays with given sum, or computing cumulative values",
    levels: [
      {
        name: "Brute Force",
        approach: "Calculate sum for every subarray",
        complexity: { time: "O(n²)", space: "O(1)" },
        java: `int count = 0;
for (int i = 0; i < nums.length; i++) {
    int sum = 0;
    for (int j = i; j < nums.length; j++) {
        sum += nums[j];
        if (sum == k) count++;
    }
}`,
        walkthrough: [
          "Try every subarray, compute sum, check if equals target",
          "Redundant work — recalculating overlapping sums"
        ]
      },
      {
        name: "Prefix Sum + Hash Map",
        approach: "Track cumulative sums. If prefixSum[j] - prefixSum[i] == k, then subarray i..j sums to k",
        complexity: { time: "O(n)", space: "O(n)" },
        java: `Map<Integer, Integer> prefixCount = new HashMap<>();
prefixCount.put(0, 1); // empty prefix
int sum = 0, count = 0;
for (int num : nums) {
    sum += num;
    count += prefixCount.getOrDefault(sum - k, 0);
    prefixCount.merge(sum, 1, Integer::sum);
}`,
        walkthrough: [
          "Key insight: sum(i..j) = prefixSum[j] - prefixSum[i]",
          "If current prefix sum minus k exists in our map, we found a valid subarray",
          "Store frequency of each prefix sum in hash map",
          "Initialize with (0, 1) — empty prefix handles subarrays starting from index 0"
        ]
      }
    ]
  },

  "bfs": {
    name: "BFS (Breadth-First Search)",
    keywords: ["level order", "shortest path", "bfs", "breadth first", "number of islands", "rotting oranges", "minimum steps", "nearest", "grid", "matrix", "flood fill", "word ladder"],
    whenToUse: "Shortest path in unweighted graph/grid, level-order traversal, or spreading/expanding from multiple sources",
    levels: [
      {
        name: "BFS with Queue",
        approach: "Process nodes level by level using a queue",
        complexity: { time: "O(V + E) or O(m×n) for grid", space: "O(V) or O(m×n)" },
        java: `// Grid BFS — e.g., shortest path, rotting oranges
Queue<int[]> queue = new LinkedList<>();
boolean[][] visited = new boolean[rows][cols];
queue.offer(new int[]{startRow, startCol});
visited[startRow][startCol] = true;
int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
int steps = 0;

while (!queue.isEmpty()) {
    int size = queue.size();
    for (int i = 0; i < size; i++) {
        int[] cell = queue.poll();
        for (int[] d : dirs) {
            int nr = cell[0] + d[0], nc = cell[1] + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                && !visited[nr][nc] && grid[nr][nc] != WALL) {
                visited[nr][nc] = true;
                queue.offer(new int[]{nr, nc});
            }
        }
    }
    steps++;
}`,
        walkthrough: [
          "Queue processes nodes in order of distance from source",
          "Process level by level — size variable captures current level's count",
          "Mark visited BEFORE adding to queue (not after polling) to avoid duplicates",
          "4-directional neighbors for grid problems",
          "Multi-source BFS: add ALL sources to queue initially (rotting oranges)"
        ]
      }
    ]
  },

  "dfs": {
    name: "DFS (Depth-First Search)",
    keywords: ["path sum", "island", "number of islands", "dfs", "depth first", "connected component", "flood fill", "surrounded regions", "max area", "tree path", "root to leaf"],
    whenToUse: "Exploring all paths, connected components, tree traversals, or when you need to go deep before wide",
    levels: [
      {
        name: "Recursive DFS",
        approach: "Recurse into neighbors, mark visited to avoid cycles",
        complexity: { time: "O(V + E) or O(m×n)", space: "O(V) recursion stack" },
        java: `// Count islands in grid
int count = 0;
for (int i = 0; i < grid.length; i++) {
    for (int j = 0; j < grid[0].length; j++) {
        if (grid[i][j] == '1') {
            dfs(grid, i, j);
            count++;
        }
    }
}

void dfs(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length
        || grid[r][c] != '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(grid, r+1, c);
    dfs(grid, r-1, c);
    dfs(grid, r, c+1);
    dfs(grid, r, c-1);
}`,
        walkthrough: [
          "Base case: out of bounds or already visited",
          "Mark current cell visited (modify in-place or use visited array)",
          "Recurse in all 4 directions",
          "Each cell visited once — O(m×n)",
          "For trees: no visited check needed (no cycles)"
        ]
      },
      {
        name: "Iterative DFS with Stack",
        approach: "Same logic but explicit stack instead of recursion — avoids stack overflow",
        complexity: { time: "O(V + E)", space: "O(V)" },
        java: `Deque<int[]> stack = new ArrayDeque<>();
stack.push(new int[]{startR, startC});
while (!stack.isEmpty()) {
    int[] cell = stack.pop();
    int r = cell[0], c = cell[1];
    if (r < 0 || r >= rows || c < 0 || c >= cols
        || visited[r][c]) continue;
    visited[r][c] = true;
    // process cell
    for (int[] d : dirs) {
        stack.push(new int[]{r + d[0], c + d[1]});
    }
}`,
        walkthrough: [
          "Replace recursion with explicit stack — same traversal order",
          "Use when grid is large and recursion depth could overflow",
          "Check visited after popping (lazy evaluation)"
        ]
      }
    ]
  },

  "tree-traversal": {
    name: "Tree Traversal",
    keywords: ["inorder", "preorder", "postorder", "level order", "binary tree", "bst", "validate bst", "max depth", "diameter", "lowest common ancestor", "serialize", "symmetric"],
    whenToUse: "Any binary tree problem. Inorder for BST (sorted output). Preorder for serialization. Postorder for bottom-up computation",
    levels: [
      {
        name: "Recursive Traversal",
        approach: "Choose traversal order based on when you process the node",
        complexity: { time: "O(n)", space: "O(h) where h = height" },
        java: `// Inorder: left → node → right (BST gives sorted order)
void inorder(TreeNode node) {
    if (node == null) return;
    inorder(node.left);
    process(node.val);     // visit node between children
    inorder(node.right);
}

// Preorder: node → left → right (copy/serialize tree)
// Postorder: left → right → node (compute height, delete tree)

// Max depth example (postorder pattern):
int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
        walkthrough: [
          "Inorder on BST = sorted output — useful for validation, kth smallest",
          "Preorder = process root first — good for copying, serializing",
          "Postorder = process children first — good for height, diameter, subtree problems",
          "Most tree problems: think about what info you need from children (postorder) vs what you pass down (preorder)"
        ]
      },
      {
        name: "Iterative with Stack",
        approach: "Simulate recursion with explicit stack",
        complexity: { time: "O(n)", space: "O(h)" },
        java: `// Iterative inorder
Deque<TreeNode> stack = new ArrayDeque<>();
TreeNode curr = root;
while (curr != null || !stack.isEmpty()) {
    while (curr != null) {
        stack.push(curr);
        curr = curr.left;
    }
    curr = stack.pop();
    process(curr.val);
    curr = curr.right;
}`,
        walkthrough: [
          "Go as far left as possible, pushing nodes",
          "Pop = visit the node, then go right",
          "Useful when interviewer asks for iterative solution"
        ]
      }
    ]
  },

  "sorting-greedy": {
    name: "Sorting + Greedy",
    keywords: ["merge intervals", "meeting rooms", "interval", "schedule", "overlap", "non-overlapping", "minimum platforms", "assign cookies", "jump game", "task scheduler"],
    whenToUse: "Interval problems (sort by start/end), greedy choices after sorting, or when order matters for optimization",
    levels: [
      {
        name: "Sort + Sweep",
        approach: "Sort intervals, then process linearly making greedy decisions",
        complexity: { time: "O(n log n)", space: "O(n) for result" },
        java: `// Merge Intervals
Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
List<int[]> merged = new ArrayList<>();
merged.add(intervals[0]);
for (int i = 1; i < intervals.length; i++) {
    int[] last = merged.get(merged.size() - 1);
    if (intervals[i][0] <= last[1]) {
        last[1] = Math.max(last[1], intervals[i][1]);
    } else {
        merged.add(intervals[i]);
    }
}`,
        walkthrough: [
          "Sort by start time — this is almost always step 1 for interval problems",
          "Compare current interval with last merged",
          "Overlap? Extend the end. No overlap? Add as new interval",
          "Meeting rooms variant: sort + count overlapping (use min-heap or line sweep)"
        ]
      }
    ]
  },

  "linked-list": {
    name: "Linked List",
    keywords: ["linked list", "reverse linked list", "merge two sorted", "remove nth from end", "add two numbers", "reorder list", "intersection", "copy with random pointer"],
    whenToUse: "In-place manipulation of linked list nodes. Reversal, merging, or pointer manipulation",
    levels: [
      {
        name: "Iterative Reversal",
        approach: "Three pointers: prev, curr, next. Reverse links one by one",
        complexity: { time: "O(n)", space: "O(1)" },
        java: `ListNode prev = null, curr = head;
while (curr != null) {
    ListNode next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
}
return prev; // new head`,
        walkthrough: [
          "Save next pointer before breaking the link",
          "Point current's next to previous (reverse the arrow)",
          "Advance both pointers forward",
          "At end, prev is the new head"
        ]
      },
      {
        name: "Merge Two Sorted Lists",
        approach: "Dummy head + compare and link smaller node",
        complexity: { time: "O(n + m)", space: "O(1)" },
        java: `ListNode dummy = new ListNode(0);
ListNode curr = dummy;
while (l1 != null && l2 != null) {
    if (l1.val <= l2.val) {
        curr.next = l1;
        l1 = l1.next;
    } else {
        curr.next = l2;
        l2 = l2.next;
    }
    curr = curr.next;
}
curr.next = (l1 != null) ? l1 : l2;
return dummy.next;`,
        walkthrough: [
          "Dummy head avoids edge cases with empty lists",
          "Compare heads of both lists, link smaller one",
          "When one list exhausted, attach the remainder",
          "Return dummy.next — the real head"
        ]
      }
    ]
  },

  "dp-1d": {
    name: "Dynamic Programming (1D)",
    keywords: ["climbing stairs", "house robber", "coin change", "longest increasing subsequence", "decode ways", "word break", "maximum subarray", "fibonacci", "minimum cost"],
    whenToUse: "Optimal substructure + overlapping subproblems. Current answer depends on previous answers. 'Minimum cost', 'number of ways', 'can you reach'",
    levels: [
      {
        name: "Recursion (Top-Down, no memo)",
        approach: "Break into subproblems recursively",
        complexity: { time: "O(2^n) typically", space: "O(n) stack" },
        java: `// Climbing stairs — how many ways to reach step n?
int climb(int n) {
    if (n <= 1) return 1;
    return climb(n - 1) + climb(n - 2);
}`,
        walkthrough: [
          "Recurrence relation: f(n) = f(n-1) + f(n-2)",
          "Correct but exponential — recalculates same subproblems",
          "Interviewer: can you avoid redundant work?"
        ]
      },
      {
        name: "Memoization (Top-Down)",
        approach: "Cache results of subproblems",
        complexity: { time: "O(n)", space: "O(n)" },
        java: `int[] memo = new int[n + 1];
Arrays.fill(memo, -1);
int climb(int n) {
    if (n <= 1) return 1;
    if (memo[n] != -1) return memo[n];
    memo[n] = climb(n - 1) + climb(n - 2);
    return memo[n];
}`,
        walkthrough: [
          "Same recursion but check cache before computing",
          "Each subproblem computed once — O(n) time",
          "Good when not all subproblems needed (sparse)"
        ]
      },
      {
        name: "Tabulation (Bottom-Up)",
        approach: "Build solution iteratively from base cases",
        complexity: { time: "O(n)", space: "O(n) or O(1) with optimization" },
        java: `// Bottom-up with O(1) space
int prev2 = 1, prev1 = 1;
for (int i = 2; i <= n; i++) {
    int curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
}
return prev1;

// Coin change — minimum coins
int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);
dp[0] = 0;
for (int i = 1; i <= amount; i++) {
    for (int coin : coins) {
        if (coin <= i) {
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
}
return dp[amount] > amount ? -1 : dp[amount];`,
        walkthrough: [
          "Fill table from small to large — each entry uses already-computed values",
          "Space optimization: if dp[i] only depends on dp[i-1] and dp[i-2], just keep two variables",
          "Coin change: dp[i] = min coins to make amount i. Try each coin, take minimum",
          "Bottom-up preferred in interviews — easier to reason about complexity"
        ]
      }
    ]
  },

  "dp-2d": {
    name: "Dynamic Programming (2D)",
    keywords: ["unique paths", "longest common subsequence", "edit distance", "minimum path sum", "knapsack", "interleaving string", "regular expression matching"],
    whenToUse: "Two sequences to compare, grid traversal with constraints, or decisions involving two dimensions",
    levels: [
      {
        name: "Recursive",
        approach: "Two indices, one per sequence/dimension",
        complexity: { time: "O(2^(m+n))", space: "O(m+n) stack" },
        java: `// Longest Common Subsequence
int lcs(String s1, String s2, int i, int j) {
    if (i == s1.length() || j == s2.length()) return 0;
    if (s1.charAt(i) == s2.charAt(j)) {
        return 1 + lcs(s1, s2, i+1, j+1);
    }
    return Math.max(lcs(s1, s2, i+1, j), lcs(s1, s2, i, j+1));
}`,
        walkthrough: [
          "Characters match? Include + advance both",
          "Don't match? Try skipping from each string, take max",
          "Exponential — overlapping subproblems"
        ]
      },
      {
        name: "2D Table",
        approach: "dp[i][j] represents answer for first i chars of s1 and first j chars of s2",
        complexity: { time: "O(m×n)", space: "O(m×n) or O(n) with rolling array" },
        java: `int[][] dp = new int[m + 1][n + 1];
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
        if (s1.charAt(i-1) == s2.charAt(j-1)) {
            dp[i][j] = dp[i-1][j-1] + 1;
        } else {
            dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
}
return dp[m][n];

// Space optimization: only need previous row
// Use 1D array + prev variable`,
        walkthrough: [
          "Build table row by row",
          "Match → diagonal + 1. No match → max of left and above",
          "Final answer at dp[m][n]",
          "Space optimization: roll to 1D array since each row only depends on previous row"
        ]
      }
    ]
  },

  "backtracking": {
    name: "Backtracking",
    keywords: ["permutations", "combinations", "subsets", "generate parentheses", "sudoku", "n-queens", "letter combinations", "combination sum", "word search", "palindrome partitioning"],
    whenToUse: "Generate all valid configurations, combinations, or permutations. 'Find all...', 'generate all...', 'list all possible...'",
    levels: [
      {
        name: "Backtracking Template",
        approach: "Choose → Explore → Unchoose. Build solution incrementally, prune invalid branches early",
        complexity: { time: "O(2^n) subsets, O(n!) permutations", space: "O(n) recursion depth" },
        java: `// Subsets
List<List<Integer>> result = new ArrayList<>();
void backtrack(int[] nums, int start, List<Integer> current) {
    result.add(new ArrayList<>(current)); // add copy
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);           // choose
        backtrack(nums, i + 1, current); // explore
        current.remove(current.size()-1); // unchoose
    }
}

// Permutations — use boolean[] used instead of start index
// Combination Sum — pass i (not i+1) to allow reuse`,
        walkthrough: [
          "Template: choose element, recurse, then undo the choice",
          "Subsets: start from index i, move forward only (avoid duplicates)",
          "Permutations: try all unused elements at each position",
          "Pruning: skip branches early if they can't lead to valid solution",
          "Always add a COPY of current list to result (not the reference)"
        ]
      }
    ]
  },

  "heap-priority-queue": {
    name: "Heap / Priority Queue",
    keywords: ["kth largest", "kth smallest", "top k", "merge k sorted", "median", "find median from data stream", "meeting rooms ii", "task scheduler", "reorganize string"],
    whenToUse: "'Kth' anything, merging k sorted things, or maintaining running min/max/median",
    levels: [
      {
        name: "Sort",
        approach: "Sort entire collection and pick kth element",
        complexity: { time: "O(n log n)", space: "O(1)" },
        java: `Arrays.sort(nums);
return nums[nums.length - k]; // kth largest`,
        walkthrough: [
          "Simple but sorts everything — wasteful if k << n",
          "Interviewer: can you do better than O(n log n)?"
        ]
      },
      {
        name: "Min/Max Heap",
        approach: "Maintain heap of size k — only keep what you need",
        complexity: { time: "O(n log k)", space: "O(k)" },
        java: `// Kth largest: use min-heap of size k
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int num : nums) {
    minHeap.offer(num);
    if (minHeap.size() > k) {
        minHeap.poll(); // remove smallest
    }
}
return minHeap.peek(); // kth largest

// Running median: max-heap for lower half + min-heap for upper half
PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<Integer> hi = new PriorityQueue<>();`,
        walkthrough: [
          "Kth largest → min-heap of size k. Top of heap = answer",
          "Why min-heap for kth largest? We evict smallest, keeping k largest",
          "Kth smallest → max-heap of size k (evict largest)",
          "Running median: two heaps — max-heap (lower half) + min-heap (upper half)"
        ]
      }
    ]
  }
};

const COMPLEXITY_REFERENCE = {
  timeComplexity: [
    { notation: "O(1)", name: "Constant", example: "Array access, hash map lookup" },
    { notation: "O(log n)", name: "Logarithmic", example: "Binary search" },
    { notation: "O(n)", name: "Linear", example: "Single loop, linear scan" },
    { notation: "O(n log n)", name: "Linearithmic", example: "Merge sort, heap sort, efficient sorting" },
    { notation: "O(n²)", name: "Quadratic", example: "Nested loops, brute force pairs" },
    { notation: "O(2^n)", name: "Exponential", example: "Recursive subsets, brute force combinations" },
    { notation: "O(n!)", name: "Factorial", example: "Permutations" }
  ],
  spaceComplexity: [
    "Input modification (mark visited in-place) = O(1) extra space",
    "Hash map / set = O(n)",
    "Recursion stack = O(h) for trees, O(n) worst case",
    "2D DP table = O(m×n), often optimizable to O(n) with rolling array",
    "BFS queue = O(width of level) — worst case O(n)"
  ],
  javaCollections: {
    "HashMap": "O(1) get/put avg, O(n) worst. null keys allowed",
    "TreeMap": "O(log n) get/put. Sorted keys. NavigableMap methods",
    "HashSet": "O(1) add/contains/remove avg",
    "PriorityQueue": "O(log n) offer/poll, O(1) peek. Min-heap by default",
    "ArrayDeque": "O(1) push/pop/offer/poll. Use as stack AND queue. Faster than Stack/LinkedList",
    "LinkedList": "O(1) add/remove at ends. O(n) random access. Implements Deque",
    "ArrayList": "O(1) amortized add, O(1) get by index, O(n) remove from middle"
  }
};

const COMMON_GOTCHAS = [
  { pattern: "Integer overflow", tip: "Use long for intermediate calculations. mid = left + (right - left) / 2 instead of (left + right) / 2" },
  { pattern: "Off-by-one", tip: "Clarify: is the range inclusive or exclusive? Check loop bounds with smallest input" },
  { pattern: "Null/empty input", tip: "Always handle: null array, empty array, single element. Ask interviewer about constraints" },
  { pattern: "Modifying while iterating", tip: "Use iterator.remove() or collect indices first, then modify" },
  { pattern: "Reference vs copy", tip: "result.add(new ArrayList<>(current)) not result.add(current) — current will be modified later" },
  { pattern: "HashMap default", tip: "map.getOrDefault(key, 0) or map.merge(key, 1, Integer::sum) for counting" },
  { pattern: "Comparator gotcha", tip: "(a, b) -> a - b can overflow with large ints. Use Integer.compare(a, b) instead" },
  { pattern: "String immutability", tip: "Use StringBuilder for string building in loops — String concatenation is O(n) per operation" }
];

module.exports = { CODING_PATTERNS, COMPLEXITY_REFERENCE, COMMON_GOTCHAS };
