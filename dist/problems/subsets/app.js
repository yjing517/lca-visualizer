function trace(nums) {
 if(!Array.isArray(nums)||nums.length>10||new Set(nums).size!==nums.length||nums.some(x=>!Number.isInteger(x)))throw Error('需要至多十个互不相同的整数');
 const events=[],nodes=[],path=[],ans=[],stack=[],seen=[];
 const emit=(line,message,node)=>events.push({line,message,node,path:[...path],ans:ans.map(x=>[...x]),stack:[...stack],seen:[...seen]});
 nodes.push({id:'root',parent:null,label:'开始',depth:0,x:280});
 emit('start','dfs(i) 决定 nums[i] 选不选。先走不选分支，再走选分支。','root');
 function dfs(i,id){
  stack.push(i);emit('check',`进入 dfs(${i})，path = ${JSON.stringify(path)}；检查所有数字是否都已决定。`,id);
  if(i===nums.length){ans.push([...path]);seen.push(id);emit('copy',`保存 path 的副本 ${JSON.stringify(path)}，它是独立列表；后续 pop 不会改掉这份答案。`,id);emit('return','只结束当前调用，回到父层暂停的 dfs 调用处。',id);stack.pop();return;}
  const addNode=(suffix,label)=>{const child=id+suffix,depth=i+1,offset=140/2**i;nodes.push({id:child,parent:id,label,depth,x:nodes.find(n=>n.id===id).x+(suffix==='N'?-offset:offset)});return child;};
  const skip=addNode('N',`不选 ${nums[i]}`);
  emit('skip',`第一次 dfs(${i+1})：不选 ${nums[i]}，path 仍是 ${JSON.stringify(path)}。`,skip);
  dfs(i+1,skip);
  path.push(nums[i]);emit('append',`回到 dfs(${i})，现在选 ${nums[i]}：append 后 path = ${JSON.stringify(path)}。`,id);
  const take=addNode('Y',`选 ${nums[i]}`);
  emit('take',`第二次 dfs(${i+1})：已经选了 ${nums[i]}，path = ${JSON.stringify(path)}。参数相同，选择状态不同。`,take);
  dfs(i+1,take);
  const removed=path.pop();emit('pop',`回到 dfs(${i})，pop 撤销本层加入的 ${removed}，恢复 path = ${JSON.stringify(path)}。更深层已撤销了它们自己的选择。`,id);
  emit('end',`dfs(${i}) 两个分支都完成，自然返回上一层。`,id);stack.pop();
 }
 dfs(0,'root');emit('done',`共 ${ans.length} 个子集；path 恢复为 []。保存的副本仍保留各自内容。`,'root');return {events,nodes};
}
const snippets={Python:[
 'from typing import List',
 'class Solution:',
 '    def subsets(self, nums: List[int]) -> List[List[int]]:',
 '        ans, path = [], []',
 '        n = len(nums)',
 '        def dfs(i):',
 '            if i == n:',
 '                ans.append(path.copy())',
 '                return',
 '            dfs(i + 1)  # 不选 nums[i]',
 '            path.append(nums[i])',
 '            dfs(i + 1)  # 选 nums[i]',
 '            path.pop()',
 '            # 本层结束，自然返回',
 '        dfs(0)',
 '        return ans'
],Java:[
 'import java.util.ArrayList;',
 'import java.util.List;',
 'class Solution {',
 '    public List<List<Integer>> subsets(int[] nums) {',
 '        List<List<Integer>> ans = new ArrayList<>();',
 '        List<Integer> path = new ArrayList<>();',
 '        dfs(0, nums, path, ans);',
 '        return ans;',
 '    }',
 '    private void dfs(int i, int[] nums, List<Integer> path, List<List<Integer>> ans) {',
 '        if (i == nums.length) {',
 '            ans.add(new ArrayList<>(path));',
 '            return;',
 '        }',
 '        dfs(i + 1, nums, path, ans); // 不选',
 '        path.add(nums[i]);',
 '        dfs(i + 1, nums, path, ans); // 选',
 '        path.remove(path.size() - 1);',
 '    } // 本层结束，自然返回',
 '}'
]};
const highlightLines={Python:{start:4,check:6,copy:7,return:8,skip:9,append:10,take:11,pop:12,end:13,done:15},Java:{start:4,check:10,copy:11,return:12,skip:14,append:15,take:16,pop:17,end:18,done:7}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};

if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value;
  // 只展示已经走到的分支，避免把尚未选择的字母误认为当前状态。
  const visible=new Set(['root',...data.events.slice(0,index+1).map(x=>x.node)]),nodes=data.nodes.filter(n=>visible.has(n.id));
  $('tree').setAttribute('viewBox','0 0 560 '+Math.max(250,75+JSON.parse($('example').value).length*75));
  $('tree').innerHTML=nodes.filter(n=>n.parent).map(n=>{const p=data.nodes.find(p=>p.id===n.parent);return '<line class="edge" x1="'+p.x+'" y1="'+(35+p.depth*75)+'" x2="'+n.x+'" y2="'+(35+n.depth*75)+'"/>';}).join('')+nodes.map(n=>'<g class="node '+(e.seen.includes(n.id)?'answer ':'')+(e.node===n.id?'active':'')+'" transform="translate('+n.x+','+(35+n.depth*75)+')"><circle r="23"/><text style="font-size:12px">'+n.label+'</text></g>').join('');
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('slots').textContent='path = '+JSON.stringify(e.path);
  $('frames').textContent=e.stack.length?e.stack.map(i=>`dfs(${i})`).join(' → ')+' ← 栈顶':'∅ 空栈';
  $('answers').textContent='ans = '+JSON.stringify(e.ans);
  $('alias').textContent='如果不 copy：ans 中的 '+e.ans.length+' 项都指向同一个 path，现在都会显示 '+JSON.stringify(e.path)+'。';
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;
  $('result').textContent=`已收集 ${e.ans.length} 个`;$('counter').textContent=`${index} / ${data.events.length-1}`;$('seek').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(JSON.parse($('example').value));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
