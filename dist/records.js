(function (root) {
  'use strict';
  const KEY = 'algorithm-notebook.v1';
  const statuses = ['没理解', '需复习', '已掌握'];
  const emptyRecord = () => ({ status: '没理解', review: false, notes: '', updatedAt: '' });
  function validateRecords(records) {
    if (!records || typeof records !== 'object' || Array.isArray(records) || Object.keys(records).length > 10000) throw Error('记录格式不正确');
    const clean = {};
    for (const [id, r] of Object.entries(records)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 100 || ['constructor', 'prototype'].includes(id)) throw Error('题目标识不正确');
      if (!r || !statuses.includes(r.status) || typeof r.review !== 'boolean' || typeof r.notes !== 'string' || r.notes.length > 100000 || typeof r.updatedAt !== 'string' || (r.updatedAt !== '' && !Number.isFinite(Date.parse(r.updatedAt)))) throw Error('题目记录不完整或超出长度限制');
      clean[id] = { status: r.status, review: r.review, notes: r.notes, updatedAt: r.updatedAt };
    }
    return clean;
  }
  function validateBackup(data) {
    if (!data || data.kind !== 'algorithm-notebook-backup' || data.version !== 1) throw Error('请选择本网站导出的版本 1 备份文件');
    return validateRecords(data.records);
  }
  function createStore(storage) {
    let state = { version: 1, records: {}, lastVisited: null }, error = '', blocked = false, corrupted = false, rawSnapshot = '';
    try {
      const raw = storage.getItem(KEY);
      if (raw) {
        rawSnapshot = raw;
        const saved = JSON.parse(raw);
        if (saved.version !== 1) throw Error('版本不支持');
        state.records = validateRecords(saved.records);
        state.lastVisited = typeof saved.lastVisited === 'string' ? saved.lastVisited : null;
      }
    } catch (_) {
      // 读不出来时不能假装记录为空：保留原始内容供恢复，并停用「正常备份」。
      corrupted = rawSnapshot !== '';
      blocked = true;
      error = corrupted
        ? '浏览器里的记录无法解析。为避免覆盖，已暂停自动保存；请先下载原始数据留档，或导入之前导出的备份恢复。'
        : '无法访问浏览器存储。为避免覆盖，已暂停自动保存；请确认浏览器允许本地存储后刷新重试。';
    }
    function persist() {
      if (blocked) return false;
      try { storage.setItem(KEY, JSON.stringify(state)); error = ''; return true; }
      catch (_) { error = '保存失败：浏览器存储不可用或空间不足。当前修改仅在本页内保留，请导出备份。'; return false; }
    }
    return {
      get error() { return error; }, get records() { return state.records; }, get lastVisited() { return state.lastVisited; },
      get corrupted() { return corrupted; }, get rawSnapshot() { return rawSnapshot; }, get canBackup() { return !blocked; },
      get(id) { return state.records[id] || emptyRecord(); },
      update(id, patch) {
        state.records = { ...state.records, ...validateRecords({ [id]: { ...this.get(id), ...patch, updatedAt: new Date().toISOString() } }) };
        return persist();
      },
      visit(id) { state.lastVisited = id; return persist(); },
      backup() {
        if (!this.canBackup) throw Error('当前浏览器记录不可读，已停止导出正常备份；请下载原始数据或导入已有备份');
        return { kind: 'algorithm-notebook-backup', version: 1, exportedAt: new Date().toISOString(), records: state.records };
      },
      merge(records) {
        const next = { ...state, records: { ...state.records, ...validateRecords(records) } };
        // 导入先完整写入成功，再替换内存；失败时保留原记录。
        try { storage.setItem(KEY, JSON.stringify(next)); state = next; blocked = false; corrupted = false; rawSnapshot = ''; error = ''; return true; }
        catch (_) { error = '导入未保存：浏览器存储不可用，原记录已保留。'; return false; }
      }
    };
  }
  const api = { KEY, statuses, validateBackup, createStore };
  if (typeof module !== 'undefined') module.exports = api; else root.NotebookRecords = api;
})(typeof window !== 'undefined' ? window : globalThis);
