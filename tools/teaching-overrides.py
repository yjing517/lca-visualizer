"""Expanded operations where a library shortcut would hide the state being taught."""

SOLUTIONS = {
    295: """class MedianFinder:
    def __init__(self):
        self.minq = []
        self.maxq = []

    def addNum(self, num: int) -> None:
        heappush(self.maxq, -num)
        moved = -heappop(self.maxq)
        heappush(self.minq, moved)
        if len(self.minq) - len(self.maxq) > 1:
            heappush(self.maxq, -heappop(self.minq))

    def findMedian(self) -> float:
        if len(self.minq) == len(self.maxq):
            return (self.minq[0] - self.maxq[0]) / 2
        return self.minq[0]
""",
    84: """class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        n = len(heights)
        stk = []
        left = [-1] * n
        right = [n] * n
        for i, h in enumerate(heights):
            while stk and heights[stk[-1]] >= h:
                right[stk[-1]] = i
                stk.pop()
            if stk:
                left[i] = stk[-1]
            stk.append(i)
        res = 0
        for i in range(n):
            res = max(res, heights[i] * (right[i] - left[i] - 1))
        return res
""",
    79: """class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        def dfs(i: int, j: int, k: int) -> bool:
            if k == len(word) - 1:
                return board[i][j] == word[k]
            if board[i][j] != word[k]:
                return False
            c = board[i][j]
            board[i][j] = '0'
            for a, b in pairwise((-1, 0, 1, 0, -1)):
                x, y = i + a, j + b
                ok = 0 <= x < m and 0 <= y < n and board[x][y] != '0'
                if ok and dfs(x, y, k + 1):
                    return True
            board[i][j] = c
            return False
        m, n = len(board), len(board[0])
        for i in range(m):
            for j in range(n):
                if dfs(i, j, 0):
                    return True
        return False
""",
    136: """class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        ans = 0
        for v in nums:
            ans ^= v
        return ans
""",
    347: """class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        cnt = Counter()
        for x in nums:
            cnt[x] += 1
        pq = []
        for x, count in cnt.items():
            heappush(pq, (count, x))
            if len(pq) > k:
                heappop(pq)
        return [x for count, x in pq]
""",
    287: """class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        l, r = 0, len(nums) - 1
        while l < r:
            mid = (l + r) // 2
            cnt = 0
            for v in nums:
                if v <= mid:
                    cnt += 1
            if cnt > mid:
                r = mid
            else:
                l = mid + 1
        return l
""",
    34: """class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        l = self.search(nums, target)
        r = self.search(nums, target + 1)
        return [-1, -1] if l == r else [l, r - 1]

    def search(self, nums: List[int], x: int) -> int:
        left, right = 0, len(nums)
        while left < right:
            mid = (left + right) // 2
            if nums[mid] >= x:
                right = mid
            else:
                left = mid + 1
        return left
""",
    42: """class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        left = [height[0]] * n
        right = [height[-1]] * n
        for i in range(1, n):
            left[i] = max(left[i - 1], height[i])
            right[n - i - 1] = max(right[n - i], height[n - i - 1])
        ans = 0
        for i in range(n):
            ans += min(left[i], right[i]) - height[i]
        return ans
""",
    31: """class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        n = len(nums)
        i = n - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        j, k = i + 1, n - 1
        while j < k:
            nums[j], nums[k] = nums[k], nums[j]
            j += 1
            k -= 1
""",
    139: """class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        n = len(s)
        f = [True] + [False] * n
        for i in range(1, n + 1):
            for j in range(i):
                if f[j] and s[j:i] in words:
                    f[i] = True
                    break
        return f[n]
""",
}

# Small, independently specified boundary cases, in addition to official examples.
EDGES = {
    1: ({"nums": [3, 3], "target": 6}, [0, 1]),
    49: ({"strs": [""]}, [[""]]),
    128: ({"nums": []}, 0),
    283: ({"nums": [0, 0]}, [0, 0]),
    11: ({"height": [1, 1]}, 1),
    15: ({"nums": [0, 0, 0, 0]}, [[0, 0, 0]]),
    42: ({"height": [1]}, 0),
    3: ({"s": ""}, 0),
    438: ({"s": "a", "p": "ab"}, []),
    560: ({"nums": [0, 0], "k": 0}, 3),
    76: ({"s": "a", "t": "aa"}, ""),
    53: ({"nums": [-3, -2, -5]}, -2),
    56: ({"intervals": [[1, 4], [4, 5]]}, [[1, 5]]),
    189: ({"nums": [1], "k": 10}, [1]),
    238: ({"nums": [0, 2, 0]}, [0, 0, 0]),
    41: ({"nums": [1, 1]}, 2),
    73: ({"matrix": [[0]]}, [[0]]),
    54: ({"matrix": [[1, 2, 3]]}, [1, 2, 3]),
    48: ({"matrix": [[1]]}, [[1]]),
    240: ({"matrix": [[1]], "target": 0}, False),
    206: ({"head": []}, []),
    234: ({"head": [1]}, True),
    21: ({"list1": [], "list2": [0]}, [0]),
    2: ({"l1": [9], "l2": [1]}, [0, 1]),
    19: ({"head": [1], "n": 1}, []),
    24: ({"head": [1]}, [1]),
    25: ({"head": [1, 2, 3], "k": 3}, [3, 2, 1]),
    138: ({"head": []}, []),
    148: ({"head": []}, []),
    23: ({"lists": [[]]}, []),
    94: ({"root": []}, []),
    104: ({"root": []}, 0),
    226: ({"root": []}, []),
    101: ({"root": [1, 2, 2, None, 3, None, 3]}, False),
    543: ({"root": [1]}, 0),
    102: ({"root": []}, []),
    108: ({"nums": [1]}, [1]),
    98: ({"root": [2, 2, 3]}, False),
    230: ({"root": [1], "k": 1}, 1),
    199: ({"root": []}, []),
    114: ({"root": [1]}, [1]),
    105: ({"preorder": [1], "inorder": [1]}, [1]),
    437: ({"root": [0, 0, 0], "targetSum": 0}, 5),
    124: ({"root": [-3]}, -3),
    200: ({"grid": [["0"]]}, 0),
    994: ({"grid": [[0, 2]]}, 0),
    207: ({"numCourses": 1, "prerequisites": [[0, 0]]}, False),
    39: ({"candidates": [2], "target": 1}, []),
    79: ({"board": [["A"]], "word": "AA"}, False),
    35: ({"nums": [1], "target": 2}, 1),
    74: ({"matrix": [[1]], "target": 0}, False),
    34: ({"nums": [], "target": 1}, [-1, -1]),
    33: ({"nums": [1], "target": 0}, -1),
    153: ({"nums": [1]}, 1),
    4: ({"nums1": [], "nums2": [1]}, 1),
    20: ({"s": "]"}, False),
    394: ({"s": "2[a2[b]]"}, "abbabb"),
    739: ({"temperatures": [30, 30]}, [0, 0]),
    84: ({"heights": [2, 2]}, 4),
    215: ({"nums": [2, 2, 1], "k": 2}, 2),
    347: ({"nums": [1], "k": 1}, [1]),
    121: ({"prices": [5, 4, 3]}, 0),
    55: ({"nums": [0]}, True),
    45: ({"nums": [0]}, 0),
    763: ({"s": "a"}, [1]),
    70: ({"n": 1}, 1),
    118: ({"numRows": 1}, [[1]]),
    279: ({"n": 1}, 1),
    322: ({"coins": [2], "amount": 0}, 0),
    139: ({"s": "a", "wordDict": ["b"]}, False),
    152: ({"nums": [-2, 0, -1]}, 0),
    416: ({"nums": [1, 2, 5]}, False),
    32: ({"s": ""}, 0),
    62: ({"m": 1, "n": 1}, 1),
    64: ({"grid": [[0]]}, 0),
    5: ({"s": "a"}, "a"),
    72: ({"word1": "", "word2": "abc"}, 3),
    136: ({"nums": [-1]}, -1),
    169: ({"nums": [1]}, 1),
    75: ({"nums": [2, 0, 1]}, [0, 1, 2]),
    31: ({"nums": [3, 2, 1]}, [1, 2, 3]),
    287: ({"nums": [1, 1]}, 1),
}
