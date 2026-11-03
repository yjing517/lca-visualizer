(() => {
 const $=id=>document.getElementById(id),cases=window.TARGET_SUM_DATA.cases;
 let selected=cases[0],index=0,timer=null;
 for(const item of cases){const option=document.createElement('option');option.value=item.id;option.textContent=item.label;$('example').append(option);}
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function describe(e){
  const pair=e.stack.at(-1),i=pair?.[0],c=pair?.[1];
  if(e.kind==='done')return `最终共有 ${e.value} 种符号选择。`+(selected.capacity===null?'S + target 不是非负偶数，直接返回 0。':selected.capacity>selected.total?'p 大于数组总和，搜索没有找到可行子集。':'每个正号子集对应唯一的符号分配。');
  if(e.kind==='hit')return `命中缓存 dfs(${i}, ${c}) = ${e.value}，直接复用结果，不再展开子调用。即使两个分支命中同一状态，也要分别计数。`;
  if(e.kind==='call')return `进入 dfs(${i}, ${c})：只在下标 0…${i} 中选择，数出恰好凑成 ${c} 的选法。`;
  if(e.kind==='return')return `dfs(${i}, ${c}) 返回 ${e.value}。保存到缓存，回到父调用暂停的位置继续计算。`;
  switch(e.line){
   case 4:return `S = ${selected.total}，原 target = ${selected.target}，先计算 S + target = ${selected.combined}。`;
   case 5:return '检查 S + target 是否为负数或奇数；此时不可能得到非负整数的正号子集和。';
   case 6:return '预检查失败，直接返回 0，不创建递归缓存。';
   case 7:return `通过预检查，把 S + target 除以 2，得到 p = ${selected.capacity}。`;
   case 8:return `共有 ${selected.nums.length} 个数字。即使数值相同，下标仍然不同，分别有选与不选两种决定。`;
   case 9:return '准备 @cache：缓存键是 (i,c)，每个状态的函数体只执行一次。Java 在 Map 中保存相同状态。';
   case 10:return '定义 dfs(i,c)：i 表示能用到的最后一个下标，c 表示还需凑出的和。';
   case 11:return `检查 i=${i} 是否小于 0；必须等数字全部处理完，再统计这一条路径是否成功。`;
   case 12:return `没有数字可选：剩余容量 c=${c}。${c===0?'恰好凑完，返回 1，代表完成一种选法。':'还没有凑完，返回 0。'}`;
   case 13:return `当前 nums[${i}] = ${selected.nums[i]}，还需 c=${c}。${c<selected.nums[i]?'数字超过容量，只能不选。':'容量足够，要分别计算不选和选。'}`;
   case 14:return `只能不选下标 ${i}，继续 dfs(${i-1}, ${c})，容量保持不变。`;
   case 15:return `不选：dfs(${i-1}, ${c})；选：dfs(${i-1}, ${c-selected.nums[i]})。两类方案数相加。`+(selected.nums[i]===0?'当前数字是 0：两个分支虽然容量相同，却分别代表 −0 与 +0，不能去重。':'选中子集的数字加正号，其余数字加负号。');
   case 16:return `从最后一个下标 ${selected.nums.length-1} 出发，求 dfs(${selected.nums.length-1}, ${selected.capacity})。`;
   default:throw Error('未解释的执行行 '+e.line);
  }
 }
 function render(){
  const e=selected.events[index],lang=$('lang').value,current=e.stack.at(-1),i=current?.[0],c=current?.[1];
  $('sum').textContent=selected.total;$('target').textContent=selected.target;$('capacity').textContent=selected.capacity??'无整数解';
  $('conversion-note').textContent=selected.capacity===null?`S + target = ${selected.combined}，${selected.combined<0?'小于 0':'不是偶数'}，正号子集和不合法。`:`p = (${selected.total} + (${selected.target})) / 2 = ${selected.capacity}。剩余数字加负号。`;
  $('numbers').replaceChildren(...selected.nums.map((n,k)=>{const item=document.createElement('div');item.className='number'+(i===k?' active':'')+(i!==undefined&&k>i?' outside':'');const value=document.createElement('b'),label=document.createElement('span');value.textContent=n;label.textContent='下标 '+k;item.append(value,label);return item;}));
  $('index-value').textContent=i??'—';$('capacity-value').textContent=c??'—';$('return-value').textContent=e.value??'—';
  $('frames').textContent=e.stack.length?e.stack.map(([a,b])=>`dfs(${a},${b})`).join(' → ')+' ← 栈顶':'∅ 当前无递归调用';
  $('statistics').textContent=`计算 ${e.calls} 个状态 · 缓存命中 ${e.hits} 次`;
  const entries=Object.entries(e.memo).sort(([a],[b])=>{const x=a.split(',').map(Number),y=b.split(',').map(Number);return x[0]-y[0]||x[1]-y[1];});
  $('memo').replaceChildren(...entries.map(([key,value])=>{const item=document.createElement('div');item.className='memo-cell'+(key===`${i},${c}`?' active':'');item.textContent=`dfs(${key}) → ${value}`;return item;}));
  if(!entries.length)$('memo').textContent='尚无已完成的状态。';
  $('answer').textContent=e.kind==='done'?'方案数：'+e.value:'当前步骤：'+index+' / '+(selected.events.length-1);
  $('phase').textContent=({line:'逐行执行',call:'进入状态',return:'返回并缓存',hit:'复用缓存',done:'计算完成'})[e.kind];$('message').textContent=describe(e);
  $('code').replaceChildren(...snippets[lang].map((text,k)=>{const row=document.createElement('div');row.className='line'+(k===(lang==='Python'?e.line:e.javaLine)?' on':'');row.textContent=String(k+1).padStart(2)+'  '+text;return row;}));
  const active=$('code').querySelector('.line.on');if(active){const code=$('code');if(active.offsetTop<code.scrollTop||active.offsetTop+active.offsetHeight>code.scrollTop+code.clientHeight)code.scrollTop=Math.max(0,active.offsetTop-code.clientHeight/2);}
  $('counter').textContent=index+' / '+(selected.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===selected.events.length-1;
 }
 function reset(){stop();selected=cases.find(item=>item.id===$('example').value);index=0;$('seek').max=selected.events.length-1;$('solutions-title').textContent=`查看全部符号方案（${selected.answer} 种）`;$('solutions').replaceChildren(...selected.solutions.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));if(!selected.solutions.length){const li=document.createElement('li');li.textContent='没有满足目标值的符号分配。';$('solutions').append(li);}render();}
 function step(delta){index=Math.max(0,Math.min(selected.events.length-1,index+delta));render();if(index===selected.events.length-1)stop();}
 $('prev').onclick=()=>{stop();step(-1)};$('next').onclick=()=>{stop();step(1)};$('reset').onclick=reset;$('example').onchange=reset;$('lang').onchange=render;
 $('seek').oninput=()=>{stop();index=Number($('seek').value);render();};
 $('play').onclick=()=>{if(timer)return stop();if(index===selected.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),Number($('speed').value));};
 $('speed').onchange=()=>{if(timer){stop();$('play').click();}};
 reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
})();
