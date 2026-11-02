function trace(input,mode='strict'){
 if(!Array.isArray(input)||input.length>20||input.some(x=>!Number.isInteger(x)||Math.abs(x)>10000)||!['strict','screenshot'].includes(mode))throw Error('需要至多 20 个 −10000 到 10000 的整数');
 const nums=[...input],events=[];let ng=0,i=-1,x=null,left=0,right=0,mid=null,j=null;
 const emit=(line,message)=>events.push({line,message,nums:[...nums],tails:nums.slice(0,ng),ng,i,x,left,right,mid,j});
 emit('start','ng 是有效前缀长度，也是当前答案；有效前缀开始为空。');
 for(i=0;i<nums.length;i++){
  x=nums[i];j=null;mid=null;emit('read',`读取原数组下标 ${i}，x=${x}。前面写入的位置都不大于当时读取的位置，因此这里仍是原始元素。`);
  left=0;right=ng;emit('search',`只在 [0,${ng}) 查找第一个 ${mode==='strict'?'≥':'>'} ${x} 的位置；末端 ng 不参与搜索。`);
  while(left<right){mid=Math.floor((left+right)/2);emit('mid',`left=${left}, right=${right}, mid=${mid}，比较 nums[mid]=${nums[mid]} 与 x=${x}。`);
   if(mode==='strict'?nums[mid]>=x:nums[mid]>x){right=mid;emit('right',`候选位置不大于 mid，令 right=${right}。`);}else{left=mid+1;emit('left',`当前位置不符合条件，令 left=${left}。`);}
  }
  j=left;mid=null;emit('found',`二分结束 j=${j}。${j===ng?'可以扩展长度。':'替换该长度的结尾，长度不变。'}`);
  emit('check',`判断 j == ng：${j} == ${ng} 为 ${j===ng}。`);
  if(j===ng){nums[ng]=x;emit('append',`把 ${x} 写入 nums[${ng}]，随后将有效长度加一。`);ng++;emit('grow',`ng=${ng}：找到更长的${mode==='strict'?'严格递增':'非递减'}子序列。`);}else{nums[j]=x;emit('replace',`nums[${j}]=${x}：让长度 ${j+1} 的结尾尽量小，给未来数字更多接续机会；ng 不变。`);}
 }
 i=input.length;emit('done',`返回 ${ng}。${mode==='strict'?'这是严格递增子序列长度。':'这是截图 bisect_right 的非递减长度；重复数字可能导致错误答案。'}`);return {events,answer:ng};
}
const snippets={"Python": ["from typing import List", "from bisect import bisect_left", "class Solution:", "    def lengthOfLIS(self, nums: List[int]) -> int:", "        ng = 0", "        for x in nums:", "            j = bisect_left(nums, x, 0, ng)", "            if j == ng:", "                nums[ng] = x", "                ng += 1", "            else:", "                nums[j] = x", "        return ng"], "Java": ["class Solution {", "    public int lengthOfLIS(int[] nums) {", "        int ng = 0;", "        for (int x : nums) {", "            int left = 0, right = ng;", "            while (left < right) {", "                int mid = left + (right - left) / 2;", "                if (nums[mid] >= x) right = mid;", "                else left = mid + 1;", "            }", "            int j = left;", "            if (j == ng) {", "                nums[ng] = x;", "                ng++;", "            } else {", "                nums[j] = x;", "            }", "        }", "        return ng;", "    }", "}"]};
const highlightLines={Python:{start:4,read:5,search:6,mid:6,right:6,left:6,found:6,check:7,append:8,grow:9,replace:11,done:12},Java:{start:2,read:3,search:4,mid:6,right:7,left:8,found:10,check:11,append:12,grow:13,replace:15,done:18}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value,bad=$('mode').value==='screenshot',original=JSON.parse($('example').value);
  const lines=snippets[lang].map(s=>bad?s.replaceAll('bisect_left','bisect_right').replace('nums[mid] >= x','nums[mid] > x'):s);
  $('code').replaceChildren(...lines.map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');el.textContent=(i+1).toString().padStart(2)+'  '+line;return el;}));
  function cells(id,values,isOriginal){$(id).replaceChildren(...values.map((v,k)=>{const el=document.createElement('div');el.className='cell'+(isOriginal?(k===e.i?' current':''):(k<e.ng?' valid':' inactive'))+(!isOriginal&&k===e.mid?' probe':'');el.textContent=v;const small=document.createElement('small');small.textContent='['+k+']';el.append(small);return el;}));}
  cells('original',original,true);cells('working',e.nums,false);
  $('state').textContent=`读取 i=${e.i}，x=${e.x??'—'}；ng=${e.ng}；left=${e.left}，right=${e.right}，mid=${e.mid??'—'}，j=${e.j??'—'}`;
  $('tails').textContent='有效前缀 = '+JSON.stringify(e.tails);$('answers').textContent='当前长度：'+e.ng+(bad?'（截图模式：允许相等）':'（严格递增）');
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;$('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(JSON.parse($('example').value),$('mode').value);index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('mode').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
