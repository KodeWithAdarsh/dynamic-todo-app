// Import necessary modules
const express = require('express');
const path = require('path');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Define the port for the server

// --- Middleware Setup ---
// Serve static files from the 'public' directory (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (if you were to send JSON from client-side)
app.use(express.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Specify the directory where your EJS template files are located
app.set('views', path.join(__dirname, 'views'));

// --- In-memory Data Storage ---
// This array will hold our todo items. In a real application, you'd use a database.
let todos = [
    { id: 1, task: "Learn Node.js", priority: "High" },
    { id: 2, task: "Build EJS App", priority: "Medium" },
    { id: 3, task: "Go for a walk", priority: "Low" }
];

// --- Helper function to generate unique IDs for new todos ---
const generateId = () => {
    // Finds the maximum ID currently in the todos array and adds 1.
    // If no todos, starts from 1.
    const maxId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) : 0;
    return maxId + 1;
};

// --- Routes ---

// GET / - Home page: Displays the todo list
app.get('/', (req, res) => {
    // Get the priority filter from the query parameters (e.g., ?priority=High)
    const filterPriority = req.query.priority;
    let filteredTodos = todos;

    // Apply filtering if a priority is specified and it's not 'All'
    if (filterPriority && filterPriority !== 'All') {
        filteredTodos = todos.filter(todo => todo.priority === filterPriority);
    }

    // Render the 'index' EJS template, passing the (filtered) todos array
    res.render('index', { todos: filteredTodos, filterPriority: filterPriority || 'All' });
});

// POST /add-todo - Adds a new todo item
app.post('/add-todo', (req, res) => {
    const { task, priority } = req.body; // Extract task and priority from the form submission

    // Basic validation: Check if the task input is empty
    if (!task || task.trim() === '') {
        // If empty, redirect back to the home page with an error message
        // You could also render the page again with an error flag
        return res.redirect('/?error=empty');
    }

    // Create a new todo object
    const newTodo = {
        id: generateId(), // Assign a unique ID
        task: task.trim(), // Trim whitespace from the task
        priority: priority || 'Medium' // Default priority if not provided
    };

    todos.push(newTodo); // Add the new todo to our in-memory array
    res.redirect('/'); // Redirect back to the home page to show the updated list
});

// POST /edit-todo - Edits an existing todo item
app.post('/edit-todo', (req, res) => {
    const { id, task, priority } = req.body; // Extract ID, new task, and new priority

    // Find the todo item by its ID
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));

    // If the todo is found
    if (todoIndex !== -1) {
        // Basic validation: Check if the task input is empty
        if (!task || task.trim() === '') {
            // If empty, redirect back to the home page with an error message
            return res.redirect('/?error=empty');
        }
        // Update the task and priority
        todos[todoIndex].task = task.trim();
        todos[todoIndex].priority = priority;
    }
    res.redirect('/'); // Redirect back to the home page
});

// POST /delete-todo - Deletes a todo item
app.post('/delete-todo', (req, res) => {
    const { id } = req.body; // Extract the ID of the todo to delete

    // Filter out the todo item with the matching ID
    todos = todos.filter(todo => todo.id !== parseInt(id));
    res.redirect('/'); // Redirect back to the home page
});

// Start the server and listen on the defined PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server.');
});
