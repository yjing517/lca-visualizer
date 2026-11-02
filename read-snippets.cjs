const vm = require("node:vm");
module.exports = function readSnippets(source) {
  const match = /const snippets\s*=\s*\{/.exec(source);
  if (!match) throw new Error("缺少 const snippets 定义");
  const start = match.index + match[0].length - 1;
  let depth = 0,
    quote = null,
    escaped = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "{") depth++;
    if (c === "}" && --depth === 0)
      return vm.runInNewContext(
        "(" + source.slice(start, i + 1) + ")",
        {},
        { timeout: 1000 },
      );
  }
  throw new Error("snippets 定义未结束");
};
