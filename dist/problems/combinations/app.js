function trace(n,k) {
 if(!Number.isInteger(n)||!Number.isInteger(k)||n<1||n>8||k<1||k>n)throw Error('演示范围：1 ≤ k ≤ n ≤ 8');
 const events=[],path=[],ans=[],stack=[],nodes=[{id:'root',parent:null,label:'开始',depth:0}],seen=[];
 const emit=(line,message,node='root',d=null)=>events.push({line,message,node,d,path:[...path],ans:ans.map(a=>[...a]),stack:[...stack],seen:[...seen]});
 emit('start',`从 1…${n} 中选 ${k} 个，不考虑顺序。路径始终严格递减。`);
 emit('init','初始化空路径 path 和答案 ans。');
 function dfs(i,parent){
  stack.push(i);const d=k-path.length;
  emit('need',`dfs(${i})：已选 ${path.length} 个，还缺 d = ${k} − ${path.length} = ${d} 个。`,parent,d);
  emit('check','检查路径长度是否等于 k。',parent,d);
  if(path.length===k){ans.push([...path]);seen.push(parent);emit('save','复制当前路径到 ans，后续 pop 不会修改这个答案。',parent,d);emit('return','只结束当前 dfs，返回父调用的递归语句之后。',parent,d);stack.pop();return;}
  for(let j=i;j>=d;j--){
   emit('loop',`枚举 j = ${j}，边界 j ≥ d = ${d}。选 j 后还有 j−1 个更小数字，足够选剩余 d−1 个。`,parent,d);
   path.push(j);const id=path.join('-');nodes.push({id,parent,label:path.join(','),depth:path.length});
   emit('assign',`选择 ${j}：加入 path。`,id,d);
   emit('call',`调用 dfs(${j-1})，只从更小的数中选择，避免重复和排列。`,id,d);dfs(j-1,id);
   path.pop();emit('pop',`子调用已返回，撤销 ${j}，恢复父层路径，再尝试下一个候选。`,parent,d);
  }
  emit('end',`候选已用完；j < ${d} 的分支被剪掉，因为凑不够 ${d} 个数。返回上一层。`,parent,d);stack.pop();
 }
 dfs(n,'root');emit('done',`全部完成：共 ${ans.length} 个组合。`);return {events,nodes};
}
const snippets={"Python": ["from typing import List", "class Solution:", "    def combine(self, n: int, k: int) -> List[List[int]]:", "        ans, path = [], []", "        def dfs(i):", "            d = k - len(path)", "            if len(path) == k:", "                ans.append(path.copy())", "                return", "            for j in range(i, d - 1, -1):", "                path.append(j)", "                dfs(j - 1)", "                path.pop()", "        dfs(n)", "        return ans"], "Java": ["import java.util.ArrayList;", "import java.util.List;", "class Solution {", "    public List<List<Integer>> combine(int n, int k) {", "        List<List<Integer>> ans = new ArrayList<>();", "        dfs(n, k, new ArrayList<>(), ans);", "        return ans;", "    }", "    private void dfs(int i, int k, List<Integer> path, List<List<Integer>> ans) {", "        int d = k - path.size();", "        if (path.size() == k) {", "            ans.add(new ArrayList<>(path));", "            return;", "        }", "        for (int j = i; j >= d; j--) {", "            path.add(j);", "            dfs(j - 1, k, path, ans);", "            path.remove(path.size() - 1);", "        }", "    }", "}"]};
const highlightLines={"Python": {"start": 2, "init": 3, "need": 5, "check": 6, "save": 7, "return": 8, "loop": 9, "assign": 10, "call": 11, "pop": 12, "end": 9, "done": 14}, "Java": {"start": 3, "init": 4, "need": 9, "check": 10, "save": 11, "return": 12, "loop": 14, "assign": 15, "call": 16, "pop": 17, "end": 18, "done": 6}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value;
  // 只展示已经走到的分支，避免把尚未选择的数字误认为当前状态。
  const visible=new Set(['root',...data.events.slice(0,index+1).map(x=>x.node)]),nodes=data.nodes.filter(n=>visible.has(n.id));
  const rows=Array.from({length:9},(_,d)=>nodes.filter(n=>n.depth===d));
  const pos=Object.fromEntries(rows.flatMap(row=>row.map((n,j)=>[n.id,{x:280+(j-(row.length-1)/2)*56,y:35+n.depth*75}])));
  const width=Math.max(560,...rows.map(r=>r.length*56+40));
  $('tree').setAttribute('viewBox',`${280-width/2} 0 ${width} ${Math.max(240,70+(Number($('example').value.split(',')[1]))*75)}`);
  $('tree').innerHTML=nodes.filter(n=>n.parent).map(n=>`<line class="edge" x1="${pos[n.parent].x}" y1="${pos[n.parent].y}" x2="${pos[n.id].x}" y2="${pos[n.id].y}"/>`).join('')+nodes.map(n=>`<g class="node ${e.seen.includes(n.id)?'answer':''} ${e.node===n.id?'active':''}" transform="translate(${pos[n.id].x},${pos[n.id].y})"><circle r="23"/><text style="font-size:13px">${n.label}</text></g>`).join('');
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('slots').textContent='path = '+JSON.stringify(e.path)+(e.d===null?'':`；还缺 d = ${e.d}`);
  $('frames').textContent=e.stack.length?e.stack.map(i=>`dfs(${i})`).join(' → ')+' ← 栈顶':'∅ 空栈';
  $('answers').textContent='ans = '+JSON.stringify(e.ans);
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;
  $('result').textContent=`已收集 ${e.ans.length} 个`;$('counter').textContent=`${index} / ${data.events.length-1}`;$('seek').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(...$('example').value.split(',').map(Number));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}

