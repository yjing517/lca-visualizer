const mapping=['','','abc','def','ghi','jkl','mno','pqrs','tuv','wxyz'];
function trace(digits) {
 if(!/^[2-9]{0,4}$/.test(digits)) throw Error('请输入最多四个 2—9');
 const events=[],path=Array(digits.length).fill(''),ans=[],stack=[],nodes=[{id:'root',parent:null,label:'开始',depth:0}],seen=[];
 const emit=(line,message,node='root')=>events.push({line,message,node,path:[...path],ans:[...ans],stack:[...stack],seen:[...seen]});
 emit('start','每个数字对应一个格子。dfs(i) 表示前 i 格已确定，准备填第 i 格。');
 if(!digits.length){emit('empty','输入为空，直接返回 []，不是 [""]。');return {events,nodes};}
 emit('init',`初始化 ${digits.length} 个固定格子和空答案列表。`);
 function dfs(i,parent){
  stack.push(i);emit('check',`进入 dfs(${i})：检查 i == n。`,parent);
  if(i===digits.length){ans.push(path.join(''));seen.push(parent);emit('save',`填满了！把 ${path.join('')} 作为字符串保存；之后改 path 不影响已保存的答案。`,parent);emit('return','return 只结束当前调用，回到上一层 for 循环。',parent);stack.pop();return;}
  for(const c of mapping[+digits[i]]){
   emit('loop',`dfs(${i}) 的循环选中 ${c}（数字 ${digits[i]} 的候选字母）。`,parent);
   const old=path[i];path[i]=c;const id=path.slice(0,i+1).join('');
   nodes.push({id,parent,label:id,depth:i+1});
   emit('assign',`path[${i}] = '${c}'${old?`，直接覆盖旧值 '${old}'`:'，填入空格'}。右侧未确定的旧值暂不算结果。`,id);
   emit('call',`调用 dfs(${i+1}) 填下一格；dfs(${i}) 暂停，等它返回。`,id);
   dfs(i+1,id);
   emit('loop',`已回到 dfs(${i}) 的 for 循环，继续尝试下一个字母；无需清空固定格子。`,id);
  }
  emit('end',`dfs(${i}) 的候选字母已用完，函数结束并返回调用处。`,parent);stack.pop();
 }
 dfs(0,'root');emit('done',`全部完成，共 ${ans.length} 个组合。递归栈已空。`);return {events,nodes};
}
const snippets={Python:[
 'from typing import List',
 'MAPPING = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]',
 'class Solution:',
 '    def letterCombinations(self, digits: str) -> List[str]:',
 '        n = len(digits)',
 '        if n == 0: return []',
 '        ans, path = [], [""] * n',
 '        def dfs(i):',
 '            if i == n:',
 '                ans.append("".join(path))',
 '                return',
 '            for c in MAPPING[int(digits[i])]:',
 '                path[i] = c',
 '                dfs(i + 1)',
 '            # 循环结束，自动返回上一层',
 '        dfs(0)',
 '        return ans'
],Java:[
 'import java.util.ArrayList;',
 'import java.util.List;',
 'class Solution {',
 '    private static final String[] MAPPING = ",,abc,def,ghi,jkl,mno,pqrs,tuv,wxyz".split(",");',
 '    public List<String> letterCombinations(String digits) {',
 '        List<String> ans = new ArrayList<>();',
 '        if (digits.isEmpty()) return ans;',
 '        char[] path = new char[digits.length()];',
 '        dfs(0, digits, path, ans);',
 '        return ans;',
 '    }',
 '    private void dfs(int i, String digits, char[] path, List<String> ans) {',
 '        if (i == digits.length()) {',
 '            ans.add(new String(path));',
 '            return;',
 '        }',
 '        for (char c : MAPPING[digits.charAt(i) - \'0\'].toCharArray()) {',
 '            path[i] = c;',
 '            dfs(i + 1, digits, path, ans);',
 '        } // 循环结束，返回上一层',
 '    }',
 '}'
]};
const highlightLines={Python:{start:4,empty:5,init:6,check:8,save:9,return:10,loop:11,assign:12,call:13,end:14,done:16},Java:{start:4,empty:6,init:7,check:12,save:13,return:14,loop:16,assign:17,call:18,end:19,done:9}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value;
  // 只展示已经走到的分支，避免把尚未选择的字母误认为当前状态。
  const visible=new Set(['root',...data.events.slice(0,index+1).map(x=>x.node)]),nodes=data.nodes.filter(n=>visible.has(n.id));
  const rows=Array.from({length:5},(_,d)=>nodes.filter(n=>n.depth===d));
  const pos=Object.fromEntries(rows.flatMap(row=>row.map((n,j)=>[n.id,{x:280+(j-(row.length-1)/2)*56,y:35+n.depth*75}])));
  const width=Math.max(560,...rows.map(r=>r.length*56+40));
  $('tree').setAttribute('viewBox',`${280-width/2} 0 ${width} ${Math.max(240,70+($('example').value.length)*75)}`);
  $('tree').innerHTML=nodes.filter(n=>n.parent).map(n=>`<line class="edge" x1="${pos[n.parent].x}" y1="${pos[n.parent].y}" x2="${pos[n.id].x}" y2="${pos[n.id].y}"/>`).join('')+nodes.map(n=>`<g class="node ${e.seen.includes(n.id)?'answer':''} ${e.node===n.id?'active':''}" transform="translate(${pos[n.id].x},${pos[n.id].y})"><circle r="23"/><text style="font-size:13px">${n.label}</text></g>`).join('');
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('slots').textContent='path = ['+e.path.map((c,i)=>`${i}: ${c||'空'}`).join(' | ')+']';
  $('frames').textContent=e.stack.length?e.stack.map(i=>`dfs(${i})`).join(' → ')+' ← 栈顶':'∅ 空栈';
  $('answers').textContent='ans = '+JSON.stringify(e.ans);
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;
  $('result').textContent=`已收集 ${e.ans.length} 个`;$('counter').textContent=`${index} / ${data.events.length-1}`;$('seek').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace($('example').value);index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
