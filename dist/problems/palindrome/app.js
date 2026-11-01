function trace(s){
 if(typeof s!=='string'||!/^[a-z]{0,6}$/.test(s))throw Error('演示使用至多 6 个小写字母');
 const events=[],nodes=[{id:'root',parent:null,label:'开始',depth:0}],path=[],ans=[],stack=[],seen=[];
 let candidate=null;
 const emit=(line,message,node)=>events.push({line,message,node,path:[...path],ans:ans.map(x=>[...x]),stack:[...stack],seen:[...seen],candidate:candidate&&{...candidate}});
 emit('start','把字符间隙当作切割点。子集题选数字，本题选择下一刀切在哪里。','root');
 function dfs(i,id){
  stack.push(i);candidate=null;emit('check',`dfs(${i})：前缀 s[0:${i}] 已分好，准备分割剩余的 ${JSON.stringify(s.slice(i))}。`,id);
  if(i===s.length){ans.push([...path]);seen.push(id);emit('copy',`i == n，没有剩余字符。保存独立副本 ${JSON.stringify(path)}。`,id);emit('return','返回上一层；父层会撤销刚加入的一段，再尝试更长的候选。',id);stack.pop();return;}
  for(let j=i;j<s.length;j++){
   candidate={i,j,t:'',pal:null};emit('loop',`起点 i=${i} 固定，枚举终点 j=${j}。这轮循环代表“下一段到这里结束”。`,id);
   const t=s.slice(i,j+1);candidate.t=t;emit('slice',`s[${i}:${j+1}] = "${t}"，右端不包含 ${j+1}，所以必须写 j+1。`,id);
   const pal=t===[...t].reverse().join('');candidate.pal=pal;
   const child='n'+nodes.length;nodes.push({id:child,parent:id,label:pal?t:'× '+t,depth:stack.length,rejected:!pal});
   emit('palindrome',pal?`"${t}" 正着反着相同，可以作为下一段。`:`"${t}" 不是回文，不递归。继续增大 j；不能 break，因为更长的串可能是回文（如 ab → aba）。`,child);
   if(pal){
    path.push(t);emit('append',`选择这一段 "${t}"，path = ${JSON.stringify(path)}。`,child);
    emit('call',`这一段已覆盖下标 ${i} 到 ${j}，所以下一段从 j+1=${j+1} 开始；调用 dfs(${j+1})。`,child);
    dfs(j+1,child);
    candidate={i,j,t,pal};path.pop();emit('pop',`回到 dfs(${i})，pop 撤销本层选择的 "${t}"，恢复 ${JSON.stringify(path)}，再试下一个终点。`,id);
   }
  }
  emit('end',`dfs(${i}) 的所有终点都试完，返回父调用。`,id);stack.pop();
 }
 dfs(0,'root');candidate=null;emit('done',`完成，共 ${ans.length} 种方案。每种方案拼接都还原为原字符串。`,'root');
 let leaf=0;function layout(id){const node=nodes.find(n=>n.id===id),children=nodes.filter(n=>n.parent===id);if(!children.length)node.x=leaf++*85;else{children.forEach(n=>layout(n.id));node.x=(children[0].x+children.at(-1).x)/2;}}
 layout('root');const width=Math.max(560,leaf*85+30);const min=Math.min(...nodes.map(n=>n.x)),max=Math.max(...nodes.map(n=>n.x));nodes.forEach(n=>n.x+=(width-min-max)/2);
 return {events,nodes,width,height:Math.max(250,80+Math.max(...nodes.map(n=>n.depth))*75)};
}
const snippets={Python:[
 'from typing import List',
 'class Solution:',
 '    def partition(self, s: str) -> List[List[str]]:',
 '        ans, path = [], []',
 '        n = len(s)',
 '        def dfs(i):',
 '            if i == n:',
 '                ans.append(path.copy())',
 '                return',
 '            for j in range(i, n):',
 '                t = s[i:j + 1]',
 '                if t == t[::-1]:',
 '                    path.append(t)',
 '                    dfs(j + 1)',
 '                    path.pop()',
 '            # 所有终点试完，返回上一层',
 '        dfs(0)',
 '        return ans'
],Java:[
 'import java.util.ArrayList;',
 'import java.util.List;',
 'class Solution {',
 '    public List<List<String>> partition(String s) {',
 '        List<List<String>> ans = new ArrayList<>();',
 '        List<String> path = new ArrayList<>();',
 '        dfs(0, s, path, ans);',
 '        return ans;',
 '    }',
 '    private void dfs(int i, String s, List<String> path, List<List<String>> ans) {',
 '        if (i == s.length()) {',
 '            ans.add(new ArrayList<>(path));',
 '            return;',
 '        }',
 '        for (int j = i; j < s.length(); j++) {',
 '            String t = s.substring(i, j + 1);',
 '            if (t.equals(new StringBuilder(t).reverse().toString())) {',
 '                path.add(t);',
 '                dfs(j + 1, s, path, ans);',
 '                path.remove(path.size() - 1);',
 '            }',
 '        } // 所有终点试完，返回上一层',
 '    }',
 '}'
]};
const highlightLines={Python:{start:4,check:6,copy:7,return:8,loop:9,slice:10,palindrome:11,append:12,call:13,pop:14,end:15,done:17},Java:{start:4,check:10,copy:11,return:12,loop:14,slice:15,palindrome:16,append:17,call:18,pop:19,end:21,done:7}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};

if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value;
  // 只展示已经走到的分支，避免把尚未选择的字母误认为当前状态。
  const visible=new Set(['root',...data.events.slice(0,index+1).map(x=>x.node)]),nodes=data.nodes.filter(n=>visible.has(n.id));
  $('tree').setAttribute('viewBox','0 0 '+data.width+' '+data.height);
  $('tree').innerHTML=nodes.filter(n=>n.parent).map(n=>{const p=data.nodes.find(p=>p.id===n.parent);return '<line class="edge" x1="'+p.x+'" y1="'+(35+p.depth*75)+'" x2="'+n.x+'" y2="'+(35+n.depth*75)+'"/>';}).join('')+nodes.map(n=>'<g class="node '+(e.seen.includes(n.id)?'answer ':'')+(e.node===n.id?'active':'')+'" transform="translate('+n.x+','+(35+n.depth*75)+')"><circle r="23"/><text style="font-size:12px">'+n.label+'</text></g>').join('');
  $('segments').textContent=e.line==='done'?'所有方案已遍历，path 已回溯清空。':'已切分：'+(e.path.join(' | ')||'∅')+'；剩余：'+$('example').value.slice(e.path.join('').length);
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('slots').textContent='path = '+JSON.stringify(e.path);
  $('frames').textContent=e.stack.length?e.stack.map(i=>`dfs(${i})`).join(' → ')+' ← 栈顶':'∅ 空栈';
  $('answers').textContent='ans = '+JSON.stringify(e.ans);
  $('alias').textContent=e.candidate ? 'i='+e.candidate.i+'，j='+e.candidate.j+'，候选 t='+JSON.stringify(e.candidate.t)+'；回文判断：'+(e.candidate.pal===null?'尚未判断':e.candidate.pal?'通过':'不通过，跳过') : e.line==='done'?'全部候选已尝试，保存的方案不受回溯影响。':'等待选择下一段';
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
