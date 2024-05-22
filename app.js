import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getDatabase, ref, push, set, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js';
import { auth, database } from './firebase-config.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadTasks(user.uid);
    } else {
        clearTasks();
    }
});

let calendar; // Declare calendar variable here

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    initializeCalendar(calendarEl);

    const addButton = document.getElementById('addEvent');
    addButton.addEventListener('click', function () {
        const title = prompt('Enter event title:');
        const start = prompt('Enter event start date (YYYY-MM-DD HH:mm):');
        const end = prompt('Enter event end date (YYYY-MM-DD HH:mm):');
        addEventToDatabase(title, start, end);
    });

    // Sign in the user anonymously
    signInAnonymously(auth).then(() => {
        console.log("Anonymous sign-in successful.");
    }).catch(function (error) {
        console.error("Error signing in anonymously:", error.code, error.message);
    });

    // Ensure the user is signed in before interacting with the database
    onAuthStateChanged(auth, function (user) {
        if (user) {
            console.log("User signed in:", user);
            fetchEventsFromDatabase();
        } else {
            console.log("No user is signed in.");
        }
    });
});

function initializeCalendar(calendarEl) {
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        events: [], // Events will be loaded from the database
        eventClick: function (info) {
            if (confirm(`Do you want to delete the event "${info.event.title}"?`)) {
                removeEventFromDatabase(info.event.id);
                info.event.remove();
            }
        }
    });
    calendar.render();
}

function fetchEventsFromDatabase() {
    const eventsRef = ref(database, 'events');
    onValue(eventsRef, function (snapshot) {
        calendar.removeAllEvents();
        snapshot.forEach(function (childSnapshot) {
            const eventData = childSnapshot.val();
            calendar.addEvent({
                id: childSnapshot.key,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end
            });
        });
    });
}

function addEventToDatabase(title, start, end) {
    const eventsRef = ref(database, 'events');
    push(eventsRef, {
        title: title,
        start: start,
        end: end
    });
}

function removeEventFromDatabase(eventId) {
    const eventRef = ref(database, 'events/' + eventId);
    remove(eventRef);
}

function loadTasks(userId) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear previous tasks

    const tasksRef = ref(database, 'tasks/' + userId);
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



// Fetch tasks from Firebase Realtime Database
function fetchTasksFromDatabase() {
    // Assuming you have a 'tasks' collection in your database
    const tasksRef = firebase.database().ref('tasks');
    tasksRef.on('value', function (snapshot) {
        // Convert snapshot to an array of tasks
        const tasks = [];
        snapshot.forEach(function (childSnapshot) {
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
document.addEventListener('DOMContentLoaded', function () {
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


// Ensure the user is signed in before interacting with the database
auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log("User signed in:", user);

        // Initialize the calendar and fetch events
        initializeCalendar();
        fetchEventsFromDatabase();
    } else {
        // No user is signed in.
        console.log("No user is signed in.");
    }
});