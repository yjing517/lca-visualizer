/* Deterministic snapshots were recorded from the displayed Python implementation.
   Language switching changes the corresponding code, never the selected state. */
(() => {
  "use strict";
  const data = window.HOT100_DATA,
    snippets = window.HOT100_SNIPPETS,
    $ = (id) => document.getElementById(id);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const repr = (x) =>
    x === null
      ? "null"
      : typeof x === "object" && x.ref
        ? "→ " + x.ref
        : typeof x === "object"
          ? JSON.stringify(x)
          : String(x);
  let example = 0,
    index = 0,
    timer = null,
    lang = "Python",
    lastHeight = 0;
  const current = () => data.cases[example],
    events = () => current().events;
  const varsOf = (e) => Object.assign({}, ...e.stack.map((f) => f.vars));
  const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);
  function pointers(vars, name) {
    // Only explicit per-problem bindings are indices. A rank, product, or DP
    // prefix length must never accidentally highlight an unrelated array cell.
    return (data.cursors[name] || []).flatMap((expression) => {
      const terms = expression.match(/[+-]?(?:[A-Za-z_]\w*|\d+)/g) || [];
      if (terms.join("") !== expression) return [];
      let index = 0;
      for (const term of terms) {
        const sign = term[0] === "-" ? -1 : 1,
          key = term.replace(/^[+-]/, "");
        const part = /^\d+$/.test(key) ? Number(key) : vars[key];
        if (!Number.isInteger(part)) return [];
        index += sign * part;
      }
      return [[expression, index]];
    });
  }
  function cells(a, name, vars, old) {
    const ps = pointers(vars, name),
      bars = /^(height|heights|temperatures|prices)$/.test(name),
      max = bars ? Math.max(1, ...a.filter((x) => typeof x === "number")) : 1;
    return (
      '<div class="cells">' +
      a
        .map((x, i) => {
          const labels = ps
            .filter(([, v]) => v === i)
            .map(([k]) => k)
            .join(",");
          return `<span class="slot ${labels ? "mark" : ""} ${old && changed(x, old[i]) ? "changed" : ""}" data-index="${i}">${bars ? `<span class="bar" style="height:${Math.max(2, (Number(x) / max) * 58)}px"></span>` : ""}<small>${esc(labels || "·")}</small><b>${esc(repr(x))}</b><small>[${i}]</small></span>`;
        })
        .join("") +
      "</div>"
    );
  }
  function matrix(a, vars, old, name) {
    const width = Math.max(0, ...a.map((r) => r.length));
    const highlight = ["matrix", "grid", "board", "vis", "f"].includes(name);
    const row = data.number === 74 ? vars.x : vars.i,
      column = data.number === 74 ? vars.y : vars.j;
    return (
      '<div class="matrix-wrap"><table class="matrix"><thead><tr><th></th>' +
      Array.from({ length: width }, (_, j) => `<th scope="col">${j}</th>`).join(
        "",
      ) +
      "</tr></thead><tbody>" +
      a
        .map(
          (row, i) =>
            `<tr><th scope="row">${i}</th>` +
            row
              .map(
                (x, j) =>
                  `<td class="${highlight && i === row && j === column ? "mark" : ""} ${old && old[i] && changed(x, old[i][j]) ? "changed" : ""}" title="[${i}][${j}]">${esc(repr(x))}</td>`,
              )
              .join("") +
            "</tr>",
        )
        .join("") +
      "</tbody></table></div>"
    );
  }
  function heap(a, vars) {
    if (!a.length) return '<span class="scalar">空堆</span>';
    const levels = Math.floor(Math.log2(a.length)) + 1,
      h = levels * 75 + 20,
      w = 600,
      pos = a.map((_, i) => {
        const d = Math.floor(Math.log2(i + 1)),
          offset = i - (2 ** d - 1);
        return [((offset + 0.5) * w) / 2 ** d, 35 + d * 75];
      });
    let s = "";
    a.forEach((v, i) => {
      const [x, y] = pos[i];
      if (i) {
        const [px, py] = pos[Math.floor((i - 1) / 2)];
        s += `<path d="M${px} ${py + 20} L${x} ${y - 20}"/>`;
      }
      s += `<circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y + 4}" text-anchor="middle">${esc(repr(v))}</text><text class="label" x="${x}" y="${y + 36}" text-anchor="middle">[${i}]</text>`;
    });
    return `<div class="graph-wrap"><svg class="graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="堆的完全二叉树结构">${s}</svg></div>`;
  }
  function value(v, name, vars, old) {
    if (Array.isArray(v)) {
      if (
        v.length &&
        v.every((x) => Array.isArray(x)) &&
        !/^(pq|q|heap)$/.test(name)
      )
        return matrix(v, vars, old, name);
      if (/^(pq|minq|maxq|heap)$/.test(name))
        return heap(v, vars) + cells(v, name, vars, old);
      return cells(v, name, vars, old) || "<span>空数组</span>";
    }
    if (v && typeof v === "object" && !v.ref)
      return (
        '<div class="dictionary">' +
        Object.entries(v)
          .map(
            ([k, x]) =>
              `<span class="entry ${old && changed(x, old[k]) ? "changed" : ""}">${esc(k)} → ${esc(repr(x))}</span>`,
          )
          .join("") +
        "</div>"
      );
    if (typeof v === "string" && v.length > 1 && v.length <= 80)
      return cells(
        [...v],
        name,
        vars,
        typeof old === "string" ? [...old] : null,
      );
    return `<span class="scalar ${changed(v, old) ? "changed" : ""}">${esc(repr(v))}</span>`;
  }
  function nodeGraph(e, vars) {
    const reachable = new Set();
    function visit(x) {
      if (!x || typeof x !== "object") return;
      if (x.ref) {
        if (reachable.has(x.ref)) return;
        reachable.add(x.ref);
        visit(e.nodes[x.ref]);
      } else Object.values(x).forEach(visit);
    }
    e.stack.forEach((f) => Object.values(f.vars).forEach(visit));
    const ns = Object.entries(e.nodes).filter(
        ([id, o]) => reachable.has(id) && ("val" in o || "children" in o),
      ),
      ids = new Set(ns.map(([id]) => id));
    if (!ns.length) return "";
    const edges = [];
    ns.forEach(([id, o]) => {
      for (const [key, v] of Object.entries(o)) {
        if (v && v.ref && ids.has(v.ref)) edges.push([id, v.ref, key]);
        else if (key === "children" && Array.isArray(v))
          v.forEach((x, i) => {
            if (x?.ref && ids.has(x.ref))
              edges.push([id, x.ref, String.fromCharCode(97 + i)]);
          });
      }
    });
    const isTree = ns.some(
        ([, o]) => "left" in o || "right" in o || "children" in o,
      ),
      pos = {},
      w = 660;
    if (isTree) {
      const children = new Set(
        edges
          .filter(([, , k]) => k !== "prev" && k !== "random")
          .map(([, id]) => id),
      );
      let level = ns.filter(([id]) => !children.has(id)).map(([id]) => id),
        seen = new Set(),
        d = 0;
      while (level.length) {
        const next = [];
        level.forEach((id, i) => {
          if (seen.has(id)) return;
          seen.add(id);
          pos[id] = [((i + 0.5) * w) / level.length, 45 + d * 85];
          for (const [from, to, key] of edges)
            if (
              from === id &&
              key !== "prev" &&
              key !== "random" &&
              !seen.has(to)
            )
              next.push(to);
        });
        level = [...new Set(next)];
        d++;
        if (d > 30) break;
      }
      ns.filter(([id]) => !pos[id]).forEach(
        ([id], i) =>
          (pos[id] = [45 + (i % 7) * 90, 45 + d * 85 + Math.floor(i / 7) * 85]),
      );
    } else {
      // Place chains in next-pointer order, rather than object-allocation order.
      const next = new Map(
        edges.filter(([, , k]) => k === "next").map(([a, b]) => [a, b]),
      );
      const incoming = new Set(next.values()),
        visited = new Set();
      let row = 0;
      const starts = [...ns.filter(([id]) => !incoming.has(id)), ...ns].map(
        ([id]) => id,
      );
      for (const start of starts) {
        if (visited.has(start)) continue;
        let id = start,
          col = 0;
        while (id && !visited.has(id)) {
          visited.add(id);
          pos[id] = [55 + col * 110, 60 + row * 120];
          id = next.get(id);
          col++;
          if (col === 6 && id && !visited.has(id)) {
            col = 0;
            row++;
          }
        }
        row++;
      }
    }
    const refs = {};
    function label(k, v) {
      if (v?.ref) (refs[v.ref] ??= []).push(k);
      else if (Array.isArray(v))
        v.forEach((x, i) => {
          if (x?.ref) label(k + "[" + i + "]", x);
        });
    }
    Object.entries(vars)
      .filter(([k]) => k !== "self")
      .forEach(([k, v]) => label(k, v));
    for (const f of e.stack) {
      const receiver = e.nodes[f.vars.self?.ref];
      if (receiver)
        for (const k of ["head", "tail"])
          if (receiver[k]) label(k, receiver[k]);
    }
    let s =
      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="arrow" d="M0 0 L10 5 L0 10Z"/></marker></defs>';
    for (const [a, b, label] of edges) {
      const [x, y] = pos[a],
        [xx, yy] = pos[b],
        dx = xx - x,
        dy = yy - y,
        len = Math.hypot(dx, dy) || 1,
        ex = xx - (dx / len) * 23,
        ey = yy - (dy / len) * 23;
      const curve = label === "prev" ? -24 : label === "random" ? 30 : 0;
      s += `<path class="${label === "random" ? "random" : ""}" marker-end="url(#arrow)" d="M${x} ${y} Q${(x + xx) / 2} ${(y + yy) / 2 + curve} ${ex} ${ey}"/><text class="label" x="${(x + xx) / 2}" y="${(y + yy) / 2 + curve - 5}" text-anchor="middle">${esc(label)}</text>`;
    }
    ns.forEach(([id, o]) => {
      const [x, y] = pos[id];
      s += `<circle class="${refs[id] ? "active" : ""}" cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y + 4}" text-anchor="middle">${esc(o.val ?? (o.is_end ? "✓" : "·"))}</text><text class="label" x="${x}" y="${y - 28}" text-anchor="middle">${esc(id + (o.is_end ? " 词尾" : ""))}</text><text class="label" x="${x}" y="${y + 37}" text-anchor="middle">${esc((refs[id] || []).join(", "))}</text>`;
    });
    const h = Math.max(...Object.values(pos).map((p) => p[1])) + 60;
    return `<div class="var"><h3>${isTree ? "树 / 前缀树" : "链表与指针"} · 橙色节点被当前变量引用</h3><div class="graph-wrap"><svg class="graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="当前节点及其真实连接关系">${s}</svg></div></div>`;
  }
  function courseGraph(vars) {
    if (data.number !== 207) return "";
    const inp = current().input,
      n = inp.numCourses,
      w = 620,
      h = 100 + Math.ceil(n / 6) * 90,
      pos = Array.from({ length: n }, (_, i) => [
        50 + (i % 6) * 100,
        55 + Math.floor(i / 6) * 90,
      ]);
    let s =
      '<defs><marker id="courseArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="arrow" d="M0 0 L10 5 L0 10Z"/></marker></defs>';
    for (const [a, b] of inp.prerequisites) {
      const [x, y] = pos[b],
        [xx, yy] = pos[a];
      s += `<path marker-end="url(#courseArrow)" d="${a === b ? `M${x - 15} ${y - 15} C${x - 65} ${y - 80},${x + 65} ${y - 80},${x + 15} ${y - 15}` : `M${x} ${y + 20} Q${(x + xx) / 2} ${Math.max(y, yy) + 65} ${xx} ${yy + 20}`}"/><text class="label" x="${(x + xx) / 2}" y="${Math.max(y, yy) + 55}">先修 →</text>`;
    }
    pos.forEach(
      ([x, y], i) =>
        (s += `<circle class="${vars.i === i ? "active" : ""}" cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y + 4}" text-anchor="middle">${i}</text>`),
    );
    return `<div class="graph-wrap"><svg class="graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="课程依赖图">${s}</svg></div>`;
  }
  function code() {
    $("code").innerHTML = snippets[lang]
      .map(
        (s, i) =>
          `<span class="line" data-line="${i}"><span class="num">${i + 1}</span>${esc(s) || " "}</span>`,
      )
      .join("");
  }
  function render() {
    const e = events()[index],
      old = events()[Math.max(0, index - 1)],
      vars = varsOf(e),
      oldVars = varsOf(old),
      line = lang === "Python" ? e.line : e.javaLine;
    document
      .querySelectorAll(".line.on")
      .forEach((x) => x.classList.remove("on"));
    const active = $("code").querySelector(`[data-line="${line}"]`);
    if (active) {
      active.classList.add("on");
      const box = $("code");
      if (
        active.offsetTop < box.scrollTop ||
        active.offsetTop > box.scrollTop + box.clientHeight - 30
      )
        box.scrollTop = active.offsetTop - box.clientHeight / 3;
    }
    // Include outer receivers: constructing a cache node must not hide the cache itself.
    const shown = { ...vars },
      previous = { ...oldVars };
    for (const f of e.stack) {
      const ref = f.vars.self?.ref;
      if (ref)
        for (const [k, v] of Object.entries(e.nodes[ref] || {}))
          if (data.focus.includes(k)) {
            shown[k] = v;
            previous[k] = old.nodes[ref]?.[k];
          }
    }
    const display = ([k, v]) =>
      `<div class="var"><h3>${esc(k)}</h3>${value(v, k, vars, previous[k])}</div>`;
    const primary = data.focus
        .filter((k) => k in shown)
        .map((k) => [k, shown[k]]),
      extra = Object.entries(shown).filter(
        ([k]) => k !== "self" && !data.focus.includes(k),
      );
    $("state").innerHTML =
      `<p class="state-meaning">${esc(data.meaning)}</p>` +
      nodeGraph(e, vars) +
      courseGraph(vars) +
      primary.map(display).join("") +
      (extra.length
        ? `<details class="extra-vars"><summary>查看边界与临时变量（${extra.length}）</summary>${extra.map(display).join("")}</details>`
        : "");
    $("frames").innerHTML = e.stack
      .map(
        (f) =>
          `<span class="frame">${esc(f.name)}(${esc(
            Object.entries(f.vars)
              .filter(([k, v]) => k !== "self" && typeof v !== "object")
              .map(([k, v]) => k + "=" + repr(v))
              .join(", "),
          )})</span>`,
      )
      .join('<span aria-hidden="true">→</span>');
    $("counter").textContent = `${index} / ${events().length - 1}`;
    $("seek").value = index;
    $("seek").max = events().length - 1;
    $("prev").disabled = index === 0;
    $("next").disabled = index === events().length - 1;
    $("phase").textContent = e.phase === "完成" ? "完成" : e.action;
    $("message").textContent =
      e.phase === "完成"
        ? "算法执行完成。可以回退检查最后几次更新，也可以切换边界示例对照。"
        : e.explanation;
    $("result").textContent =
      e.phase === "完成"
        ? "实际输出：" + JSON.stringify(e.result)
        : "执行中 · " + (current().boundary ? "边界示例" : "典型示例");
    if (index === events().length - 1) stop();
    report();
  }
  function stop() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    $("play").textContent = "▶ 自动播放";
  }
  function play() {
    if (timer !== null) return stop();
    if (index === events().length - 1) index = 0;
    $("play").textContent = "Ⅱ 暂停";
    timer = setInterval(
      () => {
        index = Math.min(index + 1, events().length - 1);
        render();
      },
      Number($("speed").value),
    );
  }
  function report() {
    requestAnimationFrame(() => {
      const h = Math.ceil(
        document.querySelector("main").getBoundingClientRect().bottom + 24,
      );
      if (h !== lastHeight) {
        lastHeight = h;
        parent.postMessage(
          { type: "algorithm-demo-ready", height: h },
          location.origin === "null" ? "*" : location.origin,
        );
      }
    });
  }
  $("title").textContent = data.title;
  $("topic").textContent = data.category + " / " + data.number;
  $("example").innerHTML = data.cases
    .map(
      (c, i) =>
        `<option value="${i}">${c.boundary ? "边界" : "示例 " + (i + 1)} → ${esc(JSON.stringify(c.expected).slice(0, 65))}</option>`,
    )
    .join("");
  function showExample() {
    stop();
    index = 0;
    $("input").textContent = JSON.stringify(current().input, null, 2);
    code();
    render();
  }
  $("example").onchange = () => {
    example = Number($("example").value);
    showExample();
  };
  $("lang").onchange = () => {
    lang = $("lang").value;
    code();
    render();
  };
  $("prev").onclick = () => {
    stop();
    index = Math.max(0, index - 1);
    render();
  };
  $("next").onclick = () => {
    stop();
    index = Math.min(events().length - 1, index + 1);
    render();
  };
  $("reset").onclick = () => {
    stop();
    index = 0;
    render();
  };
  $("play").onclick = play;
  $("seek").oninput = () => {
    stop();
    index = Number($("seek").value);
    render();
  };
  $("speed").onchange = () => {
    if (timer !== null) {
      stop();
      play();
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  window.addEventListener("pagehide", stop);
  new ResizeObserver(report).observe(document.querySelector("main"));
  showExample();
})();
