function trace(k,n){
 if(!Number.isInteger(k)||!Number.isInteger(n)||k<2||k>9||n<1||n>60)throw Error('演示范围 2≤k≤9，1≤n≤60');
 const events=[],path=[],ans=[],stack=[],needs=[];
 const emit=(line,message,i=9,t=n)=>events.push({line,message,i,t,d:needs.at(-1)??k-path.length,limit:(2*i-(needs.at(-1)??k-path.length)+1)*(needs.at(-1)??k-path.length)/2,path:[...path],ans:ans.map(a=>[...a]),stack:[...stack]});
 emit('start','从 1 到 9 选 k 个不同数字，总和为 n；路径递减，不产生重复组合。');
 function dfs(i,t){stack.push(`dfs(${i}, ${t})`);const d=k-path.length;needs.push(d);emit('need',`还缺 d=${d} 个，剩余目标 t=${t}。`,i,t);
  const limit=(2*i-d+1)*d/2;emit('prune',`检查 t<0 或 t>(${i}×2−${d}+1)×${d}/2=${limit}。`,i,t);
  if(t<0||t>limit){emit('cut',t<0?'已经超出目标，剪枝返回。':'即使选最大的 d 个数也凑不到目标，剪枝返回。',i,t);stack.pop();needs.pop();return;}
  emit('check','检查是否已经选满 k 个。',i,t);
  if(path.length===k){ans.push([...path]);emit('save','d=0 时上界是 0，前面的剪枝已保证 t=0；复制当前路径。',i,t);emit('return','返回父调用，继续执行撤销。',i,t);stack.pop();needs.pop();return;}
  for(let j=i;j>=d;j--){emit('loop',`枚举 j=${j} ≥ d=${d}，保证剩余候选数量足够。`,i,t);path.push(j);emit('choose',`选 ${j}，路径严格递减。`,i,t);emit('call',`调用 dfs(${j-1}, ${t-j})：候选上界减小，目标减去选中数字。`,i,t);dfs(j-1,t-j);path.pop();emit('pop',`撤销 ${j}，恢复父调用路径；t 是参数，没有被子调用改动。`,i,t);}
  emit('end','本层候选已枚举完，返回上一层。',i,t);stack.pop();needs.pop();
 }
 dfs(9,n);emit('done',`完成，共 ${ans.length} 个组合。`);return {events,answer:ans};
}
const snippets={"Python": ["from typing import List", "class Solution:", "    def combinationSum3(self, k: int, n: int) -> List[List[int]]:", "        ans, path = [], []", "        def dfs(i, t):", "            d = k - len(path)", "            if t < 0 or t > (i * 2 - d + 1) * d // 2:", "                return", "            if len(path) == k:", "                ans.append(path.copy())", "                return", "            for j in range(i, d - 1, -1):", "                path.append(j)", "                dfs(j - 1, t - j)", "                path.pop()", "        dfs(9, n)", "        return ans"], "Java": ["import java.util.ArrayList;", "import java.util.List;", "class Solution {", "    public List<List<Integer>> combinationSum3(int k, int n) {", "        List<List<Integer>> ans = new ArrayList<>();", "        dfs(9, n, k, new ArrayList<>(), ans);", "        return ans;", "    }", "    private void dfs(int i, int t, int k, List<Integer> path, List<List<Integer>> ans) {", "        int d = k - path.size();", "        if (t < 0 || t > (i * 2 - d + 1) * d / 2) return;", "        if (path.size() == k) {", "            ans.add(new ArrayList<>(path));", "            return;", "        }", "        for (int j = i; j >= d; j--) {", "            path.add(j);", "            dfs(j - 1, t - j, k, path, ans);", "            path.remove(path.size() - 1);", "        }", "    }", "}"]};
const highlightLines={"Python": {"start": 2, "need": 5, "prune": 6, "cut": 7, "check": 8, "save": 9, "loop": 11, "choose": 12, "call": 13, "pop": 14, "end": 11, "done": 16, "return": 10}, "Java": {"start": 3, "need": 9, "prune": 10, "cut": 10, "check": 11, "save": 12, "loop": 15, "choose": 16, "call": 17, "pop": 18, "end": 19, "done": 6, "return": 13}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){const e=data.events[index],lang=$('lang').value;
 $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');el.textContent=(i+1).toString().padStart(2)+'  '+line;return el;}));
 $('frames').textContent=e.stack.length?e.stack.join(' → ')+' ← 栈顶':'∅ 空栈';$('answers').textContent='ans = '+JSON.stringify(e.ans);
 $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;$('result').textContent='已收集 '+e.ans.length+' 个';$('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
$('slots').textContent='path = '+JSON.stringify(e.path);$('state').textContent=`本层候选上界 i=${e.i}；本层 d=${e.d}；本层剩余目标 t=${e.t}；最大可凑和=${e.limit}`;
 $('visual').innerHTML=Array.from({length:9},(_,i)=>i+1).map(v=>'<span class="cell '+(e.path.includes(v)?'chosen':v>e.i?'muted':'')+'">'+v+'</span>').join('');
 }
 function reset(){stop();data=trace(...$('example').value.split(',').map(Number));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}

