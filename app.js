import { app } from './firebase-config.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getDatabase, ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js';

const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadTasks(user.uid);
    } else {
        clearTasks();
    }
});

const taskForm = document.getElementById('task-form');
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = taskForm['task-name'].value;
    const dueDate = taskForm['due-date'].value;
    const user = auth.currentUser;
    if (user) {
        try {
            const tasksRef = ref(db, 'tasks/' + user.uid);
            const newTaskRef = push(tasksRef);
            await set(newTaskRef, {
                taskName: taskName,
                dueDate: dueDate
            });
            taskForm.reset();
        } catch (error) {
            console.error('Error adding task: ', error);
        }
    }
});

function loadTasks(userId) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear previous tasks

    const tasksRef = ref(db, 'tasks/' + userId);
    onValue(tasksRef, (snapshot) => {
        taskList.innerHTML = ''; // Clear task list before appending new tasks
        snapshot.forEach((childSnapshot) => {
            const task = childSnapshot.val();
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <span class="task-name">${task.taskName}</span> - Due: <span class="due-date">${task.dueDate}</span>
                <button class="delete-button">Delete</button>
            `;
            taskList.appendChild(li);
        });

        // Add event listeners to checkboxes and delete buttons
        const checkboxes = taskList.querySelectorAll('.task-checkbox');
        const deleteButtons = taskList.querySelectorAll('.delete-button');

        checkboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', () => {
                // Toggle 'task-selected' class on parent li
                const li = checkbox.closest('li');
                li.classList.toggle('task-selected', checkbox.checked);
            });
        });

        deleteButtons.forEach((deleteButton, index) => {
            deleteButton.addEventListener('click', () => {
                let taskIndex = 0;
                snapshot.forEach((childSnapshot) => {
                    if (taskIndex === index) {
                        const taskId = childSnapshot.key;
                        deleteTask(userId, taskId);
                    }
                    taskIndex++;
                });
            });
        });
        
        
    });
}

function deleteTask(userId, taskId) {
    const taskRef = ref(db, 'tasks/' + userId + '/' + taskId);
    set(taskRef, null)
        .then(() => {
            console.log('Task deleted successfully');
            loadTasks(userId);
        })
        .catch((error) => {
            console.error('Error deleting task: ', error);
        });
}

function clearTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
}


document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar-container');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [
            // Your events (tasks) will go here
            {
                title: 'Task 1',
                start: '2024-04-01', // Start date
                end: '2024-04-03'    // End date
            },
            {
                title: 'Task 2',
                start: '2024-04-05',
                end: '2024-04-07'
            },
            // Add more tasks as needed
        ]
    });
    calendar.render();
});

// Fetch tasks from Firebase Realtime Database
function fetchTasksFromDatabase() {
    // Assuming you have a 'tasks' collection in your database
    const tasksRef = firebase.database().ref('tasks');
    tasksRef.on('value', function(snapshot) {
        // Convert snapshot to an array of tasks
        const tasks = [];
        snapshot.forEach(function(childSnapshot) {
            const task = childSnapshot.val();
            tasks.push({
                title: task.title,
                start: task.startDate,
                end: task.endDate
            });
        });
        // Render calendar with fetched tasks
        renderCalendar(tasks);
    });
}

// Render calendar with tasks
function renderCalendar(tasks) {
    var calendarEl = document.getElementById('calendar-container');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: tasks
    });
    calendar.render();
}

// Call fetchTasksFromDatabase when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchTasksFromDatabase();
});






const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User logged in');
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        })
        .catch(error => {
            console.error(error.message);
        });
});

const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = registerForm['register-email'].value;
    const password = registerForm['register-password'].value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User registered and logged in');
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        })
        .catch(error => {
            console.error(error.message);
        });
});

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
            document.getElementById('email').value = "";
            document.getElementById('register-email').value = "";
            document.getElementById('password').value = "";
            document.getElementById('register-password').value = "";
            clearTasks();
        })
        .catch(error => {
            console.error(error.message);
        });
});