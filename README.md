# 📋 Quản Lý Công Việc - TTHT (CongviecTTHT)

Ứng dụng quản lý công việc sử dụng **Google Apps Script** và **Google Sheets** làm backend, với giao diện web hiện đại hỗ trợ nhiều chế độ xem.

## 🌐 Truy cập ứng dụng

- **Web App**: [https://script.google.com/macros/s/AKfycbzP7tqnlPoQE10FKdNGzk5vdhpck_UtMCqqK-Udod1sjGfsYcy2GtBi5J8A4Ff7sk66/exec](https://script.google.com/macros/s/AKfycbzP7tqnlPoQE10FKdNGzk5vdhpck_UtMCqqK-Udod1sjGfsYcy2GtBi5J8A4Ff7sk66/exec)
- **Google Sheets**: [Dữ liệu Spreadsheet](https://docs.google.com/spreadsheets/d/1r2lWfbeHh7LXqOOH1Dmgd4IEwgudw3kGqbk3UORKDVc/edit?gid=1426639223#gid=1426639223)

## ✨ Tính năng chính

### 📊 Ba chế độ xem
- **Kanban Board**: Kéo thả công việc giữa các cột trạng thái (Đang thực hiện, Hoàn thành, Quá hạn, Đã huỷ)
- **Danh sách (List View)**: Xem tổng quan dạng bảng với đầy đủ thông tin
- **Biểu đồ Gantt**: Theo dõi tiến độ theo dòng thời gian, điều hướng theo tháng

### 📝 Quản lý công việc
- Thêm / Sửa / Xóa công việc
- Phân loại theo mức độ ưu tiên (Cao, Trung bình, Thấp)
- Theo dõi ngày bắt đầu và hạn hoàn thành
- Quản lý công việc con (subtasks) với tiến độ tự động
- Đính kèm tệp và URL

### 👥 Quản lý người dùng
- Thêm / Sửa / Xóa người dùng
- Gán người phụ trách cho từng công việc
- Hiển thị avatar viết tắt

### 🔍 Tìm kiếm & Lọc
- Tìm kiếm theo từ khóa
- Lọc theo người phụ trách
- Lọc theo ngày hoạt động

### ⚡ Tự động hoá
- Tự động phát hiện và chuyển trạng thái công việc quá hạn
- Cập nhật tiến độ tự động dựa trên công việc con
- Bộ nhớ đệm (cache) để tăng tốc độ tải

## 📁 Cấu trúc dự án

| File | Mô tả |
|------|--------|
| `Code.gs` | Backend - Google Apps Script xử lý dữ liệu (CRUD, lọc, kiểm tra quá hạn) |
| `index.html` | Giao diện HTML chính - cấu trúc trang, modal, form |
| `CSS.js` | Stylesheet dạng `<style>` - thiết kế gradient, responsive, animation |
| `JavaScript.js` | Frontend logic - render, drag & drop, CRUD, Gantt, filter, cache |

## 🗄️ Cấu trúc Google Sheets

| Sheet | Cột |
|-------|------|
| **Tasks** | ID, Tiêu đề, Mô tả, Trạng thái, Mức độ ưu tiên, Ngày bắt đầu, Ngày kết thúc, Tiến độ |
| **Subtasks** | ID, ID công việc chính, Nội dung, Hoàn thành |
| **Assignees** | ID công việc, ID người dùng, Tên người dùng, Chữ viết tắt |
| **Attachments** | ID công việc, Tên file, Loại file, URL |
| **Users** | ID, Tên, Chữ viết tắt |

## 🚀 Hướng dẫn triển khai

### 1. Tạo Google Apps Script Project
1. Mở Google Sheets → Extensions → Apps Script
2. Copy nội dung từng file vào project:
   - `Code.gs` → Tạo file `Code.gs`
   - `index.html` → Tạo file `Index.html`
   - `CSS.js` → Tạo file `CSS.html` (đổi đuôi sang .html)
   - `JavaScript.js` → Tạo file `JavaScript.html` (đổi đuôi sang .html)

### 2. Deploy Web App
1. Trong Apps Script → Deploy → New deployment
2. Chọn type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy**

### 3. Lần đầu sử dụng
- Ứng dụng sẽ tự động tạo các sheet cần thiết khi truy cập lần đầu
- Dữ liệu mẫu sẽ được thêm vào nếu sheet Tasks trống

## 🎨 Thiết kế

- **Color scheme**: Gradient `#4568dc` → `#b06ab3` (Electric Indigo)
- **Font**: Roboto (Google Fonts)
- **Responsive**: Hỗ trợ desktop và mobile
- **Animations**: Fade-in, slide-down, drag & drop, skeleton loading

## 📱 Screenshots

### Kanban View
Giao diện kéo thả trực quan với 4 cột trạng thái

### List View
Bảng dữ liệu đầy đủ với sorting và filtering

### Gantt Chart
Biểu đồ Gantt theo dõi tiến độ theo tháng

---

**Phát triển bởi**: Trung tâm Hạ tầng - VNPT  
**Công nghệ**: Google Apps Script, Google Sheets, HTML/CSS/JavaScript
