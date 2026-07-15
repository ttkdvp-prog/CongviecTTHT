<style>
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

/* Scrollbar tùy chỉnh */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Header Styles */
.header {
  background: linear-gradient(135deg, #4568dc, #b06ab3);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-weight: 500;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
}

.header h1 i {
  margin-right: 0.8rem;
  font-size: 1.6rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-right: 1rem;
  font-weight: 500;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

/* Control Panel Styles */
.control-panel {
  background-color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.action-button {
  background-color: #4568dc;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: background-color 0.3s, transform 0.2s;
}

.action-button i {
  margin-right: 0.5rem;
}

.action-button:hover {
  background-color: #3a57c4;
  transform: translateY(-2px);
}

.action-button:active {
  transform: translateY(0);
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  width: 300px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.search-box:focus-within {
  box-shadow: 0 0 0 2px rgba(69, 104, 220, 0.2);
}

.search-box input {
  flex: 1;
  border: none;
  padding: 0.6rem 1rem;
  outline: none;
  font-size: 0.9rem;
}

.search-box button {
  background-color: #f5f7fa;
  border: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: #555;
  transition: background-color 0.3s;
}

.search-box button:hover {
  background-color: #e2e5eb;
}

.view-options {
  display: flex;
}

.view-btn {
  background-color: transparent;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s;
}

.view-btn i {
  margin-right: 0.5rem;
}

.view-btn.active {
  background-color: #4568dc;
  color: white;
  border-color: #4568dc;
}

/* Kanban Board Styles */
.main-content {
  padding: 0 2rem 2rem;
}

.kanban-board {
  display: flex;
  height: calc(100vh - 200px);
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
  width: 100%;
}

.kanban-column {
  background-color: #ebecf0;
  border-radius: 6px;
  flex: 1 1 0; /* Flex-grow: 1, flex-shrink: 1, flex-basis: 0 - để cột co giãn đều */
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  margin: 0 0.75rem;
  min-width: 250px; /* Giới hạn kích thước tối thiểu */
}

/* Đảm bảo cột đầu tiên không có margin-left và cột cuối không có margin-right */
.kanban-column:first-child {
  margin-left: 0;
}

.kanban-column:last-child {
  margin-right: 0;
}

.kanban-column:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.kanban-column.no-drop {
  background-color: #fff0f0;
  border-left: 3px solid #ff6b6b;
}

.kanban-column.no-drop .task-item {
  cursor: not-allowed;
}

.column-header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.column-header h3 {
  font-weight: 500;
  color: #172b4d;
  font-size: 1rem;
  flex: 1;
}

.task-count {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #555;
  margin: 0 0.5rem;
}

.add-column-task {
  background-color: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.add-column-task:hover {
  background-color: rgba(69, 104, 220, 0.1);
  color: #4568dc;
  transform: rotate(90deg);
}

.task-list {
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
  min-height: 100px;
  transition: background-color 0.3s;
}

.task-list.drag-over {
  background-color: rgba(69, 104, 220, 0.05);
}

.task-item {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: fadeIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.task-item:active {
  cursor: grabbing;
}

.task-item.dragging {
  opacity: 0.6;
  transform: scale(0.95) rotate(1deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.priority {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-weight: 500;
  text-transform: uppercase;
}

.priority.high {
  background-color: #ffebee;
  color: #d32f2f;
  border-left: 2px solid #d32f2f;
}

.priority.medium {
  background-color: #fff8e1;
  color: #ff8f00;
  border-left: 2px solid #ff8f00;
}

.priority.low {
  background-color: #e8f5e9;
  color: #388e3c;
  border-left: 2px solid #388e3c;
}

.task-actions {
  display: flex;
}

.task-actions button {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #888;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-actions button:hover {
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
}

.task-actions button.toggle-subtasks {
  transform-origin: center;
  transition: transform 0.3s;
}

.task-actions button.toggle-subtasks.collapsed {
  transform: rotate(-90deg);
}

.task-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #172b4d;
}

.task-desc {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.8rem;
  line-height: 1.4;
}

.attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.attachment {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7rem;
  color: #666;
  cursor: pointer;
  transition: transform 0.2s;
  max-width: 100px;
  text-align: center;
}

.attachment:hover {
  transform: scale(1.05);
}

.attachment.image-attachment img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
  margin-bottom: 0.2rem;
  border: 1px solid #eee;
}

.attachment.file-attachment i {
  font-size: 2rem;
  margin-bottom: 0.2rem;
}

.attachment.file-attachment i.fa-file-pdf {
  color: #f44336;
}

.attachment.file-attachment i.fa-file-word {
  color: #2196f3;
}

.attachment.file-attachment i.fa-file-excel {
  color: #4caf50;
}

.attachment.file-attachment i.fa-file-code {
  color: #ff9800;
}

.subtasks {
  margin-bottom: 0.8rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.85rem;
  animation: slideDown 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 200px;
    opacity: 1;
  }
}

.subtask-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.3rem;
  padding: 0.3rem 0;
  border-bottom: 1px dashed #eee;
}

.subtask-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.subtask-checkbox {
  margin-right: 0.5rem;
}

.subtask-checkbox:checked + label {
  text-decoration: line-through;
  color: #999;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #888;
}

.date-info {
  display: flex;
  gap: 0.8rem;
}

.date-info span {
  display: flex;
  align-items: center;
}

.date-info i {
  margin-right: 0.3rem;
}

.overdue {
  color: #f44336;
  font-weight: 500;
}

.assignees {
  display: flex;
  align-items: center;
}

.assignee-avatars {
  display: flex;
  margin-left: auto;
}

.avatar {
  width: 30px;
  height: 30px;
  background-color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.7rem;
  color: white;
  margin-left: -8px;
  border: 2px solid #fff;
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar:hover {
  transform: translateY(-3px);
  z-index: 2;
}

.avatar.small {
  width: 24px;
  height: 24px;
  font-size: 0.6rem;
}

.progress-bar {
  height: 4px;
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.8rem;
}

.progress-bar.cancelled {
  background-color: #ffebee;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #4568dc, #b06ab3);
  transition: width 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.progress-bar.cancelled .progress {
  background: #f44336;
}

/* List View Styles */
.list-view {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: calc(100vh - 200px);
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th, .task-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.task-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #555;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 #e0e0e0;
}

.task-table tbody tr {
  transition: all 0.3s;
}

.task-table tbody tr:hover {
  background-color: #f5f7fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.task-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.task-title-cell {
  display: flex;
  align-items: center;
}

.toggle-subtasks-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #888;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-subtasks-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.toggle-subtasks-btn.collapsed i {
  transform: rotate(-90deg);
}

.subtask-row {
  background-color: #f8f9fa !important;
  animation: slideDown 0.3s;
}

.subtasks-table {
  width: 100%;
  padding: 0.5rem 0;
}

.subtasks-table .subtask-row {
  display: flex;
  padding: 0.3rem 0;
  border-bottom: 1px dashed #e0e0e0;
}

.subtasks-table .subtask-row:last-child {
  border-bottom: none;
}

.subtasks-table .subtask-checkbox {
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subtasks-table .subtask-title {
  flex: 1;
}

.subtasks-table input[type="checkbox"]:checked + label {
  text-decoration: line-through;
  color: #999;
}

.priority-cell {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-cell.high {
  background-color: #ffebee;
  color: #d32f2f;
  border-left: 2px solid #d32f2f;
}

.priority-cell.medium {
  background-color: #fff8e1;
  color: #ff8f00;
  border-left: 2px solid #ff8f00;
}

.priority-cell.low {
  background-color: #e8f5e9;
  color: #388e3c;
  border-left: 2px solid #388e3c;
}

.status-cell {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-cell.inprogress {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.status-cell.done {
  background-color: #e0f2f1;
  color: #00897b;
}

.status-cell.overdue {
  background-color: #ffebee;
  color: #d32f2f;
}

.status-cell.cancelled {
  background-color: #f5f5f5;
  color: #757575;
  text-decoration: line-through;
}

.assignee-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.progress-bar-small {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.progress-bar-small span {
  font-size: 0.7rem;
  margin-left: 0.5rem;
  color: #666;
}

.progress-bar-small.cancelled {
  background-color: #ffebee;
}

.progress-bar-small .progress {
  height: 100%;
  background: linear-gradient(90deg, #4568dc, #b06ab3);
}

.progress-bar-small.cancelled .progress {
  background: #f44336;
}

.attachments-cell {
  display: flex;
  gap: 0.3rem;
}

.attachment-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.attachment-icon.image {
  background-color: #e3f2fd;
  color: #1976d2;
}

.attachment-icon.pdf {
  background-color: #ffebee;
  color: #d32f2f;
}

.attachment-icon.word {
  background-color: #e3f2fd;
  color: #1976d2;
}

.attachment-icon.excel {
  background-color: #e8f5e9;
  color: #388e3c;
}

.attachment-icon.code {
  background-color: #fff8e1;
  color: #ff8f00;
}

.action-cell {
  white-space: nowrap;
}

.action-cell button {
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #888;
  margin-right: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-cell button:hover {
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
}

.gantt-side-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.gantt-task-header {
  padding: 1rem;
  font-weight: 500;
  flex: 1;
}

.gantt-status-header {
  width: 120px;
  padding: 1rem;
  font-weight: 500;
  text-align: center;
}

.gantt-timeline-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f5f7fa;
  min-width: 100%;
  width: 100%;
}

.gantt-days {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
}

.gantt-day {
  min-width: 30px;
  width: 30px;
  flex: 1 1 30px;
  padding: 0.3rem 0;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  border-right: 1px solid #f0f0f0;
  box-sizing: border-box;
}

.gantt-day.weekend {
  background-color: #f9f9f9;
  color: #999;
}

.gantt-task-row, 
.gantt-subtask-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.gantt-task-row:hover {
  background-color: #f5f7fa;
}

.gantt-subtask-row {
  background-color: #fafafa;
}

.gantt-task-cell {
  flex: 1;
  padding: 0.7rem 1rem;
}

.gantt-status-cell {
  width: 120px;
  padding: 0.7rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gantt-task-title {
  display: flex;
  align-items: center;
}

.gantt-subtask-title {
  display: flex;
  align-items: center;
  padding-left: 1.5rem;
  font-size: 0.85rem;
}

.task-expander {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.task-expander.collapsed {
  transform: rotate(-90deg);
}

.gantt-task-title .priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  padding: 0;
}

.gantt-task-title .priority.high {
  background-color: #d32f2f;
}

.gantt-task-title .priority.medium {
  background-color: #ff8f00;
}

.gantt-task-title .priority.low {
  background-color: #388e3c;
}

.gantt-timeline-body {
  position: relative;
}

.gantt-timeline-row {
  height: 40px;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
}

.gantt-timeline-row.subtask {
  height: 30px;
  background-color: #fafafa;
}

.gantt-bar-container {
  position: relative;
  height: 100%;
  min-width: 100%;
  display: flex;
}

.gantt-bar {
  position: absolute;
  height: 18px;
  top: 50%;
  margin-top: -9px;
  background: linear-gradient(90deg, #4568dc, #b06ab3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.gantt-bar:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.gantt-bar.inprogress {
  background: linear-gradient(90deg, #4568dc, #b06ab3);
}

.gantt-bar.done {
  background: linear-gradient(90deg, #26a69a, #69f0ae);
}

.gantt-bar.overdue {
  background: linear-gradient(90deg, #f44336, #ff9e80);
}

.gantt-bar.cancelled {
  background: linear-gradient(90deg, #9e9e9e, #c7c7c7);
  height: 12px;
  margin-top: -6px;
  opacity: 0.7;
}

.gantt-bar-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.gantt-bar:hover .gantt-bar-label {
  opacity: 1;
}

.gantt-progress {
  position: absolute;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  top: 0;
  left: 0;
  border-radius: 4px;
}

/* Modal Styles */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: auto;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  margin: 5% auto;
  width: 90%;
  max-width: 700px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #4568dc, #b06ab3);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px 10px 0 0;
}

.modal-header h2 {
  font-weight: 500;
  font-size: 1.5rem;
  margin: 0;
}

.close-modal {
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-modal:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4568dc;
  box-shadow: 0 0 0 3px rgba(69, 104, 220, 0.2);
  outline: none;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

/* Assignee selector styles */
.assignee-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background-color: #f5f7fa;
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.assignee-option {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.assignee-option:hover {
  background-color: #f0f4ff;
  transform: translateY(-2px);
}

.assignee-option input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

/* Attachment inputs styles */
.attachment-inputs {
  margin-bottom: 0.8rem;
}

.attachment-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
}

.attachment-type {
  width: 80px !important;
  flex: 0 0 80px !important;
}

.attachment-file,
.attachment-url {
  flex: 1 !important;
  min-width: 0 !important;
}

.add-attachment-btn {
  background-color: #4568dc;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-attachment-btn:hover {
  background-color: #3a57c4;
  transform: rotate(90deg);
}

.attachment-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: 0.8rem;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px dashed #ddd;
  min-height: 80px;
}

.attachment-preview:empty::before {
  content: 'Không có tệp đính kèm';
  color: #999;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.preview-item {
  position: relative;
  width: 100px;
  background-color: white;
  border-radius: 4px;
  padding: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.3s;
}

.preview-item img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.preview-item i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.preview-item .preview-name {
  font-size: 0.7rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.preview-item .remove-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-item .remove-preview:hover {
  transform: scale(1.1);
}

/* Subtasks styles */
.subtasks-container {
  margin-bottom: 0.8rem;
}

.subtask-input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.subtask-title-input {
  flex: 1;
}

.add-subtask-btn {
  background-color: #4568dc;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-subtask-btn:hover {
  background-color: #3a57c4;
  transform: rotate(90deg);
}

.subtasks-list {
  padding: 0.8rem;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px dashed #ddd;
  min-height: 80px;
}

.subtasks-list:empty::before {
  content: 'Không có công việc con';
  color: #999;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.subtask-list-item {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s;
}

.subtask-list-item .subtask-checkbox {
  flex: 0 0 auto;
  margin-right: 10px;
  width: auto !important;
}

.subtask-list-item .subtask-text {
  flex: 1;
  white-space: normal;
  word-break: break-word;
  text-align: left;
}

.subtask-list-item .remove-subtask {
  flex: 0 0 auto;
  margin-left: 10px;
}

/* Sửa lỗi người phụ trách */
.assignee-option {
  margin-bottom: 5px;
}

.assignee-option input[type="checkbox"] {
  width: auto !important;
  margin-right: 8px !important;
}

.modal-body input[type="date"] {
  display: block;
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: 'Roboto', sans-serif;
  background-color: white;
  color: #333;
  visibility: visible !important;
  opacity: 1 !important;
  -webkit-appearance: auto !important;
  appearance: auto !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.subtask-list-item:last-child {
  margin-bottom: 0;
}

.subtask-list-item .subtask-text {
  flex: 1;
  margin: 0 0.5rem;
}

.subtask-list-item .remove-subtask {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  transition: all 0.3s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.subtask-list-item .remove-subtask:hover {
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
}

.form-actions {
  text-align: right;
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-actions button {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

#cancel-task-btn {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #666;
}

#cancel-task-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

#save-task-btn {
  background: linear-gradient(135deg, #4568dc, #b06ab3);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

#save-task-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s;
}

#save-task-btn:hover {
  box-shadow: 0 5px 15px rgba(69, 104, 220, 0.3);
  transform: translateY(-2px);
}

#save-task-btn:hover::before {
  left: 100%;
}

#save-task-btn:active {
  transform: translateY(0);
}

/* Filter Controls */
.filter-controls {
  display: flex;
  gap: 1rem;
  flex: 1;
  margin: 0 1.5rem;
}

.filter-dropdown {
  position: relative;
}

.filter-dropdown select,
.filter-dropdown input {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 180px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

/* Sửa lỗi hiển thị mũi tên kép */
.filter-dropdown select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 0l6 6 6-6z" fill="%23888"/></svg>');
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  padding-right: 30px;
}

/* Loại bỏ mũi tên măc định của trình duyệt */
.filter-dropdown select::-ms-expand {
  display: none;
}

/* Sửa lỗi icon date picker */
.filter-dropdown input[type="date"] {
  position: relative;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 30px;
}

/* Thêm icon lịch tùy chỉnh */
.filter-dropdown input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.8;
  cursor: pointer;
}

.filter-dropdown select:focus,
.filter-dropdown input:focus {
  border-color: #4568dc;
  box-shadow: 0 0 0 3px rgba(69, 104, 220, 0.2);
  outline: none;
}

/* Loại bỏ mũi tên giả ở filter dropdown */
.filter-dropdown::after {
  content: none;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  flex: 1;
  max-width: 400px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background-color: white;
}

.search-box:focus-within {
  border-color: #4568dc;
  box-shadow: 0 0 0 3px rgba(69, 104, 220, 0.2);
}

.search-box input {
  flex: 1;
  border: none;
  padding: 0.6rem 1rem;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
}

.search-box button {
  background-color: transparent;
  border: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: #555;
  transition: all 0.3s;
}

.search-box button:hover {
  color: #4568dc;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: none;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: relative;
  margin-bottom: 1rem;
}

.spinner:before, .spinner:after {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.spinner:before {
  width: 100%;
  height: 100%;
  background-image: linear-gradient(135deg, #4568dc 0%, #b06ab3 100%);
  animation: spin 1s infinite linear;
}

.spinner:after {
  width: 80%;
  height: 80%;
  background-color: white;
  top: 10%;
  left: 10%;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  font-weight: 500;
  color: #333;
}

/* Thông báo */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transform: translateX(120%) scale(0.9);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1001;
  display: flex;
  align-items: center;
}

.notification.success {
  background: linear-gradient(135deg, #43a047, #66bb6a);
}

.notification.error {
  background: linear-gradient(135deg, #e53935, #ef5350);
}

.notification.warning {
  background: linear-gradient(135deg, #ff8f00, #ffb74d);
}

.notification::before {
  content: '';
  margin-right: 0.8rem;
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
}

.notification.success::before {
  content: '\f00c';
}

.notification.error::before {
  content: '\f00d';
}

.notification.warning::before {
  content: '\f071';
}

.notification.show {
  transform: translateX(0) scale(1);
}

/* Effects & Animations */
@keyframes pulseEffect {
  0% {
    box-shadow: 0 0 0 0 rgba(69, 104, 220, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(69, 104, 220, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(69, 104, 220, 0);
  }
}

.pulse {
  animation: pulseEffect 1.5s infinite;
}

@keyframes shakeEffect {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-1deg); }
  50% { transform: translateX(5px) rotate(1deg); }
  75% { transform: translateX(-5px) rotate(-1deg); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shakeEffect 0.5s;
}

@keyframes bounceEffect {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.bounce {
  animation: bounceEffect 1s;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  
  .filter-controls {
    flex-direction: column;
    margin: 0;
  }
  
  .filter-dropdown select,
  .filter-dropdown input {
    width: 100%;
  }
  
  .view-options {
    display: flex;
    justify-content: space-between;
  }
  
  .kanban-column {
    min-width: 260px;
  }
  
  .modal-content {
    width: 95%;
    margin: 10% auto;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .gantt-container {
    flex-direction: column;
  }
  
  .gantt-side {
    width: 100%;
    min-width: 0;
    max-height: 40%;
  }
}

/* Custom Select & Date */
.custom-select, .custom-date {
  position: relative;
  display: inline-block;
}

.custom-select select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
  padding-right: 1rem;
}

.custom-date input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 1rem;
}

.custom-select::after {
  content: '\f0d7';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

.custom-date::after {
  content: '\f133';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

/* Ẩn icon mặc định của input date */
.custom-date input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

.refresh-button {
  margin-left: 10px;
  padding: 8px 12px;
  background-color: #4568dc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.refresh-button:hover {
  background-color: #3a57c4;
  transform: translateY(-2px);
}

.refresh-button:active {
  transform: translateY(0);
}

.refresh-button.rotating i {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Thêm điều khiển tháng */
.gantt-month-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
}

.month-nav-btn {
  background-color: #4568dc;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.month-nav-btn:hover {
  background-color: #3a57c4;
  transform: scale(1.1);
}

.month-nav-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.gantt-month {
  flex: 1;
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-align: center;
}

.gantt-view {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: calc(100vh - 200px);
}

.gantt-container {
  overflow: hidden !important;
  display: flex;
  height: 100%;
  overflow: auto; /* Chỉ sử dụng một thanh cuộn chính */
}

.gantt-side {
  width: 30%;
  min-width: 300px;
  border-right: 1px solid #e0e0e0;
  overflow: hidden; /* Loại bỏ thanh cuộn riêng */
}

.gantt-timeline {
  flex: 1;
  overflow: hidden; /* Loại bỏ thanh cuộn riêng */
  position: relative;
}

.gantt-side-header {
  height: 73px;
}

/* Sửa lỗi khung màu hồng và canh chỉnh tiêu đề */
.gantt-side-header, .gantt-timeline-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f5f7fa;
  border: none !important; /* Loại bỏ border */
  outline: none !important; /* Loại bỏ outline */
  box-shadow: 0 1px 0 #e0e0e0;
}

.gantt-task-header, .gantt-status-header {
  padding: 1rem;
  font-weight: 500;
  color: #333;
  border: none !important;
  outline: none !important;
  background-color: #f5f7fa;
}

/* Đảm bảo chiều cao dòng đồng nhất */
.gantt-task-row, .gantt-timeline-row {
  display: flex;
  align-items: center; /* Căn giữa theo chiều dọc */
  height: 40px;
  min-height: 40px;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
}

.gantt-subtask-row, .gantt-timeline-row.subtask {
  display: flex;
  align-items: center; /* Căn giữa theo chiều dọc */
  height: 30px;
  min-height: 30px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

/* CSS cho avatar người phụ trách trên thanh Gantt */
.gantt-bar {
  position: absolute;
  height: 18px;
  top: 50%;
  margin-top: -9px;
  background: linear-gradient(90deg, #4568dc, #b06ab3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gantt-bar-assignees {
  position: absolute;
  top: -15px;
  right: 0;
  display: flex;
  gap: 2px;
}

.gantt-bar-avatar {
  width: 22px;
  height: 22px;
  background-color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.65rem;
  color: white;
  border: 1px solid #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: transform 0.2s;
  z-index: 10;
}

.gantt-bar-avatar:hover {
  transform: translateY(-2px) scale(1.1);
  z-index: 11;
}

@keyframes shakeEffect {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-1deg); }
  50% { transform: translateX(5px) rotate(1deg); }
  75% { transform: translateX(-5px) rotate(-1deg); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shakeEffect 0.5s;
}

/* Hiệu ứng cho hàng bảng khi xóa */
tr.deleting {
  transition: all 0.3s ease;
}

/* Cải thiện sự đồng bộ giữa các chế độ xem */
.view-sync-helper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0,0,0,0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 1000;
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.view-sync-helper.show {
  display: block;
  opacity: 1;
}

/* CSS cho modal quản lý người dùng - Thêm vào file CSS */

/* Nút người dùng trong header */
.user-button {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: white;
  padding: 6px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.user-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.user-button .avatar {
  margin-left: 10px;
}

/* Bảng người dùng */
.user-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th, .user-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #555;
}

.user-table tr:hover {
  background-color: #f9f9f9;
}

.user-table .user-actions {
  display: flex;
  justify-content: flex-end;
}

.user-table .user-actions button {
  background: none;
  border: none;
  color: #888;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-table .user-actions button:hover {
  color: #4568dc;
}

.user-table .user-actions button.delete-user:hover {
  color: #f44336;
}

/* Nút thêm người dùng */
#add-user-btn {
  margin-top: 5px;
}

/* Form người dùng */
#user-form-container {
  border-top: 1px solid #eee;
  margin-top: 20px;
  padding-top: 20px;
}

#user-form-title {
  margin-bottom: 15px;
}

/* Badge khi người dùng đang được sử dụng */
.user-in-use {
  background-color: #f44336;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8rem;
  margin-left: 5px;
}

/* Disable các action khi người dùng đang được sử dụng */
.user-actions button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Animation cho khi thêm/xóa người dùng */
@keyframes highlight-row {
  0% { background-color: rgba(69, 104, 220, 0.1); }
  100% { background-color: transparent; }
}

.highlight-new {
  animation: highlight-row 2s ease;
}

/* Chỉnh lại modal giới hạn chiều cao */
#user-management-modal .modal-content {
  max-height: 80vh;
  overflow: auto;
}

/* Thêm Tooltip */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

/* Tiêu đề với nút thêm mới ở bên phải */
.user-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-list-header h3 {
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
}

/* Nút thêm người dùng với hiệu ứng */
#add-user-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

#add-user-btn:active {
  transform: scale(0.95);
}

/* Hiệu ứng ripple cho nút thêm người dùng */
#add-user-btn:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

#add-user-btn:focus:not(:active)::after {
  animation: ripple 1s ease-out;
}

/* Cải thiện bảng người dùng */
.user-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.user-table th, .user-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #555;
}

.user-table tr:hover {
  background-color: #f9f9f9;
}

.user-table tr:last-child td {
  border-bottom: none;
}

/* Cải thiện nút hành động trong bảng */
.user-actions {
  display: flex;
  justify-content: center;
}

.user-actions button {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 3px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.user-actions button:hover {
  background-color: rgba(69, 104, 220, 0.1);
  color: #4568dc;
}

.user-actions button.delete-user:hover {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

/* Hiệu ứng khi click vào các nút */
.user-actions button:active {
  transform: scale(0.9);
}

/* Hiệu ứng ripple */
.user-actions button:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(69, 104, 220, 0.3);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.user-actions button.delete-user:after {
  background: rgba(244, 67, 54, 0.3);
}

.user-actions button:focus:not(:active)::after {
  animation: ripple 0.8s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  20% {
    transform: scale(25, 25);
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(40, 40);
  }
}

/* Cải thiện form người dùng */
#user-form-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

#user-form-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #4568dc;
  font-size: 1.2rem;
}

#user-form .form-group {
  margin-bottom: 15px;
}

#user-form input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s;
}

#user-form input:focus {
  border-color: #4568dc;
  box-shadow: 0 0 0 3px rgba(69, 104, 220, 0.2);
}

/* Hiệu ứng cho nút trong form */
#user-form .form-actions button {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

#user-form #save-user-btn {
  background: linear-gradient(135deg, #4568dc, #b06ab3);
  color: white;
  border: none;
}

#user-form #save-user-btn:hover {
  box-shadow: 0 4px 8px rgba(69, 104, 220, 0.3);
}

#user-form #cancel-user-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
}

#user-form #cancel-user-btn:hover {
  background-color: #f1f1f1;
}

#user-form .form-actions button:active {
  transform: scale(0.97);
}

/* Hiệu ứng lắc khi xóa */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

/* Hiệu ứng flash khi thêm mới */
@keyframes flash {
  0% { background-color: rgba(69, 104, 220, 0.2); }
  100% { background-color: transparent; }
}

.flash {
  animation: flash 1.5s;
}

/* Sửa thanh cuộn cho sơ đồ Gantt */
.gantt-side-body, .gantt-timeline-body {
  overflow-y: auto !important;
  max-height: calc(100vh - 273px) !important; /* 273px = 200px + 73px (header) */
}

/* Đảm bảo thanh cuộn hiển thị trên các trình duyệt khác nhau */
.gantt-side-body::-webkit-scrollbar, .gantt-timeline-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.gantt-side-body::-webkit-scrollbar-thumb, .gantt-timeline-body::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
}
</style>