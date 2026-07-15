<script>
// Các biến DOM Elements
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModal = document.querySelector('.close-modal');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const viewButtons = document.querySelectorAll('.view-btn');
const kanbanView = document.getElementById('kanban-view');
const listView = document.getElementById('list-view');
const ganttView = document.getElementById('gantt-view');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const assigneeFilter = document.getElementById('assignee-filter');
const dateFilter = document.getElementById('date-filter');
const addColumnTaskBtns = document.querySelectorAll('.add-column-task');

// Biến lưu trữ dữ liệu
let allTasks = [];
let users = [];
let isDataLoaded = false;
let loadingTimeout;
let currentGanttMonth = new Date().getMonth();
let currentGanttYear = new Date().getFullYear();

// Biến lưu trữ cache và thời gian hết hạn
let tasksCache = null;
let cacheTimestamp = 0;
const CACHE_EXPIRY = 60000; // Cache hết hạn sau 1 phút

// Hàng đợi các thao tác cập nhật
const updateQueue = [];
let isProcessingQueue = false;


// Dữ liệu cột
const taskColumns = {
  'inprogress': document.getElementById('inprogress-tasks'),
  'done': document.getElementById('done-tasks'),
  'overdue': document.getElementById('overdue-tasks'),
  'cancelled': document.getElementById('cancelled-tasks')
};

// Cập nhật số lượng công việc trong mỗi cột
function updateTaskCounts() {
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(column => {
    const taskList = column.querySelector('.task-list');
    const taskCount = column.querySelector('.task-count');
    // Chỉ đếm các task-item trực tiếp, không đếm subtasks
    const visibleTasks = Array.from(taskList.children).filter(item => 
      item.classList.contains('task-item') && 
      window.getComputedStyle(item).display !== 'none'
    );
    taskCount.textContent = visibleTasks.length;
  });
}

function formatDateDisplay(dateStr) {
  // Nếu đã đúng định dạng dd/MM/yyyy, trả về nguyên bản
  if (dateStr && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Nếu là ngày đầy đủ, chuyển về dd/MM/yyyy
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}
  
  return dateStr;
}

// Hiển thị loading overlay
function showLoading() {
  // Sử dụng loading nhỏ ở góc màn hình thay vì che toàn bộ
  if (!document.getElementById('corner-spinner')) {
    const cornerSpinner = document.createElement('div');
    cornerSpinner.id = 'corner-spinner';
    cornerSpinner.className = 'corner-spinner';
    cornerSpinner.innerHTML = '<div class="spinner-icon"></div><span>Đang tải...</span>';
    document.body.appendChild(cornerSpinner);
    
    // Hiệu ứng xuất hiện
    setTimeout(() => {
      cornerSpinner.classList.add('visible');
    }, 10);
  }
  
  // Tự động ẩn loading sau 20 giây nếu có lỗi
  clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => {
    hideLoading();
    showNotification('Quá thời gian tải dữ liệu, vui lòng tải lại trang', 'error');
    console.error('Loading timeout exceeded');
  }, 20000);
}

// Ẩn loading overlay
function hideLoading() {
  // Ẩn loading với hiệu ứng
  const cornerSpinner = document.getElementById('corner-spinner');
  if (cornerSpinner) {
    cornerSpinner.classList.remove('visible');
    setTimeout(() => {
      if (document.body.contains(cornerSpinner)) {
        document.body.removeChild(cornerSpinner);
      }
    }, 300);
  }
  
  clearTimeout(loadingTimeout);
}

// Thêm CSS cho loading góc
const cornerLoadingStyle = document.createElement('style');
cornerLoadingStyle.textContent = `
  .corner-spinner {
    position: fixed;
    bottom: 20px;
    left: 20px;
    padding: 8px 16px;
    background-color: rgba(69, 104, 220, 0.9);
    color: white;
    border-radius: 24px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateY(100%);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  .corner-spinner.visible {
    transform: translateY(0);
    opacity: 1;
  }
  
  .spinner-icon {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: corner-spin 0.8s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes corner-spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(cornerLoadingStyle);

// Thêm hiệu ứng skeleton loading cho các phần tử
function addSkeletonLoading(container) {
  container.querySelectorAll('.task-item, tr').forEach(item => {
    item.classList.add('skeleton-loading');
  });
  
  setTimeout(() => {
    container.querySelectorAll('.skeleton-loading').forEach(item => {
      item.classList.remove('skeleton-loading');
    });
  }, 800);
}

// CSS cho hiệu ứng skeleton
const skeletonStyle = document.createElement('style');
skeletonStyle.textContent = `
  .skeleton-loading {
    position: relative;
    overflow: hidden;
  }
  
  .skeleton-loading::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.3) 50%, 
      rgba(255, 255, 255, 0.1) 100%);
    animation: skeleton-wave 1.5s infinite;
    pointer-events: none;
  }
  
  @keyframes skeleton-wave {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
document.head.appendChild(skeletonStyle);

// Tải dữ liệu từ server
function loadData(skipShowLoading = false, callback = null) {
  const currentTime = new Date().getTime();
  const useCache = tasksCache && (currentTime - cacheTimestamp < CACHE_EXPIRY);
  
  // Nếu có dữ liệu trong cache và cache chưa hết hạn, sử dụng cache
  if (useCache) {
    console.log("Sử dụng dữ liệu từ cache...");
    // Render từ cache ngay lập tức để UI phản hồi nhanh
    renderTasks(tasksCache);
    
    if (callback && typeof callback === 'function') {
      callback();
    }
    
    // Tải dữ liệu từ server trong nền để cập nhật cache
    loadDataFromServer(true, true);
    return;
  }
  
  // Không có cache hoặc cache đã hết hạn, tải dữ liệu mới
  if (!skipShowLoading) {
    showLoading();
  }
  
  loadDataFromServer(skipShowLoading, false, callback);
}

// Hàm tải dữ liệu thực tế từ server
function loadDataFromServer(skipShowLoading = false, isSilentLoad = false, callback = null) {
  console.log("Bắt đầu tải dữ liệu từ server...");
  
  // Đặt timeout ngắn hơn cho API call
  setTimeout(() => {
    try {
      google.script.run
        .withSuccessHandler(function(result) {
          console.log("Đã nhận dữ liệu người dùng:", result);
          users = result || [];
          
          // Cập nhật UI người dùng 
          populateAssigneeSelector();
          
          // Tiếp tục tải dữ liệu công việc
          google.script.run
            .withSuccessHandler(function(tasks) {
              console.log("Đã nhận dữ liệu công việc:", tasks);
              allTasks = tasks || [];
              
              // Cập nhật cache
              tasksCache = [...allTasks];
              cacheTimestamp = new Date().getTime();
              
              // Chỉ render nếu không phải tải ngầm
              if (!isSilentLoad) {
                renderTasks(allTasks);
                
                // Kiểm tra công việc quá hạn
                checkOverdueTasksClient();
              }
              
              isDataLoaded = true;
              if (!skipShowLoading) {
                hideLoading();
              }
              
              // Gọi callback nếu có
              if (callback && typeof callback === 'function') {
                callback();
              }
            })
            .withFailureHandler(function(error) {
              handleDataError(error);
              if (callback && typeof callback === 'function') {
                callback();
              }
            })
            .getTasks();
        })
        .withFailureHandler(function(error) {
          handleDataError(error);
          if (callback && typeof callback === 'function') {
            callback();
          }
        })
        .getUsers();
    } catch (error) {
      handleDataError(error);
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  }, 50); // Giảm timeout xuống 50ms thay vì 200ms
}

// Thêm hàm để cập nhật cache cục bộ khi thay đổi một task
function updateTaskInCache(updatedTask) {
  if (!tasksCache) return;
  
  const index = tasksCache.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasksCache[index] = { ...updatedTask };
  }
}

// Thêm hàm để thêm task vào cache cục bộ
function addTaskToCache(newTask) {
  if (!tasksCache) return;
  
  tasksCache.push(newTask);
}

// Thêm hàm để xóa task khỏi cache cục bộ
function removeTaskFromCache(taskId) {
  if (!tasksCache) return;
  
  const index = tasksCache.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasksCache.splice(index, 1);
  }
}

function handleDataError(error) {
  console.error('Lỗi khi tải dữ liệu:', error);
  showNotification('Không thể tải dữ liệu. Vui lòng làm mới trang và kiểm tra quyền truy cập.', 'error');
  hideLoading();
  
  // Hiển thị dữ liệu mẫu để không trống rỗng
  allTasks = [];
  users = [];
  renderTasks([]);
}

// Thêm hàm xử lý lỗi
function handleDataError(error) {
  console.error('Lỗi khi tải dữ liệu:', error);
  showNotification('Không thể tải dữ liệu. Vui lòng làm mới trang và kiểm tra quyền truy cập.', 'error');
  hideLoading();
  
  // Hiển thị dữ liệu mẫu để không trống rỗng
  allTasks = [];
  users = [];
  renderTasks([]);
}

// Render tất cả công việc
function renderTasks(tasks) {
  console.log("Đang render", tasks.length, "công việc");
  
  // Xóa tất cả công việc hiện tại
  Object.values(taskColumns).forEach(column => {
    column.innerHTML = '';
  });
  
  // Render từng công việc vào cột tương ứng
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    const column = taskColumns[task.status];
    if (column) {
      column.appendChild(taskElement);
    } else {
      console.warn("Không tìm thấy cột cho trạng thái:", task.status);
    }
  });
  
  // Render cho chế độ xem danh sách
  renderListView(tasks);
  
  // Render cho chế độ xem Gantt
  renderGanttView(tasks);
  
  // Cập nhật số lượng công việc
  updateTaskCounts();
  
  // Khởi tạo lại kéo thả
  initDragAndDrop();
}

function populateAssigneeSelector() {
  const assigneeSelector = document.getElementById('assignee-selector');
  const assigneeFilter = document.getElementById('assignee-filter');
  
  // Xóa nội dung hiện tại
  assigneeSelector.innerHTML = '';
  
  // Giữ lại option đầu tiên của filter
  const defaultOption = assigneeFilter.options[0];
  assigneeFilter.innerHTML = '';
  assigneeFilter.appendChild(defaultOption);
  
  // Thêm người dùng vào cả hai nơi
  users.forEach(user => {
    // Thêm vào assignee selector (checkbox)
    const option = document.createElement('div');
    option.className = 'assignee-option';
    option.innerHTML = `
      <input type="checkbox" id="assignee-${user.id}" class="assignee-checkbox">
      <label for="assignee-${user.id}">${user.name}</label>
    `;
    assigneeSelector.appendChild(option);
    
    // Thêm vào assignee filter (dropdown)
    const filterOption = document.createElement('option');
    filterOption.value = user.id;
    filterOption.textContent = user.name;
    assigneeFilter.appendChild(filterOption);
  });
}

// Thêm các hàm tiện ích xử lý ngày tháng
function convertDateForDisplay(dateStr) {
  // Nếu không có ngày, trả về rỗng
  if (!dateStr) return '';
  
  // Nếu đã đúng định dạng dd/MM/yyyy, trả về nguyên bản
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Xử lý trường hợp các định dạng khác
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    console.error("Lỗi chuyển đổi ngày:", e);
  }
  
  return dateStr;
}

function convertDateForInput(dateStr) {
  // Nếu không có ngày, trả về rỗng
  if (!dateStr) return '';
  
  // Xử lý định dạng dd/MM/yyyy sang yyyy-MM-dd
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Đảm bảo các phần đều có 2 chữ số
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  
  // Xử lý các định dạng khác
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Lấy phần yyyy-MM-dd
    }
  } catch (e) {
    console.error("Lỗi chuyển đổi ngày:", e);
  }
  
  return '';
}

// Xử lý modal
function openTaskModal(isEdit = false, taskData = null, status = null) {
  populateAssigneeSelector();
  if (isEdit) {
    modalTitle.textContent = 'Chỉnh Sửa Công Việc';
    // Nếu là chỉnh sửa, điền dữ liệu vào form
    if (taskData) {
      document.getElementById('task-id').value = taskData.id || '';
      document.getElementById('task-title-input').value = taskData.title || '';
      document.getElementById('task-desc-input').value = taskData.description || '';
      document.getElementById('task-priority').value = taskData.priority || 'medium';
      document.getElementById('task-status').value = taskData.status || 'inprogress';
      
      // Sửa lại cách xử lý ngày tháng - chuyển đổi từ định dạng dd/mm/yyyy sang yyyy-mm-dd cho input date
      document.getElementById('task-start-date').value = convertDateForInput(taskData.startDate);
      document.getElementById('task-due-date').value = convertDateForInput(taskData.dueDate);
      
      // Xử lý người phụ trách
      const assigneeIds = taskData.assignees || [];
      document.querySelectorAll('.assignee-checkbox').forEach(checkbox => {
        checkbox.checked = assigneeIds.includes(checkbox.id.replace('assignee-', ''));
      });
      
      // Xử lý tệp đính kèm
      const attachmentsContainer = document.querySelector('.attachment-preview');
      attachmentsContainer.innerHTML = '';
      if (taskData.attachments && taskData.attachments.length > 0) {
        taskData.attachments.forEach(attachment => {
          addAttachmentPreview(attachment);
        });
      }
      
      // Xử lý công việc con
      const subtasksContainer = document.querySelector('.subtasks-list');
      subtasksContainer.innerHTML = '';
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        taskData.subtasks.forEach(subtask => {
          addSubtaskToList(subtask.text, subtask.completed);
        });
      }
    }
  } else {
    modalTitle.textContent = 'Thêm Công Việc Mới';
    taskForm.reset();
    document.getElementById('task-id').value = '';
    
    // Xóa tệp đính kèm và công việc con
    document.querySelector('.attachment-preview').innerHTML = '';
    document.querySelector('.subtasks-list').innerHTML = '';
    
    // Nếu có trạng thái được chỉ định, thiết lập trạng thái cho công việc mới
    if (status) {
      document.getElementById('task-status').value = status;
    }
  }
  
  taskModal.style.display = 'block';
  document.getElementById('task-title-input').focus();
}

function closeTaskModal() {
  // Đảm bảo reset nút Save về trạng thái ban đầu
  const saveButton = document.getElementById('save-task-btn');
  if (saveButton) {
    saveButton.innerHTML = 'Lưu';
    saveButton.disabled = false;
  }
  
  // Ẩn modal
  taskModal.style.display = 'none';
  
  // Reset form
  taskForm.reset();
  
  // Xóa tệp đính kèm và công việc con
  document.querySelector('.attachment-preview').innerHTML = '';
  document.querySelector('.subtasks-list').innerHTML = '';
}

// Tính năng kéo thả nâng cao
function initDragAndDrop() {
  const draggables = document.querySelectorAll('.task-item[draggable="true"]');
  const dropZones = document.querySelectorAll('.task-list:not(#overdue-tasks)'); // Không cho phép kéo vào "Quá Hạn"
  
  // Thiết lập cho các phần tử có thể kéo
  draggables.forEach(task => {
    task.addEventListener('dragstart', (e) => {
      task.classList.add('dragging');
      // Thêm hiệu ứng cho phần tử đang kéo
      setTimeout(() => {
        task.style.opacity = '0.4';
      }, 0);
      
      // Lưu ID của task đang kéo để sử dụng khi thả
      e.dataTransfer.setData('text/plain', task.dataset.id);
      
      // Hiệu ứng cho các vùng thả
      dropZones.forEach(zone => {
        zone.classList.add('highlight-drop-zone');
      });
    });
    
    task.addEventListener('dragend', () => {
      task.classList.remove('dragging');
      task.style.opacity = '1';
      
      // Kết thúc hiệu ứng cho các vùng thả
      dropZones.forEach(zone => {
        zone.classList.remove('highlight-drop-zone');
        zone.classList.remove('drag-over');
      });
      
      // Cập nhật trạng thái công việc sau khi kéo thả
      const newColumn = task.parentElement.id;
      const status = newColumn.split('-')[0]; // Lấy trạng thái từ ID của cột
      
      // Tìm công việc trong dữ liệu
      const taskId = task.dataset.id;
      const taskIndex = allTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        const taskData = allTasks[taskIndex];
        
        // Nếu trạng thái không thay đổi, không cần cập nhật
        if (taskData.status === status) {
          return;
        }
        
        // Cập nhật trạng thái - Cập nhật UI ngay lập tức
        const oldStatus = taskData.status;
        taskData.status = status;
        
        // Cập nhật trạng thái công việc trực tiếp trong mảng dữ liệu
        allTasks[taskIndex].status = status;
        
        // Cập nhật tiến độ nếu là cột hoàn thành
        if (status === 'done') {
          taskData.progress = 100;
          allTasks[taskIndex].progress = 100;
          
          // Đánh dấu tất cả công việc con là hoàn thành
          if (taskData.subtasks && taskData.subtasks.length > 0) {
            taskData.subtasks.forEach(subtask => {
              subtask.completed = true;
            });
            
            allTasks[taskIndex].subtasks = [...taskData.subtasks];
          }
          
          // Cập nhật giao diện
          const progressBar = task.querySelector('.progress');
          if (progressBar) {
            progressBar.style.width = '100%';
          }
          
          // Đánh dấu tất cả công việc con là hoàn thành trong giao diện
          const subtaskCheckboxes = task.querySelectorAll('.subtask-checkbox');
          subtaskCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
          });
        } else if (status === 'cancelled') {
          taskData.progress = 0;
          allTasks[taskIndex].progress = 0;
          
          // Cập nhật giao diện
          const progressBar = task.querySelector('.progress');
          if (progressBar) {
            progressBar.style.width = '0%';
          }
        }
        
        // Hiển thị thông báo ngay lập tức
        showNotification(`Đã chuyển công việc sang trạng thái ${getStatusText(status)}`, 'success');
        
        // Cập nhật cache
        updateTaskInCache(taskData);
        
        // Thêm vào hàng đợi để cập nhật lên server
        enqueueTaskUpdate(taskData, () => {
          console.log(`Đã cập nhật công việc ${taskId} thành công từ ${oldStatus} sang ${status}`);
        });
      }
      
      updateTaskCounts();
    });
  });
  
  // Thiết lập cho các vùng thả (phần code không thay đổi)
  dropZones.forEach(zone => {
    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });
    
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
      const afterElement = getDragAfterElement(zone, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (draggable) {
        if (afterElement == null) {
          zone.appendChild(draggable);
        } else {
          zone.insertBefore(draggable, afterElement);
        }
      }
    });
    
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      // Lấy ID của task được kéo
      const taskId = e.dataTransfer.getData('text/plain');
      const draggedTask = document.querySelector(`.task-item[data-id="${taskId}"]`);
      
      if (draggedTask) {
        // Thêm hiệu ứng
        draggedTask.classList.add('bounce');
        setTimeout(() => {
          draggedTask.classList.remove('bounce');
        }, 1000);
      }
    });
  });
}

// Hàm thêm task vào hàng đợi cập nhật
function enqueueTaskUpdate(taskData, callback) {
  updateQueue.push({
    task: taskData,
    callback: callback
  });
  
  if (!isProcessingQueue) {
    processUpdateQueue();
  }
}

// Hàm xử lý hàng đợi cập nhật
function processUpdateQueue() {
  if (updateQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  isProcessingQueue = true;
  const item = updateQueue.shift();
  
  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success) {
        if (item.callback) {
          item.callback();
        }
      } else {
        console.error('Lỗi khi cập nhật task:', result.message);
        showNotification(result.message || 'Có lỗi xảy ra khi cập nhật trạng thái', 'error', true);
      }
      
      // Xử lý item tiếp theo trong hàng đợi
      setTimeout(processUpdateQueue, 50);
    })
    .withFailureHandler(function(error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      showNotification('Lỗi khi cập nhật trạng thái: ' + error, 'error', true);
      
      // Vẫn tiếp tục xử lý queue ngay cả khi có lỗi
      setTimeout(processUpdateQueue, 50);
    })
    .updateTask(item.task);
}

// Hàm trợ giúp để xác định vị trí thả
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Thêm đoạn JavaScript này vào phần khởi tạo view Gantt
function initGanttScrollSync() {
  const sideBody = document.querySelector('.gantt-side-body');
  const timelineBody = document.querySelector('.gantt-timeline-body');
  
  if (sideBody && timelineBody) {
    // Đồng bộ cuộn dọc giữa hai phần
    sideBody.addEventListener('scroll', function() {
      timelineBody.scrollTop = sideBody.scrollTop;
    });
    
    timelineBody.addEventListener('scroll', function() {
      sideBody.scrollTop = timelineBody.scrollTop;
    });
  }
}

// Chuyển đổi giữa các chế độ xem
function switchView(viewType) {
  const views = {
    'kanban': kanbanView,
    'list': listView,
    'gantt': ganttView
  };
  
  // Ẩn tất cả view
  Object.values(views).forEach(view => {
    view.style.display = 'none';
  });
  
  // Hiển thị view được chọn
  views[viewType].style.display = viewType === 'kanban' ? 'flex' : 'block';
  
  // Cập nhật nút active
  viewButtons.forEach(btn => {
    if (btn.dataset.view === viewType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Thêm hiệu ứng khi chuyển đổi
  views[viewType].classList.add('fade-in');
  setTimeout(() => {
    views[viewType].classList.remove('fade-in');
  }, 500);
  
  // Lưu vào localStorage để duy trì khi tải lại trang
  localStorage.setItem('preferredView', viewType);
  if (viewType === 'gantt') {
   setTimeout(initGanttScrollSync, 300); // Chờ DOM render xong
  }
}

// Xử lý công việc con
function toggleSubtasks(taskElement) {
  const subtasks = taskElement.querySelector('.subtasks');
  if (subtasks) {
    if (subtasks.style.display === 'none') {
      subtasks.style.display = 'block';
      // Hiệu ứng mở rộng
      subtasks.classList.add('slide-down');
      setTimeout(() => {
        subtasks.classList.remove('slide-down');
      }, 300);
      // Thay đổi icon
      const toggleBtn = taskElement.querySelector('.toggle-subtasks i');
      toggleBtn.className = 'fas fa-chevron-down';
      toggleBtn.parentElement.classList.remove('collapsed');
    } else {
      // Hiệu ứng thu gọn
      subtasks.classList.add('slide-up');
      setTimeout(() => {
        subtasks.style.display = 'none';
        subtasks.classList.remove('slide-up');
      }, 300);
      // Thay đổi icon
      const toggleBtn = taskElement.querySelector('.toggle-subtasks i');
      toggleBtn.className = 'fas fa-chevron-right';
      toggleBtn.parentElement.classList.add('collapsed');
    }
  }
}

// Cập nhật tiến độ dựa trên công việc con
function updateTaskProgress(taskElement) {
  const subtasks = taskElement.querySelectorAll('.subtask-checkbox');
  if (subtasks.length === 0) return;
  
  const completedSubtasks = Array.from(subtasks).filter(checkbox => checkbox.checked).length;
  const progressPercent = Math.round((completedSubtasks / subtasks.length) * 100);
  
  const progressBar = taskElement.querySelector('.progress');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
    
    // Nếu tất cả công việc con hoàn thành, thì công việc chính cũng hoàn thành
    if (progressPercent === 100 && taskElement.parentElement.id !== 'done-tasks') {
      // Gợi ý người dùng chuyển sang trạng thái hoàn thành
      showNotification('Tất cả công việc con đã hoàn thành! Có thể chuyển sang trạng thái Hoàn Thành.', 'success');
    }
  }
  
  // Cập nhật biểu thị tiến độ trong chế độ xem danh sách
  const taskId = taskElement.dataset.id;
  const listViewRow = document.querySelector(`#task-table-body tr[data-id="${taskId}"]`);
  if (listViewRow) {
    const progressBarSmall = listViewRow.querySelector('.progress-bar-small .progress');
    const progressText = listViewRow.querySelector('.progress-bar-small span');
    if (progressBarSmall && progressText) {
      progressBarSmall.style.width = `${progressPercent}%`;
      progressText.textContent = `${progressPercent}%`;
    }
  }
  
  // Cập nhật trong Gantt view
  const ganttTaskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
  if (ganttTaskRow) {
    const ganttProgressBar = document.querySelector(`.gantt-timeline-row[data-id="${taskId}"] .gantt-progress`);
    if (ganttProgressBar) {
      ganttProgressBar.style.width = `${progressPercent}%`;
    }
  }
  
  // Cập nhật tiến độ trong dữ liệu
  const taskIndex = allTasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    const task = allTasks[taskIndex];
    
    // Cập nhật trạng thái của công việc con
    if (task.subtasks && task.subtasks.length > 0) {
      const checkboxes = Array.from(subtasks);
      task.subtasks.forEach((subtask, index) => {
        if (index < checkboxes.length) {
          subtask.completed = checkboxes[index].checked;
        }
      });
    }
    
    // Cập nhật tiến độ
    task.progress = progressPercent;
    
    // Gửi yêu cầu cập nhật đến server
    google.script.run
      .withSuccessHandler(function(result) {
        if (!result.success) {
          console.error('Lỗi khi cập nhật tiến độ:', result.message);
        }
      })
      .withFailureHandler(function(error) {
        console.error('Lỗi khi cập nhật tiến độ:', error);
      })
      .updateTask(task);
  }
}

// Tạo phần tử công việc HTML cho giao diện Kanban
function createTaskElement(task) {
  const taskEl = document.createElement('div');
  taskEl.className = 'task-item';
  taskEl.draggable = task.status !== 'overdue';
  taskEl.dataset.id = task.id;
  
  // Tạo HTML cho phần tử công việc
  let subtasksHtml = '';
  if (task.subtasks && task.subtasks.length > 0) {
    subtasksHtml = `
      <div class="subtasks">
        ${task.subtasks.map((subtask, index) => `
          <div class="subtask-item">
            <input type="checkbox" id="subtask-${task.id}-${index}" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
            <label for="subtask-${task.id}-${index}">${subtask.text}</label>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  let attachmentsHtml = '';
  if (task.attachments && task.attachments.length > 0) {
    attachmentsHtml = `
      <div class="attachments">
        ${task.attachments.map(attachment => {
          if (attachment.type === 'image') {
            return `
              <div class="attachment image-attachment">
                <img src="${attachment.url}" alt="${attachment.name}">
                <span>${attachment.name}</span>
              </div>
            `;
          } else {
            let iconClass = 'fa-file';
            if (attachment.name.endsWith('.pdf')) iconClass = 'fa-file-pdf';
            else if (attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx')) iconClass = 'fa-file-word';
            else if (attachment.name.endsWith('.xls') || attachment.name.endsWith('.xlsx')) iconClass = 'fa-file-excel';
            else if (attachment.name.endsWith('.json') || attachment.name.endsWith('.js') || attachment.name.endsWith('.html')) iconClass = 'fa-file-code';
            
            return `
              <div class="attachment file-attachment">
                <i class="far ${iconClass}"></i>
                <span>${attachment.name}</span>
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  }
  
  // Tạo HTML cho danh sách người phụ trách
  let assigneesHtml = '';
  if (task.assignees && task.assignees.length > 0) {
    const assigneeAvatars = task.assignees.map(assigneeId => {
      const user = users.find(u => u.id === assigneeId);
      return user ? `<div class="avatar" title="${user.name}">${user.initials}</div>` : '';
    }).join('');
    
    if (assigneeAvatars) {
      assigneesHtml = `
        <div class="assignee-avatars">
          ${assigneeAvatars}
        </div>
      `;
    }
  }
  
  // Xác định class cho progress bar
  let progressBarClass = '';
  if (task.status === 'cancelled') {
    progressBarClass = 'cancelled';
  }

    // Định dạng ngày tháng
  const formattedStartDate = formatDateDisplay(task.startDate);
  const formattedDueDate = formatDateDisplay(task.dueDate);
  
  taskEl.innerHTML = `
    <div class="task-header">
      <span class="priority ${task.priority}">${getPriorityText(task.priority)}</span>
      <div class="task-actions">
        <button class="edit-task"><i class="fas fa-edit"></i></button>
        <button class="delete-task"><i class="fas fa-trash"></i></button>
        ${subtasksHtml ? `<button class="toggle-subtasks"><i class="fas fa-chevron-down"></i></button>` : ''}
      </div>
    </div>
    <h4 class="task-title">${task.title}</h4>
    <p class="task-desc">${task.description || ''}</p>
    ${attachmentsHtml}
    ${subtasksHtml}
    <div class="task-footer">
      <div class="date-info">
        <span class="start-date"><i class="far fa-calendar-plus"></i> ${formattedStartDate || 'Không có'}</span>
        <span class="due-date${task.status === 'overdue' ? ' overdue' : ''}"><i class="far fa-calendar-${task.status === 'overdue' ? 'times' : 'check'}"></i> ${formattedDueDate || 'Không có'}</span>
      </div>
      <div class="assignees">
        ${assigneesHtml}
      </div>
    </div>
    <div class="progress-bar${progressBarClass ? ' ' + progressBarClass : ''}">
      <div class="progress" style="width: ${task.progress || 0}%"></div>
    </div>
  `;
  
  return taskEl;
}

// Render chế độ xem danh sách
function renderListView(tasks) {
  const tableBody = document.getElementById('task-table-body');
  tableBody.innerHTML = '';
  
  tasks.forEach(task => {
    // Tạo hàng chính
    const row = document.createElement('tr');
    row.dataset.id = task.id;
    
    // Tạo HTML cho người phụ trách
    let assigneesHtml = '';
    if (task.assignees && task.assignees.length > 0) {
      const assigneeAvatars = task.assignees.map(assigneeId => {
        const user = users.find(u => u.id === assigneeId);
        return user ? `<div class="avatar small" title="${user.name}">${user.initials}</div>` : '';
      }).join('');
      
      if (assigneeAvatars) {
        assigneesHtml = `
          <div class="assignee-list">
            ${assigneeAvatars}
          </div>
        `;
      }
    }
    
    // Tạo HTML cho tệp đính kèm CÓ KHẢ NĂNG CLICK ĐỂ XEM
    let attachmentsHtml = '';
    if (task.attachments && task.attachments.length > 0) {
      attachmentsHtml = task.attachments.map(attachment => {
        let iconClass = 'file';
        if (attachment.type === 'image') iconClass = 'image';
        else if (attachment.name.endsWith('.pdf')) iconClass = 'pdf';
        else if (attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx')) iconClass = 'word';
        else if (attachment.name.endsWith('.xls') || attachment.name.endsWith('.xlsx')) iconClass = 'excel';
        else if (attachment.name.endsWith('.json') || attachment.name.endsWith('.js') || attachment.name.endsWith('.html')) iconClass = 'code';
        
        // Thêm class viewable-attachment để có thể bắt sự kiện click
        return `<span class="attachment-icon ${iconClass} viewable-attachment" 
                    data-url="${attachment.url}" 
                    data-name="${attachment.name}" 
                    data-type="${attachment.type || iconClass}"
                    title="${attachment.name}">
                  <i class="far fa-${iconClass === 'image' ? 'image' : 'file-' + iconClass}"></i>
                </span>`;
      }).join('');
      
      attachmentsHtml = `<div class="attachments-cell">${attachmentsHtml}</div>`;
    }
    
    // Xác định class cho progress bar
    let progressBarClass = '';
    if (task.status === 'cancelled') {
      progressBarClass = 'cancelled';
    }
    
    row.innerHTML = `
      <td>${task.id.replace('task-', '')}</td>
      <td>
        <div class="task-title-cell">
          ${task.title}
          ${task.subtasks && task.subtasks.length > 0 ? `<button class="toggle-subtasks-btn"><i class="fas fa-chevron-down"></i></button>` : ''}
        </div>
      </td>
      <td>${task.description || ''}</td>
      <td><span class="priority-cell ${task.priority}">${getPriorityText(task.priority)}</span></td>
      <td>${assigneesHtml}</td>
      <td>${formatDateDisplay(task.startDate) || ''}</td>
      <td>${task.status === 'overdue' ? 
          `<span class="overdue">${formatDateDisplay(task.dueDate) || ''}</span>` : 
          (formatDateDisplay(task.dueDate) || '')}</td>
      <td><span class="status-cell ${task.status}">${getStatusText(task.status)}</span></td>
      <td>
        <div class="progress-bar-small ${progressBarClass}">
          <div class="progress" style="width: ${task.progress || 0}%"></div>
          <span>${task.progress || 0}%</span>
        </div>
      </td>
      <td>${attachmentsHtml}</td>
      <td class="action-cell">
        <button class="edit-task-btn"><i class="fas fa-edit"></i></button>
        <button class="delete-task-btn"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
    
    // Thêm hàng công việc con nếu có
    if (task.subtasks && task.subtasks.length > 0) {
      const subtaskRow = document.createElement('tr');
      subtaskRow.className = 'subtask-row';
      subtaskRow.dataset.parent = task.id;
      subtaskRow.style.display = 'none'; // Ẩn ban đầu
      
      const subtasksHtml = task.subtasks.map((subtask, index) => `
        <div class="subtask-row">
          <div class="subtask-checkbox">
            <input type="checkbox" id="list-subtask-${task.id}-${index}" ${subtask.completed ? 'checked' : ''}>
          </div>
          <div class="subtask-title">
            <label for="list-subtask-${task.id}-${index}">${subtask.text}</label>
          </div>
        </div>
      `).join('');
      
      subtaskRow.innerHTML = `
        <td></td>
        <td colspan="10">
          <div class="subtasks-table">
            ${subtasksHtml}
          </div>
        </td>
      `;
      
      tableBody.appendChild(subtaskRow);
    }
  });
  
  // Sau khi render, gắn sự kiện cho các tệp đính kèm
  attachViewableClickHandler();
}

// Hàm gắn sự kiện click cho các tệp đính kèm trong bảng
function attachViewableClickHandler() {
  const viewableAttachments = document.querySelectorAll('.viewable-attachment');
  viewableAttachments.forEach(attachment => {
    attachment.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const url = this.dataset.url;
      const name = this.dataset.name;
      const type = this.dataset.type;
      
      // Sử dụng modal viewer đã cài đặt trước đó
      openAttachment(url, name, type);
    });
  });
}

// Render chế độ xem Gantt
function renderGanttView(tasks) {
  const sideBody = document.querySelector('.gantt-side-body');
  const timelineBody = document.querySelector('.gantt-timeline-body');
  
  // Xóa nội dung hiện tại
  sideBody.innerHTML = '';
  timelineBody.innerHTML = '';
  
  // Loại bỏ bất kỳ khung viền nào xung quanh tiêu đề
  const allHeaders = document.querySelectorAll('.gantt-side-header, .gantt-task-header, .gantt-status-header');
  allHeaders.forEach(header => {
    header.style.border = 'none';
    header.style.outline = 'none';
    header.style.boxShadow = '0 1px 0 #e0e0e0';
  });
  
  // Tạo cấu trúc ngày tháng cho biểu đồ Gantt
  const daysContainer = document.querySelector('.gantt-days');
  daysContainer.innerHTML = '';
  
  // Lấy tháng được chọn
  const monthElement = document.querySelector('.gantt-month');
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  monthElement.textContent = `${monthNames[currentGanttMonth]}, ${currentGanttYear}`;
  
  // Lấy số ngày trong tháng
  const daysInMonth = new Date(currentGanttYear, currentGanttMonth + 1, 0).getDate();
  
  // Tạo các ô ngày
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentGanttYear, currentGanttMonth, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const dayElement = document.createElement('div');
    dayElement.className = `gantt-day${isWeekend ? ' weekend' : ''}`;
    dayElement.textContent = day;
    
    daysContainer.appendChild(dayElement);
  }
  
  // Render từng công việc
  tasks.forEach(task => {
    // Bỏ qua nếu không có ngày bắt đầu hoặc ngày kết thúc
    if (!task.startDate || !task.dueDate) return;
    
    try {
      let startDate, dueDate;
      
      // Xử lý định dạng dd/MM/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.startDate) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.dueDate)) {
        const startParts = task.startDate.split('/');
        const dueParts = task.dueDate.split('/');
        
        if (startParts.length === 3 && dueParts.length === 3) {
          startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
          dueDate = new Date(parseInt(dueParts[2]), parseInt(dueParts[1]) - 1, parseInt(dueParts[0]));
        } else {
          return; // Nếu không đủ 3 phần, bỏ qua
        }
      } else {
        // Thử parse cách khác nếu không phải định dạng dd/MM/yyyy
        startDate = new Date(task.startDate);
        dueDate = new Date(task.dueDate);
        
        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
          return; // Nếu không parse được, bỏ qua
        }
      }
      
      // Kiểm tra xem công việc có liên quan đến tháng hiện tại không
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const dueMonth = dueDate.getMonth();
      const dueYear = dueDate.getFullYear();
      
      // Kiểm tra xem công việc có nằm hoặc giao với tháng đang xem không
      const isVisible = (
        // Bắt đầu trong tháng hiện tại
        (startMonth === currentGanttMonth && startYear === currentGanttYear) ||
        // Kết thúc trong tháng hiện tại
        (dueMonth === currentGanttMonth && dueYear === currentGanttYear) ||
        // Bắt đầu trước và kết thúc sau tháng hiện tại
        (
          (startYear < currentGanttYear || (startYear === currentGanttYear && startMonth < currentGanttMonth)) &&
          (dueYear > currentGanttYear || (dueYear === currentGanttYear && dueMonth > currentGanttMonth))
        )
      );
      
      if (!isVisible) return;
      
      // Tính vị trí và độ rộng của thanh Gantt
      let startDay = 1;
      let endDay = daysInMonth;
      
      // Nếu startDate trong tháng hiện tại
      if (startMonth === currentGanttMonth && startYear === currentGanttYear) {
        startDay = startDate.getDate();
      }
      
      // Nếu dueDate trong tháng hiện tại
      if (dueMonth === currentGanttMonth && dueYear === currentGanttYear) {
        endDay = dueDate.getDate();
      }
      
      // Tính % vị trí bắt đầu và độ rộng
      const leftPosition = ((startDay - 1) / daysInMonth) * 100;
      const width = Math.max(((endDay - startDay + 1) / daysInMonth) * 100, 2); // tối thiểu 2% để nhìn thấy
      
      // Tạo HTML cho người phụ trách trên thanh Gantt
      let assigneesHtml = '';
      if (task.assignees && task.assignees.length > 0) {
        assigneesHtml = '<div class="gantt-bar-assignees">';
        
        task.assignees.forEach(assigneeId => {
          const user = users.find(u => u.id === assigneeId);
          if (user) {
            assigneesHtml += `<div class="gantt-bar-avatar" title="${user.name}">${user.initials}</div>`;
          }
        });
        
        assigneesHtml += '</div>';
      }
      
      // THÊM MỚI: Tạo HTML cho tệp đính kèm trên thanh Gantt
      let attachmentsHtml = '';
      if (task.attachments && task.attachments.length > 0) {
        attachmentsHtml = '<div class="gantt-bar-attachments">';
        
        task.attachments.forEach(attachment => {
          let iconClass = 'file';
          if (attachment.type === 'image') iconClass = 'image';
          else if (attachment.name.endsWith('.pdf')) iconClass = 'pdf';
          else if (attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx')) iconClass = 'word';
          else if (attachment.name.endsWith('.xls') || attachment.name.endsWith('.xlsx')) iconClass = 'excel';
          else if (attachment.name.endsWith('.json') || attachment.name.endsWith('.js') || attachment.name.endsWith('.html')) iconClass = 'code';
          
          attachmentsHtml += `
            <div class="gantt-bar-attachment viewable-attachment" 
                 data-url="${attachment.url}" 
                 data-name="${attachment.name}" 
                 data-type="${attachment.type || iconClass}"
                 title="${attachment.name}">
              <i class="far fa-${iconClass === 'image' ? 'image' : 'file-' + iconClass}"></i>
            </div>
          `;
        });
        
        attachmentsHtml += '</div>';
      }
      
      // Tạo hàng cho công việc trong bảng bên trái
      const taskRow = document.createElement('div');
      taskRow.className = 'gantt-task-row';
      taskRow.dataset.id = task.id;
      
      taskRow.innerHTML = `
        <div class="gantt-task-cell">
          <div class="gantt-task-title">
            <span class="task-expander expanded"><i class="fas fa-caret-down"></i></span>
            <span class="priority ${task.priority}"></span>
            ${task.title}
          </div>
        </div>
        <div class="gantt-status-cell">
          <span class="status-cell ${task.status}">${getStatusText(task.status)}</span>
        </div>
      `;
      
      sideBody.appendChild(taskRow);
      
      // Tạo hàng trong biểu đồ Gantt
      const timelineRow = document.createElement('div');
      timelineRow.className = 'gantt-timeline-row';
      timelineRow.dataset.id = task.id;
      
      timelineRow.innerHTML = `
        <div class="gantt-bar-container">
          <div class="gantt-bar ${task.status}" style="left: ${leftPosition}%; width: ${width}%;" 
              data-start="${convertDateForDisplay(task.startDate)}" 
              data-end="${convertDateForDisplay(task.dueDate)}">
            <div class="gantt-bar-label">${convertDateForDisplay(task.startDate)}-${convertDateForDisplay(task.dueDate)}</div>
            <div class="gantt-progress" style="width: ${task.progress || 0}%"></div>
            ${assigneesHtml}
            ${attachmentsHtml}
          </div>
        </div>
      `;
      
      timelineBody.appendChild(timelineRow);
      
      // Thêm công việc con
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((subtask, index) => {
          // Thêm hàng trong bảng bên trái
          const subtaskRow = document.createElement('div');
          subtaskRow.className = 'gantt-subtask-row';
          subtaskRow.dataset.parent = task.id;
          
          subtaskRow.innerHTML = `
            <div class="gantt-task-cell">
              <div class="gantt-subtask-title">
                <input type="checkbox" id="gantt-subtask-${task.id}-${index}" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <label for="gantt-subtask-${task.id}-${index}">${subtask.text}</label>
              </div>
            </div>
            <div class="gantt-status-cell"></div>
          `;
          
          sideBody.appendChild(subtaskRow);
          
          // Thêm hàng trong biểu đồ Gantt
          const subtaskTimelineRow = document.createElement('div');
          subtaskTimelineRow.className = 'gantt-timeline-row subtask';
          subtaskTimelineRow.dataset.parent = task.id;
          
          timelineBody.appendChild(subtaskTimelineRow);
        });
      }
    } catch (e) {
      console.error("Lỗi xử lý dữ liệu ngày tháng cho task:", task.id, e);
    }
  });
  
  // Khởi tạo tương tác cho biểu đồ Gantt
  initGanttChart();
  
  // Thêm sự kiện click cho tệp đính kèm trong Gantt
  attachViewableClickHandler();
}

// Thêm CSS cho hiển thị tệp đính kèm trong Gantt
function addAttachmentStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Cải thiện hiển thị tệp đính kèm trong bảng */
    .attachments-cell {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    
    .attachment-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      background-color: #f5f7fa;
      color: #4568dc;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .attachment-icon:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    }
    
    .attachment-icon.image { background-color: #e3f2fd; color: #1976d2; }
    .attachment-icon.pdf { background-color: #ffebee; color: #d32f2f; }
    .attachment-icon.word { background-color: #e3f2fd; color: #1976d2; }
    .attachment-icon.excel { background-color: #e8f5e9; color: #388e3c; }
    .attachment-icon.code { background-color: #fff8e1; color: #ff8f00; }
    
    /* Hiển thị tệp đính kèm trong Gantt */
    .gantt-bar-attachments {
      position: absolute;
      bottom: -20px;
      left: 0;
      display: flex;
      gap: 3px;
    }
    
    .gantt-bar-attachment {
      width: 20px;
      height: 20px;
      background-color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      color: #4568dc;
      border: 1px solid #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      transition: transform 0.2s;
      z-index: 10;
      cursor: pointer;
    }
    
    .gantt-bar-attachment:hover {
      transform: translateY(2px) scale(1.1);
      z-index: 11;
    }
    
    /* Điều chỉnh vị trí người phụ trách khi có cả tệp đính kèm */
    .gantt-bar-assignees {
      top: -20px;
    }
  `;
  
  document.head.appendChild(style);
}

// Thêm CSS khi trang đã load
document.addEventListener('DOMContentLoaded', function() {
  addViewerModalToDOM();
  initAttachmentViewer();
  addAttachmentStyles();
  initUserManagement();
});

// Thêm ngay nếu trang đã load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function() {
    addAttachmentStyles();
  }, 1);
}

// Thêm hàm điều hướng tháng
function navigateGanttMonth(direction) {
  // direction: -1 cho prev, 1 cho next
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
  
  // Render lại biểu đồ Gantt với tháng mới
  renderGanttView(allTasks);
}

// Khởi tạo sự kiện cho nút prev/next
function initMonthNavigation() {
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');
  
  if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener('click', () => navigateGanttMonth(-1));
    nextMonthBtn.addEventListener('click', () => navigateGanttMonth(1));
  }
}

// Chuyển đổi giá trị ưu tiên thành text
function getPriorityText(priority) {
  switch(priority) {
    case 'high': return 'Cao';
    case 'medium': return 'Trung bình';
    case 'low': return 'Thấp';
    default: return 'Trung bình';
  }
}

// Chuyển đổi giá trị trạng thái thành text
function getStatusText(status) {
  switch(status) {
    case 'inprogress': return 'Đang Thực Hiện';
    case 'done': return 'Hoàn Thành';
    case 'overdue': return 'Quá Hạn';
    case 'cancelled': return 'Đã Huỷ';
    default: return 'Đang Thực Hiện';
  }
}

// Tìm kiếm công việc
function searchTasks() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    // Nếu ô tìm kiếm trống, hiển thị lại tất cả công việc
    renderTasks(allTasks);
    return;
  }
  
  // Hiển thị hiệu ứng loading
  showLoading();
  
  // Gửi yêu cầu tìm kiếm đến server
  google.script.run
    .withSuccessHandler(function(filteredTasks) {
      renderTasks(filteredTasks);
      
      // Thông báo kết quả tìm kiếm
      if (filteredTasks.length === 0) {
        showNotification(`Không tìm thấy công việc nào với từ khóa "${searchTerm}"`, 'warning');
      } else {
        showNotification(`Đã tìm thấy ${filteredTasks.length} công việc phù hợp`, 'success');
      }
      
      hideLoading();
    })
    .withFailureHandler(function(error) {
      console.error('Lỗi khi tìm kiếm:', error);
      showNotification('Lỗi khi tìm kiếm: ' + error, 'error');
      hideLoading();
    })
    .filterTasks({ keyword: searchTerm });
}

// Áp dụng bộ lọc
function applyFilters() {
  const assigneeValue = assigneeFilter.value;
  const dateValue = dateFilter.value;
  
  // Nếu không có bộ lọc nào được áp dụng, hiển thị tất cả
  if (!assigneeValue && !dateValue) {
    renderTasks(allTasks);
    return;
  }
  
  showLoading();
  
  // Chuyển đổi ngày từ yyyy-mm-dd sang định dạng mà server hiểu
  let formattedDate = null;
  if (dateValue) {
    const dateObj = new Date(dateValue);
    formattedDate = dateObj.toISOString().split('T')[0]; // Định dạng yyyy-mm-dd
  }
  
  // Gửi yêu cầu lọc đến server
  google.script.run
    .withSuccessHandler(function(filteredTasks) {
      renderTasks(filteredTasks);
      
      // Thông báo kết quả lọc
      if (filteredTasks.length === 0) {
        showNotification('Không tìm thấy công việc nào phù hợp với bộ lọc', 'warning');
      } else {
        showNotification(`Đang hiển thị ${filteredTasks.length} công việc phù hợp với bộ lọc`, 'success');
      }
      
      hideLoading();
    })
    .withFailureHandler(function(error) {
      console.error('Lỗi khi lọc:', error);
      showNotification('Lỗi khi lọc: ' + error, 'error');
      hideLoading();
    })
    .filterTasks({
      assignee: assigneeValue,
      startDate: formattedDate
    });
}

// Format ngày từ input date sang dd/mm/yyyy
function formatDate(dateString) {
  if (!dateString) return '';
  
  // Nếu đã là định dạng dd/mm/yyyy, trả về nguyên bản
  if (dateString.includes('/')) return dateString;
  
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

// Xử lý tệp đính kèm
// function handleAttachmentTypeChange(selectElement) {
//   const fileInput = selectElement.parentElement.querySelector('.attachment-file');
//   const urlInput = selectElement.parentElement.querySelector('.attachment-url');
  
//   if (selectElement.value === 'file') {
//     fileInput.style.display = 'block';
//     urlInput.style.display = 'none';
//   } else {
//     fileInput.style.display = 'none';
//     urlInput.style.display = 'block';
//   }
// }

// Thêm hàng nhập tệp đính kèm mới
function addAttachmentRow() {
  const container = document.querySelector('.attachment-inputs');
  const newRow = document.createElement('div');
  newRow.className = 'attachment-input-row';
  newRow.innerHTML = `
    <select class="attachment-type" onchange="handleAttachmentTypeChange(this)">
      <option value="file">Tệp</option>
      <option value="url">URL</option>
    </select>
    <input type="file" class="attachment-file">
    <input type="text" class="attachment-url" placeholder="Nhập URL" style="display: none;">
    <button type="button" class="add-attachment-btn remove-row"><i class="fas fa-minus"></i></button>
  `;
  
  container.appendChild(newRow);
  
  // Thêm sự kiện cho nút xóa
  newRow.querySelector('.remove-row').addEventListener('click', function() {
    container.removeChild(newRow);
  });
}

// Thêm preview tệp đính kèm
function addAttachmentPreview(attachment) {
  const container = document.querySelector('.attachment-preview');
  const previewItem = document.createElement('div');
  previewItem.className = 'preview-item';
  
  if (attachment.type === 'image') {
    previewItem.innerHTML = `
      <img src="${attachment.url}" alt="${attachment.name}">
      <span class="preview-name">${attachment.name}</span>
      <button class="remove-preview"><i class="fas fa-times"></i></button>
    `;
  } else {
    let iconClass = 'fa-file';
    if (attachment.name.endsWith('.pdf')) iconClass = 'fa-file-pdf';
    else if (attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx')) iconClass = 'fa-file-word';
    else if (attachment.name.endsWith('.xls') || attachment.name.endsWith('.xlsx')) iconClass = 'fa-file-excel';
    else if (attachment.name.endsWith('.json') || attachment.name.endsWith('.js') || attachment.name.endsWith('.html')) iconClass = 'fa-file-code';
    
    previewItem.innerHTML = `
      <i class="far ${iconClass}"></i>
      <span class="preview-name">${attachment.name}</span>
      <button class="remove-preview"><i class="fas fa-times"></i></button>
    `;
  }
  
  container.appendChild(previewItem);
  
  // Thêm sự kiện cho nút xóa
  previewItem.querySelector('.remove-preview').addEventListener('click', function() {
    container.removeChild(previewItem);
  });
}

// Thêm công việc con vào danh sách
function addSubtaskToList(text, completed = false) {
  const container = document.querySelector('.subtasks-list');
  const listItem = document.createElement('div');
  listItem.className = 'subtask-list-item';
  
  listItem.innerHTML = `
    <input type="checkbox" class="subtask-checkbox" ${completed ? 'checked' : ''}>
    <span class="subtask-text">${text}</span>
    <button class="remove-subtask"><i class="fas fa-times"></i></button>
  `;
  
  container.appendChild(listItem);
  
  // Thêm sự kiện cho nút xóa
  listItem.querySelector('.remove-subtask').addEventListener('click', function() {
    container.removeChild(listItem);
  });
}

// Hiển thị thông báo
function showNotification(message, type = 'success', isSmall = false) {
  // Kiểm tra xem đã có thông báo nào đang hiển thị chưa
  const existingNotification = document.querySelector('.notification' + (isSmall ? '.small-notification' : ':not(.small-notification)'));
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}${isSmall ? ' small-notification' : ''}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Hiệu ứng hiển thị
  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 400);
    }, isSmall ? 1500 : 3000);
  }, 10);
}

// Thêm CSS cho thông báo nhỏ
const smallNotificationStyle = document.createElement('style');
smallNotificationStyle.textContent = `
  .small-notification {
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    color: white;
    font-size: 0.8rem;
    font-weight: 400;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(100%) scale(0.9);
    opacity: 0.9;
    z-index: 900;
  }
  
  .small-notification.show {
    transform: translateY(0) scale(1);
  }
`;
document.head.appendChild(smallNotificationStyle);

// Khởi tạo biểu đồ Gantt
function initGanttChart() {
  // Xử lý mở/đóng công việc con
  const expanders = document.querySelectorAll('.task-expander');
  expanders.forEach(expander => {
    expander.addEventListener('click', function() {
      const taskId = this.closest('.gantt-task-row').dataset.id;
      const subtasks = document.querySelectorAll(`.gantt-subtask-row[data-parent="${taskId}"]`);
      const subtaskTimelineRows = document.querySelectorAll(`.gantt-timeline-row.subtask[data-parent="${taskId}"]`);
      
      if (this.classList.contains('expanded')) {
        // Thu gọn
        this.classList.remove('expanded');
        this.classList.add('collapsed');
        this.querySelector('i').className = 'fas fa-caret-right';
        
        subtasks.forEach(row => {
          row.style.display = 'none';
        });
        
        subtaskTimelineRows.forEach(row => {
          row.style.display = 'none';
        });
      } else {
        // Mở rộng
        this.classList.remove('collapsed');
        this.classList.add('expanded');
        this.querySelector('i').className = 'fas fa-caret-down';
        
        subtasks.forEach(row => {
          row.style.display = 'flex';
        });
        
        subtaskTimelineRows.forEach(row => {
          row.style.display = 'block';
        });
      }
    });
  });
  
  // Xử lý hover hiển thị thông tin chi tiết
  const ganttBars = document.querySelectorAll('.gantt-bar');
  ganttBars.forEach(bar => {
    bar.addEventListener('mouseover', function() {
      const taskId = this.closest('.gantt-timeline-row').dataset.id;
      const taskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
      if (taskRow) {
        taskRow.classList.add('highlight');
      }
    });
    
    bar.addEventListener('mouseout', function() {
      const taskId = this.closest('.gantt-timeline-row').dataset.id;
      const taskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
      if (taskRow) {
        taskRow.classList.remove('highlight');
      }
    });
  });
  
  // Kéo/thả biểu đồ Gantt để cuộn theo trục thời gian
  const ganttTimeline = document.querySelector('.gantt-timeline');
  let isScrolling = false;
  let startX, scrollLeft;
  
  ganttTimeline.addEventListener('mousedown', function(e) {
    if (e.target.closest('.gantt-bar')) return; // Không kéo nếu đang kéo thanh công việc
    
    isScrolling = true;
    startX = e.pageX - ganttTimeline.offsetLeft;
    scrollLeft = ganttTimeline.scrollLeft;
    ganttTimeline.style.cursor = 'grabbing';
  });
  
  ganttTimeline.addEventListener('mouseleave', function() {
    isScrolling = false;
    ganttTimeline.style.cursor = 'auto';
  });
  
  ganttTimeline.addEventListener('mouseup', function() {
    isScrolling = false;
    ganttTimeline.style.cursor = 'auto';
  });
  
  ganttTimeline.addEventListener('mousemove', function(e) {
    if (!isScrolling) return;
    e.preventDefault();
    
    const x = e.pageX - ganttTimeline.offsetLeft;
    const walk = (x - startX) * 2; // Tốc độ cuộn
    ganttTimeline.scrollLeft = scrollLeft - walk;
  });
}

// Sự kiện DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {

  updateDateFilterLabel();
  // Tải dữ liệu từ server
  loadData();

  // Thêm sự kiện điều hướng tháng
  initMonthNavigation();
  
  // Khởi tạo các chức năng
  initDragAndDrop();
  
  // Sự kiện modal
  addTaskBtn.addEventListener('click', () => {
    // Đảm bảo người dùng đã được tải trước khi mở modal
    populateAssigneeSelector();
    openTaskModal(false);
  });

  const dueDateInput = document.getElementById('task-due-date');
  if (dueDateInput) {
    dueDateInput.addEventListener('change', function() {
      // Chỉ cập nhật dữ liệu mà không thay đổi trạng thái
      const taskId = document.getElementById('task-id').value;
      if (taskId) {
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          // Cập nhật ngày kết thúc trong dữ liệu tạm thời
          const formattedDate = formatDate(this.value);
          allTasks[taskIndex].dueDate = formattedDate;
        }
      }
    });
  }

  // Sự kiện modal
  addTaskBtn.addEventListener('click', () => openTaskModal(false));
  closeModal.addEventListener('click', closeTaskModal);
  cancelTaskBtn.addEventListener('click', closeTaskModal);
  
  // Chuyển đổi chế độ xem
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });
  
  // Thiết lập sự kiện cho bộ lọc realtime
  setupFilterEvents();
  
  // Thiết lập nút Refresh
  setupRefreshButton();
  
  // Thêm công việc từ nút + trong cột
  addColumnTaskBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;
      openTaskModal(false, null, status);
    });
  });
  
  // Xử lý form
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Hiển thị loading chỉ trên nút submit thay vì full screen
  const saveButton = document.getElementById('save-task-btn');
  const originalButtonText = saveButton.innerHTML;
  saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
  saveButton.disabled = true;
  
  // Thu thập dữ liệu từ form
  const taskId = document.getElementById('task-id').value;
  const isEdit = taskId !== '';
  
  // Chuyển đổi ngày tháng từ yyyy-mm-dd sang dd/mm/yyyy
  const startDateInput = document.getElementById('task-start-date').value;
  const dueDateInput = document.getElementById('task-due-date').value;
  
  const taskData = {
    id: taskId,
    title: document.getElementById('task-title-input').value,
    description: document.getElementById('task-desc-input').value,
    priority: document.getElementById('task-priority').value,
    status: document.getElementById('task-status').value,
    startDate: formatDate(startDateInput),
    dueDate: formatDate(dueDateInput),
    
    // Thu thập người phụ trách
    assignees: Array.from(document.querySelectorAll('.assignee-checkbox:checked')).map(
      checkbox => checkbox.id.replace('assignee-', '')
    ),
    
    // Thu thập tệp đính kèm
    attachments: Array.from(document.querySelectorAll('.preview-item')).map(item => {
      const isImage = item.querySelector('img') !== null;
      return {
        type: isImage ? 'image' : 'file',
        name: item.querySelector('.preview-name').textContent,
        url: isImage ? item.querySelector('img').src : '#'
      };
    }),
    
    // Thu thập công việc con
    subtasks: Array.from(document.querySelectorAll('.subtasks-list .subtask-list-item')).map(item => {
      return {
        text: item.querySelector('.subtask-text').textContent,
        completed: item.querySelector('.subtask-checkbox').checked
      };
    })
  };
  
  // Kiểm tra quá hạn trước khi gửi đến server
  const wasUpdatedToOverdue = checkAndUpdateOverdueStatus(taskData, !isEdit);
  
  if (isEdit) {
    // Cập nhật lạc quan - Cập nhật UI trước khi gửi đến server
    updateLocalTaskData(taskData);
    
    // QUAN TRỌNG: Khôi phục nút lưu về trạng thái ban đầu trước khi đóng modal
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    
    // Đóng modal ngay lập tức để cải thiện UX
    closeTaskModal();
    
    // Hiển thị thông báo ngay lập tức
    showNotification('Đã cập nhật công việc thành công!', 'success');
    
    // Gửi dữ liệu đến server trong nền
    google.script.run
      .withSuccessHandler(function(result) {
        if (!result.success) {
          console.error('Lỗi khi cập nhật công việc:', result.message);
          showNotification(result.message || 'Có lỗi xảy ra khi cập nhật công việc', 'error', true);
          
          // Tải lại dữ liệu nếu cập nhật thất bại
          loadData(true);
        } else {
          // Cập nhật cache
          updateTaskInCache(taskData);
        }
      })
      .withFailureHandler(function(error) {
        console.error('Lỗi khi cập nhật công việc:', error);
        showNotification('Lỗi khi cập nhật công việc: ' + error, 'error', true);
        loadData(true);
      })
      .updateTask(taskData);
  } else {
    // Thêm mới công việc
    
    // QUAN TRỌNG: Khôi phục nút lưu về trạng thái ban đầu trước khi đóng modal
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    
    // Đóng modal ngay
    closeTaskModal();
    
    // Thêm task tạm thời vào UI với ID tạm (sẽ được cập nhật sau)
    const tempId = 'temp-' + new Date().getTime();
    taskData.id = tempId;
    
    // Thêm vào danh sách công việc
    allTasks.push(taskData);
    
    // Render lại UI
    renderTasks(allTasks);
    
    // Hiển thị thông báo ngay lập tức
    showNotification('Đang thêm công việc mới...', 'success');
    
    // Gửi dữ liệu đến server trong nền
    google.script.run
      .withSuccessHandler(function(result) {
        if (result.success) {
          // Cập nhật ID thực từ server
          updateTempTaskId(tempId, result.taskId);
          
          // Hiển thị thông báo thành công
          showNotification('Đã thêm công việc mới thành công!', 'success');
          
          // Cập nhật cache sau khi đã có ID thực
          const updatedTask = { ...taskData, id: result.taskId };
          addTaskToCache(updatedTask);
        } else {
          // Xóa task tạm khỏi UI
          removeTaskFromUI(tempId);
          
          showNotification(result.message || 'Có lỗi xảy ra khi thêm công việc mới', 'error', true);
        }
      })
      .withFailureHandler(function(error) {
        // Xóa task tạm khỏi UI
        removeTaskFromUI(tempId);
        
        console.error('Lỗi khi thêm công việc mới:', error);
        showNotification('Lỗi khi thêm công việc mới: ' + error, 'error', true);
      })
      .addTask(taskData);
  }
});

// Hàm cập nhật ID tạm thành ID thực
function updateTempTaskId(tempId, realId) {
  // Cập nhật trong mảng dữ liệu
  const taskIndex = allTasks.findIndex(t => t.id === tempId);
  if (taskIndex !== -1) {
    allTasks[taskIndex].id = realId;
  }
  
  // Cập nhật trong DOM
  const taskElement = document.querySelector(`.task-item[data-id="${tempId}"]`);
  if (taskElement) {
    taskElement.dataset.id = realId;
  }
  
  // Cập nhật trong chế độ xem List
  const listViewRow = document.querySelector(`#task-table-body tr[data-id="${tempId}"]`);
  if (listViewRow) {
    listViewRow.dataset.id = realId;
    
    // Cập nhật cả ID hiển thị nếu có
    const idCell = listViewRow.querySelector('td:first-child');
    if (idCell) {
      idCell.textContent = realId.replace('task-', '');
    }
  }
  
  // Cập nhật trong chế độ xem Gantt
  const ganttTaskRow = document.querySelector(`.gantt-task-row[data-id="${tempId}"]`);
  if (ganttTaskRow) {
    ganttTaskRow.dataset.id = realId;
  }
  
  const ganttTimelineRow = document.querySelector(`.gantt-timeline-row[data-id="${tempId}"]`);
  if (ganttTimelineRow) {
    ganttTimelineRow.dataset.id = realId;
  }
}

// Hàm xóa task tạm khỏi UI
function removeTaskFromUI(taskId) {
  // Xóa khỏi mảng dữ liệu
  const taskIndex = allTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    allTasks.splice(taskIndex, 1);
  }
  
  // Xóa khỏi DOM
  const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.remove();
  }
  
  // Xóa khỏi chế độ xem List
  const listViewRow = document.querySelector(`#task-table-body tr[data-id="${taskId}"]`);
  if (listViewRow) {
    listViewRow.remove();
  }
  
  // Xóa khỏi chế độ xem Gantt
  const ganttTaskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
  if (ganttTaskRow) {
    ganttTaskRow.remove();
  }
  
  const ganttTimelineRow = document.querySelector(`.gantt-timeline-row[data-id="${taskId}"]`);
  if (ganttTimelineRow) {
    ganttTimelineRow.remove();
  }
  
  // Cập nhật số lượng công việc
  updateTaskCounts();
}

// Hàm cập nhật dữ liệu công việc trong local data và UI
function updateLocalTaskData(taskData) {
  // Tìm vị trí công việc trong mảng allTasks
  const taskIndex = allTasks.findIndex(t => t.id === taskData.id);
  if (taskIndex === -1) return;
  
  // Cập nhật trong mảng dữ liệu
  allTasks[taskIndex] = { ...taskData };
  
  // Cập nhật task riêng lẻ trong UI thay vì render lại toàn bộ
  // (Hàm mới để cập nhật một task cụ thể)
  updateTaskElementInUI(taskData);
}

  // Cập nhật placeholder cho input date
const dateFilter = document.getElementById('date-filter');
if (dateFilter) {
  dateFilter.setAttribute('placeholder', 'Lọc theo ngày hoạt động');
}
  
  // Xử lý tệp đính kèm
document.querySelector('.add-attachment-btn').addEventListener('click', function() {
  const inputRow = this.closest('.attachment-input-row');
  const urlInput = inputRow.querySelector('.attachment-url');
  
  if (urlInput.value.trim() !== '') {
    const url = urlInput.value.trim();
    
    // Hiển thị loading
    showLoading();
    
    // Xử lý URL
    google.script.run
      .withSuccessHandler(function(result) {
        if (result.success) {
          // Thêm preview
          addAttachmentPreview(result.fileInfo);
          
          // Reset input sau khi thêm
          urlInput.value = '';
        } else {
          showNotification(result.message || 'Có lỗi xảy ra khi thêm URL', 'error');
        }
        hideLoading();
      })
      .withFailureHandler(function(error) {
        console.error('Lỗi khi thêm URL:', error);
        showNotification('Lỗi khi thêm URL: ' + error, 'error');
        hideLoading();
      })
      .uploadFile(url);
  } else {
    showNotification('Vui lòng nhập URL', 'warning');
  }
});
  
  // Xử lý thêm công việc con
  document.querySelector('.add-subtask-btn').addEventListener('click', function() {
    const inputElement = document.querySelector('.subtask-title-input');
    const subtaskText = inputElement.value.trim();
    
    if (subtaskText !== '') {
      addSubtaskToList(subtaskText);
      inputElement.value = '';
    }
  });
  
  // Xử lý các nút thao tác nhanh và sự kiện
  document.addEventListener('click', (e) => {
    // Nút chỉnh sửa
    if (e.target.closest('.edit-task') || e.target.closest('.edit-task-btn')) {
      // Tìm công việc
      const taskItem = e.target.closest('.task-item') || e.target.closest('tr');
      
      if (taskItem) {
        const taskId = taskItem.dataset.id;
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
          openTaskModal(true, allTasks[taskIndex]);
        }
      }
    }
    // Nút xóa
    else if (e.target.closest('.delete-task') || e.target.closest('.delete-task-btn')) {
      if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        // Lấy phần tử được click từ bất kỳ chế độ xem nào
        const taskItem = e.target.closest('.task-item') || e.target.closest('tr');
        if (taskItem) {
          const taskId = taskItem.dataset.id;
          
          // Tìm và lưu trữ tạm thời thông tin công việc để khôi phục nếu cần
          const taskIndex = allTasks.findIndex(t => t.id === taskId);
          const deletedTask = taskIndex !== -1 ? { ...allTasks[taskIndex] } : null;
          
          // Xóa khỏi mảng dữ liệu
          if (taskIndex !== -1) {
            allTasks.splice(taskIndex, 1);
          }
          
          // Xóa khỏi cache nếu có
          removeTaskFromCache(taskId);
          
          // Bắt đầu xóa UI với hiệu ứng
          // 1. Xóa khỏi chế độ xem Kanban
          const kanbanTaskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
          if (kanbanTaskItem) {
            kanbanTaskItem.classList.add('shake');
            setTimeout(() => {
              kanbanTaskItem.style.height = '0';
              kanbanTaskItem.style.opacity = '0';
              kanbanTaskItem.style.margin = '0';
              kanbanTaskItem.style.padding = '0';
              
              setTimeout(() => {
                if (kanbanTaskItem.parentElement) {
                  kanbanTaskItem.parentElement.removeChild(kanbanTaskItem);
                }
              }, 300);
            }, 300);
          }
          
          // 2. Xóa khỏi chế độ xem Danh sách (List view) - LUÔN LUÔN THỰC HIỆN
          const listViewRow = document.querySelector(`#task-table-body tr[data-id="${taskId}"]`);
          if (listViewRow) {
            // Áp dụng hiệu ứng xóa
            listViewRow.classList.add('shake');
            setTimeout(() => {
              listViewRow.style.height = '0';
              listViewRow.style.opacity = '0';
              listViewRow.style.margin = '0';
              listViewRow.style.padding = '0';
              
              setTimeout(() => {
                if (listViewRow.parentElement) {
                  listViewRow.parentElement.removeChild(listViewRow);
                }
                
                // Xóa hàng subtask liên quan trong List view
                const subtaskRow = document.querySelector(`tr.subtask-row[data-parent="${taskId}"]`);
                if (subtaskRow && subtaskRow.parentElement) {
                  subtaskRow.style.height = '0';
                  subtaskRow.style.opacity = '0';
                  setTimeout(() => {
                    if (subtaskRow.parentElement) {
                      subtaskRow.parentElement.removeChild(subtaskRow);
                    }
                  }, 200);
                }
              }, 300);
            }, 300);
          }
          
          // 3. Xóa khỏi chế độ xem Gantt
          const ganttTaskRow = document.querySelector(`.gantt-task-row[data-id="${taskId}"]`);
          if (ganttTaskRow && ganttTaskRow.parentElement) {
            ganttTaskRow.classList.add('shake');
            setTimeout(() => {
              ganttTaskRow.style.opacity = '0';
              setTimeout(() => {
                ganttTaskRow.parentElement.removeChild(ganttTaskRow);
              }, 300);
            }, 300);
          }
          
          const ganttTimelineRow = document.querySelector(`.gantt-timeline-row[data-id="${taskId}"]`);
          if (ganttTimelineRow && ganttTimelineRow.parentElement) {
            ganttTimelineRow.style.opacity = '0';
            setTimeout(() => {
              ganttTimelineRow.parentElement.removeChild(ganttTimelineRow);
            }, 300);
          }
          
          // Xóa các hàng subtask trong Gantt view
          const ganttSubtaskRows = document.querySelectorAll(`.gantt-subtask-row[data-parent="${taskId}"]`);
          ganttSubtaskRows.forEach(row => {
            if (row.parentElement) {
              row.style.opacity = '0';
              setTimeout(() => {
                row.parentElement.removeChild(row);
              }, 300);
            }
          });
          
          const ganttSubtaskTimelineRows = document.querySelectorAll(`.gantt-timeline-row.subtask[data-parent="${taskId}"]`);
          ganttSubtaskTimelineRows.forEach(row => {
            if (row.parentElement) {
              row.style.opacity = '0';
              setTimeout(() => {
                row.parentElement.removeChild(row);
              }, 300);
            }
          });
          
          // Cập nhật số lượng công việc
          updateTaskCounts();
          
          // Hiển thị thông báo
          showNotification('Đã xóa công việc thành công!', 'success');
          
          // Gửi yêu cầu xóa đến server trong nền (không hiển thị loading)
          google.script.run
            .withSuccessHandler(function(result) {
              if (!result.success) {
                console.error('Lỗi khi xóa công việc:', result.message);
                showNotification(result.message || 'Có lỗi xảy ra khi xóa công việc. Đang khôi phục...', 'error');
                
                // Khôi phục lại công việc trong trường hợp lỗi
                if (deletedTask) {
                  allTasks.push(deletedTask);
                  
                  // Thêm lại vào cache
                  if (tasksCache) {
                    tasksCache.push(deletedTask);
                  }
                  
                  // Tải lại dữ liệu UI
                  renderTasks(allTasks);
                }
              }
            })
            .withFailureHandler(function(error) {
              console.error('Lỗi khi xóa công việc:', error);
              showNotification('Lỗi khi xóa công việc: ' + error + '. Đang khôi phục...', 'error');
              
              // Khôi phục lại công việc trong trường hợp lỗi
              if (deletedTask) {
                allTasks.push(deletedTask);
                
                // Thêm lại vào cache
                if (tasksCache) {
                  tasksCache.push(deletedTask);
                }
                
                // Tải lại dữ liệu UI
                renderTasks(allTasks);
              }
            })
            .deleteTask(taskId);
        }
      }
    }

    // Nút toggle công việc con (trong Kanban)
    else if (e.target.closest('.toggle-subtasks')) {
      const taskItem = e.target.closest('.task-item');
      if (taskItem) {
        toggleSubtasks(taskItem);
      }
    }
    // Toggle hiển thị công việc con (trong List view)
    else if (e.target.closest('.toggle-subtasks-btn')) {
      const row = e.target.closest('tr');
      const subtaskRow = row.nextElementSibling;
      if (subtaskRow && subtaskRow.classList.contains('subtask-row')) {
        const toggleBtn = e.target.closest('.toggle-subtasks-btn');
        if (subtaskRow.style.display === 'none') {
          subtaskRow.style.display = '';
          toggleBtn.querySelector('i').className = 'fas fa-chevron-down';
        } else {
          subtaskRow.style.display = 'none';
          toggleBtn.querySelector('i').className = 'fas fa-chevron-right';
        }
      }
    }
  });
  
  // Xử lý checkbox công việc con
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('subtask-checkbox') || 
        (e.target.type === 'checkbox' && (e.target.closest('.subtask-row') || e.target.closest('.subtasks-table')))) {
      // Xác định task ID và subtask index
      let taskId, subtaskIndex;
      const isChecked = e.target.checked;
      
      // Xác định từ chế độ xem nào
      if (e.target.closest('.task-item')) {
        // Từ Kanban view
        const parentElement = e.target.closest('.task-item');
        taskId = parentElement.dataset.id;
        
        // Tìm index của subtask này
        const allCheckboxes = parentElement.querySelectorAll('.subtask-checkbox');
        subtaskIndex = Array.from(allCheckboxes).indexOf(e.target);
        
        console.log("Thay đổi từ Kanban:", taskId, subtaskIndex, isChecked);
      } 
      else if (e.target.closest('.subtask-row')) {
        // Từ List view - Cải thiện selector này
        let subtaskElement = e.target.closest('.subtask-row');
        
        // Tìm tr.subtask-row gốc có chứa data-parent
        while (subtaskElement && !subtaskElement.dataset.parent) {
          subtaskElement = subtaskElement.closest('tr.subtask-row') || 
                          subtaskElement.parentElement.closest('.subtask-row');
        }
        
        if (subtaskElement && subtaskElement.dataset.parent) {
          taskId = subtaskElement.dataset.parent;
          
          // Xác định index bằng vị trí của checkbox trong tất cả các checkbox của công việc con
          // Tìm tất cả checkbox trong hàng subtask
          const allCheckboxesInRow = Array.from(subtaskElement.querySelectorAll('input[type="checkbox"]'));
          subtaskIndex = allCheckboxesInRow.indexOf(e.target);
          
          // Nếu không tìm thấy trực tiếp, hãy tìm theo vị trí của div.subtask-row
          if (subtaskIndex === -1) {
            const subTaskContainer = e.target.closest('.subtask-row');
            const allSubTaskContainers = Array.from(subtaskElement.querySelectorAll('.subtask-row'));
            subtaskIndex = allSubTaskContainers.indexOf(subTaskContainer);
          }
          
          console.log("Thay đổi từ Danh sách:", taskId, subtaskIndex, isChecked);
        }
      }
      else if (e.target.closest('.gantt-subtask-row')) {
        // Từ Gantt view
        const subtaskRow = e.target.closest('.gantt-subtask-row');
        taskId = subtaskRow.dataset.parent;
        
        // Lấy tất cả gantt subtask row của task này
        const ganttSubtaskRows = document.querySelectorAll(`.gantt-subtask-row[data-parent="${taskId}"]`);
        subtaskIndex = Array.from(ganttSubtaskRows).indexOf(subtaskRow);
        
        console.log("Thay đổi từ Gantt:", taskId, subtaskIndex, isChecked);
      }
      
      // Nếu có đủ thông tin, đồng bộ hóa
      if (taskId !== undefined && subtaskIndex !== -1) {
        // Áp dụng hiệu ứng pulse ngay lập tức
        e.target.classList.add('pulse-effect');
        setTimeout(() => {
          e.target.classList.remove('pulse-effect');
        }, 1000);
        
        // Đồng bộ hóa trên tất cả các chế độ xem
        syncSubtaskCheckboxes(taskId, subtaskIndex, isChecked);
      } else {
        console.warn("Không thể xác định taskId hoặc subtaskIndex:", taskId, subtaskIndex);
        
        // Thử phương pháp xác định khác nếu đang ở chế độ danh sách
        if (document.querySelector('#list-view').style.display !== 'none') {
          // Thử tìm kiếm dựa trên ID của checkbox
          const checkboxId = e.target.id;
          if (checkboxId && checkboxId.startsWith('list-subtask-')) {
            // Format dự kiến: list-subtask-{taskId}-{index}
            const parts = checkboxId.split('-');
            if (parts.length >= 4) {
              // Lấy taskId từ phần giữa
              taskId = parts.slice(2, parts.length - 1).join('-');
              // Lấy index từ phần cuối
              subtaskIndex = parseInt(parts[parts.length - 1], 10);
              
              console.log("Xác định qua ID:", taskId, subtaskIndex, isChecked);
              
              if (!isNaN(subtaskIndex)) {
                syncSubtaskCheckboxes(taskId, subtaskIndex, isChecked);
              }
            }
          }
        }
      }
    }
  });
  
  // Khôi phục chế độ xem từ localStorage nếu có
  const savedView = localStorage.getItem('preferredView');
  if (savedView) {
    switchView(savedView);
  }
  
  // Thêm hiệu ứng di chuột cho các cột
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(column => {
    column.addEventListener('mouseenter', function() {
      this.classList.add('pulse');
    });
    
    column.addEventListener('mouseleave', function() {
      this.classList.remove('pulse');
    });
  });
});


// Hàm lọc dữ liệu phía client
function filterTasksClientSide() {
  // Lấy các giá trị lọc
  const assigneeValue = assigneeFilter.value;
  const dateValue = dateFilter.value;
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // Nếu không có bộ lọc nào được áp dụng, hiển thị tất cả
  if (!assigneeValue && !dateValue && !searchTerm) {
    renderTasks(allTasks);
    return;
  }
  
  // Lọc dữ liệu từ mảng allTasks
  let filteredTasks = [...allTasks];
  
  // Lọc theo người phụ trách
  if (assigneeValue) {
    filteredTasks = filteredTasks.filter(task => 
      task.assignees && task.assignees.includes(assigneeValue)
    );
  }
  
  // Lọc theo ngày - LOGIC MỚI
  if (dateValue) {
    // Convert dateValue từ yyyy-MM-dd sang đối tượng Date
    const filterDate = new Date(dateValue);
    // Đặt giờ về 00:00:00 để so sánh chính xác ngày
    filterDate.setHours(0, 0, 0, 0);
    
    filteredTasks = filteredTasks.filter(task => {
      // Nếu không có ngày bắt đầu và kết thúc, bỏ qua
      if (!task.startDate && !task.dueDate) return false;
      
      // Parse ngày bắt đầu của task
      let taskStartDate = null;
      if (task.startDate) {
        // Xử lý định dạng dd/MM/yyyy
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.startDate)) {
          const parts = task.startDate.split('/');
          if (parts.length === 3) {
            taskStartDate = new Date(
              parseInt(parts[2]), // năm
              parseInt(parts[1]) - 1, // tháng (0-11)
              parseInt(parts[0]) // ngày
            );
            taskStartDate.setHours(0, 0, 0, 0);
          }
        } else {
          // Thử parse cách khác
          taskStartDate = new Date(task.startDate);
          taskStartDate.setHours(0, 0, 0, 0);
        }
      }
      
      // Parse ngày kết thúc của task
      let taskDueDate = null;
      if (task.dueDate) {
        // Xử lý định dạng dd/MM/yyyy
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.dueDate)) {
          const parts = task.dueDate.split('/');
          if (parts.length === 3) {
            taskDueDate = new Date(
              parseInt(parts[2]), // năm
              parseInt(parts[1]) - 1, // tháng (0-11)
              parseInt(parts[0]) // ngày
            );
            // Đặt về cuối ngày để bao gồm cả ngày kết thúc
            taskDueDate.setHours(23, 59, 59, 999);
          }
        } else {
          // Thử parse cách khác
          taskDueDate = new Date(task.dueDate);
          taskDueDate.setHours(23, 59, 59, 999);
        }
      }

      // Logic mới: Kiểm tra xem ngày lọc có nằm trong khoảng thời gian
      // của công việc hay không
      
      // TH1: Chỉ có ngày bắt đầu, không có ngày kết thúc
      if (taskStartDate && !taskDueDate) {
        return filterDate >= taskStartDate;
      }
      
      // TH2: Chỉ có ngày kết thúc, không có ngày bắt đầu
      if (!taskStartDate && taskDueDate) {
        return filterDate <= taskDueDate;
      }
      
      // TH3: Có cả ngày bắt đầu và kết thúc
      if (taskStartDate && taskDueDate) {
        return filterDate >= taskStartDate && filterDate <= taskDueDate;
      }
      
      return false;
    });
  }
  
  // Lọc theo từ khóa tìm kiếm
  if (searchTerm) {
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      (task.subtasks && task.subtasks.some(sub => sub.text.toLowerCase().includes(searchTerm)))
    );
  }
  
  // Render kết quả lọc
  renderTasks(filteredTasks);
  
  // Hiển thị thông báo kết quả
  if (filteredTasks.length === 0) {
    showNotification('Không tìm thấy công việc nào phù hợp với điều kiện lọc', 'warning');
  } else if (filteredTasks.length < allTasks.length) {
    showNotification(`Đang hiển thị ${filteredTasks.length} công việc phù hợp`, 'success');
  }
}

// Cập nhật label của bộ lọc ngày để rõ ràng hơn
function updateDateFilterLabel() {
  const dateFilterLabel = document.querySelector('label[for="date-filter"]');
  if (dateFilterLabel) {
    dateFilterLabel.textContent = "Ngày hoạt động:";
  } else {
    // Nếu không tìm thấy label, tạo tooltip hoặc placeholder
    const dateFilterInput = document.getElementById('date-filter');
    if (dateFilterInput) {
      dateFilterInput.setAttribute('placeholder', 'Lọc theo ngày hoạt động');
      dateFilterInput.setAttribute('title', 'Hiển thị các công việc đang diễn ra vào ngày này');
    }
  }
}

// Cập nhật sự kiện cho các bộ lọc
function setupFilterEvents() {
  // Bộ lọc người phụ trách
  assigneeFilter.addEventListener('change', filterTasksClientSide);
  
  // Bộ lọc ngày
  dateFilter.addEventListener('change', filterTasksClientSide);
  
  // Ô tìm kiếm - lọc khi gõ
  searchInput.addEventListener('input', debounce(filterTasksClientSide, 300));
  
  // Nút tìm kiếm
  searchBtn.addEventListener('click', filterTasksClientSide);
  
  // Enter trong ô tìm kiếm
  searchInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      filterTasksClientSide();
    }
  });
}

// Hàm debounce để tránh gọi quá nhiều lần khi người dùng gõ
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// JavaScript để xử lý sự kiện nút Refresh
function setupRefreshButton() {
  const refreshBtn = document.getElementById('refresh-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      // Thêm hiệu ứng quay
      this.classList.add('rotating');
      
      // Hiệu ứng skeleton cho các task hiện tại trước khi tải mới
      Object.values(taskColumns).forEach(column => {
        addSkeletonLoading(column);
      });
      
      const listViewBody = document.getElementById('task-table-body');
      if (listViewBody) {
        addSkeletonLoading(listViewBody);
      }
      
      // Sử dụng cache ban đầu nếu có - hiển thị ngay
      const useCache = tasksCache !== null;
      
      // Tải lại dữ liệu
      loadData(true, () => {
        // Xóa hiệu ứng sau khi tải xong
        setTimeout(() => {
          this.classList.remove('rotating');
          showNotification('Đã tải lại dữ liệu thành công!', 'success');
        }, 500);
      });
    });
  }
}

function checkOverdueTasksClient() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác
  
  let hasChanges = false;
  
  // Lặp qua tất cả công việc
  allTasks.forEach(task => {
    // Bỏ qua nếu đã hoàn thành, hủy hoặc đã quá hạn
    if (task.status === 'done' || task.status === 'cancelled' || task.status === 'overdue') {
      return;
    }
    
    // Chuyển đổi ngày kết thúc sang đối tượng Date
    let dueDate = null;
    if (task.dueDate) {
      // Xử lý định dạng dd/MM/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(task.dueDate)) {
        const parts = task.dueDate.split('/');
        if (parts.length === 3) {
          dueDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          dueDate.setHours(0, 0, 0, 0); // Đặt về đầu ngày
        }
      } else {
        // Thử parse cách khác nếu không phải định dạng dd/MM/yyyy
        dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
      }
    }
    
    // Nếu có ngày kết thúc và đã quá hạn
    if (dueDate && dueDate < today) {
      console.log(`Công việc ${task.id} quá hạn: ${task.dueDate} < ${today.toLocaleDateString()}`);
      // Cập nhật trạng thái trong dữ liệu
      task.status = 'overdue';
      hasChanges = true;
      
      // Gửi yêu cầu cập nhật đến server (không hiển thị loading)
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            console.log("Đã cập nhật công việc " + task.id + " thành quá hạn");
          }
        })
        .updateTask(task);
    }
  });
  
  // Nếu có thay đổi, render lại UI
  if (hasChanges) {
    renderTasks(allTasks);
    showNotification("Đã cập nhật trạng thái công việc quá hạn", "warning");
  }
}

// Hàm kiểm tra và cập nhật trạng thái quá hạn ngay lập tức
// Sửa hàm checkAndUpdateOverdueStatus để cập nhật cả ngày hiển thị

function checkAndUpdateOverdueStatus(taskData, isNewTask = false) {
  // Nếu đã là quá hạn, hoàn thành hoặc đã hủy thì không cần kiểm tra
  if (taskData.status === 'overdue' || taskData.status === 'done' || taskData.status === 'cancelled') {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt về đầu ngày
  
  let dueDate = null;
  if (taskData.dueDate) {
    // Xử lý định dạng dd/MM/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(taskData.dueDate)) {
      const parts = taskData.dueDate.split('/');
      if (parts.length === 3) {
        dueDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        dueDate.setHours(0, 0, 0, 0);
      }
    } else {
      // Thử parse cách khác
      dueDate = new Date(taskData.dueDate);
      dueDate.setHours(0, 0, 0, 0);
    }
  }
  
  // Nếu có ngày kết thúc và đã quá hạn
  if (dueDate && dueDate < today) {
    console.log(`Phát hiện công việc ${taskData.id} quá hạn: ${taskData.dueDate} < ${today.toLocaleDateString()}`);
    
    // Cập nhật trạng thái
    taskData.status = 'overdue';
    
    // Cập nhật UI ngay lập tức nếu không phải là task mới
    if (!isNewTask) {
      // Tìm phần tử task trong DOM
      const taskElement = document.querySelector(`.task-item[data-id="${taskData.id}"]`);
      if (taskElement) {
        // Tìm cột quá hạn
        const overdueColumn = document.getElementById('overdue-tasks');
        if (overdueColumn) {
          // Di chuyển task sang cột quá hạn
          overdueColumn.appendChild(taskElement);
          
          // Cập nhật số lượng công việc trong cột
          updateTaskCounts();
          
          // Thêm hiệu ứng highlight
          taskElement.classList.add('highlight-overdue');
          setTimeout(() => {
            taskElement.classList.remove('highlight-overdue');
          }, 2000);
          
          // QUAN TRỌNG: Cập nhật hiển thị ngày trong card
          const startDateEl = taskElement.querySelector('.start-date');
          const dueDateEl = taskElement.querySelector('.due-date');
          
          if (startDateEl && taskData.startDate) {
            startDateEl.innerHTML = `<i class="far fa-calendar-plus"></i> ${taskData.startDate}`;
          }
          
          if (dueDateEl && taskData.dueDate) {
            // Thêm class overdue và cập nhật nội dung
            dueDateEl.className = 'due-date overdue';
            dueDateEl.innerHTML = `<i class="far fa-calendar-times"></i> ${taskData.dueDate}`;
          }
          
          // Thông báo
          showNotification(`Công việc "${taskData.title}" đã chuyển sang trạng thái Quá Hạn`, 'warning');
        }
      }
      
      // Cập nhật trong chế độ List view
      const listViewRow = document.querySelector(`#task-table-body tr[data-id="${taskData.id}"]`);
      if (listViewRow) {
        const statusCell = listViewRow.querySelector('td:nth-child(8)'); // Cột trạng thái
        if (statusCell) {
          statusCell.innerHTML = '<span class="status-cell overdue">Quá Hạn</span>';
        }
        
        // Cập nhật cột ngày bắt đầu và kết thúc
        const startDateCell = listViewRow.querySelector('td:nth-child(6)');
        const dueDateCell = listViewRow.querySelector('td:nth-child(7)');
        
        if (startDateCell && taskData.startDate) {
          startDateCell.textContent = taskData.startDate;
        }
        
        if (dueDateCell && taskData.dueDate) {
          dueDateCell.innerHTML = `<span class="overdue">${taskData.dueDate}</span>`;
        }
      }
      
      // Cập nhật trong chế độ Gantt
      const ganttRow = document.querySelector(`.gantt-task-row[data-id="${taskData.id}"]`);
      if (ganttRow) {
        const statusCell = ganttRow.querySelector('.gantt-status-cell');
        if (statusCell) {
          statusCell.innerHTML = '<span class="status-cell overdue">Quá Hạn</span>';
        }
        
        // Cập nhật thanh Gantt
        const ganttBar = document.querySelector(`.gantt-timeline-row[data-id="${taskData.id}"] .gantt-bar`);
        if (ganttBar) {
          ganttBar.className = ganttBar.className.replace(/inprogress|done|cancelled/g, 'overdue');
          
          // Cập nhật label của thanh
          const barLabel = ganttBar.querySelector('.gantt-bar-label');
          if (barLabel) {
            barLabel.textContent = `${taskData.startDate}-${taskData.dueDate}`;
          }
          
          // Cập nhật data attributes
          ganttBar.dataset.start = taskData.startDate;
          ganttBar.dataset.end = taskData.dueDate;
        }
      }
    }
    
    // Cập nhật trong dữ liệu
    const taskIndex = allTasks.findIndex(t => t.id === taskData.id);
    if (taskIndex !== -1) {
      allTasks[taskIndex].status = 'overdue';
    }
    
    return true;
  }
  
  return false;
}


// Thêm CSS cho hiệu ứng highlight khi chuyển trạng thái
const style = document.createElement('style');
style.textContent = `
  @keyframes overdueHighlight {
    0% { background-color: rgba(255, 86, 86, 0.2); }
    50% { background-color: rgba(255, 86, 86, 0.4); }
    100% { background-color: rgba(255, 86, 86, 0.2); }
  }
  
  .highlight-overdue {
    animation: overdueHighlight 1s ease infinite;
  }
`;
document.head.appendChild(style);

// Cập nhật một phần tử công việc cụ thể trong UI thay vì render lại toàn bộ
function updateTaskElementInUI(taskData) {
  // Cập nhật trong chế độ xem Kanban
  const taskElement = document.querySelector(`.task-item[data-id="${taskData.id}"]`);
  if (taskElement) {
    // Cập nhật tiêu đề và mô tả
    taskElement.querySelector('.task-title').textContent = taskData.title;
    
    const descElement = taskElement.querySelector('.task-desc');
    if (descElement) {
      descElement.textContent = taskData.description || '';
    }
    
    // Cập nhật độ ưu tiên
    const priorityElement = taskElement.querySelector('.priority');
    if (priorityElement) {
      priorityElement.className = `priority ${taskData.priority}`;
      priorityElement.textContent = getPriorityText(taskData.priority);
    }
    
    // Cập nhật ngày tháng
    const startDateElement = taskElement.querySelector('.start-date');
    if (startDateElement) {
      startDateElement.innerHTML = `<i class="far fa-calendar-plus"></i> ${formatDateDisplay(taskData.startDate) || 'Không có'}`;
    }
    
    const dueDateElement = taskElement.querySelector('.due-date');
    if (dueDateElement) {
      dueDateElement.className = `due-date${taskData.status === 'overdue' ? ' overdue' : ''}`;
      dueDateElement.innerHTML = `<i class="far fa-calendar-${taskData.status === 'overdue' ? 'times' : 'check'}"></i> ${formatDateDisplay(taskData.dueDate) || 'Không có'}`;
    }
    
    // Cập nhật người phụ trách
    const assigneesContainer = taskElement.querySelector('.assignee-avatars');
    if (assigneesContainer) {
      assigneesContainer.innerHTML = '';
      
      if (taskData.assignees && taskData.assignees.length > 0) {
        taskData.assignees.forEach(assigneeId => {
          const user = users.find(u => u.id === assigneeId);
          if (user) {
            const avatarElement = document.createElement('div');
            avatarElement.className = 'avatar';
            avatarElement.title = user.name;
            avatarElement.textContent = user.initials;
            assigneesContainer.appendChild(avatarElement);
          }
        });
      }
    }
    
    // Cập nhật tiến độ
    const progressBar = taskElement.querySelector('.progress');
    if (progressBar) {
      progressBar.style.width = `${taskData.progress || 0}%`;
    }
    
    // Cập nhật công việc con nếu có
    const subtasksContainer = taskElement.querySelector('.subtasks');
    if (subtasksContainer && taskData.subtasks && taskData.subtasks.length > 0) {
      subtasksContainer.innerHTML = taskData.subtasks.map((subtask, index) => `
        <div class="subtask-item">
          <input type="checkbox" id="subtask-${taskData.id}-${index}" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
          <label for="subtask-${taskData.id}-${index}">${subtask.text}</label>
        </div>
      `).join('');
    }
    
    // Cập nhật tệp đính kèm nếu có
    const attachmentsContainer = taskElement.querySelector('.attachments');
    if (attachmentsContainer && taskData.attachments && taskData.attachments.length > 0) {
      attachmentsContainer.innerHTML = taskData.attachments.map(attachment => {
        if (attachment.type === 'image') {
          return `
            <div class="attachment image-attachment">
              <img src="${attachment.url}" alt="${attachment.name}">
              <span>${attachment.name}</span>
            </div>
          `;
        } else {
          let iconClass = 'fa-file';
          if (attachment.name.endsWith('.pdf')) iconClass = 'fa-file-pdf';
          else if (attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx')) iconClass = 'fa-file-word';
          else if (attachment.name.endsWith('.xls') || attachment.name.endsWith('.xlsx')) iconClass = 'fa-file-excel';
          else if (attachment.name.endsWith('.json') || attachment.name.endsWith('.js') || attachment.name.endsWith('.html')) iconClass = 'fa-file-code';
          
          return `
            <div class="attachment file-attachment">
              <i class="far ${iconClass}"></i>
              <span>${attachment.name}</span>
            </div>
          `;
        }
      }).join('');
    }
    
    // Cập nhật trạng thái (có thể cần di chuyển sang cột khác)
    if (taskElement.parentElement.id !== `${taskData.status}-tasks`) {
      const targetColumn = document.getElementById(`${taskData.status}-tasks`);
      if (targetColumn) {
        targetColumn.appendChild(taskElement);
        updateTaskCounts();
      }
    }
  }
  
  // Cập nhật trong chế độ xem List
  const listViewRow = document.querySelector(`#task-table-body tr[data-id="${taskData.id}"]`);
  if (listViewRow) {
    // Cập nhật từng ô
    const cells = listViewRow.querySelectorAll('td');
    if (cells.length >= 10) {
      // Tiêu đề
      cells[1].querySelector('.task-title-cell').textContent = taskData.title;
      
      // Mô tả
      cells[2].textContent = taskData.description || '';
      
      // Ưu tiên
      cells[3].innerHTML = `<span class="priority-cell ${taskData.priority}">${getPriorityText(taskData.priority)}</span>`;
      
      // Người phụ trách
      let assigneesHtml = '';
      if (taskData.assignees && taskData.assignees.length > 0) {
        assigneesHtml = '<div class="assignee-list">';
        taskData.assignees.forEach(assigneeId => {
          const user = users.find(u => u.id === assigneeId);
          if (user) {
            assigneesHtml += `<div class="avatar small" title="${user.name}">${user.initials}</div>`;
          }
        });
        assigneesHtml += '</div>';
      }
      cells[4].innerHTML = assigneesHtml;
      
      // Ngày bắt đầu
      cells[5].textContent = formatDateDisplay(taskData.startDate) || '';
      
      // Ngày kết thúc
      if (taskData.status === 'overdue') {
        cells[6].innerHTML = `<span class="overdue">${formatDateDisplay(taskData.dueDate) || ''}</span>`;
      } else {
        cells[6].textContent = formatDateDisplay(taskData.dueDate) || '';
      }
      
      // Trạng thái
      cells[7].innerHTML = `<span class="status-cell ${taskData.status}">${getStatusText(taskData.status)}</span>`;
      
      // Tiến độ
      const progressClass = taskData.status === 'cancelled' ? ' cancelled' : '';
      cells[8].innerHTML = `
        <div class="progress-bar-small${progressClass}">
          <div class="progress" style="width: ${taskData.progress || 0}%"></div>
          <span>${taskData.progress || 0}%</span>
        </div>
      `;
    }
    
    // Cập nhật công việc con nếu có
    const subtaskRow = listViewRow.nextElementSibling;
    if (subtaskRow && subtaskRow.classList.contains('subtask-row')) {
      const subtasksTable = subtaskRow.querySelector('.subtasks-table');
      if (subtasksTable && taskData.subtasks && taskData.subtasks.length > 0) {
        subtasksTable.innerHTML = taskData.subtasks.map((subtask, index) => `
          <div class="subtask-row">
            <div class="subtask-checkbox">
              <input type="checkbox" id="list-subtask-${taskData.id}-${index}" ${subtask.completed ? 'checked' : ''}>
            </div>
            <div class="subtask-title">
              <label for="list-subtask-${taskData.id}-${index}">${subtask.text}</label>
            </div>
          </div>
        `).join('');
      }
    }
  }
  
  // Cập nhật trong chế độ xem Gantt
  updateTaskInGanttView(taskData);
}

// Hàm cập nhật công việc trong chế độ xem Gantt
function updateTaskInGanttView(taskData) {
  // Cập nhật hàng bên trái
  const ganttTaskRow = document.querySelector(`.gantt-task-row[data-id="${taskData.id}"]`);
  if (ganttTaskRow) {
    const titleElement = ganttTaskRow.querySelector('.gantt-task-title');
    if (titleElement) {
      // Giữ lại nút mở rộng
      const expanderButton = titleElement.querySelector('.task-expander');
      const priorityElement = titleElement.querySelector('.priority');
      
      titleElement.innerHTML = '';
      if (expanderButton) titleElement.appendChild(expanderButton);
      
      // Cập nhật ưu tiên
      const newPriority = document.createElement('span');
      newPriority.className = `priority ${taskData.priority}`;
      titleElement.appendChild(newPriority);
      
      // Thêm tiêu đề
      titleElement.appendChild(document.createTextNode(taskData.title));
    }
    
    // Cập nhật trạng thái
    const statusCell = ganttTaskRow.querySelector('.gantt-status-cell');
    if (statusCell) {
      statusCell.innerHTML = `<span class="status-cell ${taskData.status}">${getStatusText(taskData.status)}</span>`;
    }
  }
  
  // Cập nhật thanh Gantt
  const ganttTimelineRow = document.querySelector(`.gantt-timeline-row[data-id="${taskData.id}"]`);
  if (ganttTimelineRow) {
    const ganttBar = ganttTimelineRow.querySelector('.gantt-bar');
    if (ganttBar) {
      // Cập nhật class trạng thái
      ganttBar.className = ganttBar.className.replace(/inprogress|done|overdue|cancelled/g, taskData.status);
      
      // Cập nhật ngày
      ganttBar.dataset.start = formatDateDisplay(taskData.startDate);
      ganttBar.dataset.end = formatDateDisplay(taskData.dueDate);
      
      // Cập nhật label
      const barLabel = ganttBar.querySelector('.gantt-bar-label');
      if (barLabel) {
        barLabel.textContent = `${formatDateDisplay(taskData.startDate)}-${formatDateDisplay(taskData.dueDate)}`;
      }
      
      // Cập nhật tiến độ
      const progressElement = ganttBar.querySelector('.gantt-progress');
      if (progressElement) {
        progressElement.style.width = `${taskData.progress || 0}%`;
      }
      
      // Cập nhật người phụ trách
      const assigneesContainer = ganttBar.querySelector('.gantt-bar-assignees');
      if (assigneesContainer) {
        assigneesContainer.innerHTML = '';
        
        if (taskData.assignees && taskData.assignees.length > 0) {
          taskData.assignees.forEach(assigneeId => {
            const user = users.find(u => u.id === assigneeId);
            if (user) {
              const avatarElement = document.createElement('div');
              avatarElement.className = 'gantt-bar-avatar';
              avatarElement.title = user.name;
              avatarElement.textContent = user.initials;
              assigneesContainer.appendChild(avatarElement);
            }
          });
        }
      }
      
      // Cập nhật vị trí và kích thước nếu có thay đổi ngày
      if (taskData.startDate && taskData.dueDate) {
        try {
          let startDate, dueDate;
          
          // Xử lý định dạng dd/MM/yyyy
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(taskData.startDate) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(taskData.dueDate)) {
            const startParts = taskData.startDate.split('/');
            const dueParts = taskData.dueDate.split('/');
            
            if (startParts.length === 3 && dueParts.length === 3) {
              startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
              dueDate = new Date(parseInt(dueParts[2]), parseInt(dueParts[1]) - 1, parseInt(dueParts[0]));
            }
          } else {
            startDate = new Date(taskData.startDate);
            dueDate = new Date(taskData.dueDate);
          }
          
          // Chỉ cập nhật vị trí và kích thước nếu đang xem tháng hiện tại
          if (startDate && dueDate) {
            const startMonth = startDate.getMonth();
            const startYear = startDate.getFullYear();
            const dueMonth = dueDate.getMonth();
            const dueYear = dueDate.getFullYear();
            
            if ((startMonth === currentGanttMonth && startYear === currentGanttYear) ||
                (dueMonth === currentGanttMonth && dueYear === currentGanttYear) ||
                (
                  (startYear < currentGanttYear || (startYear === currentGanttYear && startMonth < currentGanttMonth)) &&
                  (dueYear > currentGanttYear || (dueYear === currentGanttYear && dueMonth > currentGanttMonth))
                )) {
              
              // Tính lại vị trí và độ rộng
              const daysInMonth = new Date(currentGanttYear, currentGanttMonth + 1, 0).getDate();
              
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
              
              ganttBar.style.left = `${leftPosition}%`;
              ganttBar.style.width = `${width}%`;
            }
          }
        } catch (e) {
          console.error("Lỗi cập nhật thanh Gantt:", e);
        }
      }
    }
  }
  
  // Cập nhật công việc con
  if (taskData.subtasks && taskData.subtasks.length > 0) {
    // Lấy tất cả các hàng công việc con liên quan
    const subtaskRows = document.querySelectorAll(`.gantt-subtask-row[data-parent="${taskData.id}"]`);
    
    taskData.subtasks.forEach((subtask, index) => {
      if (index < subtaskRows.length) {
        const subtaskTitle = subtaskRows[index].querySelector('.gantt-subtask-title');
        if (subtaskTitle) {
          const checkbox = subtaskTitle.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = subtask.completed;
          }
          
          const label = subtaskTitle.querySelector('label');
          if (label) {
            label.textContent = subtask.text;
          }
        }
      }
    });
  }
}

// Thêm HTML cho modal viewer vào cuối body
function addViewerModalToDOM() {
  // Kiểm tra xem modal đã tồn tại chưa
  if (!document.getElementById('attachment-viewer-modal')) {
    const viewerModal = document.createElement('div');
    viewerModal.id = 'attachment-viewer-modal';
    viewerModal.className = 'attachment-viewer-modal';
    viewerModal.innerHTML = `
      <div class="attachment-viewer-content">
        <span class="close-viewer">&times;</span>
        <div class="attachment-title"></div>
        <div class="attachment-controls">
          <button id="zoom-in-btn" title="Phóng to"><i class="fas fa-search-plus"></i></button>
          <button id="zoom-out-btn" title="Thu nhỏ"><i class="fas fa-search-minus"></i></button>
          <button id="reset-zoom-btn" title="Khôi phục"><i class="fas fa-sync-alt"></i></button>
        </div>
        <div class="attachment-container">
          <!-- Nội dung tệp sẽ được đưa vào đây -->
        </div>
      </div>
    `;
    document.body.appendChild(viewerModal);
    
    // Thêm CSS cho modal viewer với nền mờ nhẹ
    const viewerStyles = document.createElement('style');
    viewerStyles.textContent = `
      .attachment-viewer-modal {
        display: none;
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.75); /* Nền tối mờ nhẹ */
        transition: opacity 0.3s ease;
        opacity: 0;
      }
      
      .attachment-viewer-modal.show {
        opacity: 1;
      }
      
      .attachment-viewer-content {
        position: relative;
        margin: 50px auto;
        width: fit-content;
        max-width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .attachment-title {
        color: #333;
        text-align: center;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 500;
        background-color: white;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin-bottom: 10px;
        display: inline-block;
      }
      
      .close-viewer {
        position: absolute;
        top: -15px;
        right: -15px;
        background-color: white;
        color: #333;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 2001;
        transition: all 0.3s;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      .close-viewer:hover {
        transform: rotate(90deg);
        color: #f44336;
      }
      
      .attachment-controls {
        position: absolute;
        bottom: 15px;
        right: 15px;
        display: flex;
        gap: 8px;
        z-index: 2001;
      }
      
      .attachment-controls button {
        background-color: white;
        color: #4568dc;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      .attachment-controls button:hover {
        background-color: #4568dc;
        color: white;
        transform: scale(1.1);
      }
      
      .attachment-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background-color: white;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      
      .attachment-container img {
        max-width: 90vw;
        max-height: 80vh;
        object-fit: contain;
        transition: transform 0.3s ease;
        border-radius: 4px;
      }
      
      .attachment-container .pdf-viewer {
        width: 80vw;
        height: 80vh;
        border: none;
        border-radius: 4px;
      }
      
      .attachment-container .text-content {
        padding: 20px;
        border-radius: 4px;
        max-width: 80vw;
        max-height: 80vh;
        overflow: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: monospace;
      }
      
      .attachment-container .unsupported-file {
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        color: #333;
        width: auto;
        max-width: 500px;
      }
      
      .unsupported-file i {
        font-size: 48px;
        margin-bottom: 15px;
        display: block;
        color: #4568dc;
      }
      
      .unsupported-file p {
        margin: 10px 0 0;
        font-size: 14px;
        color: #666;
      }
      
      /* Thêm hiệu ứng pulse cho các tệp đính kèm */
      .attachment, .attachment img, .file-attachment, .attachment-icon {
        cursor: zoom-in !important;
        transition: all 0.3s ease !important;
      }
      
      .attachment:hover, .attachment img:hover, .file-attachment:hover, .attachment-icon:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
      }
    `;
    document.head.appendChild(viewerStyles);
  }
}

// Biến toàn cục để lưu trữ trạng thái
let currentZoom = 1;
let currentAttachment = null;

// Khởi tạo viewer
function initAttachmentViewer() {
  // Lấy các phần tử DOM
  const modal = document.getElementById('attachment-viewer-modal');
  const closeBtn = modal.querySelector('.close-viewer');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const resetZoomBtn = document.getElementById('reset-zoom-btn');
  const container = modal.querySelector('.attachment-container');
  
  // Thêm sự kiện click cho tất cả các tệp đính kèm
  document.addEventListener('click', function(e) {
    // Tìm phần tử gần nhất là tệp đính kèm
    const attachmentElement = e.target.closest('.attachment, .attachment img, .file-attachment, .attachment-icon');
    if (attachmentElement) {
      e.preventDefault();
      e.stopPropagation();
      
      // Lấy thông tin về tệp
      const fileContainer = e.target.closest('.attachment, .file-attachment') || attachmentElement;
      
      const fileName = fileContainer.querySelector('span')?.textContent || 
                      attachmentElement.getAttribute('alt') || 
                      attachmentElement.getAttribute('title') || 
                      'Tệp đính kèm';
      
      // Lấy URL của tệp
      let fileUrl;
      if (attachmentElement.tagName === 'IMG') {
        fileUrl = attachmentElement.src;
      } else {
        const img = attachmentElement.querySelector('img');
        if (img) {
          fileUrl = img.src;
        } else {
          // Mặc định cho các loại tệp khác
          fileUrl = '#';
        }
      }
      
      // Xác định loại tệp
      let fileType;
      if (attachmentElement.classList.contains('image-attachment') || 
          fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ||
          fileUrl.includes('placeholder')) {
        fileType = 'image';
      } else if (fileName.match(/\.pdf$/i) || attachmentElement.classList.contains('pdf')) {
        fileType = 'pdf';
      } else if (fileName.match(/\.json$/i) || fileUrl.includes('json')) {
        fileType = 'json';
      } else if (fileName.match(/\.(doc|docx)$/i) || attachmentElement.classList.contains('word')) {
        fileType = 'word';
      } else if (fileName.match(/\.(xls|xlsx)$/i) || attachmentElement.classList.contains('excel')) {
        fileType = 'excel';
      } else {
        fileType = 'other';
      }
      
      // Mở tệp trong viewer
      openAttachment(fileUrl, fileName, fileType);
    }
  });
  
  // Đóng modal khi nhấp vào nút đóng hoặc bên ngoài
  closeBtn.addEventListener('click', closeViewer);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeViewer();
    }
  });
  
  // Xử lý zoom
  zoomInBtn.addEventListener('click', function() {
    updateZoom(0.2);
  });
  
  zoomOutBtn.addEventListener('click', function() {
    updateZoom(-0.2);
  });
  
  resetZoomBtn.addEventListener('click', function() {
    resetZoom();
  });
  
  // Hỗ trợ pinch zoom cho thiết bị cảm ứng
  let initialDistance = 0;
  container.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
  });
  
  container.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2 && initialDistance > 0) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const zoomFactor = (currentDistance - initialDistance) / initialDistance;
      
      if (Math.abs(zoomFactor) > 0.05) {
        updateZoom(zoomFactor);
        initialDistance = currentDistance;
      }
    }
  });
  
  // Hỗ trợ scroll wheel để zoom
  container.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (e.deltaY < 0) {
      updateZoom(0.1);
    } else {
      updateZoom(-0.1);
    }
  });
  
  // Thêm hỗ trợ phím tắt
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'block') {
      if (e.key === 'Escape') {
        closeViewer();
      } else if (e.key === '+' || e.key === '=') {
        updateZoom(0.2);
      } else if (e.key === '-') {
        updateZoom(-0.2);
      } else if (e.key === '0') {
        resetZoom();
      }
    }
  });
}

// Mở tệp đính kèm trong viewer
function openAttachment(url, fileName, fileType) {
  const modal = document.getElementById('attachment-viewer-modal');
  const container = modal.querySelector('.attachment-container');
  const titleElement = modal.querySelector('.attachment-title');
  
  // Xóa nội dung cũ
  container.innerHTML = '';
  
  // Hiển thị tên tệp
  titleElement.textContent = fileName;
  
  // Reset zoom
  resetZoom();
  
  // Tạo nội dung dựa trên loại tệp
  let content = '';
  
  if (fileType === 'image') {
    // Thay thế URL placeholder bằng URL lớn hơn nếu cần
    if (url.includes('placeholder')) {
      url = url.replace(/(\d+)x(\d+)/, '800x600');
    }
    
    content = `<img src="${url}" alt="${fileName}" id="zoomable-content">`;
    currentAttachment = { type: 'image' };
  } else if (fileType === 'pdf' && url !== '#') {
    content = `<iframe src="${url}" class="pdf-viewer" title="${fileName}"></iframe>`;
    currentAttachment = { type: 'pdf' };
  } else if (fileType === 'json' && url !== '#') {
    // Hiển thị JSON dưới dạng định dạng
    content = `<div class="text-content">Loading JSON content...</div>`;
    currentAttachment = { type: 'json' };
    
    // Tải và định dạng nội dung JSON
    fetchJsonContent(url);
  } else {
    // Hiển thị icon dựa vào loại tệp
    let iconClass = 'fa-file';
    if (fileType === 'word') iconClass = 'fa-file-word';
    else if (fileType === 'excel') iconClass = 'fa-file-excel';
    else if (fileType === 'pdf') iconClass = 'fa-file-pdf';
    else if (fileType === 'json') iconClass = 'fa-file-code';
    
    // Trường hợp tệp không thể xem trước
    content = `
      <div class="unsupported-file">
        <i class="far ${iconClass}"></i>
        <h3>${fileName}</h3>
        <p>Tệp này không thể xem trước.</p>
      </div>
    `;
    currentAttachment = { type: 'other' };
  }
  
  container.innerHTML = content;
  
  // Hiển thị modal với hiệu ứng
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Đóng viewer
function closeViewer() {
  const modal = document.getElementById('attachment-viewer-modal');
  modal.classList.remove('show');
  
  setTimeout(() => {
    modal.style.display = 'none';
    currentAttachment = null;
  }, 300);
}

// Cập nhật zoom
function updateZoom(delta) {
  if (!currentAttachment || currentAttachment.type !== 'image') return;
  
  const image = document.getElementById('zoomable-content');
  if (!image) return;
  
  // Cập nhật tỷ lệ zoom
  currentZoom = Math.max(0.5, Math.min(5, currentZoom + delta));
  
  // Áp dụng zoom
  image.style.transform = `scale(${currentZoom})`;
}

// Reset zoom
function resetZoom() {
  currentZoom = 1;
  const image = document.getElementById('zoomable-content');
  if (image) {
    image.style.transform = 'scale(1)';
  }
}

// Tính khoảng cách giữa hai điểm chạm
function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Tải nội dung JSON và hiển thị định dạng
function fetchJsonContent(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector('.attachment-container .text-content');
      if (container) {
        container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      }
    })
    .catch(error => {
      const container = document.querySelector('.attachment-container .text-content');
      if (container) {
        container.innerHTML = `<p class="error">Lỗi khi tải JSON: ${error.message}</p>`;
      }
    });
}

// Khởi tạo ngay lập tức nếu DOMContentLoaded đã xảy ra
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function() {
    addViewerModalToDOM();
    initAttachmentViewer();
  }, 1);
}

// Hàm mới để đồng bộ hóa checkbox công việc con trên tất cả chế độ xem
function syncSubtaskCheckboxes(taskId, subtaskIndex, isChecked) {
  console.log(`Đồng bộ hóa: Task ${taskId}, Subtask ${subtaskIndex}, Checked: ${isChecked}`);
  
  // 1. Cập nhật trong mảng dữ liệu
  const taskIndex = allTasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1 && allTasks[taskIndex].subtasks && allTasks[taskIndex].subtasks[subtaskIndex]) {
    // Cập nhật trạng thái trong dữ liệu
    allTasks[taskIndex].subtasks[subtaskIndex].completed = isChecked;
    
    // Tính toán lại tiến độ
    const total = allTasks[taskIndex].subtasks.length;
    const completed = allTasks[taskIndex].subtasks.filter(sub => sub.completed).length;
    const progressPercent = Math.round((completed / total) * 100);
    allTasks[taskIndex].progress = progressPercent;
    
    // 2. Cập nhật trong chế độ xem Kanban
    const kanbanTaskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (kanbanTaskItem) {
      // Cập nhật checkbox trong Kanban
      const kanbanCheckboxes = kanbanTaskItem.querySelectorAll('.subtask-checkbox');
      if (kanbanCheckboxes && kanbanCheckboxes[subtaskIndex]) {
        const kanbanCheckbox = kanbanCheckboxes[subtaskIndex];
        if (kanbanCheckbox.checked !== isChecked) {
          kanbanCheckbox.checked = isChecked;
        }
      }
      
      // Cập nhật thanh tiến độ
      const progressBar = kanbanTaskItem.querySelector('.progress');
      if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
      }
    }
    
    // 3. Cập nhật trong chế độ xem Danh sách
    // Tìm hàng chứa công việc
    const listViewRow = document.querySelector(`#task-table-body tr[data-id="${taskId}"]`);
    if (listViewRow) {
      // Tìm hàng subtask
      const subtaskRow = document.querySelector(`tr.subtask-row[data-parent="${taskId}"]`);
      if (subtaskRow) {
        // Tìm tất cả checkbox - LƯU Ý: Cấu trúc DOM phức tạp hơn
        const checkboxes = subtaskRow.querySelectorAll('input[type="checkbox"]');
        if (checkboxes && checkboxes.length > subtaskIndex) {
          const listCheckbox = checkboxes[subtaskIndex];
          if (listCheckbox && listCheckbox.checked !== isChecked) {
            listCheckbox.checked = isChecked;
          }
        } else {
          // Thử một lần nữa với selector khác nếu không tìm thấy
          const subtaskContainers = subtaskRow.querySelectorAll('.subtask-row');
          if (subtaskContainers && subtaskContainers.length > subtaskIndex) {
            const checkbox = subtaskContainers[subtaskIndex].querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked !== isChecked) {
              checkbox.checked = isChecked;
            }
          }
        }
      }
      
      // Cập nhật thanh tiến độ trong list view
      const progressBarSmall = listViewRow.querySelector('.progress-bar-small .progress');
      const progressText = listViewRow.querySelector('.progress-bar-small span');
      if (progressBarSmall && progressText) {
        progressBarSmall.style.width = `${progressPercent}%`;
        progressText.textContent = `${progressPercent}%`;
      }
    }
    
    // 4. Cập nhật trong chế độ xem Gantt
    // Tìm tất cả các subtask row trong Gantt
    const ganttSubtaskRows = document.querySelectorAll(`.gantt-subtask-row[data-parent="${taskId}"]`);
    if (ganttSubtaskRows && ganttSubtaskRows.length > subtaskIndex) {
      const checkbox = ganttSubtaskRows[subtaskIndex].querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked !== isChecked) {
        checkbox.checked = isChecked;
      }
    }
    
    // Cập nhật thanh tiến độ trong Gantt
    const ganttProgressBar = document.querySelector(`.gantt-timeline-row[data-id="${taskId}"] .gantt-progress`);
    if (ganttProgressBar) {
      ganttProgressBar.style.width = `${progressPercent}%`;
    }
    
    // 5. Gửi cập nhật đến server trong nền
    const updatedTask = { ...allTasks[taskIndex] };
    
    // Hiệu ứng đánh dấu vừa được cập nhật
    if (kanbanTaskItem) {
      kanbanTaskItem.classList.add('just-updated');
      setTimeout(() => {
        kanbanTaskItem.classList.remove('just-updated');
      }, 1000);
    }
    
    // Thêm vào hàng đợi để cập nhật lên server
    enqueueTaskUpdate(updatedTask, () => {
      console.log(`Đã cập nhật trạng thái công việc con ${subtaskIndex + 1} của công việc ${taskId}`);
    });
    
    // Cập nhật cache
    updateTaskInCache(updatedTask);
    
    // 6. Kiểm tra và thông báo nếu tất cả công việc con hoàn thành
    if (progressPercent === 100 && allTasks[taskIndex].status !== 'done') {
      showNotification('Tất cả công việc con đã hoàn thành! Có thể chuyển sang trạng thái Hoàn Thành.', 'success');
    }
  } else {
    console.warn(`Không tìm thấy task (${taskId}) hoặc subtask (${subtaskIndex}) trong dữ liệu`);
  }
}

// JavaScript cho quản lý người dùng

// Các biến DOM Elements
const userModal = document.getElementById('user-management-modal');
const closeUserModal = userModal.querySelector('.close-modal');
const userForm = document.getElementById('user-form');
const userFormContainer = document.getElementById('user-form-container');
const userTableBody = document.getElementById('user-table-body');
const addUserBtn = document.getElementById('add-user-btn');
const cancelUserBtn = document.getElementById('cancel-user-btn');
const saveUserBtn = document.getElementById('save-user-btn');

// Chuyển đổi phần "Người dùng" thành cấu hình người dùng
function initUserManagement() {
  // Tìm phần tử người dùng hiện tại ở góc trên bên phải
  const userElement = document.querySelector('.user-info');
  
  if (userElement) {
    // Tạo nút mới
    const userButton = document.createElement('button');
    userButton.className = 'user-button';
    userButton.innerHTML = `
      <span>Quản lý Người dùng</span>
      <div class="avatar">
        <i class="fas fa-users-cog"></i>
      </div>
    `;
    
    // Thêm sự kiện click để mở modal
    userButton.addEventListener('click', openUserManagementModal);
    
    // Thêm hiệu ứng ripple khi click
    userButton.addEventListener('click', createRippleEffect);
    
    // Thay thế phần tử hiện tại
    userElement.parentNode.replaceChild(userButton, userElement);
  } else {
    // Nếu không tìm thấy, tạo một nút và thêm vào header
    const header = document.querySelector('.header');
    if (header) {
      const userButton = document.createElement('button');
      userButton.className = 'user-button';
      userButton.innerHTML = `
        <span>Quản lý Người dùng</span>
        <div class="avatar">
          <i class="fas fa-users-cog"></i>
        </div>
      `;
      userButton.addEventListener('click', openUserManagementModal);
      userButton.addEventListener('click', createRippleEffect);
      header.appendChild(userButton);
    }
  }
  
  // Thêm các event listeners
  closeUserModal.addEventListener('click', closeUserManagementModal);
  addUserBtn.addEventListener('click', showAddUserForm);
  addUserBtn.addEventListener('click', createRippleEffect);
  cancelUserBtn.addEventListener('click', hideUserForm);
  userForm.addEventListener('submit', handleUserFormSubmit);
  
  // Click bên ngoài để đóng modal
  window.addEventListener('click', (e) => {
    if (e.target === userModal) {
      closeUserManagementModal();
    }
  });
}

// Tạo hiệu ứng ripple khi click
function createRippleEffect(e) {
  const button = e.currentTarget;
  
  // Tạo phần tử ripple
  const ripple = document.createElement('span');
  ripple.classList.add('ripple-effect');
  
  // Tính toán kích thước ripple
  const size = Math.max(button.offsetWidth, button.offsetHeight);
  ripple.style.width = ripple.style.height = `${size}px`;
  
  // Đặt vị trí ripple
  const rect = button.getBoundingClientRect();
  ripple.style.left = `${e.clientX - rect.left - (size / 2)}px`;
  ripple.style.top = `${e.clientY - rect.top - (size / 2)}px`;
  
  // Thêm vào button
  button.appendChild(ripple);
  
  // Xóa ripple sau khi hoàn thành hiệu ứng
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Mở modal quản lý người dùng
function openUserManagementModal() {
  // Tải danh sách người dùng
  loadUsers();
  
  // Hiển thị modal
  userModal.style.display = 'block';
  
  // Ẩn form người dùng
  hideUserForm();
}

// Đóng modal quản lý người dùng
function closeUserManagementModal() {
  userModal.style.display = 'none';
}

// Hiển thị form thêm người dùng
function showAddUserForm() {
  // Cập nhật tiêu đề
  document.getElementById('user-form-title').textContent = 'Thêm người dùng mới';
  
  // Xóa dữ liệu cũ
  document.getElementById('user-id-input').value = '';
  document.getElementById('user-name-input').value = '';
  document.getElementById('user-initials-input').value = '';
  
  // Hiển thị form với hiệu ứng
  userFormContainer.style.display = 'block';
  userFormContainer.classList.add('slide-down');
  setTimeout(() => {
    userFormContainer.classList.remove('slide-down');
  }, 300);
  
  // Focus vào trường đầu tiên
  document.getElementById('user-name-input').focus();
}

// Hiển thị form chỉnh sửa người dùng
function showEditUserForm(userId) {
  // Kiểm tra xem người dùng có đang được sử dụng không
  checkUserInUse(userId)
    .then(isInUse => {
      if (isInUse) {
        showNotification('Không thể chỉnh sửa người dùng đang được gán vào công việc!', 'warning');
        // Thêm hiệu ứng lắc cho hàng đó
        const userRow = document.querySelector(`tr[data-id="${userId}"]`);
        if (userRow) {
          userRow.classList.add('shake');
          setTimeout(() => {
            userRow.classList.remove('shake');
          }, 500);
        }
        return;
      }
      
      // Tìm thông tin người dùng
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      // Cập nhật tiêu đề
      document.getElementById('user-form-title').textContent = 'Chỉnh sửa người dùng';
      
      // Điền dữ liệu
      document.getElementById('user-id-input').value = user.id;
      document.getElementById('user-name-input').value = user.name;
      document.getElementById('user-initials-input').value = user.initials;
      
      // Hiển thị form với hiệu ứng
      userFormContainer.style.display = 'block';
      userFormContainer.classList.add('slide-down');
      setTimeout(() => {
        userFormContainer.classList.remove('slide-down');
      }, 300);
      
      // Focus vào trường đầu tiên
      document.getElementById('user-name-input').focus();
      
      // Cuộn lên trên để nhìn thấy form
      userFormContainer.scrollIntoView({ behavior: 'smooth' });
    });
}

// Ẩn form người dùng
function hideUserForm() {
  // Thêm hiệu ứng slide-up trước khi ẩn
  userFormContainer.classList.add('slide-up');
  setTimeout(() => {
    userFormContainer.style.display = 'none';
    userFormContainer.classList.remove('slide-up');
  }, 300);
}

// Xử lý submit form người dùng
function handleUserFormSubmit(e) {
  e.preventDefault();
  
  // Thu thập dữ liệu
  const userId = document.getElementById('user-id-input').value;
  const userData = {
    id: userId,
    name: document.getElementById('user-name-input').value,
    initials: document.getElementById('user-initials-input').value.toUpperCase()
  };
  
  // Hiển thị loading
  saveUserBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
  saveUserBtn.disabled = true;
  
  // Gọi API để lưu
  if (userId) {
    // Cập nhật
    updateUser(userData);
  } else {
    // Thêm mới
    addUser(userData);
  }
}

// Thêm mới người dùng
function addUser(userData) {
  // Gọi API thêm mới
  google.script.run
    .withSuccessHandler(result => {
      if (result.success) {
        // Hiển thị thông báo
        showNotification('Đã thêm người dùng thành công!', 'success');
        
        // Tải lại danh sách người dùng
        loadUsers(() => {
          // Highlight hàng mới thêm
          const newRow = document.querySelector(`tr[data-id="${result.userId}"]`);
          if (newRow) {
            newRow.classList.add('flash');
            setTimeout(() => {
              newRow.classList.remove('flash');
            }, 1500);
          }
        });
        
        // Ẩn form
        hideUserForm();
      } else {
        showNotification(result.message || 'Lỗi khi thêm người dùng', 'error');
      }
      resetSaveButton();
    })
    .withFailureHandler(error => {
      console.error('Lỗi khi thêm người dùng:', error);
      showNotification('Lỗi khi thêm người dùng: ' + error, 'error');
      resetSaveButton();
    })
    .addUser(userData);
}

// Cập nhật người dùng
function updateUser(userData) {
  // Gọi API cập nhật
  google.script.run
    .withSuccessHandler(result => {
      if (result.success) {
        // Hiển thị thông báo
        showNotification('Đã cập nhật người dùng thành công!', 'success');
        
        // Tải lại danh sách người dùng
        loadUsers(() => {
          // Highlight hàng vừa cập nhật
          const updatedRow = document.querySelector(`tr[data-id="${userData.id}"]`);
          if (updatedRow) {
            updatedRow.classList.add('flash');
            setTimeout(() => {
              updatedRow.classList.remove('flash');
            }, 1500);
          }
        });
        
        // Ẩn form
        hideUserForm();
      } else {
        showNotification(result.message || 'Lỗi khi cập nhật người dùng', 'error');
      }
      resetSaveButton();
    })
    .withFailureHandler(error => {
      console.error('Lỗi khi cập nhật người dùng:', error);
      showNotification('Lỗi khi cập nhật người dùng: ' + error, 'error');
      resetSaveButton();
    })
    .updateUser(userData);
}

// Xóa người dùng
function deleteUser(userId) {
  // Kiểm tra xem người dùng có đang được sử dụng không
  checkUserInUse(userId)
    .then(isInUse => {
      if (isInUse) {
        showNotification('Không thể xóa người dùng đang được gán vào công việc!', 'warning');
        // Thêm hiệu ứng lắc cho hàng đó
        const userRow = document.querySelector(`tr[data-id="${userId}"]`);
        if (userRow) {
          userRow.classList.add('shake');
          setTimeout(() => {
            userRow.classList.remove('shake');
          }, 500);
        }
        return;
      }
      
      if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        // Tìm và lưu trữ hàng trước khi xóa
        const userRow = document.querySelector(`tr[data-id="${userId}"]`);
        
        // Thêm hiệu ứng trước khi xóa
        if (userRow) {
          userRow.classList.add('shake');
          
          // Chờ hiệu ứng hoàn thành rồi mới xóa
          setTimeout(() => {
            // Gọi API xóa
            google.script.run
              .withSuccessHandler(result => {
                if (result.success) {
                  // Áp dụng hiệu ứng fade-out
                  userRow.style.opacity = '0';
                  userRow.style.height = '0';
                  userRow.style.overflow = 'hidden';
                  
                  // Chờ hiệu ứng fade-out hoàn thành rồi mới xóa khỏi DOM và hiển thị thông báo
                  setTimeout(() => {
                    // Xóa hàng khỏi DOM
                    if (userRow.parentElement) {
                      userRow.parentElement.removeChild(userRow);
                    }
                    // Hiển thị thông báo
                    showNotification('Đã xóa người dùng thành công!', 'success');
                  }, 300);
                } else {
                  // Nếu xóa thất bại, dừng hiệu ứng và hiển thị thông báo lỗi
                  userRow.classList.remove('shake');
                  userRow.style.opacity = '1';
                  userRow.style.height = 'auto';
                  showNotification(result.message || 'Lỗi khi xóa người dùng', 'error');
                }
              })
              .withFailureHandler(error => {
                // Nếu lỗi, dừng hiệu ứng và hiển thị thông báo lỗi
                userRow.classList.remove('shake');
                userRow.style.opacity = '1';
                userRow.style.height = 'auto';
                console.error('Lỗi khi xóa người dùng:', error);
                showNotification('Lỗi khi xóa người dùng: ' + error, 'error');
              })
              .deleteUser(userId);
          }, 500);
        } else {
          // Nếu không tìm thấy hàng, gọi API mà không cần hiệu ứng
          google.script.run
            .withSuccessHandler(result => {
              if (result.success) {
                showNotification('Đã xóa người dùng thành công!', 'success');
                loadUsers(); // Tải lại danh sách
              } else {
                showNotification(result.message || 'Lỗi khi xóa người dùng', 'error');
              }
            })
            .withFailureHandler(error => {
              console.error('Lỗi khi xóa người dùng:', error);
              showNotification('Lỗi khi xóa người dùng: ' + error, 'error');
            })
            .deleteUser(userId);
        }
      }
    });
}

// Kiểm tra xem người dùng có đang được sử dụng không
async function checkUserInUse(userId) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(result => {
        resolve(result.inUse);
      })
      .withFailureHandler(error => {
        console.error('Lỗi khi kiểm tra người dùng:', error);
        reject(error);
      })
      .checkUserInUse(userId);
  });
}

// Tải danh sách người dùng
function loadUsers(callback) {
  // Hiển thị loading
  userTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';
  
  // Gọi API lấy danh sách người dùng
  google.script.run
    .withSuccessHandler(result => {
      users = result || [];
      renderUserTable(users);
      
      if (callback && typeof callback === 'function') {
        callback();
      }
    })
    .withFailureHandler(error => {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      userTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Lỗi khi tải dữ liệu</td></tr>';
    })
    .getUsers();
}


// Hiển thị danh sách người dùng vào bảng
function renderUserTable(users) {
  if (!users || users.length === 0) {
    userTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Không có người dùng nào</td></tr>';
    return;
  }
  
  userTableBody.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.dataset.id = user.id;
    
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.initials}</td>
      <td class="user-actions">
        <button type="button" class="edit-user tooltip" data-id="${user.id}">
          <i class="fas fa-edit"></i>
          <span class="tooltiptext">Chỉnh sửa</span>
        </button>
        <button type="button" class="delete-user tooltip" data-id="${user.id}">
          <i class="fas fa-trash"></i>
          <span class="tooltiptext">Xóa</span>
        </button>
      </td>
    `;
    
    userTableBody.appendChild(row);
    
    // Thêm sự kiện
    const editButton = row.querySelector('.edit-user');
    editButton.addEventListener('click', () => showEditUserForm(user.id));
    editButton.addEventListener('click', createRippleEffect);
    
    const deleteButton = row.querySelector('.delete-user');
    deleteButton.addEventListener('click', () => deleteUser(user.id));
    deleteButton.addEventListener('click', createRippleEffect);
  });
}

// Reset nút lưu
function resetSaveButton() {
  saveUserBtn.innerHTML = 'Lưu';
  saveUserBtn.disabled = false;
}

// Hiệu ứng CSS bổ sung
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-up {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  
  .slide-down {
    animation: slide-down 0.3s ease;
  }
  
  .slide-up {
    animation: slide-up 0.3s ease;
  }
  
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(additionalStyles);
</script>