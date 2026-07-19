// Hàm doGet - xử lý cả web app và API requests
function doGet(e) {
  // Nếu có parameter action => trả về JSON (API mode)
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter);
  }
  
  // Nếu không => trả về HTML (web app mode)
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Quản lý công việc TTHT')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .addMetaTag('description', 'quản lý công việc TTHT')
    .addMetaTag('og:title', 'Quản lý công việc TTHT')
    .addMetaTag('og:description', 'quản lý công việc TTHT')
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
      case 'getDocuments':
        result = getDocuments();
        break;
      case 'addDocument':
        var docData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = addDocument(docData);
        break;
      case 'updateDocument':
        var docData2 = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
        result = updateDocument(docData2);
        break;
      case 'deleteDocument':
        result = deleteDocument(params.docId);
        break;
      case 'uploadFile':
        result = uploadFileToDrive(params.base64Data, params.fileName, params.mimeType);
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

// Cache spreadsheet trong cùng 1 lần thực thi
let _cachedSs = null;

function getSs() {
  if (_cachedSs) return _cachedSs;
  try {
    _cachedSs = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    _cachedSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return _cachedSs;
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
        "Ngày bắt đầu", "Ngày kết thúc", "Tiến độ", "Kế hoạch", "Thực hiện", "Tỷ lệ", "Ghi chú", "Ngày làm xong"
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
    
    let documents = ss.getSheetByName("Documents");
    if (!documents) {
      documents = ss.insertSheet("Documents");
      documents.appendRow([
        "ID", "Số hồ sơ", "Tên hồ sơ", "Danh mục", "Phòng ban",
        "Ngày ban hành", "Ngày kết thúc", "Dự án", "Nhà cung cấp",
        "Tình trạng", "Giá trị HĐ", "Giá trị thực hiện", "Chênh lệch",
        "File Name", "File URL", "Mô tả", "Ngày tạo"
      ]);
    }
    
    return {
      tasks: tasks,
      subtasks: subtasks,
      assignees: assignees,
      attachments: attachments,
      documents: documents
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

// Cache dữ liệu users và teams trong cùng 1 lần thực thi
let _cachedUsers = null;
let _cachedTeamsData = null;

// Hàm lấy dữ liệu người dùng có kèm thông tin Tổ (Team)
function getUsers() {
  if (_cachedUsers) return _cachedUsers;
  try {
    const ss = getSs();
    const usersSheet = ss.getSheetByName("Users");
    if (!usersSheet) return [];
    
    const lastRow = usersSheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const usersData = usersSheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const nameToTeam = getTeamsData();
    
    _cachedUsers = usersData.map(row => {
      const name = String(row[1]);
      let team = String(row[2]).trim();
      // Nếu cột C (Viết tắt/Tổ) trống hoặc quá ngắn, thử tra cứu từ sheet "To"
      if (!team || team.length <= 4) {
        team = nameToTeam[name.trim().toLowerCase()] || team;
      }
      return {
        id: String(row[0]),
        name: name,
        initials: team,
        team: team
      };
    });
    return _cachedUsers;
  } catch(e) {
    Logger.log("Lỗi khi lấy danh sách người dùng: " + e.toString());
    return [];
  }
}

// Lấy thông tin ánh xạ Họ tên -> Tổ từ sheet "To"
function getTeamsData() {
  if (_cachedTeamsData) return _cachedTeamsData;
  try {
    const ss = getSs();
    const toSheet = ss.getSheetByName("To");
    if (!toSheet) return {};
    
    const lastRow = toSheet.getLastRow();
    if (lastRow <= 1) return {};
    
    const data = toSheet.getRange(2, 1, lastRow - 1, 4).getValues();
    _cachedTeamsData = {};
    data.forEach(row => {
      const team = row[0]; // Cột A: Tổ
      const name = row[2]; // Cột C: Họ và tên
      if (name && team) {
        _cachedTeamsData[String(name).trim().toLowerCase()] = String(team).trim();
      }
    });
    return _cachedTeamsData;
  } catch(e) {
    Logger.log("Lỗi lấy thông tin ánh xạ Tổ: " + e.toString());
    return {};
  }
}

// Lấy danh sách tên các Tổ độc nhất từ sheet "To" và sheet "Users"
function getTeams() {
  try {
    const ss = getSs();
    const teamsSet = new Set();
    
    // Đọc từ sheet "To"
    const toSheet = ss.getSheetByName("To");
    if (toSheet) {
      const lastRow = toSheet.getLastRow();
      if (lastRow > 1) {
        const data = toSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        data.forEach(row => {
          if (row[0]) teamsSet.add(String(row[0]).trim());
        });
      }
    }
    
    // Đọc từ sheet "Users" (Cột C: Tổ/Viết tắt)
    const usersSheet = ss.getSheetByName("Users");
    if (usersSheet) {
      const lastRow = usersSheet.getLastRow();
      if (lastRow > 1) {
        const data = usersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
        data.forEach(row => {
          if (row[0] && String(row[0]).trim().toLowerCase() !== "null") {
            const val = String(row[0]).trim();
            // Chỉ thêm nếu có vẻ là tên Tổ (ví dụ độ dài > 4 ký tự)
            if (val.length > 4) {
              teamsSet.add(val);
            }
          }
        });
      }
    }
    
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
    const tasksData = sheets.tasks.getRange(2, 1, Math.max(1, sheets.tasks.getLastRow() - 1), 16).getValues();
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
      let progress = parseInt(row[10]);
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
      if (row[8]) {
        // Đảm bảo định dạng dd/MM/yyyy
        const dateValue = row[8];
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
      if (row[9]) {
        // Đảm bảo định dạng dd/MM/yyyy
        const dateValue = row[9];
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
      
      const task = {
        id: taskId,
        title: String(row[1]),
        description: String(row[2]),
        status: String(row[6]),
        priority: String(row[7]),
        startDate: startDate,
        dueDate: dueDate,
        progress: progress,
        planValue: row[11] !== undefined && row[11] !== "" ? Number(row[11]) : 0,
        actualValue: row[12] !== undefined && row[12] !== "" ? Number(row[12]) : 0,
        notes: row[14] !== undefined ? String(row[14]) : "",
        completionDate: row[15] !== undefined ? String(row[15]) : "",
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

    // Lấy thông tin người phụ trách MỘT LẦN DUY NHẤT
    let allUsers = [];
    let usersMap = {};
    let assigneeIds = "";
    let assigneeNames = "";
    let assigneeTeams = "";
    if (taskData.assignees && taskData.assignees.length > 0) {
      allUsers = getUsers();
      allUsers.forEach(user => {
        usersMap[user.id] = { name: user.name, initials: user.initials };
      });
      const matchedUsers = taskData.assignees.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
      assigneeIds = matchedUsers.map(u => u.id).join(', ');
      assigneeNames = matchedUsers.map(u => u.name).join(', ');
      assigneeTeams = matchedUsers.map(u => u.team || '').filter(Boolean).join(', ');
    }

    const nextRow = sheets.tasks.getLastRow() + 1;
    const ratioFormula = `=IF(L${nextRow}>0; M${nextRow}/L${nextRow}; 0)`;

    // Thêm công việc chính
    sheets.tasks.appendRow([
      taskId,
      taskData.title,
      taskData.description || "",
      assigneeIds,
      assigneeNames,
      assigneeTeams,
      taskData.status || "inprogress",
      taskData.priority || "medium",
      taskData.startDate || "",
      taskData.dueDate || "",
      taskData.subtasks && taskData.subtasks.length > 0 ? "0" : "",
      taskData.planValue !== undefined ? Number(taskData.planValue) : 0,
      taskData.actualValue !== undefined ? Number(taskData.actualValue) : 0,
      ratioFormula,
      taskData.notes || "",
      taskData.completionDate || ""
    ]);
    
    // Thêm công việc con
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const subtaskRows = taskData.subtasks.map((subtask, index) => [
        `subtask-${taskId}-${index}`,
        taskId,
        subtask.text,
        subtask.completed ? "true" : "false"
      ]);
      const lastRow = sheets.subtasks.getLastRow();
      sheets.subtasks.getRange(lastRow + 1, 1, subtaskRows.length, 4).setValues(subtaskRows);
    }
    
    // Thêm người phụ trách (dùng usersMap đã cache)
    if (taskData.assignees && taskData.assignees.length > 0) {
      const assigneeRows = [];
      taskData.assignees.forEach(assigneeId => {
        if (usersMap[assigneeId]) {
          assigneeRows.push([
            taskId,
            assigneeId,
            usersMap[assigneeId].name,
            usersMap[assigneeId].initials
          ]);
        }
      });
      
      if (assigneeRows.length > 0) {
        const lastRow = sheets.assignees.getLastRow();
        sheets.assignees.getRange(lastRow + 1, 1, assigneeRows.length, 4).setValues(assigneeRows);
      }
    }
    
    // Thêm tệp đính kèm
    if (taskData.attachments && taskData.attachments.length > 0) {
      const attachmentRows = taskData.attachments.map(attachment => [
        taskId,
        attachment.name,
        attachment.type,
        attachment.url
      ]);
      const lastRow = sheets.attachments.getLastRow();
      sheets.attachments.getRange(lastRow + 1, 1, attachmentRows.length, 4).setValues(attachmentRows);
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

// Hàm cập nhật công việc (tối ưu tốc độ)
function updateTask(taskData) {
  try {
    if (!taskData.id) {
      return { success: false, message: "ID công việc không hợp lệ" };
    }
    
    const sheets = setupSheets();
    const taskId = taskData.id;
    
    // Tìm vị trí của công việc trong sheet
    const lastTaskRow = sheets.tasks.getLastRow();
    if (lastTaskRow <= 1) {
      return { success: false, message: "Không có công việc nào trong danh sách" };
    }
    const tasksValues = sheets.tasks.getRange(2, 1, lastTaskRow - 1, 1).getValues();
    let taskRowIndex = -1;
    
    for (let i = 0; i < tasksValues.length; i++) {
      if (String(tasksValues[i][0]).trim() === String(taskId).trim()) {
        taskRowIndex = i + 2;
        break;
      }
    }
    
    if (taskRowIndex === -1) {
      return { success: false, message: "Không tìm thấy công việc với ID: " + taskId };
    }
    
    // Định dạng ngày
    let startDate = taskData.startDate || "";
    let dueDate = taskData.dueDate || "";
    
    if (startDate && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(startDate)) {
      try {
        const date = new Date(startDate);
        if (!isNaN(date.getTime())) {
          startDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        }
      } catch (e) {}
    }
    
    if (dueDate && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dueDate)) {
      try {
        const date = new Date(dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        }
      } catch (e) {}
    }
    
    // Lấy danh sách users MỘT LẦN DUY NHẤT
    let allUsers = [];
    let usersMap = {};
    if (taskData.assignees && taskData.assignees.length > 0) {
      allUsers = getUsers();
      allUsers.forEach(user => {
        usersMap[user.id] = { name: user.name, initials: user.initials };
      });
    }
    
    // Tính thông tin người phụ trách
    let assigneeIds = "";
    let assigneeNames = "";
    let assigneeTeams = "";
    if (taskData.assignees && taskData.assignees.length > 0) {
      const matchedUsers = taskData.assignees.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
      assigneeIds = matchedUsers.map(u => u.id).join(', ');
      assigneeNames = matchedUsers.map(u => u.name).join(', ');
      assigneeTeams = matchedUsers.map(u => u.team || '').filter(Boolean).join(', ');
    }

    // Tính toán tiến độ
    let progress = 0;
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const completed = taskData.subtasks.filter(sub => sub.completed).length;
      progress = Math.round((completed / taskData.subtasks.length) * 100);
    } else if (taskData.status === "done") {
      progress = 100;
    } else if (taskData.status === "cancelled") {
      progress = 0;
    }

    // Cập nhật thông tin công việc bằng 1 lệnh duy nhất (Cột 2 đến Cột 16 = 15 cột)
    sheets.tasks.getRange(taskRowIndex, 2, 1, 15).setValues([[
      taskData.title,
      taskData.description || "",
      assigneeIds,
      assigneeNames,
      assigneeTeams,
      taskData.status || "inprogress",
      taskData.priority || "medium",
      startDate,
      dueDate,
      progress.toString(),
      taskData.planValue !== undefined ? Number(taskData.planValue) : 0,
      taskData.actualValue !== undefined ? Number(taskData.actualValue) : 0,
      `=IF(L${taskRowIndex}>0; M${taskRowIndex}/L${taskRowIndex}; 0)`,
      taskData.notes || "",
      taskData.completionDate || ""
    ]]);
    
    // Xóa công việc con cũ và thêm mới
    deleteRowsFast(sheets.subtasks, taskId, 1);
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const subtaskRows = taskData.subtasks.map((subtask, index) => [
        subtask.id || `subtask-${taskId}-${index}`,
        taskId,
        subtask.text,
        subtask.completed ? "true" : "false"
      ]);
      const lastRow = sheets.subtasks.getLastRow();
      sheets.subtasks.getRange(lastRow + 1, 1, subtaskRows.length, 4).setValues(subtaskRows);
    }
    
    // Xóa người phụ trách cũ và thêm mới (dùng usersMap đã cache)
    deleteRowsFast(sheets.assignees, taskId, 0);
    if (taskData.assignees && taskData.assignees.length > 0) {
      const assigneeRows = [];
      taskData.assignees.forEach(assigneeId => {
        if (usersMap[assigneeId]) {
          assigneeRows.push([
            taskId,
            assigneeId,
            usersMap[assigneeId].name,
            usersMap[assigneeId].initials
          ]);
        }
      });
      
      if (assigneeRows.length > 0) {
        const lastRow = sheets.assignees.getLastRow();
        sheets.assignees.getRange(lastRow + 1, 1, assigneeRows.length, 4).setValues(assigneeRows);
      }
    }
    
    // Xóa tệp đính kèm cũ và thêm mới
    deleteRowsFast(sheets.attachments, taskId, 0);
    if (taskData.attachments && taskData.attachments.length > 0) {
      const attachmentRows = taskData.attachments.map(attachment => [
        taskId,
        attachment.name,
        attachment.type,
        attachment.url
      ]);
      const lastRow = sheets.attachments.getLastRow();
      sheets.attachments.getRange(lastRow + 1, 1, attachmentRows.length, 4).setValues(attachmentRows);
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

// Hàm xóa nhanh - chỉ xóa các dòng khớp taskId (từ dưới lên để không lệch index)
function deleteRowsFast(sheet, taskId, taskIdColumnIndex) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    
    // Đọc chỉ cột taskId để tìm dòng cần xóa
    const data = sheet.getRange(2, taskIdColumnIndex + 1, lastRow - 1, 1).getValues();
    const rowsToDelete = [];
    
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(taskId).trim()) {
        rowsToDelete.push(i + 2);
      }
    }
    
    // Xóa từ dưới lên để không bị lệch index
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.deleteRow(rowsToDelete[i]);
    }
  } catch (e) {
    Logger.log("Lỗi deleteRowsFast: " + e.toString());
  }
}

// Hàm phụ trợ xóa các dòng khớp taskId (phương pháp cũ, dùng cho deleteTask)
function deleteRowsByTaskId(sheet, taskId, taskIdColumnIndex) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
  const newRows = [];
  let hasDeleted = false;
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0 || data[i][taskIdColumnIndex] !== taskId) {
      newRows.push(data[i]);
    } else {
      hasDeleted = true;
    }
  }
  
  if (hasDeleted) {
    sheet.clearContents();
    sheet.getRange(1, 1, newRows.length, newRows[0].length).setValues(newRows);
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
      const status = row[6];
      const dueDate = row[9];
      
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
          tasksSheet.getRange(i + 1, 7).setValue('overdue');
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

// ==================== QUẢN LÝ TÀI LIỆU ====================

// Lấy danh sách tất cả tài liệu
function getDocuments() {
  try {
    const ss = getSs();
    let docSheet = ss.getSheetByName("Documents");
    if (!docSheet) {
      setupSheets();
      docSheet = ss.getSheetByName("Documents");
    }
    const lastRow = docSheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = docSheet.getRange(2, 1, lastRow - 1, 17).getValues();
    const documents = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      documents.push({
        id: String(row[0]),
        docNumber: String(row[1]),
        title: String(row[2]),
        category: String(row[3]),
        department: String(row[4]),
        issueDate: String(row[5]),
        endDate: String(row[6]),
        project: String(row[7]),
        supplier: String(row[8]),
        status: String(row[9]),
        contractValue: Number(row[10]) || 0,
        actualValue: Number(row[11]) || 0,
        diffValue: Number(row[12]) || 0,
        fileName: String(row[13]),
        fileUrl: String(row[14]),
        description: String(row[15]),
        createdAt: String(row[16])
      });
    }
    return documents;
  } catch (e) {
    Logger.log("Lỗi lấy tài liệu: " + e.toString());
    return [];
  }
}

// Thêm tài liệu mới
function addDocument(docData) {
  try {
    if (!docData.title) {
      return { success: false, message: "Tên hồ sơ không được để trống" };
    }
    const ss = getSs();
    let docSheet = ss.getSheetByName("Documents");
    if (!docSheet) {
      setupSheets();
      docSheet = ss.getSheetByName("Documents");
    }
    
    const now = new Date();
    const formattedDate = now.getFullYear().toString().slice(-2) + 
        ('0' + (now.getMonth() + 1)).slice(-2) + 
        ('0' + now.getDate()).slice(-2) + 
        ('0' + now.getHours()).slice(-2) + 
        ('0' + now.getMinutes()).slice(-2) + 
        ('0' + now.getSeconds()).slice(-2);
    const docId = "doc-" + formattedDate;
    
    const contractVal = Number(docData.contractValue) || 0;
    const actualVal = Number(docData.actualValue) || 0;
    const diffVal = contractVal - actualVal;
    
    docSheet.appendRow([
      docId,
      docData.docNumber || "",
      docData.title,
      docData.category || "",
      docData.department || "",
      docData.issueDate || "",
      docData.endDate || "",
      docData.project || "",
      docData.supplier || "",
      docData.status || "Đang hiệu lực",
      contractVal,
      actualVal,
      diffVal,
      docData.fileName || "",
      docData.fileUrl || "",
      docData.description || "",
      now.toISOString()
    ]);
    
    return { success: true, message: "Thêm tài liệu thành công", docId: docId };
  } catch (e) {
    Logger.log("Lỗi thêm tài liệu: " + e.toString());
    return { success: false, message: "Lỗi: " + e.toString() };
  }
}

// Cập nhật tài liệu
function updateDocument(docData) {
  try {
    if (!docData.id || !docData.title) {
      return { success: false, message: "Thiếu ID hoặc Tên hồ sơ" };
    }
    const ss = getSs();
    const docSheet = ss.getSheetByName("Documents");
    if (!docSheet) {
      return { success: false, message: "Không tìm thấy sheet Documents" };
    }
    
    const lastRow = docSheet.getLastRow();
    const data = docSheet.getRange(1, 1, lastRow, 1).getValues();
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]) === docData.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: "Không tìm thấy tài liệu" };
    }
    
    const contractVal = Number(docData.contractValue) || 0;
    const actualVal = Number(docData.actualValue) || 0;
    const diffVal = contractVal - actualVal;
    
    docSheet.getRange(rowIndex, 2).setValue(docData.docNumber || "");
    docSheet.getRange(rowIndex, 3).setValue(docData.title);
    docSheet.getRange(rowIndex, 4).setValue(docData.category || "");
    docSheet.getRange(rowIndex, 5).setValue(docData.department || "");
    docSheet.getRange(rowIndex, 6).setValue(docData.issueDate || "");
    docSheet.getRange(rowIndex, 7).setValue(docData.endDate || "");
    docSheet.getRange(rowIndex, 8).setValue(docData.project || "");
    docSheet.getRange(rowIndex, 9).setValue(docData.supplier || "");
    docSheet.getRange(rowIndex, 10).setValue(docData.status || "Đang hiệu lực");
    docSheet.getRange(rowIndex, 11).setValue(contractVal);
    docSheet.getRange(rowIndex, 12).setValue(actualVal);
    docSheet.getRange(rowIndex, 13).setValue(diffVal);
    docSheet.getRange(rowIndex, 14).setValue(docData.fileName || "");
    docSheet.getRange(rowIndex, 15).setValue(docData.fileUrl || "");
    docSheet.getRange(rowIndex, 16).setValue(docData.description || "");
    
    return { success: true, message: "Cập nhật tài liệu thành công" };
  } catch (e) {
    Logger.log("Lỗi cập nhật tài liệu: " + e.toString());
    return { success: false, message: "Lỗi: " + e.toString() };
  }
}

// Xóa tài liệu
function deleteDocument(docId) {
  try {
    if (!docId) {
      return { success: false, message: "Thiếu ID tài liệu" };
    }
    const ss = getSs();
    const docSheet = ss.getSheetByName("Documents");
    if (!docSheet) {
      return { success: false, message: "Không tìm thấy sheet Documents" };
    }
    
    const lastRow = docSheet.getLastRow();
    const data = docSheet.getRange(1, 1, lastRow, 1).getValues();
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]) === docId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: "Không tìm thấy tài liệu" };
    }
    
    docSheet.deleteRow(rowIndex);
    return { success: true, message: "Xóa tài liệu thành công" };
  } catch (e) {
    Logger.log("Lỗi xóa tài liệu: " + e.toString());
    return { success: false, message: "Lỗi: " + e.toString() };
  }
}

// Tải file lên Google Drive
function uploadFileToDrive(base64Data, fileName, mimeType) {
  try {
    var parts = base64Data.split(',');
    var base64String = parts.length > 1 ? parts[1] : parts[0];
    var decoded = Utilities.base64Decode(base64String);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    var folderName = "TTHT_Documents";
    var folder;
    var folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      url: file.getUrl(),
      name: fileName
    };
  } catch (e) {
    Logger.log("Lỗi tải tệp lên Drive: " + e.toString());
    return { success: false, message: "Lỗi tải tệp: " + e.toString() };
  }
}

// Hàm chạy thử để kích hoạt hộp thoại cấp quyền Google Drive (cả quyền đọc và ghi)
function triggerDriveAuth() {
  const folder = DriveApp.createFolder("TTHT_Auth_Test_Folder");
  // Xoá thư mục test vừa tạo ngay lập tức
  folder.setTrashed(true);
  Logger.log("Đã kích hoạt đủ quyền đọc và ghi thành công!");
}