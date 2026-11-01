const nodes={3:[5,1],5:[6,2],1:[0,8],6:[],2:[7,4],0:[],8:[],7:[],4:[]};
const positions={3:[280,40],5:[150,115],1:[410,115],6:[85,190],2:[215,190],0:[345,190],8:[475,190],7:[175,265],4:[255,265]};
function trace(p,q){
 const events=[],stack=[];
 const emit=(node,line,message,phase='递归执行',extra={})=>events.push({node,line,message,phase,stack:[...stack],...extra});
 emit(null,-1,`目标是 p = ${p}、q = ${q}。从根节点 3 开始，每次调用只处理自己的子树。`,'准备开始');
 function visit(n){
  stack.push(n);emit(n,0,`进入 LCA(${n??'null'})，先检查：是否为空，或者遇到了目标？`,'进入调用');
  if(n==null||n===p||n===q){emit(n,1,n==null?'遇到空节点，返回 null：这条路没有目标。':`遇到目标 ${n}，直接返回节点 ${n}。此调用不再向下搜索。`,'基本情况');stack.pop();return n;}
  emit(n,2,`节点 ${n} 先递归查找左子树；当前调用暂停，等待 left。`,'向下查找');
  const left=visit(nodes[n][0]??null);
  emit(n,2,`回到节点 ${n}：左子树返回 ${left??'null'}，保存为 left。`,'接收返回',{left});
  emit(n,3,`节点 ${n} 再递归查找右子树；left = ${left??'null'} 已保存在这一层。`,'向下查找',{left});
  const right=visit(nodes[n][1]??null);
  emit(n,4,`回到节点 ${n}：left = ${left??'null'}，right = ${right??'null'}。检查是否两边都不为空。`,'判断线索',{left,right});
  const answer=left!=null&&right!=null?n:left??right;
  const line=left!=null&&right!=null?5:left!=null?6:7;
  emit(n,line,left!=null&&right!=null?`左右两侧都有线索！节点 ${n} 就是汇合点，返回 ${n}。`:left!=null?`只有左侧有线索，把 ${left} 原样向上传递；当前节点 ${n} 不替换它。`:right!=null?`只有右侧有线索，把 ${right} 原样向上传递。`:'左右都没找到目标，向上返回 null。','向上返回',{left,right,returned:answer});
  stack.pop();return answer;
 }
 const answer=visit(3);emit(answer,-1,`执行结束：最近公共祖先是 ${answer}。注意最终返回的节点，可能在更深的一层就已经确定了。`,'找到答案',{answer});return events;
}
const snippets={Java:[
'TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {',
'    if (root == null || root == p || root == q)',
'        return root;',
'    TreeNode left = lca(root.left, p, q);',
'    TreeNode right = lca(root.right, p, q);',
'    if (left != null && right != null)',
'        return root;',
'    if (left != null) return left;',
'    return right;',
'}'],Python:[
'def lowestCommonAncestor(self, root, p, q):',
'    if root is None or root is p or root is q:',
'        return root',
'    left = self.lowestCommonAncestor(root.left, p, q)',
'    right = self.lowestCommonAncestor(root.right, p, q)',
'    if left and right:',
'        return root',
'    if left: return left',
'    return right']};
const $=id=>document.getElementById(id);let events=[],index=0,timer=null;
for(const id of ['p','q'])for(const n of Object.keys(nodes))$(id).add(new Option(n,n));$('p').value=5;$('q').value=1;
function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
function reset(){stop();events=trace(+$('p').value,+$('q').value);index=0;$('seek').max=events.length-1;render();}
function render(){
 const e=events[index],p=+$('p').value,q=+$('q').value;
 $('tree').innerHTML=Object.entries(nodes).map(([n,children])=>children.map(c=>`<line class="edge" x1="${positions[n][0]}" y1="${positions[n][1]}" x2="${positions[c][0]}" y2="${positions[c][1]}"/>`).join('')).join('')+Object.entries(positions).map(([n,[x,y]])=>`<g class="node ${+n===p||+n===q?'target':''} ${+n===e.node?'active':''} ${+n===e.answer?'answer':''}" transform="translate(${x},${y})"><circle r="23"/><text>${n}</text>${+n===p||+n===q?`<text y="-32" class="bubble">${+n===p?'p':''}${p===q?' / ':''}${+n===q?'q':''}</text>`:''}</g>`).join('');
 const lines=snippets[$('lang').value],highlight=e.line<0?-1:[1,2,3,4,5,6,7,8][e.line];
 $('code').replaceChildren(...lines.map((s,i)=>{const d=document.createElement('div');d.className='line'+(i===highlight?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;d.append(num,document.createTextNode(s));return d;}));
 $('phase').textContent=e.phase;$('message').textContent=e.message;
 $('frames').innerHTML=e.stack.length?e.stack.map(n=>`<span class="frame">LCA(${n??'null'})</span>`).join('<span class="mini"> → </span>'):'<span class="mini">调用栈为空</span>';
 $('result').textContent=e.answer!=null?`LCA = ${e.answer}`:e.node==null?(e.stack.length?'当前：null':'等待开始'):`当前 root = ${e.node}`;
 $('seek').value=index;$('counter').textContent=`${index} / ${events.length-1}`;$('prev').disabled=index===0;$('next').disabled=index===events.length-1;
}
function step(delta){index=Math.max(0,Math.min(events.length-1,index+delta));render();if(index===events.length-1)stop();}
$('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
$('play').onclick=()=>{if(timer)return stop();if(index===events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
$('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('lang').onchange=render;
$('speed').onchange=()=>{if(timer){stop();$('play').click()}};
$('example').onchange=()=>{const [p,q]=$('example').value.split(',');$('p').value=p;$('q').value=q;reset()};$('p').onchange=$('q').onchange=reset;
reset();
if (window.parent !== window) {
 const report = () => window.parent.postMessage({ type: 'algorithm-demo-ready', height: Math.ceil(document.body.getBoundingClientRect().height) }, '*');
 new ResizeObserver(report).observe(document.body);
 report();
}
