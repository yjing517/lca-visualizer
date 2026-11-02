function trace(n){
 if(!Number.isInteger(n)||n<1||n>5)throw Error('演示范围 1≤n≤5');
 const m=2*n,path=Array(m).fill(''),ans=[],stack=[],events=[];
 const emit=(line,message,i=0,open=0)=>events.push({line,message,i,open,close:i-open,balance:2*open-i,path:[...path],prefix:path.slice(0,i).join(''),ans:[...ans],stack:[...stack]});
 emit('start','固定数组长度 2n，dfs(i,open) 填第 i 个格子；open 是已放左括号的总数。');
 function dfs(i,open){stack.push(`dfs(${i}, ${open})`);emit('check',`已填 ${i} 格：左括号 ${open} 个，右括号 ${i-open} 个，余额 ${2*open-i}。`,i,open);
  if(i===m){ans.push(path.join(''));emit('save','每个前缀均合法且填满 2n 格，保存 join 生成的独立字符串。',i,open);emit('return','只返回父调用，父层可能继续尝试右括号。',i,open);stack.pop();return;}
  emit('leftCheck',`open=${open} < n=${n}？左括号总数不能超过 n。`,i,open);
  if(open<n){path[i]='(';emit('left','写入左括号；只覆盖当前格，不改变数组长度。',i,open);emit('leftCall',`递归 dfs(${i+1}, ${open+1})。`,i,open);dfs(i+1,open+1);}else emit('leftBlocked','左括号已用满，跳过该分支。',i,open);
  emit('rightCheck',`右括号数 i−open=${i-open} < 左括号数 ${open}？有未匹配左括号才可放右括号。`,i,open);
  if(i-open<open){path[i]=')';emit('right','写入右括号，覆盖当前格此前的内容；左括号总数不变。',i,open);emit('rightCall',`递归 dfs(${i+1}, ${open})。`,i,open);dfs(i+1,open);}else emit('rightBlocked','没有可匹配的左括号，右分支被阻止。',i,open);
  emit('end','当前层处理完毕。固定数组无需 pop，下一分支会覆盖本层及后续位置。',i,open);stack.pop();
 }
 dfs(0,0);emit('done',`完成，共 ${ans.length} 种有效括号。`);return {events,answer:ans};
}
const snippets={"Python": ["from typing import List", "class Solution:", "    def generateParenthesis(self, n: int) -> List[str]:", "        m = n * 2", "        ans = []", "        path = [''] * m", "        def dfs(i, open):", "            if i == m:", "                ans.append(''.join(path))", "                return", "            if open < n:", "                path[i] = '('", "                dfs(i + 1, open + 1)", "            if i - open < open:", "                path[i] = ')'", "                dfs(i + 1, open)", "        dfs(0, 0)", "        return ans"], "Java": ["import java.util.ArrayList;", "import java.util.List;", "class Solution {", "    public List<String> generateParenthesis(int n) {", "        List<String> ans = new ArrayList<>();", "        dfs(0, 0, n, new char[n * 2], ans);", "        return ans;", "    }", "    private void dfs(int i, int open, int n, char[] path, List<String> ans) {", "        if (i == path.length) {", "            ans.add(new String(path));", "            return;", "        }", "        if (open < n) {", "            path[i] = '(';", "            dfs(i + 1, open + 1, n, path, ans);", "        }", "        if (i - open < open) {", "            path[i] = ')';", "            dfs(i + 1, open, n, path, ans);", "        }", "    }", "}"]};
const highlightLines={"Python": {"start": 3, "check": 7, "save": 8, "leftCheck": 10, "left": 11, "leftCall": 12, "leftBlocked": 10, "rightCheck": 13, "right": 14, "rightCall": 15, "rightBlocked": 13, "end": 13, "done": 17, "return": 9}, "Java": {"start": 3, "check": 9, "save": 10, "leftCheck": 13, "left": 14, "leftCall": 15, "leftBlocked": 13, "rightCheck": 17, "right": 18, "rightCall": 19, "rightBlocked": 17, "end": 21, "done": 6, "return": 11}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){const e=data.events[index],lang=$('lang').value;
 $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');el.textContent=(i+1).toString().padStart(2)+'  '+line;return el;}));
 $('frames').textContent=e.stack.length?e.stack.join(' → ')+' ← 栈顶':'∅ 空栈';$('answers').textContent='ans = '+JSON.stringify(e.ans);
 $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;$('result').textContent='已收集 '+e.ans.length+' 个';$('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
$('slots').textContent='有效前缀 = '+JSON.stringify(e.prefix);$('state').textContent=`位置 i=${e.i}；左=${e.open}；右=${e.close}；未匹配余额=${e.balance}`;
 $('visual').innerHTML=e.path.map((v,i)=>'<span class="cell '+(i<e.i?'chosen':i===e.i?'current':'muted')+'">'+(v||'·')+'<small>['+i+']</small></span>').join('');
 }
 function reset(){stop();data=trace(Number($('example').value));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}

