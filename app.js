import { app } from './firebase-config.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getDatabase, ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js';

// Get the Auth and Database services for the initialized Firebase app
const auth = getAuth(app);
const db = getDatabase(app);

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, retrieve tasks
        loadTasks(user.uid);
    } else {
        // User is signed out, clear tasks
        clearTasks();
    }
});

// Task Form
const taskForm = document.getElementById('task-form');
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = taskForm['task-name'].value;
    const dueDate = taskForm['due-date'].value;
    const user = auth.currentUser;

    if (user) {
        try {
            // Get a reference to the tasks for the user
            const tasksRef = ref(db, 'tasks/' + user.uid);

            // Push a new child to the tasks reference
            const newTaskRef = push(tasksRef);

            // Set the task data on the new child reference
            await set(newTaskRef, {
                taskName: taskName,
                dueDate: dueDate
            });

            // Clear input fields
            taskForm.reset();
        } catch (error) {
            console.error('Error adding task: ', error);
        }
    }
});

// Load tasks from Realtime Database
function loadTasks(userId) {
    const taskList = document.getElementById('task-list');

    const tasksRef = ref(db, 'tasks/' + userId);
    onValue(tasksRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const task = childSnapshot.val();
            const li = document.createElement('li');
            li.textContent = `${task.taskName} - Due: ${task.dueDate}`;
            taskList.appendChild(li);

        });
    });
}

// Clear tasks when user signs out

// Login Form
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Redirect to dashboard or perform other actions
            console.log('User logged in');
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        })
        .catch(error => {
            console.error(error.message);
        });
});

// Registration Form
// Registration Form
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = registerForm['register-email'].value;
    const password = registerForm['register-password'].value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Redirect to dashboard or perform other actions
            console.log('User registered and logged in');
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        })
        .catch(error => {
            console.error(error.message);
        });
});

function clearTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear tasks
}
// Logout
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut()
        .then(() => {
            // Redirect to login page or perform other actions
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
