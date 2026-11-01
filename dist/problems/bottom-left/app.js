const examples = [[2,1,3],[1,2,3,4,null,5,6,null,null,7],[42],[5,9,1],[1,null,2,null,3]];
// 紧凑层序输入：只为非空父节点消费两个孩子位置，身份与值分开。
function buildTree(values) {
 if (!values.length || values[0] == null) throw Error('原题保证非空树');
 const root={id:0,val:values[0],depth:0,x:280}, nodes=[root];
 let cursor=1;
 for(let i=0;i<nodes.length && cursor<values.length;i++) {
  for(const side of ['left','right']) {
   const val=values[cursor++];
   if(val==null) continue;
   const parent=nodes[i], offset=130/2**parent.depth;
   const child={id:nodes.length,val,depth:parent.depth+1,x:parent.x+(side==='left'?-offset:offset)};
   parent[side]=child; nodes.push(child);
  }
 }
 return {root,nodes};
}
function trace(values) {
 const {root,nodes}=buildTree(values), events=[],queue=[],visited=[];
 let node=null,head=0;
 const emit=(line,message,phase,answer=null)=>events.push({line,message,phase,queue:queue.slice(head).map(n=>n.id),visited:[...visited],node:node?.id??null,answer});
 emit(-1,'从根节点开始。左边是队头，右边是队尾。','准备开始');
 queue.push(root); emit(2,`初始化 q = [${root.val}]。`,'初始化队列');
 while(head<queue.length) {
  emit(3,'q 非空，进入下一轮；node 暂时保留上一轮的值。','检查循环');
  node=queue[head++]; visited.push(node.id);
  emit(4,`从队头取出 ${node.val}，赋给 node。Python 用 q.popleft()，Java 用 q.removeFirst()。它已离开队列。`,'队头出队');
  if(node.right) queue.push(node.right);
  emit(5,node.right?`先把右孩子 ${node.right.val} 加入队尾。`:`节点 ${node.val} 没有右孩子，不入队。`,'检查右孩子');
  if(node.left) queue.push(node.left);
  emit(6,node.left?`再把左孩子 ${node.left.val} 加入队尾，排在右孩子后面。`:`节点 ${node.val} 没有左孩子，不入队。`,'检查左孩子');
 }
 emit(3,'q 已为空，while 条件为假，退出循环。node 仍保留最后出队的节点。','退出循环');
 emit(7,`返回 node.val = ${node.val}：最深一层从右到左访问，最后留下最左节点。`,'找到答案',node.id);
 return {nodes,events};
}
const snippets={Python:[
 'from collections import deque',
 'def findBottomLeftValue(self, root):',
 '    q = deque([root])',
 '    while q:',
 '        node = q.popleft()',
 '        if node.right: q.append(node.right)',
 '        if node.left: q.append(node.left)',
 '    return node.val'
],Java:[
 'import java.util.ArrayDeque;',
 'import java.util.Deque;',
 'class Solution {',
 '    public int findBottomLeftValue(TreeNode root) {',
 '        Deque<TreeNode> q = new ArrayDeque<>();',
 '        q.addLast(root);',
 '        TreeNode node = null;',
 '        while (!q.isEmpty()) {',
 '            node = q.removeFirst();',
 '            if (node.right != null) q.addLast(node.right);',
 '            if (node.left != null) q.addLast(node.left);',
 '        }',
 '        return node.val;',
 '    }',
 '}'
]};
const highlightLines={Python:{2:2,3:3,4:4,5:5,6:6,7:7},Java:{2:5,3:7,4:8,5:9,6:10,7:12}};
if(typeof module!=='undefined') module.exports={trace,buildTree,examples,snippets,highlightLines};
if(typeof document!=='undefined') {
 const $=id=>document.getElementById(id); let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],byId=id=>data.nodes[id],label=id=>`${byId(id).val} (#${id})`;
  $('tree').innerHTML=data.nodes.map(n=>['left','right'].filter(s=>n[s]).map(s=>`<line class="edge" x1="${n.x}" y1="${40+n.depth*75}" x2="${n[s].x}" y2="${40+n[s].depth*75}"/>`).join('')).join('')+data.nodes.map(n=>`<g class="node ${e.queue.includes(n.id)?'target':''} ${e.node===n.id?'active':''} ${e.answer===n.id?'answer':''}" transform="translate(${n.x},${40+n.depth*75})"><circle r="23"/><text>${n.val}</text><text class="bubble" y="-31">#${n.id}</text></g>`).join('');
  const lang=$('lang').value,lines=snippets[lang],highlight=highlightLines[lang][e.line];
  $('code').replaceChildren(...lines.map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlight===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('queue').replaceChildren(...(e.queue.length?e.queue.map(id=>{const el=document.createElement('span');el.className='frame';el.textContent=label(id);return el;}):[document.createTextNode('∅ 空队列')]));
  $('visited').textContent='出队顺序：'+(e.visited.map(id=>byId(id).val).join(' → ')||'尚未出队');
  $('current').textContent='node = '+(e.node===null?(lang==='Java'?'null（尚未出队）':'尚未赋值'):label(e.node));
  $('phase').textContent=e.phase;$('message').textContent=e.message;
  $('result').textContent=e.answer!==null?`答案 = ${byId(e.answer).val}`:`已出队 ${e.visited.length} / ${data.nodes.length}`;
  $('counter').textContent=`${index} / ${data.events.length-1}`;$('seek').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(examples[+$('example').value]);index=0;$('seek').max=data.events.length-1;render();}
 function step(delta){index=Math.max(0,Math.min(data.events.length-1,index+delta));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};
 reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
