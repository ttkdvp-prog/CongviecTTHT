/* ===== API Layer ===== */
const API_URL = 'https://script.google.com/macros/s/AKfycbzP7tqnlPoQE10FKdNGzk5vdhpck_UtMCqqK-Udod1sjGfsYcy2GtBi5J8A4Ff7sk66/exec';

const api = {
  async get(action) {
    try {
      const r = await fetch(`${API_URL}?action=${action}`);
      return r.json();
    } catch(e) { console.error('API GET error:', e); return []; }
  },
  async post(action, data) {
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...data }),
        redirect: 'follow'
      });
      return r.json();
    } catch(e) { console.error('API POST error:', e); return { success: false, message: e.toString() }; }
  }
};

/* ===== State ===== */
let allTasks = [];
let users = [];
let allTeams = [];
let allDocuments = [];
let currentGanttMonth = new Date().getMonth();
let currentGanttYear = new Date().getFullYear();

/* ===== Helpers ===== */
function $(id) { return document.getElementById(id); }
function getInitials(name) {
  if (!name) return '?';
  const cleanName = name.replace(/^[A-Z]+_/, '');
  const parts = cleanName.split(' ').filter(p => p);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function getTeamAbbr(teamName) {
  if (!teamName) return '';
  const name = teamName.trim();
  if (name.includes('Tổng hợp')) return 'TH';
  if (name.includes('Hạ tầng Hòa Bình')) return 'HBH';
  if (name.includes('Hạ tầng Lương Sơn')) return 'LSN';
  if (name.includes('Hạ tầng Phúc Yên')) return 'PYN';
  if (name.includes('Hạ tầng Tam Đảo')) return 'TDO';
  if (name.includes('Hạ tầng Tân Lạc')) return 'TLC';
  if (name.includes('Hạ tầng Thanh Ba')) return 'TBA';
  if (name.includes('Hạ tầng Thanh Sơn')) return 'TSN';
  if (name.includes('Hạ tầng Việt Trì')) return 'VTI';
  if (name.includes('Hạ tầng Vĩnh Yên')) return 'VYN';
  if (name.includes('Hỗ trợ Khách hàng Vip')) {
    if (name.includes('Hoà Bình') || name.includes('Hòa Bình')) return 'VIPHBN';
    if (name.includes('Phú Thọ')) return 'VIPPTO';
    if (name.includes('Vĩnh Phúc')) return 'VIPVPC';
    return 'VIP';
  }
  if (name.includes('Khai thác Hệ thống')) return 'KTHT';
  
  const clean = name.replace(/^Tổ\s+/i, '');
  return clean.split(' ').map(w => w[0]).join('').toUpperCase();
}
function getTaskTeamsAbbr(t) {
  if (!t.assignees || t.assignees.length === 0) return '';
  const abbrs = t.assignees.map(assigneeId => {
    const user = users.find(u => u.id === assigneeId);
    return user ? getTeamAbbr(user.team) : '';
  }).filter(a => a);
  const uniqueAbbrs = [...new Set(abbrs)];
  if (uniqueAbbrs.length === 0) return '';
  return `<span class="badge badge-team" style="background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);color:var(--text2);margin-left:6px;font-size:0.75rem">${uniqueAbbrs.join(', ')}</span>`;
}
const sidebar = $('sidebar');
const loadingBar = $('loading-bar');

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModals();
  setupTaskForm();
  setupUserForm();
  setupSearch();
  setupFilters();
  setupDocForm();
  setupDocFilters();
  setupDocViewModalEvents();
  $('sidebar-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('mobile-open');
  });
  $('refresh-btn').addEventListener('click', refreshData);
  $('add-task-btn').addEventListener('click', () => openTaskModal());
  $('add-user-btn').addEventListener('click', () => openUserModal());
  $('add-doc-btn').addEventListener('click', () => openDocModal());
  $('doc-refresh-btn').addEventListener('click', refreshDocData);
  $('add-subtask-btn').addEventListener('click', addSubtaskInput);
  $('subtask-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskInput(); } });
  $('global-team-filter').addEventListener('change', filterAndRender);
  $('modal-team-filter').addEventListener('change', () => populateAssigneePicker());
  let modalSearchTimer;
  $('modal-assignee-search').addEventListener('input', () => {
    clearTimeout(modalSearchTimer);
    modalSearchTimer = setTimeout(() => populateAssigneePicker(), 200);
  });
  $('prev-month-btn').addEventListener('click', () => navigateGanttMonth(-1));
  $('next-month-btn').addEventListener('click', () => navigateGanttMonth(1));
  initGanttScrollSync();
  loadAllData();
  
  // Xử lý thay đổi số liệu thực hiện trực tiếp trên bảng
  document.addEventListener('change', async e => {
    if (e.target.classList.contains('table-actual-input')) {
      const taskId = e.target.dataset.id;
      const val = Number(e.target.value) || 0;
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;
      
      task.actualValue = val;
      
      const tr = e.target.closest('tr');
      if (tr) {
        const plan = task.planValue || 0;
        const ratio = plan > 0 ? Math.round((val / plan) * 100) + '%' : '—';
        const ratioEl = tr.querySelector('.ratio-cell strong');
        if (ratioEl) {
          ratioEl.textContent = ratio;
          ratioEl.style.color = plan > 0 && val >= plan ? '#00c48c' : 'inherit';
        }
      }
      
      try {
        await api.post('updateTask', { data: task });
        toast('Đã cập nhật số liệu thực hiện!', 'success');
      } catch (err) {
        console.error(err);
        toast('Lỗi khi lưu số liệu thực hiện!', 'error');
      }
    }
  });

  // Xử lý thay đổi ghi chú trực tiếp trên bảng
  document.addEventListener('change', async e => {
    if (e.target.classList.contains('table-note-textarea')) {
      const taskId = e.target.dataset.id;
      const val = e.target.value || '';
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;
      
      task.notes = val;
      
      try {
        await api.post('updateTask', { data: task });
        toast('Đã lưu ghi chú!', 'success');
      } catch (err) {
        console.error(err);
        toast('Lỗi khi lưu ghi chú!', 'error');
      }
    }
  });

  // Tự động điều chỉnh độ cao của ghi chú khi gõ
  document.addEventListener('input', e => {
    if (e.target.classList.contains('table-note-textarea')) {
      autoResizeTextarea(e.target);
    }
  });
});

// Tự động điều chỉnh độ cao của textarea theo nội dung
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

/* ===== Loading ===== */
function showLoading() { loadingBar.className = 'loading-bar active'; }
function hideLoading() {
  loadingBar.className = 'loading-bar done';
  setTimeout(() => { loadingBar.className = 'loading-bar'; }, 400);
}

/* ===== Toast ===== */
function toast(msg, type = 'success') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]} toast-icon"></i><span>${msg}</span>`;
  $('toast-container').appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3500);
}

/* ===== Navigation ===== */
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      $(view + '-view').classList.add('active');
      $('page-title').textContent = link.querySelector('span').textContent;
      if (window.innerWidth < 768) sidebar.classList.remove('mobile-open');
    });
  });
}

/* ===== Data Loading ===== */
async function loadAllData() {
  showLoading();
  try {
    const [tasks, usersData, teamsData, docsData] = await Promise.all([
      api.get('getTasks'),
      api.get('getUsers'),
      api.get('getTeams'),
      api.get('getDocuments')
    ]);
    allTasks = Array.isArray(tasks) ? tasks : [];
    users = Array.isArray(usersData) ? usersData : [];
    allTeams = Array.isArray(teamsData) ? teamsData : [];
    allDocuments = Array.isArray(docsData) ? docsData : [];
    renderAll();
    toast('Dữ liệu đã tải thành công!');
  } catch(e) {
    console.error(e);
    toast('Không thể tải dữ liệu. Vui lòng thử lại.', 'error');
  }
  hideLoading();
}

async function refreshData() {
  const btn = $('refresh-btn');
  btn.classList.add('spinning');
  await loadAllData();
  setTimeout(() => btn.classList.remove('spinning'), 600);
}

/* ===== Render All ===== */
function renderAll() {
  renderDashboard();
  renderKanban();
  renderListView();
  renderUsersView();
  renderGanttView();
  renderDocumentsView();
  populateAssigneePicker();
  populateFilterDropdowns();
  populateTeamFilter();
  populateModalTeamFilter();
  populateDocFilterOptions();
  renderStatsView();
}

/* ===== Helpers ===== */
function statusText(s) {
  return { inprogress: 'Đang thực hiện', done: 'Hoàn thành', overdue: 'Quá hạn', cancelled: 'Đã huỷ' }[s] || s;
}
function priorityText(p) {
  return { high: 'Cao', medium: 'Trung bình', low: 'Thấp' }[p] || p;
}
function fmtDate(d) {
  if (!d) return '—';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) return d;
  try { const dt = new Date(d); return isNaN(dt) ? d : `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`; } catch(e) { return d; }
}
function toInputDate(d) {
  if (!d) return '';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) { const p = d.split('/'); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; }
  try { const dt = new Date(d); return isNaN(dt) ? '' : dt.toISOString().split('T')[0]; } catch(e) { return ''; }
}
function fromInputDate(d) {
  if (!d) return '';
  const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`;
}

/* ===== Dashboard ===== */
function renderDashboard(tasks) {
  const list = tasks || allTasks;
  const total = list.length;
  const prog = list.filter(t => t.status === 'inprogress').length;
  const done = list.filter(t => t.status === 'done').length;
  const over = list.filter(t => t.status === 'overdue').length;
  const canc = list.filter(t => t.status === 'cancelled').length;

  $('stat-total-val').textContent = total;
  $('stat-progress-val').textContent = prog;
  $('stat-done-val').textContent = done;
  $('stat-overdue-val').textContent = over;

  // Donut chart
  const chart = $('status-chart');
  if (total === 0) { chart.innerHTML = '<div class="empty-state-sm"><i class="fas fa-chart-pie"></i> Chưa có dữ liệu</div>'; }
  else {
    const data = [
      { val: prog, color: '#0ea5e9', label: 'Đang thực hiện' },
      { val: done, color: '#00c48c', label: 'Hoàn thành' },
      { val: over, color: '#f43f5e', label: 'Quá hạn' },
      { val: canc, color: '#64748b', label: 'Đã huỷ' }
    ];
    let offset = 0; const r = 60; const c = 2 * Math.PI * r;
    let circles = '';
    data.forEach(d => {
      const pct = d.val / total;
      if (pct > 0) {
        circles += `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${d.color}" stroke-width="24" stroke-dasharray="${c * pct} ${c * (1 - pct)}" stroke-dashoffset="${-offset}" stroke-linecap="round"/>`;
        offset += c * pct;
      }
    });
    const pctDone = total ? Math.round(done / total * 100) : 0;
    const legend = data.map(d => `<div class="legend-item"><span class="legend-dot" style="background:${d.color}"></span>${d.label}: ${d.val}</div>`).join('');
    chart.innerHTML = `<div class="donut-chart"><svg viewBox="0 0 180 180">${circles}</svg><div class="donut-center"><span class="big">${pctDone}%</span><span class="small">hoàn thành</span></div></div><div class="chart-legend">${legend}</div>`;
  }

  // High priority
  const highPri = list.filter(t => t.priority === 'high' && t.status !== 'done' && t.status !== 'cancelled').slice(0, 5);
  const hpList = $('high-priority-list');
  if (highPri.length === 0) { hpList.innerHTML = '<div class="empty-state-sm"><i class="fas fa-check-double"></i> Không có công việc ưu tiên cao</div>'; }
  else { hpList.innerHTML = highPri.map(t => `<div class="priority-item"><span class="task-name-col">${t.title}${getTaskTeamsAbbr(t)}</span><span class="badge badge-${t.status}">${statusText(t.status)}</span></div>`).join(''); }

  // Recent tasks
  const recent = [...list].slice(0, 6);
  const recList = $('recent-tasks');
  if (recent.length === 0) { recList.innerHTML = '<div class="empty-state-sm"><i class="fas fa-inbox"></i> Chưa có công việc nào</div>'; }
  else { recList.innerHTML = recent.map(t => `<div class="recent-item"><span class="task-name-col">${t.title}${getTaskTeamsAbbr(t)}</span><span class="badge badge-${t.priority}">${priorityText(t.priority)}</span><span class="badge badge-${t.status}">${statusText(t.status)}</span><span style="color:var(--text3);font-size:.8rem">${fmtDate(t.dueDate)}</span></div>`).join(''); }
}

/* ===== Kanban ===== */
function renderKanban(tasks) {
  const list = tasks || allTasks;
  ['inprogress', 'done', 'overdue', 'cancelled'].forEach(status => {
    const col = $('col-' + status);
    const filtered = list.filter(t => t.status === status);
    $('count-' + status).textContent = filtered.length;
    if (filtered.length === 0) { col.innerHTML = '<div class="empty-state-sm">Trống</div>'; return; }
    col.innerHTML = filtered.map(t => {
      const assigneeHtml = (t.assignees || []).map((a, i) => {
        const u = users.find(u => u.id === a);
        return `<div class="mini-avatar" title="${u ? u.name + ' (' + u.id + ')' : a}">${u ? getInitials(u.name) : '?'}</div>`;
      }).join('');
      const progress = t.progress || 0;
      return `<div class="task-card" draggable="true" data-id="${t.id}">
        <div class="task-card-actions">
          <button title="Sửa" onclick="editTask('${t.id}')"><i class="fas fa-pen"></i></button>
          <button class="btn-del" title="Xóa" onclick="delTask('${t.id}')"><i class="fas fa-trash"></i></button>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
          <span class="badge badge-${t.priority}">${priorityText(t.priority)}</span>
          ${getTaskTeamsAbbr(t)}
        </div>
        <div class="task-card-title">${t.title}</div>
        ${t.description ? `<div class="task-card-desc">${t.description}</div>` : ''}
        <div class="task-card-meta">
          <div class="task-card-dates"><i class="far fa-calendar"></i> ${fmtDate(t.dueDate)}</div>
          <div class="task-card-assignees">${assigneeHtml}</div>
        </div>
        ${progress > 0 ? `<div class="task-card-progress"><div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div></div>` : ''}
      </div>`;
    }).join('');
  });
  initDragDrop();
}

/* ===== Drag & Drop ===== */
function initDragDrop() {
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.id);
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  document.querySelectorAll('.column-body:not(.no-drop)').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over'); });
    col.addEventListener('drop', async e => {
      e.preventDefault(); col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const newStatus = col.closest('.kanban-column').dataset.status;
      const task = allTasks.find(t => t.id === taskId);
      if (!task || task.status === newStatus) return;
      task.status = newStatus;
      if (newStatus === 'done') task.progress = 100;
      renderKanban(); renderDashboard(); renderListView();
      toast(`Đã chuyển sang "${statusText(newStatus)}"`, 'success');
      await api.post('updateTask', { data: task });
    });
  });
}

/* ===== List View ===== */
function renderListView(tasks) {
  const list = tasks || allTasks;
  const tbody = $('task-table-body');
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="12" class="empty-cell"><i class="fas fa-inbox"></i> Không có công việc nào</td></tr>'; return; }
  tbody.innerHTML = list.map(t => {
    const assignees = (t.assignees || []).map(a => { const u = users.find(u => u.id === a); return u ? `${u.name} (${u.id})${u.team ? ' [' + getTeamAbbr(u.team) + ']' : ''}` : a; }).join(', ') || '—';
    const p = t.progress || 0;
    
    // Tính tỷ lệ thực hiện / kế hoạch
    const plan = t.planValue || 0;
    const actual = t.actualValue || 0;
    const ratio = plan > 0 ? Math.round((actual / plan) * 100) + '%' : '—';
    
    return `<tr>
      <td><strong>${t.title}</strong></td>
      <td><span class="badge badge-${t.priority}">${priorityText(t.priority)}</span></td>
      <td><span class="badge badge-${t.status}">${statusText(t.status)}</span></td>
      <td>${assignees}</td>
      <td>${fmtDate(t.startDate)}</td>
      <td>${fmtDate(t.dueDate)}</td>
      <td><div class="progress-sm"><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div><span>${p}%</span></div></td>
      <td>${plan}</td>
      <td><input type="number" class="table-actual-input" value="${actual}" data-id="${t.id}" min="0" style="width: 70px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: var(--text); text-align: center; padding: 4px 6px; font-size: 0.9rem; font-weight: 500; outline: none; transition: all 0.2s;"></td>
      <td class="ratio-cell"><strong style="color: ${plan > 0 && actual >= plan ? '#00c48c' : 'inherit'};">${ratio}</strong></td>
      <td><textarea class="table-note-textarea" data-id="${t.id}" rows="1" style="width: 100%; min-width: 150px; max-width: 250px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: var(--text); padding: 6px; font-size: 0.85rem; font-family: inherit; resize: none; overflow-y: hidden; min-height: 34px; outline: none; transition: all 0.2s;" placeholder="Nhập ghi chú...">${t.notes || ''}</textarea></td>
      <td><div class="table-actions">
        <button class="btn-edit" title="Sửa" onclick="editTask('${t.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn-del" title="Xóa" onclick="delTask('${t.id}')"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
  
  // Tự động căn chỉnh độ cao các ô ghi chú
  setTimeout(() => {
    document.querySelectorAll('.table-note-textarea').forEach(autoResizeTextarea);
  }, 50);
}

/* ===== Users View ===== */
function renderUsersView(selectedTeam) {
  const grid = $('users-grid');
  if (!grid) return;
  const team = selectedTeam !== undefined ? selectedTeam : $('global-team-filter').value;
  
  let filteredUsers = [...users];
  if (team) {
    filteredUsers = filteredUsers.filter(u => u.team === team);
  }
  
  if (filteredUsers.length === 0) { 
    grid.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Không có nhân viên nào thuộc tổ này</p></div>'; 
    return; 
  }
  
  grid.innerHTML = filteredUsers.map(u => `<div class="user-card glass">
    <div class="user-avatar">${getInitials(u.name)}</div>
    <h4>${u.name}</h4>
    <p style="font-size: 0.85rem; color: var(--text2);">Mã NV: <strong>${u.id}</strong></p>
    <p style="font-size: 0.85rem; color: var(--text3); margin-top: 4px;">${u.team || '—'}</p>
    <div class="user-card-actions">
      <button class="btn-secondary" onclick="editUser('${u.id}')"><i class="fas fa-pen"></i> Sửa</button>
      <button class="btn-danger" onclick="delUser('${u.id}')"><i class="fas fa-trash"></i> Xóa</button>
    </div>
  </div>`).join('');
}

/* ===== Modals ===== */
function setupModals() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = $(btn.dataset.close);
      if (modal) modal.classList.remove('show');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
  });
}

function openTaskModal(task) {
  const isEdit = !!task;
  $('modal-title').innerHTML = isEdit ? '<i class="fas fa-pen-to-square"></i> Chỉnh sửa công việc' : '<i class="fas fa-plus-circle"></i> Thêm công việc mới';
  $('task-form').reset();
  $('task-id').value = '';
  $('subtask-list').innerHTML = '';
  $('modal-team-filter').value = '';
  $('modal-assignee-search').value = '';
  $('task-notes').value = '';
  populateAssigneePicker();

  if (isEdit) {
    $('task-id').value = task.id;
    $('task-title').value = task.title || '';
    $('task-desc').value = task.description || '';
    $('task-priority').value = task.priority || 'medium';
    $('task-status').value = task.status || 'inprogress';
    $('task-start').value = toInputDate(task.startDate);
    $('task-due').value = toInputDate(task.dueDate);
    $('task-plan-value').value = task.planValue || '';
    $('task-actual-value').value = task.actualValue || '';
    $('task-notes').value = task.notes || '';
    // Assignees
    (task.assignees || []).forEach(aId => {
      const chip = document.querySelector(`.assignee-chip[data-id="${aId}"]`);
      if (chip) chip.classList.add('selected');
    });
    // Subtasks
    (task.subtasks || []).forEach(st => addSubtaskItem(st.text, st.completed));
  }
  $('task-modal').classList.add('show');
  setTimeout(() => $('task-title').focus(), 100);
}

function openUserModal(user) {
  const isEdit = !!user;
  $('user-modal-title').innerHTML = isEdit ? '<i class="fas fa-user-pen"></i> Chỉnh sửa người dùng' : '<i class="fas fa-user-plus"></i> Thêm người dùng';
  $('user-form').reset();
  $('user-id').value = '';
  if (isEdit) {
    $('user-id').value = user.id;
    $('user-name').value = user.name;
    $('user-initials').value = user.initials;
  }
  $('user-modal').classList.add('show');
}

/* ===== Assignee Picker ===== */
function populateAssigneePicker() {
  const picker = $('assignee-picker');
  if (!picker) return;

  // Remember currently selected assignees
  const selectedIds = [...document.querySelectorAll('.assignee-chip.selected')].map(c => c.dataset.id);

  const teamFilter = ($('modal-team-filter') ? $('modal-team-filter').value : '');
  const searchFilter = ($('modal-assignee-search') ? $('modal-assignee-search').value : '').toLowerCase().trim();

  // Always show already-selected users regardless of filter
  const alreadySelected = users.filter(u => selectedIds.includes(u.id));

  // If no team is selected and no search text, show prompt + already selected
  if (!teamFilter && !searchFilter) {
    let html = '';
    if (alreadySelected.length > 0) {
      html += alreadySelected.map(u => {
        const teamAbbr = getTeamAbbr(u.team);
        const teamBadge = teamAbbr ? ` <span class="chip-team-badge">${teamAbbr}</span>` : '';
        return `<div class="assignee-chip selected" data-id="${u.id}" onclick="this.classList.toggle('selected')"><i class="far fa-circle-user"></i> ${u.name}${teamBadge}</div>`;
      }).join('');
      html += `<div class="assignee-picker-divider"><span>Chọn tổ để thêm người</span></div>`;
    }
    html += '<div class="assignee-picker-prompt"><i class="fas fa-users-rectangle"></i> Vui lòng chọn Tổ để hiển thị danh sách người phụ trách</div>';
    picker.innerHTML = html;
    return;
  }

  let filteredUsers = [...users];
  if (teamFilter) {
    filteredUsers = filteredUsers.filter(u => u.team === teamFilter);
  }
  if (searchFilter) {
    filteredUsers = filteredUsers.filter(u => u.name.toLowerCase().includes(searchFilter) || (u.id && u.id.toLowerCase().includes(searchFilter)));
  }

  // Build chips: show filtered users + any previously selected users not in filtered list
  const filteredIds = new Set(filteredUsers.map(u => u.id));
  const extraSelected = users.filter(u => selectedIds.includes(u.id) && !filteredIds.has(u.id));

  let html = '';
  if (filteredUsers.length > 0 || extraSelected.length > 0) {
    // Show filtered users grouped by team if a team is selected
    html += filteredUsers.map(u => {
      const isSelected = selectedIds.includes(u.id) ? ' selected' : '';
      const teamAbbr = getTeamAbbr(u.team);
      const teamBadge = teamAbbr && !teamFilter ? ` <span class="chip-team-badge">${teamAbbr}</span>` : '';
      return `<div class="assignee-chip${isSelected}" data-id="${u.id}" onclick="this.classList.toggle('selected')"><i class="far fa-circle-user"></i> ${u.name}${teamBadge}</div>`;
    }).join('');

    // Append already-selected users from other teams (dimmed indicator)
    if (extraSelected.length > 0) {
      html += `<div class="assignee-picker-divider"><span>Đã chọn từ tổ khác</span></div>`;
      html += extraSelected.map(u => {
        const teamAbbr = getTeamAbbr(u.team);
        const teamBadge = teamAbbr ? ` <span class="chip-team-badge">${teamAbbr}</span>` : '';
        return `<div class="assignee-chip selected other-team" data-id="${u.id}" onclick="this.classList.toggle('selected')"><i class="far fa-circle-user"></i> ${u.name}${teamBadge}</div>`;
      }).join('');
    }
  } else {
    html = '<span style="color:var(--text3);font-size:.85rem">Không tìm thấy nhân viên</span>';
  }
  picker.innerHTML = html;
}

function populateModalTeamFilter() {
  const sel = $('modal-team-filter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Tất cả tổ</option>' + allTeams.map(t => {
    const abbr = getTeamAbbr(t);
    return `<option value="${t}">${t}${abbr ? ' (' + abbr + ')' : ''}</option>`;
  }).join('');
  sel.value = current;
}

function populateFilterDropdowns() {
  const sel = $('kanban-assignee-filter');
  if (!sel) return;
  const current = sel.value;
  const team = $('global-team-filter').value;
  
  let filteredUsers = [...users];
  if (team) {
    filteredUsers = filteredUsers.filter(u => u.team === team);
  }
  
  sel.innerHTML = '<option value="">Tất cả người phụ trách</option>' + filteredUsers.map(u => `<option value="${u.id}">${u.name} (${u.id})</option>`).join('');
  sel.value = current;
}

/* ===== Subtask ===== */
function addSubtaskInput() {
  const input = $('subtask-input');
  const text = input.value.trim();
  if (!text) return;
  addSubtaskItem(text, false);
  input.value = '';
  input.focus();
}

function addSubtaskItem(text, completed) {
  const list = $('subtask-list');
  const el = document.createElement('div');
  el.className = 'subtask-item';
  el.innerHTML = `<input type="checkbox" ${completed ? 'checked' : ''}><label>${text}</label><button type="button" class="remove-subtask" onclick="this.closest('.subtask-item').remove()"><i class="fas fa-xmark"></i></button>`;
  list.appendChild(el);
}

/* ===== Task Form ===== */
function setupTaskForm() {
  $('task-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('save-task-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    const selectedAssignees = [...document.querySelectorAll('.assignee-chip.selected')].map(c => c.dataset.id);
    const subtasks = [...$('subtask-list').querySelectorAll('.subtask-item')].map(el => ({
      text: el.querySelector('label').textContent,
      completed: el.querySelector('input[type="checkbox"]').checked
    }));

    const completedCount = subtasks.filter(s => s.completed).length;
    const progress = subtasks.length > 0 ? Math.round(completedCount / subtasks.length * 100) : 0;

    const startVal = $('task-start').value;
    const dueVal = $('task-due').value;

    const taskData = {
      title: $('task-title').value.trim(),
      description: $('task-desc').value.trim(),
      priority: $('task-priority').value,
      status: $('task-status').value,
      startDate: startVal ? fromInputDate(startVal) : '',
      dueDate: dueVal ? fromInputDate(dueVal) : '',
      progress,
      planValue: Number($('task-plan-value').value) || 0,
      actualValue: Number($('task-actual-value').value) || 0,
      notes: $('task-notes').value.trim(),
      assignees: selectedAssignees,
      subtasks,
      attachments: []
    };

    const taskId = $('task-id').value;
    try {
      let result;
      if (taskId) {
        taskData.id = taskId;
        result = await api.post('updateTask', { data: taskData });
      } else {
        result = await api.post('addTask', { data: taskData });
      }
      if (result && result.success !== false) {
        toast(taskId ? 'Đã cập nhật công việc!' : 'Đã thêm công việc mới!');
        $('task-modal').classList.remove('show');
        await loadAllData();
      } else {
        toast(result?.message || 'Có lỗi xảy ra!', 'error');
      }
    } catch(err) {
      toast('Lỗi: ' + err.toString(), 'error');
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Lưu lại';
  });
}

/* ===== User Form ===== */
function setupUserForm() {
  $('user-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('save-user-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    const userData = {
      name: $('user-name').value.trim(),
      initials: $('user-initials').value.trim().toUpperCase()
    };
    const userId = $('user-id').value;

    try {
      let result;
      if (userId) {
        userData.id = userId;
        result = await api.post('updateUser', { data: userData });
      } else {
        result = await api.post('addUser', { data: userData });
      }
      if (result && result.success !== false) {
        toast(userId ? 'Đã cập nhật người dùng!' : 'Đã thêm người dùng mới!');
        $('user-modal').classList.remove('show');
        await loadAllData();
      } else {
        toast(result?.message || 'Có lỗi xảy ra!', 'error');
      }
    } catch(err) {
      toast('Lỗi: ' + err.toString(), 'error');
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Lưu';
  });
}

/* ===== Actions ===== */
function editTask(id) {
  const task = allTasks.find(t => t.id === id);
  if (task) openTaskModal(task);
}

async function delTask(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
  showLoading();
  const result = await api.post('deleteTask', { taskId: id });
  if (result && result.success !== false) {
    allTasks = allTasks.filter(t => t.id !== id);
    renderAll();
    toast('Đã xóa công việc!');
  } else {
    toast('Lỗi khi xóa!', 'error');
  }
  hideLoading();
}

function editUser(id) {
  const user = users.find(u => u.id === id);
  if (user) openUserModal(user);
}

async function delUser(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
  showLoading();
  const result = await api.post('deleteUser', { userId: id });
  if (result && result.success !== false) {
    users = users.filter(u => u.id !== id);
    renderAll();
    toast('Đã xóa người dùng!');
  } else {
    toast(result?.message || 'Lỗi khi xóa!', 'error');
  }
  hideLoading();
}

/* ===== Search & Filter ===== */
function setupSearch() {
  let timer;
  $('global-search').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => filterAndRender(), 300);
  });
}

function setupFilters() {
  $('kanban-assignee-filter').addEventListener('change', filterAndRender);
  $('kanban-priority-filter').addEventListener('change', filterAndRender);
}

function filterAndRender() {
  const keyword = ($('global-search').value || '').toLowerCase().trim();
  const assignee = $('kanban-assignee-filter').value;
  const priority = $('kanban-priority-filter').value;
  const team = $('global-team-filter').value;

  let filtered = [...allTasks];
  if (keyword) filtered = filtered.filter(t => t.title.toLowerCase().includes(keyword) || (t.description || '').toLowerCase().includes(keyword));
  if (assignee) filtered = filtered.filter(t => t.assignees && t.assignees.includes(assignee));
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (team) {
    filtered = filtered.filter(t => {
      if (!t.assignees || t.assignees.length === 0) return false;
      return t.assignees.some(assigneeId => {
        const user = users.find(u => u.id === assigneeId);
        return user && user.team === team;
      });
    });
  }

  renderDashboard(filtered);
  renderKanban(filtered);
  renderListView(filtered);
  renderGanttView(filtered);
  renderUsersView(team);
  populateFilterDropdowns();

  if (filtered.length < allTasks.length) {
    toast(`Hiển thị ${filtered.length}/${allTasks.length} công việc`, 'warning');
  }
}

function populateTeamFilter() {
  const sel = $('global-team-filter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Tất cả tổ</option>' + allTeams.map(t => {
    const abbr = getTeamAbbr(t);
    return `<option value="${t}">${t}${abbr ? ' (' + abbr + ')' : ''}</option>`;
  }).join('');
  sel.value = current;
}

/* ===== Gantt Chart View ===== */
function renderGanttView(tasks) {
  const list = tasks || allTasks;
  const sideBody = document.querySelector('.gantt-side-body');
  const timelineBody = document.querySelector('.gantt-timeline-body');
  if (!sideBody || !timelineBody) return;
  
  sideBody.innerHTML = '';
  timelineBody.innerHTML = '';
  
  const allHeaders = document.querySelectorAll('.gantt-side-header, .gantt-task-header, .gantt-status-header');
  allHeaders.forEach(header => {
    header.style.border = 'none';
    header.style.outline = 'none';
    header.style.boxShadow = '0 1px 0 var(--glass-border)';
  });
  
  const daysContainer = document.querySelector('.gantt-days');
  if (!daysContainer) return;
  daysContainer.innerHTML = '';
  
  const monthElement = document.querySelector('.gantt-month');
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  if (monthElement) {
    monthElement.textContent = `${monthNames[currentGanttMonth]}, ${currentGanttYear}`;
  }
  
  const daysInMonth = new Date(currentGanttYear, currentGanttMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentGanttYear, currentGanttMonth, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayElement = document.createElement('div');
    dayElement.className = `gantt-day${isWeekend ? ' weekend' : ''}`;
    dayElement.textContent = day;
    daysContainer.appendChild(dayElement);
  }
  
  list.forEach(task => {
    if (!task.startDate || !task.dueDate) return;
    
    try {
      let startDate, dueDate;
      
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.startDate) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.dueDate)) {
        const startParts = task.startDate.split('/');
        const dueParts = task.dueDate.split('/');
        if (startParts.length === 3 && dueParts.length === 3) {
          startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
          dueDate = new Date(parseInt(dueParts[2]), parseInt(dueParts[1]) - 1, parseInt(dueParts[0]));
        } else {
          return;
        }
      } else {
        startDate = new Date(task.startDate);
        dueDate = new Date(task.dueDate);
        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) return;
      }
      
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const dueMonth = dueDate.getMonth();
      const dueYear = dueDate.getFullYear();
      
      const isVisible = (
        (startMonth === currentGanttMonth && startYear === currentGanttYear) ||
        (dueMonth === currentGanttMonth && dueYear === currentGanttYear) ||
        (
          (startYear < currentGanttYear || (startYear === currentGanttYear && startMonth < currentGanttMonth)) &&
          (dueYear > currentGanttYear || (dueYear === currentGanttYear && dueMonth > currentGanttMonth))
        )
      );
      
      if (!isVisible) return;
      
      let startDay = 1;
      let endDay = daysInMonth;
      
      if (startMonth === currentGanttMonth && startYear === currentGanttYear) {
        startDay = startDate.getDate();
      }
      if (dueMonth === currentGanttMonth && dueYear === currentGanttYear) {
        endDay = dueDate.getDate();
      }
      
      const leftPosition = ((startDay - 1) / daysInMonth) * 100;
      const width = Math.max(((endDay - startDay + 1) / daysInMonth) * 100, 2);
      
      let assigneesHtml = '';
      if (task.assignees && task.assignees.length > 0) {
        assigneesHtml = '<div class="gantt-bar-assignees">';
        task.assignees.forEach(assigneeId => {
          const user = users.find(u => u.id === assigneeId);
          if (user) {
            assigneesHtml += `<div class="gantt-bar-avatar" title="${user.name} (${user.id})">${getInitials(user.name)}</div>`;
          }
        });
        assigneesHtml += '</div>';
      }
      
      let attachmentsHtml = '';
      if (task.attachments && task.attachments.length > 0) {
        attachmentsHtml = '<div class="gantt-bar-attachments">';
        task.attachments.forEach(attachment => {
          let iconClass = 'file';
          if (attachment.type === 'image') iconClass = 'image';
          else if (attachment.name.endsWith('.pdf')) iconClass = 'file-pdf';
          else if (attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx')) iconClass = 'file-word';
          else if (attachment.name.endsWith('.xls') || attachment.name.endsWith('.xlsx')) iconClass = 'file-excel';
          
          attachmentsHtml += `
            <div class="gantt-bar-attachment" onclick="window.open('${attachment.url}', '_blank'); event.stopPropagation();" title="${attachment.name}">
              <i class="far fa-${iconClass}"></i>
            </div>
          `;
        });
        attachmentsHtml += '</div>';
      }
      
      const taskRow = document.createElement('div');
      taskRow.className = 'gantt-task-row';
      taskRow.dataset.id = task.id;
      taskRow.innerHTML = `
        <div class="gantt-task-cell">
          <div class="gantt-task-title">
            <span class="task-expander expanded"><i class="fas fa-caret-down"></i></span>
            <span class="priority ${task.priority}"></span>
            <strong>${task.title}</strong>
          </div>
        </div>
        <div class="gantt-status-cell">
          <span class="badge badge-${task.status}">${statusText(task.status)}</span>
        </div>
      `;
      sideBody.appendChild(taskRow);
      
      const timelineRow = document.createElement('div');
      timelineRow.className = 'gantt-timeline-row';
      timelineRow.dataset.id = task.id;
      timelineRow.innerHTML = `
        <div class="gantt-bar-container">
          <div class="gantt-bar ${task.status}" style="left: ${leftPosition}%; width: ${width}%;">
            <div class="gantt-bar-label">${fmtDate(task.startDate)} - ${fmtDate(task.dueDate)}</div>
            <div class="gantt-progress" style="width: ${task.progress || 0}%"></div>
            ${assigneesHtml}
            ${attachmentsHtml}
          </div>
        </div>
      `;
      timelineBody.appendChild(timelineRow);
      
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((subtask, index) => {
          const subtaskRow = document.createElement('div');
          subtaskRow.className = 'gantt-subtask-row';
          subtaskRow.dataset.parent = task.id;
          subtaskRow.innerHTML = `
            <div class="gantt-task-cell">
              <div class="gantt-subtask-title" style="padding-left: 24px; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="gantt-subtask-${task.id}-${index}" ${subtask.completed ? 'checked' : ''} onchange="toggleGanttSubtask('${task.id}', ${index}, this.checked)">
                <label for="gantt-subtask-${task.id}-${index}" style="font-size: 0.85rem; cursor: pointer; color: var(--text2);">${subtask.text}</label>
              </div>
            </div>
            <div class="gantt-status-cell"></div>
          `;
          sideBody.appendChild(subtaskRow);
          
          const subtaskTimelineRow = document.createElement('div');
          subtaskTimelineRow.className = 'gantt-timeline-row subtask';
          subtaskTimelineRow.dataset.parent = task.id;
          timelineBody.appendChild(subtaskTimelineRow);
        });
      }
    } catch (e) {
      console.error('Error rendering Gantt row for task:', task.id, e);
    }
  });
  
  initGanttInteractive();
}

function toggleGanttSubtask(taskId, subtaskIndex, isChecked) {
  const task = allTasks.find(t => t.id === taskId);
  if (task && task.subtasks && task.subtasks[subtaskIndex]) {
    task.subtasks[subtaskIndex].completed = isChecked;
    const completedCount = task.subtasks.filter(s => s.completed).length;
    const progress = Math.round(completedCount / task.subtasks.length * 100);
    task.progress = progress;
    renderAll();
    api.post('updateTask', { data: task }).then(res => {
      if (res && res.success !== false) {
        toast('Đã cập nhật tiến độ công việc con!');
      } else {
        toast('Lỗi cập nhật tiến độ!', 'error');
      }
    });
  }
}

function initGanttInteractive() {
  document.querySelectorAll('.task-expander').forEach(expander => {
    expander.addEventListener('click', function() {
      const taskId = this.closest('.gantt-task-row').dataset.id;
      const subtasks = document.querySelectorAll(`.gantt-subtask-row[data-parent="${taskId}"]`);
      const subtaskTimelines = document.querySelectorAll(`.gantt-timeline-row.subtask[data-parent="${taskId}"]`);
      
      const isExpanded = this.classList.contains('expanded');
      if (isExpanded) {
        this.classList.remove('expanded');
        this.classList.add('collapsed');
        this.querySelector('i').className = 'fas fa-caret-right';
        subtasks.forEach(el => el.style.display = 'none');
        subtaskTimelines.forEach(el => el.style.display = 'none');
      } else {
        this.classList.remove('collapsed');
        this.classList.add('expanded');
        this.querySelector('i').className = 'fas fa-caret-down';
        subtasks.forEach(el => el.style.display = 'flex');
        subtaskTimelines.forEach(el => el.style.display = 'block');
      }
    });
  });
  
  document.querySelectorAll('.gantt-bar').forEach(bar => {
    bar.addEventListener('mouseover', function() {
      const taskId = this.closest('.gantt-timeline-row').dataset.id;
      const taskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
      if (taskRow) taskRow.classList.add('highlight');
    });
    bar.addEventListener('mouseout', function() {
      const taskId = this.closest('.gantt-timeline-row').dataset.id;
      const taskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
      if (taskRow) taskRow.classList.remove('highlight');
    });
  });
  
  const timeline = document.querySelector('.gantt-timeline');
  if (timeline) {
    let isScrolling = false;
    let startX, scrollLeft;
    timeline.addEventListener('mousedown', e => {
      if (e.target.closest('.gantt-bar')) return;
      isScrolling = true;
      startX = e.pageX - timeline.offsetLeft;
      scrollLeft = timeline.scrollLeft;
      timeline.style.cursor = 'grabbing';
    });
    timeline.addEventListener('mouseleave', () => { isScrolling = false; timeline.style.cursor = 'auto'; });
    timeline.addEventListener('mouseup', () => { isScrolling = false; timeline.style.cursor = 'auto'; });
    timeline.addEventListener('mousemove', e => {
      if (!isScrolling) return;
      e.preventDefault();
      const x = e.pageX - timeline.offsetLeft;
      const walk = (x - startX) * 2;
      timeline.scrollLeft = scrollLeft - walk;
    });
  }
}

function initGanttScrollSync() {
  const sideBody = document.querySelector('.gantt-side-body');
  const timelineBody = document.querySelector('.gantt-timeline-body');
  if (sideBody && timelineBody) {
    sideBody.addEventListener('scroll', () => {
      timelineBody.scrollTop = sideBody.scrollTop;
    });
    timelineBody.addEventListener('scroll', () => {
      sideBody.scrollTop = timelineBody.scrollTop;
    });
  }
}

function navigateGanttMonth(direction) {
  let newMonth = currentGanttMonth + direction;
  let newYear = currentGanttYear;
  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }
  currentGanttMonth = newMonth;
  currentGanttYear = newYear;
  renderGanttView();
}

// ==================== FRONTEND LOGIC: QUẢN LÝ TÀI LIỆU ====================

// Render bảng danh sách tài liệu
function renderDocumentsView(docs) {
  const list = docs || allDocuments;
  const tbody = $('doc-table-body');
  if (!tbody) return;
  
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-cell"><i class="fas fa-inbox"></i> Không có tài liệu nào</td></tr>';
    return;
  }
  
  tbody.innerHTML = '';
  list.forEach((doc, idx) => {
    const tr = document.createElement('tr');
    
    // Tình trạng badge
    let badgeClass = 'badge-doc-active';
    if (doc.status === 'Hết hiệu lực') badgeClass = 'badge-doc-expired';
    else if (doc.status === 'Tạm ngưng') badgeClass = 'badge-doc-suspended';
    else if (doc.status === 'Đang soạn thảo') badgeClass = 'badge-doc-draft';
    
    const statusHtml = `<span class="badge ${badgeClass}">${doc.status || 'Đang hiệu lực'}</span>`;
    
    // File attachment link
    let fileHtml = '—';
    if (doc.fileUrl && doc.fileUrl !== '#' && doc.fileUrl !== '') {
      fileHtml = `<a href="${doc.fileUrl}" target="_blank" class="doc-link" title="${doc.fileName || 'Xem tệp'}">
        <i class="fas fa-file-pdf"></i> ${doc.fileName || 'Tệp đính kèm'}
      </a>`;
    } else if (doc.fileName) {
      fileHtml = `<span class="text-muted"><i class="fas fa-file"></i> ${doc.fileName}</span>`;
    }
    
    // Currency format
    const fmtCurrency = (val) => {
      if (!val) return '0 đ';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace('₫', 'đ');
    };
    
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${doc.docNumber || '—'}</strong></td>
      <td style="white-space: normal; min-width: 250px; font-weight: 500; color: var(--text);" class="doc-title-clickable" onclick="showDocViewModal('${doc.id}')">${doc.title}</td>
      <td><span style="background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);padding:2px 8px;border-radius:12px;font-size:0.8rem;">${doc.category || 'Chưa phân loại'}</span></td>
      <td><span style="color:var(--text2);font-size:0.85rem;">${doc.department || '—'}</span></td>
      <td style="font-weight: 600; color: var(--accent);">${fmtCurrency(doc.contractValue)}</td>
      <td>${statusHtml}</td>
      <td><span style="font-size:0.85rem;color:var(--text2);"><i class="far fa-calendar-alt"></i> ${fmtDate(doc.endDate)}</span></td>
      <td>
        <div class="doc-actions">
          <button class="btn-view" onclick="showDocViewModal('${doc.id}')" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
          <button class="btn-edit" onclick="openDocModal('${doc.id}')" title="Sửa"><i class="fas fa-pen"></i></button>
          <button class="btn-del" onclick="deleteDocRecord('${doc.id}')" title="Xoá"><i class="fas fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Populate phòng ban cho modal
function populateDocDepartmentSelect() {
  const select = $('doc-department');
  if (!select) return;
  select.innerHTML = '<option value="">-- Chọn phòng ban --</option>';
  allTeams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });
}

// Reset/Mở modal tài liệu
function openDocModal(docId) {
  const isEdit = !!docId;
  $('doc-modal-title').innerHTML = isEdit ? '<i class="fas fa-pen-to-square"></i> Cập nhật hồ sơ' : '<i class="fas fa-plus-circle"></i> Thêm hồ sơ mới';
  $('doc-form').reset();
  $('doc-id').value = '';
  $('doc-file-status').textContent = 'Chưa chọn tệp';
  $('doc-file-status').className = 'file-status';
  $('doc-file-clear-btn').style.display = 'none';
  $('doc-file-url').value = '';
  $('doc-file-name').value = '';
  
  populateDocDepartmentSelect();
  
  if (isEdit) {
    const doc = allDocuments.find(d => d.id === docId);
    if (doc) {
      $('doc-id').value = doc.id;
      $('doc-title').value = doc.title || '';
      $('doc-number').value = doc.docNumber || '';
      $('doc-category').value = doc.category || '';
      $('doc-department').value = doc.department || '';
      $('doc-status').value = doc.status || 'Đang hiệu lực';
      $('doc-issue-date').value = toInputDate(doc.issueDate);
      $('doc-end-date').value = toInputDate(doc.endDate);
      $('doc-project').value = doc.project || '';
      $('doc-supplier').value = doc.supplier || '';
      $('doc-contract-value').value = doc.contractValue || '';
      $('doc-actual-value').value = doc.actualValue || '';
      
      const contractVal = Number(doc.contractValue) || 0;
      const actualVal = Number(doc.actualValue) || 0;
      const diffVal = contractVal - actualVal;
      $('doc-diff-value').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(diffVal).replace('₫', 'đ');
      
      if (doc.fileUrl && doc.fileUrl !== '') {
        $('doc-file-url').value = doc.fileUrl;
        $('doc-file-name').value = doc.fileName || '';
        $('doc-file-status').textContent = 'Đã đính kèm: ' + (doc.fileName || 'Tệp đính kèm');
        $('doc-file-status').className = 'file-status uploaded';
        $('doc-file-clear-btn').style.display = 'inline-flex';
      }
      $('doc-desc').value = doc.description || '';
    }
  }
  
  $('doc-modal').classList.add('show');
}

// Khởi tạo các sự kiện cho form tài liệu
function setupDocForm() {
  const form = $('doc-form');
  if (!form) return;
  
  // Tính chênh lệch động
  const calcDiff = () => {
    const contract = Number($('doc-contract-value').value) || 0;
    const actual = Number($('doc-actual-value').value) || 0;
    const diff = contract - actual;
    $('doc-diff-value').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(diff).replace('₫', 'đ');
  };
  
  $('doc-contract-value').addEventListener('input', calcDiff);
  $('doc-actual-value').addEventListener('input', calcDiff);
  
  // Kích hoạt nút chọn tệp
  $('doc-file-select-btn').addEventListener('click', () => {
    $('doc-file-input').click();
  });
  
  // Xoá tệp đính kèm
  $('doc-file-clear-btn').addEventListener('click', () => {
    $('doc-file-input').value = '';
    $('doc-file-url').value = '';
    $('doc-file-name').value = '';
    $('doc-file-status').textContent = 'Chưa chọn tệp';
    $('doc-file-status').className = 'file-status';
    $('doc-file-clear-btn').style.display = 'none';
  });
  
  // Xử lý khi chọn file và tải lên Drive
  $('doc-file-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    
    $('doc-file-status').textContent = 'Đang tải lên...';
    $('doc-file-status').className = 'file-status';
    
    const reader = new FileReader();
    reader.onload = async function(evt) {
      const base64Data = evt.target.result;
      try {
        const result = await api.post('uploadFile', {
          base64Data: base64Data,
          fileName: file.name,
          mimeType: file.type
        });
        
        if (result && result.success !== false && result.url) {
          $('doc-file-url').value = result.url;
          $('doc-file-name').value = result.name || file.name;
          $('doc-file-status').textContent = 'Đã tải lên: ' + file.name;
          $('doc-file-status').className = 'file-status uploaded';
          $('doc-file-clear-btn').style.display = 'inline-flex';
          toast('Tải tệp lên thành công!');
        } else {
          $('doc-file-status').textContent = 'Lỗi tải tệp';
          $('doc-file-status').className = 'file-status error';
          toast(result?.message || 'Lỗi khi tải tệp lên!', 'error');
        }
      } catch (err) {
        console.error(err);
        $('doc-file-status').textContent = 'Lỗi tải tệp';
        $('doc-file-status').className = 'file-status error';
        toast('Lỗi kết nối khi tải tệp!', 'error');
      }
    };
    reader.readAsDataURL(file);
  });
  
  // Submit Form lưu tài liệu
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('save-doc-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    
    const docData = {
      title: $('doc-title').value.trim(),
      docNumber: $('doc-number').value.trim(),
      category: $('doc-category').value.trim(),
      department: $('doc-department').value,
      status: $('doc-status').value,
      issueDate: $('doc-issue-date').value ? fromInputDate($('doc-issue-date').value) : '',
      endDate: $('doc-end-date').value ? fromInputDate($('doc-end-date').value) : '',
      project: $('doc-project').value.trim(),
      supplier: $('doc-supplier').value.trim(),
      contractValue: Number($('doc-contract-value').value) || 0,
      actualValue: Number($('doc-actual-value').value) || 0,
      fileName: $('doc-file-name').value,
      fileUrl: $('doc-file-url').value,
      description: $('doc-desc').value.trim()
    };
    
    const docId = $('doc-id').value;
    try {
      let result;
      if (docId) {
        docData.id = docId;
        result = await api.post('updateDocument', { data: docData });
      } else {
        result = await api.post('addDocument', { data: docData });
      }
      
      if (result && result.success !== false) {
        toast(docId ? 'Đã cập nhật hồ sơ!' : 'Đã thêm hồ sơ mới!');
        $('doc-modal').classList.remove('show');
        await loadDocData();
      } else {
        toast(result?.message || 'Có lỗi xảy ra!', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Có lỗi xảy ra khi lưu!', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Lưu hồ sơ';
    }
  });
}

// Tải danh sách tài liệu
async function loadDocData() {
  showLoading();
  try {
    const docs = await api.get('getDocuments');
    allDocuments = Array.isArray(docs) ? docs : [];
    renderDocumentsView();
    populateDocFilterOptions();
  } catch (e) {
    console.error(e);
    toast('Không thể tải danh sách tài liệu!', 'error');
  } finally {
    hideLoading();
  }
}

// Refresh tài liệu
async function refreshDocData() {
  const btn = $('doc-refresh-btn');
  if (btn) btn.classList.add('spinning');
  await loadDocData();
  if (btn) setTimeout(() => btn.classList.remove('spinning'), 600);
}

// Cấu hình sự kiện bộ lọc tìm kiếm tài liệu
function setupDocFilters() {
  const searchInput = $('doc-search-input');
  const catFilter = $('doc-category-filter');
  const teamFilter = $('doc-team-filter');
  const statusFilter = $('doc-status-filter');
  
  const applyFilters = () => {
    const kw = searchInput.value.toLowerCase().trim();
    const cat = catFilter.value;
    const team = teamFilter.value;
    const status = statusFilter.value;
    
    const filtered = allDocuments.filter(doc => {
      // Keyword
      const matchKw = !kw || 
        (doc.title && doc.title.toLowerCase().includes(kw)) ||
        (doc.docNumber && doc.docNumber.toLowerCase().includes(kw)) ||
        (doc.project && doc.project.toLowerCase().includes(kw)) ||
        (doc.supplier && doc.supplier.toLowerCase().includes(kw)) ||
        (doc.description && doc.description.toLowerCase().includes(kw));
        
      // Category
      const matchCat = !cat || doc.category === cat;
      // Department
      const matchTeam = !team || doc.department === team;
      // Status
      const matchStatus = !status || doc.status === status;
      
      return matchKw && matchCat && matchTeam && matchStatus;
    });
    
    renderDocumentsView(filtered);
  };
  
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (catFilter) catFilter.addEventListener('change', applyFilters);
  if (teamFilter) teamFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
}

// Đổ dữ liệu vào các dropdown bộ lọc và datalist hỗ trợ autocomplete
function populateDocFilterOptions() {
  const catFilter = $('doc-category-filter');
  const teamFilter = $('doc-team-filter');
  
  if (catFilter) {
    const cats = [...new Set(allDocuments.map(d => d.category).filter(c => c))];
    catFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      catFilter.appendChild(opt);
    });
    
    // Cập nhật datalist trong form
    const datalistCats = $('doc-categories-list');
    if (datalistCats) {
      datalistCats.innerHTML = '';
      const defaultCats = ['Hợp đồng', 'Mẫu tham khảo', 'Thỏa thuận vị trí', 'Văn bản ủy quyền'];
      const uniqueCats = [...new Set([...defaultCats, ...cats])];
      uniqueCats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        datalistCats.appendChild(opt);
      });
    }
  }
  
  if (teamFilter) {
    teamFilter.innerHTML = '<option value="">Tất cả phòng ban</option>';
    allTeams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      teamFilter.appendChild(opt);
    });
  }
  
  // Cập nhật datalist Dự án và NCC
  const datalistProjs = $('doc-projects-list');
  if (datalistProjs) {
    const projs = [...new Set(allDocuments.map(d => d.project).filter(p => p))];
    datalistProjs.innerHTML = '';
    const defaultProjs = ['Dự án Hạ tầng', 'Dự án VNPT'];
    const uniqueProjs = [...new Set([...defaultProjs, ...projs])];
    uniqueProjs.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      datalistProjs.appendChild(opt);
    });
  }
  
  const datalistSups = $('doc-suppliers-list');
  if (datalistSups) {
    const sups = [...new Set(allDocuments.map(d => d.supplier).filter(s => s))];
    datalistSups.innerHTML = '';
    const defaultSups = ['VNPT', 'Viettel', 'FPT'];
    const uniqueSups = [...new Set([...defaultSups, ...sups])];
    uniqueSups.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      datalistSups.appendChild(opt);
    });
  }
}

// Xóa tài liệu hồ sơ
async function deleteDocRecord(docId) {
  if (confirm('Bạn có chắc chắn muốn xoá hồ sơ tài liệu này?')) {
    showLoading();
    try {
      const result = await api.post('deleteDocument', { docId: docId });
      if (result && result.success !== false) {
        toast('Đã xoá tài liệu thành công!');
        await loadDocData();
      } else {
        toast(result?.message || 'Có lỗi xảy ra khi xoá!', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Lỗi kết nối khi xoá!', 'error');
    } finally {
      hideLoading();
    }
  }
}

// Đăng ký toàn cục để gọi inline từ thuộc tính onclick
window.openDocModal = openDocModal;
window.deleteDocRecord = deleteDocRecord;
window.showDocViewModal = showDocViewModal;

// ==================== VIEW MODAL CHI TIẾT TÀI LIỆU ====================

let currentViewingDocId = null;

function showDocViewModal(docId) {
  const doc = allDocuments.find(d => d.id === docId);
  if (!doc) return;
  
  currentViewingDocId = docId;
  
  $('doc-view-title').textContent = doc.title || 'Không có tiêu đề';
  $('doc-view-number').textContent = doc.docNumber || '—';
  $('doc-view-project').textContent = doc.project || '—';
  $('doc-view-supplier').textContent = doc.supplier || '—';
  $('doc-view-issue-date').textContent = fmtDate(doc.issueDate) || '—';
  $('doc-view-end-date').textContent = fmtDate(doc.endDate) || '—';
  
  $('doc-view-badge-cat').textContent = doc.category || 'Chưa phân loại';
  $('doc-view-badge-dept').textContent = doc.department || '—';
  
  const statusBadge = $('doc-view-badge-status');
  statusBadge.textContent = doc.status || 'Đang hiệu lực';
  statusBadge.className = 'badge';
  let badgeClass = 'badge-doc-active';
  if (doc.status === 'Hết hiệu lực') badgeClass = 'badge-doc-expired';
  else if (doc.status === 'Tạm ngưng') badgeClass = 'badge-doc-suspended';
  else if (doc.status === 'Đang soạn thảo') badgeClass = 'badge-doc-draft';
  statusBadge.classList.add(badgeClass);
  
  const fmtCurrency = (val) => {
    if (!val) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace('₫', 'đ');
  };
  
  $('doc-view-contract-val').textContent = fmtCurrency(doc.contractValue);
  $('doc-view-actual-val').textContent = fmtCurrency(doc.actualValue);
  
  const diffVal = (Number(doc.contractValue) || 0) - (Number(doc.actualValue) || 0);
  $('doc-view-diff-val').textContent = fmtCurrency(diffVal);
  
  $('doc-view-desc').textContent = doc.description || 'Không có mô tả';
  
  const iframe = $('doc-view-iframe');
  const fallback = $('doc-view-no-preview');
  
  if (doc.fileUrl && doc.fileUrl !== '#' && doc.fileUrl !== '') {
    const embedUrl = getEmbedUrl(doc.fileUrl);
    iframe.src = embedUrl;
    iframe.style.display = 'block';
    fallback.style.display = 'none';
    
    $('doc-view-btn-download').style.display = 'inline-flex';
    $('doc-view-btn-share').style.display = 'inline-flex';
    $('doc-view-btn-replace').style.display = 'inline-flex';
  } else {
    iframe.src = 'about:blank';
    iframe.style.display = 'none';
    fallback.style.display = 'block';
    
    $('doc-view-btn-download').style.display = 'none';
    $('doc-view-btn-share').style.display = 'none';
    $('doc-view-btn-replace').style.display = 'none';
  }
  
  $('doc-view-modal').classList.add('show');
}

function getEmbedUrl(fileUrl) {
  if (!fileUrl) return '';
  const match = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return fileUrl;
}

function setupDocViewModalEvents() {
  document.querySelectorAll('[data-close="doc-view-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      $('doc-view-modal').classList.remove('show');
      $('doc-view-iframe').src = 'about:blank';
    });
  });
  
  $('doc-view-modal').addEventListener('click', e => {
    if (e.target === $('doc-view-modal')) {
      $('doc-view-modal').classList.remove('show');
      $('doc-view-iframe').src = 'about:blank';
    }
  });
  
  $('doc-view-btn-download').addEventListener('click', () => {
    const doc = allDocuments.find(d => d.id === currentViewingDocId);
    if (doc && doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  });
  
  $('doc-view-btn-share').addEventListener('click', () => {
    const doc = allDocuments.find(d => d.id === currentViewingDocId);
    if (doc && doc.fileUrl) {
      navigator.clipboard.writeText(doc.fileUrl).then(() => {
        toast('Đã copy link tài liệu vào bộ nhớ tạm!', 'success');
      }).catch(err => {
        console.error('Không thể copy link:', err);
        prompt('Copy link bên dưới:', doc.fileUrl);
      });
    }
  });
  
  $('doc-view-btn-edit').addEventListener('click', () => {
    const docId = currentViewingDocId;
    $('doc-view-modal').classList.remove('show');
    $('doc-view-iframe').src = 'about:blank';
    openDocModal(docId);
  });
  
  $('doc-view-btn-replace').addEventListener('click', () => {
    $('doc-view-replace-file-input').click();
  });
  
  $('doc-view-replace-file-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const doc = allDocuments.find(d => d.id === currentViewingDocId);
    if (!doc) return;
    
    showLoading();
    const reader = new FileReader();
    reader.onload = async function(evt) {
      const base64Data = evt.target.result;
      try {
        const result = await api.post('uploadFile', {
          base64Data: base64Data,
          fileName: file.name,
          mimeType: file.type
        });
        
        if (result && result.success !== false && result.url) {
          const updatedDoc = {
            ...doc,
            fileName: result.name || file.name,
            fileUrl: result.url
          };
          
          const saveResult = await api.post('updateDocument', { data: updatedDoc });
          if (saveResult && saveResult.success !== false) {
            toast('Thay thế tệp hồ sơ thành công!', 'success');
            await loadDocData();
            showDocViewModal(currentViewingDocId);
          } else {
            toast(saveResult?.message || 'Không thể cập nhật hồ sơ!', 'error');
          }
        } else {
          toast(result?.message || 'Lỗi khi tải tệp lên!', 'error');
        }
      } catch (err) {
        console.error(err);
        toast('Lỗi kết nối khi thay thế tệp!', 'error');
      } finally {
        hideLoading();
        $('doc-view-replace-file-input').value = '';
      }
    };
    reader.readAsDataURL(file);
  });
  
  $('doc-view-btn-delete').addEventListener('click', async () => {
    const docId = currentViewingDocId;
    if (confirm('Bạn có chắc chắn muốn xoá hồ sơ tài liệu này?')) {
      $('doc-view-modal').classList.remove('show');
      $('doc-view-iframe').src = 'about:blank';
      
      showLoading();
      try {
        const result = await api.post('deleteDocument', { docId: docId });
        if (result && result.success !== false) {
          toast('Đã xoá tài liệu thành công!', 'success');
          await loadDocData();
        } else {
          toast(result?.message || 'Có lỗi xảy ra khi xoá!', 'error');
        }
      } catch (e) {
        console.error(e);
        toast('Lỗi kết nối khi xoá!', 'error');
      } finally {
        hideLoading();
      }
    }
  });
}

/* ===== Statistics & Evaluations ===== */
function renderStatsView() {
  const teamFilter = $('stats-team-filter');
  if (!teamFilter) return;
  
  const currentVal = teamFilter.value;
  teamFilter.innerHTML = '<option value="">Tất cả tổ</option>';
  allTeams.forEach(t => {
    const abbr = getTeamAbbr ? getTeamAbbr(t) : '';
    teamFilter.innerHTML += `<option value="${t}">${t}${abbr ? ' (' + abbr + ')' : ''}</option>`;
  });
  teamFilter.value = currentVal;
  
  const monthFilter = $('stats-month-filter');
  if (monthFilter && !monthFilter.value) {
    const today = new Date();
    const formattedMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    monthFilter.value = formattedMonth;
  }
  
  calculateAndRenderStats();
}

function parseTaskDate(d) {
  if (!d) return null;
  
  // 1. Nếu là đối tượng Date
  if (d instanceof Date) {
    return {
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear()
    };
  }
  
  // 2. Nếu là chuỗi định dạng dd/MM/yyyy
  if (typeof d === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) {
    const parts = d.split('/');
    return {
      day: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10)
    };
  }
  
  // 3. Nếu là chuỗi định dạng khác (ISO date, v.v.)
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      return {
        day: dt.getDate(),
        month: dt.getMonth() + 1,
        year: dt.getFullYear()
      };
    }
  } catch (e) {
    console.error("Lỗi parse ngày:", e);
  }
  
  return null;
}

function calculateAndRenderStats() {
  const teamFilterVal = $('stats-team-filter').value;
  const monthFilterVal = $('stats-month-filter').value; // format YYYY-MM
  
  if (!monthFilterVal) {
    toast('Vui lòng chọn tháng đánh giá!', 'warning');
    return;
  }
  
  const [filterYear, filterMonth] = monthFilterVal.split('-').map(x => parseInt(x, 10));
  
  // 1. Tính toán thống kê theo Tổ
  const teamStatsTbody = $('team-stats-tbody');
  teamStatsTbody.innerHTML = '';
  
  const teamsToProcess = teamFilterVal ? allTeams.filter(t => t === teamFilterVal) : allTeams;
  
  if (teamsToProcess.length === 0) {
    teamStatsTbody.innerHTML = '<tr><td colspan="7" class="empty-cell" style="text-align: center; padding: 20px;">Không có dữ liệu tổ</td></tr>';
  } else {
    teamsToProcess.forEach(team => {
      // Lấy danh sách thành viên thuộc tổ này
      const teamUserIds = users.filter(u => u.team === team).map(u => u.id);
      
      // Lọc các công việc thuộc tổ (có bất kỳ assignee nào thuộc tổ)
      const teamTasks = allTasks.filter(t => 
        (t.assignees || []).some(aId => teamUserIds.includes(aId))
      );
      
      let assignedInMonth = 0;
      let inprogressInMonth = 0;
      let completedInMonth = 0;
      let overdueInMonth = 0;
      let backlogInMonth = 0;
      let cumulativeBacklog = 0;
      
      teamTasks.forEach(task => {
        const parsedDue = parseTaskDate(task.dueDate);
        if (!parsedDue) return;
        
        const isDueInMonth = parsedDue.year === filterYear && parsedDue.month === filterMonth;
        const isDueOnOrBeforeMonth = parsedDue.year < filterYear || (parsedDue.year === filterYear && parsedDue.month <= filterMonth);
        const isCompleted = task.status === 'done';
        const isCancelled = task.status === 'cancelled';
        
        if (isDueInMonth) {
          assignedInMonth++;
          if (task.status === 'inprogress') inprogressInMonth++;
          if (isCompleted) completedInMonth++;
          if (task.status === 'overdue') overdueInMonth++;
          if (!isCompleted && !isCancelled) backlogInMonth++;
        }
        
        if (isDueOnOrBeforeMonth && !isCompleted && !isCancelled) {
          cumulativeBacklog++;
        }
      });
      
      teamStatsTbody.innerHTML += `
        <tr>
          <td><strong>${team}</strong></td>
          <td style="text-align: center; font-weight: 600;">${assignedInMonth}</td>
          <td style="text-align: center; color: var(--accent2);">${inprogressInMonth}</td>
          <td style="text-align: center; color: var(--accent); font-weight: 600;">${completedInMonth}</td>
          <td style="text-align: center; color: var(--amber);">${backlogInMonth}</td>
          <td style="text-align: center; color: var(--rose); font-weight: 600;">${overdueInMonth}</td>
          <td style="text-align: center; background: rgba(244,63,94,0.06); color: var(--rose); font-weight: bold;">${cumulativeBacklog}</td>
        </tr>
      `;
    });
  }
  
  // 2. Tính toán thống kê theo Cá nhân
  const personalStatsTbody = $('personal-stats-tbody');
  personalStatsTbody.innerHTML = '';
  
  const usersToProcess = teamFilterVal ? users.filter(u => u.team === teamFilterVal) : users;
  
  if (usersToProcess.length === 0) {
    personalStatsTbody.innerHTML = '<tr><td colspan="8" class="empty-cell" style="text-align: center; padding: 20px;">Không có thành viên nào</td></tr>';
  } else {
    usersToProcess.forEach(user => {
      // Lấy các công việc được giao cho cá nhân này
      const userTasks = allTasks.filter(t => (t.assignees || []).includes(user.id));
      
      let assignedInMonth = 0;
      let inprogressInMonth = 0;
      let completedInMonth = 0;
      let overdueInMonth = 0;
      let backlogInMonth = 0;
      let cumulativeBacklog = 0;
      
      userTasks.forEach(task => {
        const parsedDue = parseTaskDate(task.dueDate);
        if (!parsedDue) return;
        
        const isDueInMonth = parsedDue.year === filterYear && parsedDue.month === filterMonth;
        const isDueOnOrBeforeMonth = parsedDue.year < filterYear || (parsedDue.year === filterYear && parsedDue.month <= filterMonth);
        const isCompleted = task.status === 'done';
        const isCancelled = task.status === 'cancelled';
        
        if (isDueInMonth) {
          assignedInMonth++;
          if (task.status === 'inprogress') inprogressInMonth++;
          if (isCompleted) completedInMonth++;
          if (task.status === 'overdue') overdueInMonth++;
          if (!isCompleted && !isCancelled) backlogInMonth++;
        }
        
        if (isDueOnOrBeforeMonth && !isCompleted && !isCancelled) {
          cumulativeBacklog++;
        }
      });
      
      const userTeamName = user.team || 'Chưa phân tổ';
      
      personalStatsTbody.innerHTML += `
        <tr>
          <td><strong>${user.name}</strong> (${user.id})</td>
          <td><span style="font-size: 0.85rem; color: var(--text2);">${userTeamName}</span></td>
          <td style="text-align: center; font-weight: 600;">${assignedInMonth}</td>
          <td style="text-align: center; color: var(--accent2);">${inprogressInMonth}</td>
          <td style="text-align: center; color: var(--accent); font-weight: 600;">${completedInMonth}</td>
          <td style="text-align: center; color: var(--amber);">${backlogInMonth}</td>
          <td style="text-align: center; color: var(--rose); font-weight: 600;">${overdueInMonth}</td>
          <td style="text-align: center; background: rgba(244,63,94,0.06); color: var(--rose); font-weight: bold;">${cumulativeBacklog}</td>
        </tr>
      `;
    });
  }
}
