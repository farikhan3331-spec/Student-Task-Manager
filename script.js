let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];

// DOM references
const priorityTaskList = document.getElementById('priority-task-list');
const addTaskForm = document.getElementById('add-task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskCourseInput = document.getElementById('task-course-input');
const taskDatetimeInput = document.getElementById('task-datetime-input');
const taskPriorityInput = document.getElementById('task-priority-input');

const dueTodayEl = document.getElementById('due-today-count');
const dueWeekEl = document.getElementById('due-week-count');
const completedEl = document.getElementById('completed-count');
const activeCoursesEl = document.getElementById('active-courses-count');

function saveTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
}

// Function to format Date & Time nicely
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return "No deadline";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function updateCounters() {
    const now = new Date();
    const todayString = now.toDateString();

    const dueToday = tasks.filter(t => !t.completed && new Date(t.dueDateTime).toDateString() === todayString).length;
    const dueWeek = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    // Automatically count total courses from right sidebar
    const totalCourses = document.querySelectorAll('.course-item').length;

    dueTodayEl.textContent = dueToday;
    dueWeekEl.textContent = dueWeek;
    completedEl.textContent = completed;
    if (activeCoursesEl) activeCoursesEl.textContent = totalCourses;
}

function renderTasks() {
    priorityTaskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        const formattedTime = formatDateTime(task.dueDateTime);

        taskItem.innerHTML = `
            <div class="task-left-block">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <div class="task-details">
                    <span class="task-title" style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${escapeHTML(task.title)}</span>
                    <div class="task-meta-row">
                        <span class="task-due-text">🕒 ${formattedTime}</span>
                        <span class="course-tag">${task.course}</span>
                    </div>
                </div>
            </div>
            <span class="priority-badge ${task.priority}">${task.priority}</span>
        `;

        priorityTaskList.appendChild(taskItem);
    });

    updateCounters();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

window.toggleTask = function(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
};

// Form Submission Event
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTask = {
        id: Date.now(),
        title: taskTitleInput.value.trim(),
        course: taskCourseInput.value,
        dueDateTime: taskDatetimeInput.value,
        priority: taskPriorityInput.value,
        completed: false,
        notified: false
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    addTaskForm.reset();
});

// REAL-TIME DEADLINE REMINDER CHECKER
function checkDeadlines() {
    const now = new Date().getTime();

    tasks.forEach(task => {
        if (!task.completed && !task.notified && task.dueDateTime) {
            const taskTime = new Date(task.dueDateTime).getTime();
            
            if (taskTime <= now) {
                alert(`⏰ DEADLINE REMINDER!\n\nTask: "${task.title}"\nCourse: ${task.course}\nDue Time: ${formatDateTime(task.dueDateTime)}`);
                task.notified = true;
                saveTasks();
            }
        }
    });
}

// Check every 10 seconds
setInterval(checkDeadlines, 10000);

// Initialize Chart
function initWorkloadChart() {
    const ctx = document.getElementById('workloadChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
            datasets: [
                { label: 'Assignments', data: [4, 7, 8, 0, 0, 0, 9, 12, 0, 0], backgroundColor: '#3273dc', borderRadius: 4 },
                { label: 'Quizzes', data: [0, 8, 8, 0, 0, 0, 0, 12, 0, 0], backgroundColor: '#8146eb', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#e3e9ef' } }
            }
        }
    });
}

renderTasks();
initWorkloadChart();