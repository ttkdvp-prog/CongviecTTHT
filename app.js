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
  $('sidebar-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('mobile-open');
  });
  $('refresh-btn').addEventListener('click', refreshData);
  $('add-task-btn').addEventListener('click', () => openTaskModal());
  $('add-user-btn').addEventListener('click', () => openUserModal());
  $('add-subtask-btn').addEventListener('click', addSubtaskInput);
  $('subtask-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskInput(); } });
  $('global-team-filter').addEventListener('change', filterAndRender);
  $('prev-month-btn').addEventListener('click', () => navigateGanttMonth(-1));
  $('next-month-btn').addEventListener('click', () => navigateGanttMonth(1));
  initGanttScrollSync();
  loadAllData();
});

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
    const [tasks, usersData, teamsData] = await Promise.all([
      api.get('getTasks'),
      api.get('getUsers'),
      api.get('getTeams')
    ]);
    allTasks = Array.isArray(tasks) ? tasks : [];
    users = Array.isArray(usersData) ? usersData : [];
    allTeams = Array.isArray(teamsData) ? teamsData : [];
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
  populateAssigneePicker();
  populateFilterDropdowns();
  populateTeamFilter();
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
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="empty-cell"><i class="fas fa-inbox"></i> Không có công việc nào</td></tr>'; return; }
  tbody.innerHTML = list.map(t => {
    const assignees = (t.assignees || []).map(a => { const u = users.find(u => u.id === a); return u ? `${u.name} (${u.id})${u.team ? ' [' + getTeamAbbr(u.team) + ']' : ''}` : a; }).join(', ') || '—';
    const p = t.progress || 0;
    return `<tr>
      <td><strong>${t.title}</strong></td>
      <td><span class="badge badge-${t.priority}">${priorityText(t.priority)}</span></td>
      <td><span class="badge badge-${t.status}">${statusText(t.status)}</span></td>
      <td>${assignees}</td>
      <td>${fmtDate(t.startDate)}</td>
      <td>${fmtDate(t.dueDate)}</td>
      <td><div class="progress-sm"><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div><span>${p}%</span></div></td>
      <td><div class="table-actions">
        <button class="btn-edit" title="Sửa" onclick="editTask('${t.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn-del" title="Xóa" onclick="delTask('${t.id}')"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
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
  populateAssigneePicker();

  if (isEdit) {
    $('task-id').value = task.id;
    $('task-title').value = task.title || '';
    $('task-desc').value = task.description || '';
    $('task-priority').value = task.priority || 'medium';
    $('task-status').value = task.status || 'inprogress';
    $('task-start').value = toInputDate(task.startDate);
    $('task-due').value = toInputDate(task.dueDate);
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
  picker.innerHTML = users.map(u => `<div class="assignee-chip" data-id="${u.id}" onclick="this.classList.toggle('selected')"><i class="far fa-circle-user"></i> ${u.name}</div>`).join('');
  if (users.length === 0) picker.innerHTML = '<span style="color:var(--text3);font-size:.85rem">Chưa có người dùng</span>';
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
