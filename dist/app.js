// 第一版演示的兼容脚本入口；实际代码随独立题目维护。
const legacyDemoScript = document.createElement('script');
legacyDemoScript.src = new URL('problems/lca/app.js', document.currentScript.src).href;
document.head.append(legacyDemoScript);
