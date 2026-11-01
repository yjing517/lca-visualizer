const examples=[{nums:[1,3,-1,-3,5,3,6,7],k:3},{nums:[1],k:1},{nums:[5,4,3,2,1],k:3},{nums:[2,2,2,2],k:2},{nums:[1,2,3,4],k:4},{nums:[-4,-2,-5],k:1}];
function trace(nums,k){
 if(!Array.isArray(nums)||!nums.length||!nums.every(Number.isInteger)||!Number.isInteger(k)||k<1||k>nums.length)throw Error('需要整数数组及 1 ≤ k ≤ n');
 const q=[],ans=[],events=[];let head=0,i=-1,x=null,removed=null;
 const emit=(line,message)=>events.push({line,message,i,x,left:Math.max(0,i-k+1),queue:q.slice(head),ans:[...ans],removed});
 emit('start','窗口每次向右移动一格；q 存下标，队头是最大值的候选。');emit('init','初始化空答案和双端队列。');
 for(i=0;i<nums.length;i++){
  x=nums[i];removed=null;emit('loop',`处理 i=${i}，x=nums[${i}]=${x}。当前窗口左边界为 ${Math.max(0,i-k+1)}。`);
  emit('compare','检查队尾对应的值是否 ≤ x；若是，它已被更新且不小的 x 替代。');
  while(head<q.length&&nums[q.at(-1)]<=x){removed=q.pop();emit('pop',`从队尾淘汰下标 ${removed}（值 ${nums[removed]}）：${x} 不小于它，且出现更晚、过期更晚。`);removed=null;emit('compare','继续检查新的队尾，可能连续淘汰多个候选。');}
  q.push(i);emit('append',`把下标 ${i} 入队，不是把值 ${x} 入队。队列下标递增，对应值严格递减。`);
  emit('expire',`检查 i−q[0] ≥ k：${i}−${q[head]} ${i-q[head]>=k?'≥':'<'} ${k}。有效下标必须 ≥ i−k+1。`);
  if(i-q[head]>=k){removed=q[head++];emit('shift',`队头下标 ${removed} 已离开窗口，从左端移除。每轮只移动一格，因此最多一个旧下标过期。`);removed=null;}
  emit('ready',i>=k-1?'窗口已有 k 个元素，可以记录最大值。':`还没形成完整窗口：i=${i} < k−1=${k-1}，暂不记录。`);
  if(i>=k-1){ans.push(nums[q[head]]);emit('save',`队头下标 ${q[head]} 对应最大值 ${nums[q[head]]}，加入答案。`);}
 }
 i=nums.length-1;emit('done',`完成，共 ${ans.length} 个窗口，返回 ${JSON.stringify(ans)}。`);return {events};
}
const snippets={"Python": ["from collections import deque", "from typing import List", "class Solution:", "    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:", "        ans = []", "        q = deque()", "        for i, x in enumerate(nums):", "            while q and nums[q[-1]] <= x:", "                q.pop()", "            q.append(i)", "            if i - q[0] >= k:", "                q.popleft()", "            if i >= k - 1:", "                ans.append(nums[q[0]])", "        return ans"], "Java": ["import java.util.ArrayDeque;", "import java.util.Deque;", "class Solution {", "    public int[] maxSlidingWindow(int[] nums, int k) {", "        int[] ans = new int[nums.length - k + 1];", "        Deque<Integer> q = new ArrayDeque<>();", "        for (int i = 0; i < nums.length; i++) {", "            int x = nums[i];", "            while (!q.isEmpty() && nums[q.peekLast()] <= x) {", "                q.removeLast();", "            }", "            q.addLast(i);", "            if (i - q.peekFirst() >= k) {", "                q.removeFirst();", "            }", "            if (i >= k - 1) {", "                ans[i - k + 1] = nums[q.peekFirst()];", "            }", "        }", "        return ans;", "    }", "}"]};
const highlightLines={"Python": {"start": 3, "init": 5, "loop": 6, "compare": 7, "pop": 8, "append": 9, "expire": 10, "shift": 11, "ready": 12, "save": 13, "done": 14}, "Java": {"start": 3, "init": 5, "loop": 7, "compare": 8, "pop": 9, "append": 11, "expire": 12, "shift": 13, "ready": 15, "save": 16, "done": 19}};
if(typeof module!=='undefined')module.exports={trace,examples,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value,{nums,k}=examples[+$('example').value];
  $('array').replaceChildren(...nums.map((v,j)=>{const el=document.createElement('div');el.className='cell'+(e.i>=0&&j>=e.left&&j<=e.i?' inside':'')+(j===e.i?' current':'');el.textContent=`${v}`;const small=document.createElement('small');small.textContent=`下标 ${j}`;el.append(small);return el;}));
  $('queue').replaceChildren(...(e.queue.length?e.queue.map(j=>{const el=document.createElement('span');el.className='frame';el.textContent=`${j} → 值 ${nums[j]}`;return el;}):[document.createTextNode('∅ 空队列')]));
  $('current').textContent=e.i<0?`窗口大小 k=${k}`:`i=${e.i}，x=${e.x}；窗口 [${e.left}, ${e.i}]${e.i<k-1?'（未满）':''}`;
  $('answers').textContent='ans = '+JSON.stringify(e.ans);
  $('code').replaceChildren(...snippets[lang].map((line,j)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===j?' on':'');const num=document.createElement('span');num.className='num';num.textContent=j+1;el.append(num,document.createTextNode(line));return el;}));
  $('phase').textContent='当前操作 / '+e.line;$('message').textContent=e.message;
  $('result').textContent=`已记录 ${e.ans.length} 个窗口`;$('counter').textContent=`${index} / ${data.events.length-1}`;$('seek').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(examples[+$('example').value].nums,examples[+$('example').value].k);index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
