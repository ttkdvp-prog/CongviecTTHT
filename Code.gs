// Hàm doGet - xử lý cả web app và API requests
function doGet(e) {
  // Nếu có parameter action => trả về JSON (API mode)
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter);
  }
  
  // Nếu không => trả về HTML (web app mode)
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Quản Lý Công Việc')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setFaviconUrl("https://cdn-icons-png.flaticon.com/512/2098/2098402.png");
}

// Hàm doPost - xử lý API write operations
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    return handleApiRequest(params);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Lỗi xử lý request: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Router xử lý API requests
function handleApiRequest(params) {
  var result;
  try {
    switch(params.action) {
      case 'getTasks':
        result = getTasks();
        break;
      case 'getUsers':
        result = getUsers();
        break;
      case 'getTeams':
        result = getTeams();
        break;
      case 'addTask':
        var taskData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = addTask(taskData);
        break;
      case 'updateTask':
        var taskData2 = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = updateTask(taskData2);
        break;
      case 'deleteTask':
        result = deleteTask(params.taskId);
        break;
      case 'addUser':
        var userData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = addUser(userData);
        break;
      case 'updateUser':
        var userData2 = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = updateUser(userData2);
        break;
      case 'deleteUser':
        result = deleteUser(params.userId);
        break;
      case 'filterTasks':
        var filterData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = filterTasks(filterData);
        break;
      case 'checkOverdue':
        result = { updated: checkOverdueTasks() };
        break;
      default:
        result = { success: false, message: "Action không hợp lệ: " + params.action };
    }
  } catch (error) {
    result = { success: false, message: "Lỗi server: " + error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Hàm include để nhúng các file ngoài
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

const SPREADSHEET_ID = "1r2lWfbeHh7LXqOOH1Dmgd4IEwgudw3kGqbk3UORKDVc";

function getSs() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
}

// Khởi tạo hoặc lấy Sheet cần thiết
function setupSheets() {
  const ss = getSs();
  let tasks, subtasks, assignees, attachments;
  
  // Kiểm tra và tạo các sheet nếu chưa tồn tại
  try {
    tasks = ss.getSheetByName("Tasks");
    if (!tasks) {
      tasks = ss.insertSheet("Tasks");
      tasks.appendRow([
        "ID", "Tiêu đề", "Mô tả", "Trạng thái", "Mức độ ưu tiên", 
        "Ngày bắt đầu", "Ngày kết thúc", "Tiến độ"
      ]);
    }
    
    subtasks = ss.getSheetByName("Subtasks");
    if (!subtasks) {
      subtasks = ss.insertSheet("Subtasks");
      subtasks.appendRow([
        "ID", "ID công việc chính", "Nội dung", "Hoàn thành"
      ]);
    }
    
    assignees = ss.getSheetByName("Assignees");
    if (!assignees) {
      assignees = ss.insertSheet("Assignees");
      assignees.appendRow([
        "ID công việc", "ID người dùng", "Tên người dùng", "Chữ viết tắt"
      ]);
    }
    
    attachments = ss.getSheetByName("Attachments");
    if (!attachments) {
      attachments = ss.insertSheet("Attachments");
      attachments.appendRow([
        "ID công việc", "Tên file", "Loại file", "URL"
      ]);
    }
    
    // Tạo sheet cấu hình người dùng nếu chưa có
    let users = ss.getSheetByName("Users");
    if (!users) {
      users = ss.insertSheet("Users");
      users.appendRow([
        "ID", "Tên", "Chữ viết tắt"
      ]);
      // Thêm người dùng mẫu
      users.appendRow(["na", "Nguyễn Văn A", "NA"]);
      users.appendRow(["tb", "Trần Thị B", "TB"]);
      users.appendRow(["lc", "Lê Văn C", "LC"]);
      users.appendRow(["pd", "Phạm Thị D", "PD"]);
      users.appendRow(["ve", "Vũ Văn E", "VE"]);
    }
    
    // Thêm dữ liệu mẫu nếu sheet Tasks còn trống
    if (tasks.getLastRow() === 1) {
      initializeSampleData();
    }
    
    return {
      tasks: tasks,
      subtasks: subtasks,
      assignees: assignees,
      attachments: attachments
    };
  } catch (e) {
    Logger.log("Lỗi khi thiết lập sheet: " + e.toString());
    throw e;
  }
}

// Tạo dữ liệu mẫu
function initializeSampleData() {
  try {
    const ss = getSs();
    const tasks = ss.getSheetByName("Tasks");
    const subtasks = ss.getSheetByName("Subtasks");
    const assignees = ss.getSheetByName("Assignees");
    const attachments = ss.getSheetByName("Attachments");
    
    // Thêm dữ liệu mẫu vào sheet Tasks
    const taskData = [
      ["task-1", "việc 1", "mô tả 1", "inprogress", "high", "15/04/2025", "20/04/2025", "33"],
      
    ];
    
    taskData.forEach(row => tasks.appendRow(row));
    Logger.log("Đã thêm " + taskData.length + " công việc mẫu");
    
    // Thêm công việc con
    const subtaskData = [
      ["subtask-1-1", "task-1", "Tạo wireframe màn hình đăng nhập", "false"],
     ];
    
    subtaskData.forEach(row => subtasks.appendRow(row));
    
    // Thêm người phụ trách
    const assigneeData = [
      ["task-1", "na", "Nguyễn Văn A", "NA"],
      
    ];
    
    assigneeData.forEach(row => assignees.appendRow(row));
    
    // Thêm tệp đính kèm
    const attachmentData = [
      ["task-1", "wireframe.jpg", "image", "https://via.placeholder.com/100x60"],
      ["task-1", "guidelines.pdf", "file", "#"],
      ["task-3", "api-docs.json", "file", "#"],
      ["task-4", "test-cases.xlsx", "file", "#"],
      ["task-5", "documentation.docx", "file", "#"]
    ];
    
    attachmentData.forEach(row => attachments.appendRow(row));
    
    Logger.log("Đã khởi tạo dữ liệu mẫu thành công");
    return true;
  } catch (e) {
    Logger.log("Lỗi khi tạo dữ liệu mẫu: " + e.toString());
    return false;
  }
}

// Hàm lấy dữ liệu người dùng có kèm thông tin Tổ (Team)
function getUsers() {
  try {
    const ss = getSs();
    const usersSheet = ss.getSheetByName("Users");
    if (!usersSheet) return [];
    
    const lastRow = usersSheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const usersData = usersSheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const nameToTeam = getTeamsData();
    
    return usersData.map(row => {
      const name = String(row[1]);
      const team = nameToTeam[name.trim().toLowerCase()] || "";
      return {
        id: String(row[0]),
        name: name,
        initials: String(row[2]),
        team: team
      };
    });
  } catch(e) {
    Logger.log("Lỗi khi lấy danh sách người dùng: " + e.toString());
    return [];
  }
}

// Lấy thông tin ánh xạ Họ tên -> Tổ từ sheet "To"
function getTeamsData() {
  try {
    const ss = getSs();
    const toSheet = ss.getSheetByName("To");
    if (!toSheet) return {};
    
    const lastRow = toSheet.getLastRow();
    if (lastRow <= 1) return {};
    
    const data = toSheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const nameToTeam = {};
    data.forEach(row => {
      const team = row[0]; // Cột A: Tổ
      const name = row[2]; // Cột C: Họ và tên
      if (name && team) {
        nameToTeam[String(name).trim().toLowerCase()] = String(team).trim();
      }
    });
    return nameToTeam;
  } catch(e) {
    Logger.log("Lỗi lấy thông tin ánh xạ Tổ: " + e.toString());
    return {};
  }
}

// Lấy danh sách tên các Tổ độc nhất từ sheet "To"
function getTeams() {
  try {
    const ss = getSs();
    const toSheet = ss.getSheetByName("To");
    if (!toSheet) return [];
    
    const lastRow = toSheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = toSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const teamsSet = new Set();
    data.forEach(row => {
      if (row[0]) {
        teamsSet.add(String(row[0]).trim());
      }
    });
    return Array.from(teamsSet);
  } catch(e) {
    Logger.log("Lỗi lấy danh sách Tổ: " + e.toString());
    return [];
  }
}

// Thêm người dùng mới
function addUser(userData) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userData.name || !userData.initials) {
      return { success: false, message: "Tên và chữ viết tắt không được để trống" };
    }
    
    const ss = getSs();
    const usersSheet = ss.getSheetByName("Users");
    
    if (!usersSheet) {
      return { success: false, message: "Không tìm thấy sheet Users" };
    }
    
    // Tạo ID người dùng
    // Sử dụng 2 chữ cái đầu của tên người dùng, chuyển thành chữ thường
    const nameParts = userData.name.split(' ');
    let userId = '';
    
    if (nameParts.length >= 2) {
      // Lấy chữ cái đầu của tên và họ
      userId = (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toLowerCase();
    } else {
      // Nếu chỉ có một từ, lấy 2 chữ cái đầu
      userId = userData.name.substring(0, 2).toLowerCase();
    }
    
    // Kiểm tra xem ID đã tồn tại chưa
    const usersData = usersSheet.getDataRange().getValues();
    const existingIds = usersData.map(row => row[0]);
    
    // Nếu ID đã tồn tại, thêm số vào sau
    if (existingIds.includes(userId)) {
      let counter = 1;
      let newId = userId + counter;
      
      while (existingIds.includes(newId)) {
        counter++;
        newId = userId + counter;
      }
      
      userId = newId;
    }
    
    // Thêm người dùng mới
    usersSheet.appendRow([userId, userData.name, userData.initials]);
    
    return { 
      success: true, 
      message: "Thêm người dùng thành công",
      userId: userId
    };
  } catch (e) {
    Logger.log("Lỗi khi thêm người dùng: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Cập nhật người dùng
function updateUser(userData) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userData.id || !userData.name || !userData.initials) {
      return { success: false, message: "Thiếu thông tin người dùng" };
    }
    
    const ss = getSs();
    const usersSheet = ss.getSheetByName("Users");
    
    if (!usersSheet) {
      return { success: false, message: "Không tìm thấy sheet Users" };
    }
    
    // Tìm vị trí người dùng
    const usersData = usersSheet.getDataRange().getValues();
    let userRowIndex = -1;
    
    for (let i = 0; i < usersData.length; i++) {
      if (usersData[i][0] === userData.id) {
        userRowIndex = i + 1; // +1 vì index bắt đầu từ 1 trong Sheets
        break;
      }
    }
    
    if (userRowIndex === -1) {
      return { success: false, message: "Không tìm thấy người dùng" };
    }
    
    // Cập nhật thông tin người dùng
    usersSheet.getRange(userRowIndex, 2).setValue(userData.name);
    usersSheet.getRange(userRowIndex, 3).setValue(userData.initials);
    
    return { 
      success: true, 
      message: "Cập nhật người dùng thành công"
    };
  } catch (e) {
    Logger.log("Lỗi khi cập nhật người dùng: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Xóa người dùng
function deleteUser(userId) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userId) {
      return { success: false, message: "Thiếu ID người dùng" };
    }
    
    const ss = getSs();
    const usersSheet = ss.getSheetByName("Users");
    
    if (!usersSheet) {
      return { success: false, message: "Không tìm thấy sheet Users" };
    }
    
    // Tìm vị trí người dùng
    const usersData = usersSheet.getDataRange().getValues();
    let userRowIndex = -1;
    
    for (let i = 0; i < usersData.length; i++) {
      if (usersData[i][0] === userId) {
        userRowIndex = i + 1; // +1 vì index bắt đầu từ 1 trong Sheets
        break;
      }
    }
    
    if (userRowIndex === -1) {
      return { success: false, message: "Không tìm thấy người dùng" };
    }
    
    // Xóa người dùng
    usersSheet.deleteRow(userRowIndex);
    
    return { 
      success: true, 
      message: "Xóa người dùng thành công"
    };
  } catch (e) {
    Logger.log("Lỗi khi xóa người dùng: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Kiểm tra xem người dùng có đang được gán vào công việc nào không
function checkUserInUse(userId) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userId) {
      return { inUse: false, error: "Thiếu ID người dùng" };
    }
    
    const ss = getSs();
    const assigneesSheet = ss.getSheetByName("Assignees");
    
    if (!assigneesSheet) {
      return { inUse: false, error: "Không tìm thấy sheet Assignees" };
    }
    
    // Tìm kiếm trong danh sách người phụ trách
    const assigneesData = assigneesSheet.getDataRange().getValues();
    
    // Bỏ qua dòng header
    for (let i = 1; i < assigneesData.length; i++) {
      if (assigneesData[i][1] === userId) { // Cột thứ 2 (index 1) là ID người dùng
        return { inUse: true, taskCount: 1 }; // Nếu tìm thấy ít nhất 1, trả về true
      }
    }
    
    // Không tìm thấy người dùng trong bất kỳ công việc nào
    return { inUse: false, taskCount: 0 };
  } catch (e) {
    Logger.log("Lỗi khi kiểm tra người dùng: " + e.toString());
    return { 
      inUse: false, 
      error: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Hàm lấy tất cả công việc và các thông tin liên quan
function getTasks() {
  try {
    const sheets = setupSheets();
    
    // Lấy dữ liệu công việc
    const tasksData = sheets.tasks.getRange(2, 1, Math.max(1, sheets.tasks.getLastRow() - 1), 8).getValues();
    const subtasksData = sheets.subtasks.getRange(2, 1, Math.max(1, sheets.subtasks.getLastRow() - 1), 4).getValues();
    const assigneesData = sheets.assignees.getRange(2, 1, Math.max(1, sheets.assignees.getLastRow() - 1), 4).getValues();
    const attachmentsData = sheets.attachments.getRange(2, 1, Math.max(1, sheets.attachments.getLastRow() - 1), 4).getValues();
    
    // Kiểm tra công việc quá hạn
    checkOverdueTasks();
    
    // Chuyển đổi dữ liệu thành mảng các đối tượng
    const tasks = [];
    
    // Xử lý từng hàng dữ liệu
    for (let i = 0; i < tasksData.length; i++) {
      const row = tasksData[i];
      if (!row[0]) continue; // Bỏ qua hàng trống
      
      const taskId = String(row[0]);
      
      // Lấy công việc con
      const subtasks = [];
      for (let j = 0; j < subtasksData.length; j++) {
        if (subtasksData[j][1] === taskId) {
          subtasks.push({
            id: String(subtasksData[j][0]),
            text: String(subtasksData[j][2]),
            completed: String(subtasksData[j][3]).toLowerCase() === "true"
          });
        }
      }
      
      // Lấy người phụ trách
      const assignees = [];
      for (let j = 0; j < assigneesData.length; j++) {
        if (assigneesData[j][0] === taskId) {
          assignees.push(String(assigneesData[j][1]));
        }
      }
      
      // Lấy tệp đính kèm
      const attachments = [];
      for (let j = 0; j < attachmentsData.length; j++) {
        if (attachmentsData[j][0] === taskId) {
          attachments.push({
            name: String(attachmentsData[j][1]),
            type: String(attachmentsData[j][2]),
            url: String(attachmentsData[j][3])
          });
        }
      }
      
      // Tính tiến độ dựa trên công việc con
      let progress = parseInt(row[7]);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        if (subtasks.length > 0) {
          const completed = subtasks.filter(sub => sub.completed).length;
          progress = Math.round((completed / subtasks.length) * 100);
        } else {
          progress = 0;
        }
      }
      
      // Xử lý ngày tháng
      let startDate = "";
      if (row[5]) {
        // Đảm bảo định dạng dd/MM/yyyy
        const dateValue = row[5];
        if (dateValue instanceof Date) {
          // Nếu là đối tượng Date, chuyển đổi sang chuỗi dd/MM/yyyy
          const day = dateValue.getDate().toString().padStart(2, '0');
          const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
          const year = dateValue.getFullYear();
          startDate = `${day}/${month}/${year}`;
        } else {
          // Nếu là chuỗi, giữ nguyên
          startDate = String(dateValue);
        }
      }
      
      let dueDate = "";
      if (row[6]) {
        // Đảm bảo định dạng dd/MM/yyyy
        const dateValue = row[6];
        if (dateValue instanceof Date) {
          // Nếu là đối tượng Date, chuyển đổi sang chuỗi dd/MM/yyyy
          const day = dateValue.getDate().toString().padStart(2, '0');
          const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
          const year = dateValue.getFullYear();
          dueDate = `${day}/${month}/${year}`;
        } else {
          // Nếu là chuỗi, giữ nguyên
          dueDate = String(dateValue);
        }
      }
      
      // Tạo đối tượng công việc
      const task = {
        id: taskId,
        title: String(row[1]),
        description: String(row[2]),
        status: String(row[3]),
        priority: String(row[4]),
        startDate: startDate,
        dueDate: dueDate,
        progress: progress,
        subtasks: subtasks,
        assignees: assignees,
        attachments: attachments
      };
      
      tasks.push(task);
    }
    
    return tasks;
  } catch (e) {
    Logger.log("Lỗi khi lấy dữ liệu công việc: " + e.toString());
    return [];
  }
}

// Hàm thêm công việc mới
function addTask(taskData) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!taskData.title) {
      return { success: false, message: "Tiêu đề không được để trống" };
    }
    
    const sheets = setupSheets();

    const now = new Date();
    const formattedDate = now.getFullYear().toString().slice(-1) + 
        ('0' + (now.getMonth() + 1)).slice(-2) + 
        ('0' + now.getDate()).slice(-2) + 
        ('0' + now.getHours()).slice(-2) + 
        ('0' + now.getMinutes()).slice(-2) + 
        ('0' + now.getSeconds()).slice(-2);
    const taskId = "task-" + formattedDate

    // Thêm công việc chính
    sheets.tasks.appendRow([
      taskId,
      taskData.title,
      taskData.description || "",
      taskData.status || "inprogress",
      taskData.priority || "medium",
      taskData.startDate || "",
      taskData.dueDate || "",
      taskData.subtasks && taskData.subtasks.length > 0 ? "0" : ""
    ]);
    
    // Thêm công việc con
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      taskData.subtasks.forEach((subtask, index) => {
        const subtaskId = `subtask-${taskId}-${index}`;
        sheets.subtasks.appendRow([
          subtaskId,
          taskId,
          subtask.text,
          subtask.completed ? "true" : "false"
        ]);
      });
    }
    
    // Thêm người phụ trách
    if (taskData.assignees && taskData.assignees.length > 0) {
      // Lấy thông tin người dùng từ sheet Users
      const ss = getSs();
      const usersSheet = ss.getSheetByName("Users");
      const usersData = usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, 3).getValues();
      const usersMap = {};
      
      usersData.forEach(row => {
        usersMap[row[0]] = {
          name: row[1],
          initials: row[2]
        };
      });
      
      taskData.assignees.forEach(assigneeId => {
        if (usersMap[assigneeId]) {
          sheets.assignees.appendRow([
            taskId,
            assigneeId,
            usersMap[assigneeId].name,
            usersMap[assigneeId].initials
          ]);
        }
      });
    }
    
    // Thêm tệp đính kèm
    if (taskData.attachments && taskData.attachments.length > 0) {
      taskData.attachments.forEach(attachment => {
        sheets.attachments.appendRow([
          taskId,
          attachment.name,
          attachment.type,
          attachment.url
        ]);
      });
    }
    
    return { 
      success: true, 
      taskId: taskId,
      message: "Đã thêm công việc thành công!"
    };
  } catch (e) {
    Logger.log("Lỗi khi thêm công việc: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Hàm cập nhật công việc
function updateTask(taskData) {
  try {
    if (!taskData.id) {
      return { success: false, message: "ID công việc không hợp lệ" };
    }
    
    const sheets = setupSheets();
    const taskId = taskData.id;
    
    // Tìm vị trí của công việc trong sheet
    const tasksValues = sheets.tasks.getRange(2, 1, sheets.tasks.getLastRow() - 1, 1).getValues();
    let taskRowIndex = -1;
    
    for (let i = 0; i < tasksValues.length; i++) {
      if (tasksValues[i][0] === taskId) {
        taskRowIndex = i + 2; // +2 do index bắt đầu từ 0 và dòng đầu tiên là header
        break;
      }
    }
    
    if (taskRowIndex === -1) {
      return { success: false, message: "Không tìm thấy công việc" };
    }
    
    // Chuẩn hóa định dạng ngày dd/MM/yyyy
    let startDate = taskData.startDate || "";
    let dueDate = taskData.dueDate || "";
    
    // Nếu ngày không đúng định dạng dd/MM/yyyy, chuyển đổi về đúng định dạng
    if (startDate && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(startDate)) {
      try {
        const date = new Date(startDate);
        if (!isNaN(date.getTime())) {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          startDate = `${day}/${month}/${year}`;
        }
      } catch (e) {
        Logger.log("Lỗi định dạng ngày bắt đầu: " + e.toString());
      }
    }
    
    if (dueDate && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dueDate)) {
      try {
        const date = new Date(dueDate);
        if (!isNaN(date.getTime())) {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          dueDate = `${day}/${month}/${year}`;
        }
      } catch (e) {
        Logger.log("Lỗi định dạng ngày kết thúc: " + e.toString());
      }
    }
    
    // Cập nhật thông tin công việc
    sheets.tasks.getRange(taskRowIndex, 2).setValue(taskData.title);
    sheets.tasks.getRange(taskRowIndex, 3).setValue(taskData.description || "");
    sheets.tasks.getRange(taskRowIndex, 4).setValue(taskData.status || "inprogress");
    sheets.tasks.getRange(taskRowIndex, 5).setValue(taskData.priority || "medium");
    sheets.tasks.getRange(taskRowIndex, 6).setValue(startDate);
    sheets.tasks.getRange(taskRowIndex, 7).setValue(dueDate);
    
    // Tính toán và cập nhật tiến độ
    let progress = 0;
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const completed = taskData.subtasks.filter(sub => sub.completed).length;
      progress = Math.round((completed / taskData.subtasks.length) * 100);
    } else if (taskData.status === "done") {
      progress = 100;
    } else if (taskData.status === "cancelled") {
      progress = 0;
    }
    
    sheets.tasks.getRange(taskRowIndex, 8).setValue(progress.toString());
    
    // Xóa công việc con cũ và thêm công việc con mới
    const subtasksSheet = sheets.subtasks;
    const subtasksData = subtasksSheet.getDataRange().getValues();
    
    // Tìm và xóa các công việc con hiện tại
    for (let i = subtasksData.length - 1; i >= 1; i--) {
      if (subtasksData[i][1] === taskId) {
        subtasksSheet.deleteRow(i + 1);
      }
    }
    
    // Thêm công việc con mới
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      taskData.subtasks.forEach((subtask, index) => {
        const subtaskId = subtask.id || `subtask-${taskId}-${index}`;
        subtasksSheet.appendRow([
          subtaskId,
          taskId,
          subtask.text,
          subtask.completed ? "true" : "false"
        ]);
      });
    }
    
    // Xóa người phụ trách cũ và thêm người mới
    const assigneesSheet = sheets.assignees;
    const assigneesData = assigneesSheet.getDataRange().getValues();
    
    // Tìm và xóa các người phụ trách hiện tại
    for (let i = assigneesData.length - 1; i >= 1; i--) {
      if (assigneesData[i][0] === taskId) {
        assigneesSheet.deleteRow(i + 1);
      }
    }
    
    // Thêm người phụ trách mới
    if (taskData.assignees && taskData.assignees.length > 0) {
      // Lấy thông tin người dùng từ sheet Users
      const ss = getSs();
      const usersSheet = ss.getSheetByName("Users");
      const usersData = usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, 3).getValues();
      const usersMap = {};
      
      usersData.forEach(row => {
        usersMap[row[0]] = {
          name: row[1],
          initials: row[2]
        };
      });
      
      taskData.assignees.forEach(assigneeId => {
        if (usersMap[assigneeId]) {
          assigneesSheet.appendRow([
            taskId,
            assigneeId,
            usersMap[assigneeId].name,
            usersMap[assigneeId].initials
          ]);
        }
      });
    }
    
    // Xóa tệp đính kèm cũ và thêm tệp mới
    const attachmentsSheet = sheets.attachments;
    const attachmentsData = attachmentsSheet.getDataRange().getValues();
    
    // Tìm và xóa các tệp đính kèm hiện tại
    for (let i = attachmentsData.length - 1; i >= 1; i--) {
      if (attachmentsData[i][0] === taskId) {
        attachmentsSheet.deleteRow(i + 1);
      }
    }
    
    // Thêm tệp đính kèm mới
    if (taskData.attachments && taskData.attachments.length > 0) {
      taskData.attachments.forEach(attachment => {
        attachmentsSheet.appendRow([
          taskId,
          attachment.name,
          attachment.type,
          attachment.url
        ]);
      });
    }
    
    return { 
      success: true, 
      message: "Đã cập nhật công việc thành công!"
    };
  } catch (e) {
    Logger.log("Lỗi khi cập nhật công việc: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Hàm xóa công việc
function deleteTask(taskId) {
  try {
    if (!taskId) {
      return { success: false, message: "ID công việc không hợp lệ" };
    }
    
    const sheets = setupSheets();
    
    // Tìm vị trí của công việc trong sheet
    const tasksValues = sheets.tasks.getRange(2, 1, sheets.tasks.getLastRow() - 1, 1).getValues();
    let taskRowIndex = -1;
    
    for (let i = 0; i < tasksValues.length; i++) {
      if (tasksValues[i][0] === taskId) {
        taskRowIndex = i + 2; // +2 do index bắt đầu từ 0 và dòng đầu tiên là header
        break;
      }
    }
    
    if (taskRowIndex === -1) {
      return { success: false, message: "Không tìm thấy công việc" };
    }
    
    // Xóa công việc chính
    sheets.tasks.deleteRow(taskRowIndex);
    
    // Xóa công việc con
    const subtasksSheet = sheets.subtasks;
    const subtasksData = subtasksSheet.getDataRange().getValues();
    
    for (let i = subtasksData.length - 1; i >= 1; i--) {
      if (subtasksData[i][1] === taskId) {
        subtasksSheet.deleteRow(i + 1);
      }
    }
    
    // Xóa người phụ trách
    const assigneesSheet = sheets.assignees;
    const assigneesData = assigneesSheet.getDataRange().getValues();
    
    for (let i = assigneesData.length - 1; i >= 1; i--) {
      if (assigneesData[i][0] === taskId) {
        assigneesSheet.deleteRow(i + 1);
      }
    }
    
    // Xóa tệp đính kèm
    const attachmentsSheet = sheets.attachments;
    const attachmentsData = attachmentsSheet.getDataRange().getValues();
    
    for (let i = attachmentsData.length - 1; i >= 1; i--) {
      if (attachmentsData[i][0] === taskId) {
        attachmentsSheet.deleteRow(i + 1);
      }
    }
    
    return { 
      success: true, 
      message: "Đã xóa công việc thành công!" 
    };
  } catch (e) {
    Logger.log("Lỗi khi xóa công việc: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra: " + e.toString() 
    };
  }
}

// Hàm xử lý tệp đính kèm
function uploadFile(fileBlob, fileName) {
  try {
    // Xử lý URL
    if (typeof fileBlob === 'string' && (fileBlob.startsWith('http') || fileBlob.startsWith('https'))) {
      const url = fileBlob;
      const name = fileName || url.split('/').pop() || 'file';
      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name);
      
      return {
        success: true,
        fileInfo: {
          name: name,
          type: isImage ? 'image' : 'file',
          url: url
        }
      };
    }
    
    // Nếu không phải URL hợp lệ, trả về lỗi
    return { 
      success: false, 
      message: "URL không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://"
    };
    
  } catch (e) {
    Logger.log("Lỗi khi xử lý URL: " + e.toString());
    return { 
      success: false, 
      message: "Có lỗi xảy ra khi xử lý URL: " + e.toString() 
    };
  }
}

// Hàm kiểm tra và cập nhật công việc quá hạn
function checkOverdueTasks() {
  try {
    const sheets = setupSheets();
    const tasksSheet = sheets.tasks;
    const tasksData = tasksSheet.getDataRange().getValues();
    
    // Lấy ngày hiện tại - định dạng dd/mm/yyyy
    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), "dd/MM/yyyy");
    Logger.log("Ngày hiện tại: " + todayStr);
    
    // Chuyển đổi chuỗi ngày thành đối tượng Date
    function parseDate(dateStr) {
      if (!dateStr) return null;
      
      try {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
        const year = parseInt(parts[2], 10);
        
        return new Date(year, month, day);
      } catch (e) {
        Logger.log("Lỗi khi phân tích ngày: " + dateStr);
        return null;
      }
    }
    
    let hasUpdated = false;
    
    // Duyệt qua tất cả công việc
    for (let i = 1; i < tasksData.length; i++) {
      const row = tasksData[i];
      if (!row[0]) continue; // Bỏ qua hàng trống
      
      const taskId = row[0];
      const status = row[3];
      const dueDate = row[6];
      
      // Bỏ qua nếu công việc đã hoàn thành, đã huỷ hoặc đã quá hạn
      if (status === 'done' || status === 'cancelled' || status === 'overdue') {
        continue;
      }
      
      // Kiểm tra ngày kết thúc
      const dueDateObj = parseDate(dueDate);
      
      // So sánh chính xác ngày (không tính giờ)
      if (dueDateObj) {
        const dueDateOnly = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (dueDateOnly < todayOnly) {
          // Cập nhật trạng thái thành quá hạn
          tasksSheet.getRange(i + 1, 4).setValue('overdue');
          hasUpdated = true;
          Logger.log("Đã cập nhật công việc " + taskId + " thành quá hạn");
        }
      }
    }
    
    return hasUpdated;
  } catch (e) {
    Logger.log("Lỗi khi kiểm tra công việc quá hạn: " + e.toString());
    return false;
  }
}

// Hàm lọc công việc theo điều kiện
function filterTasks(filterOptions) {
  try {
    const allTasks = getTasks();
    let filteredTasks = [...allTasks];
    
    // Lọc theo người phụ trách
    if (filterOptions.assignee) {
      filteredTasks = filteredTasks.filter(task => 
        task.assignees && task.assignees.includes(filterOptions.assignee)
      );
    }
    
    // Lọc theo ngày - SỬA LOGIC
    if (filterOptions.startDate) {
      const filterDate = new Date(filterOptions.startDate);
      // Đặt về 00:00:00 để so sánh chính xác ngày
      filterDate.setHours(0, 0, 0, 0);
      
      filteredTasks = filteredTasks.filter(task => {
        // Nếu không có ngày bắt đầu hoặc kết thúc, bỏ qua
        if (!task.startDate && !task.dueDate) return false;
        
        // Parse ngày bắt đầu của task
        let taskStartDate = null;
        if (task.startDate) {
          const startParts = task.startDate.split('/');
          if (startParts.length === 3) {
            taskStartDate = new Date(
              parseInt(startParts[2]), // năm
              parseInt(startParts[1]) - 1, // tháng (0-11)
              parseInt(startParts[0]) // ngày
            );
          }
        }
        
        // Parse ngày kết thúc của task
        let taskDueDate = null;
        if (task.dueDate) {
          const dueParts = task.dueDate.split('/');
          if (dueParts.length === 3) {
            taskDueDate = new Date(
              parseInt(dueParts[2]), // năm
              parseInt(dueParts[1]) - 1, // tháng (0-11)
              parseInt(dueParts[0]) // ngày
            );
            // Đặt về cuối ngày để bao gồm cả ngày kết thúc
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
    if (filterOptions.keyword) {
      const keyword = filterOptions.keyword.toLowerCase();
      
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword) ||
        (task.subtasks && task.subtasks.some(sub => sub.text.toLowerCase().includes(keyword)))
      );
    }
    
    return filteredTasks;
  } catch (e) {
    Logger.log("Lỗi khi lọc công việc: " + e.toString());
    return [];
  }
}