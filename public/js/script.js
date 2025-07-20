document.addEventListener('DOMContentLoaded', () => {
    // Get references to key DOM elements
    const addTodoForm = document.getElementById('addTodoForm');
    const todoTaskInput = document.getElementById('todoTaskInput');
    const todoList = document.querySelector('.todo-list');
    const priorityFilter = document.getElementById('priorityFilter');

    // --- Add Todo Form Validation ---
    if (addTodoForm) {
        addTodoForm.addEventListener('submit', (event) => {
            // Check if the input field is empty or contains only whitespace
            if (todoTaskInput.value.trim() === '') {
                event.preventDefault(); // Prevent the form from submitting
                // Display an alert message to the user
                alert('Please enter a task before adding!');
            }
        });
    }

    // --- Event Delegation for Edit and Delete Buttons ---
    // We use event delegation on the parent todoList because todo items are added/removed dynamically.
    // This ensures that event listeners work for elements that are not yet in the DOM when the page loads.
    if (todoList) {
        todoList.addEventListener('click', (event) => {
            const target = event.target; // The element that was clicked

            // Check if the clicked element is an 'Edit' button
            if (target.classList.contains('edit-btn')) {
                const todoItem = target.closest('.todo-item'); // Find the closest parent todo-item
                if (todoItem) {
                    toggleEditMode(todoItem); // Call function to switch to edit mode
                }
            }
            // Check if the clicked element is a 'Delete' button
            else if (target.classList.contains('delete-btn')) {
                const todoItem = target.closest('.todo-item');
                if (todoItem) {
                    const todoId = todoItem.dataset.id; // Get the todo ID from the data-id attribute
                    // Confirm with the user before deleting
                    if (confirm('Are you sure you want to delete this todo?')) {
                        deleteTodo(todoId); // Call function to delete the todo
                    }
                }
            }
            // Check if the clicked element is a 'Save' button (appears in edit mode)
            else if (target.classList.contains('save-btn')) {
                const todoItem = target.closest('.todo-item');
                if (todoItem) {
                    saveTodo(todoItem); // Call function to save the edited todo
                }
            }
        });
    }

    // --- Toggle Edit Mode Function ---
    function toggleEditMode(todoItem) {
        // Find existing elements within the todo item
        const todoContent = todoItem.querySelector('.todo-content');
        const todoTaskSpan = todoItem.querySelector('.todo-task');
        const todoPrioritySpan = todoItem.querySelector('.todo-priority');
        const editBtn = todoItem.querySelector('.edit-btn');
        const deleteBtn = todoItem.querySelector('.delete-btn');

        // Check if the item is already in edit mode
        if (todoItem.classList.contains('editing')) {
            // If already editing, revert to display mode
            todoItem.classList.remove('editing');
            todoTaskSpan.style.display = 'inline';
            todoPrioritySpan.style.display = 'inline';

            // Remove temporary input/select fields
            const editInput = todoItem.querySelector('.edit-input');
            const editSelect = todoItem.querySelector('.edit-select');
            if (editInput) editInput.remove();
            if (editSelect) editSelect.remove();

            // Revert buttons
            editBtn.textContent = 'Edit';
            editBtn.classList.remove('save-btn', 'btn-primary');
            editBtn.classList.add('btn-secondary');
            deleteBtn.style.display = 'inline-block'; // Show delete button again
        } else {
            // Enter edit mode
            todoItem.classList.add('editing');
            todoTaskSpan.style.display = 'none'; // Hide task span
            todoPrioritySpan.style.display = 'none'; // Hide priority span

            // Create an input field for editing the task
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = todoTaskSpan.textContent; // Pre-fill with current task
            editInput.required = true;

            // Create a select field for editing priority
            const editSelect = document.createElement('select');
            editSelect.className = 'edit-select';
            const priorities = ['Low', 'Medium', 'High'];
            priorities.forEach(p => {
                const option = document.createElement('option');
                option.value = p;
                option.textContent = p;
                if (p.toLowerCase() === todoPrioritySpan.textContent.toLowerCase()) {
                    option.selected = true; // Select current priority
                }
                editSelect.appendChild(option);
            });

            // Insert input and select fields into the todo-content div
            todoContent.insertBefore(editInput, todoContent.firstChild);
            todoContent.insertBefore(editSelect, editInput.nextSibling);

            // Change 'Edit' button to 'Save'
            editBtn.textContent = 'Save';
            editBtn.classList.remove('btn-secondary');
            editBtn.classList.add('save-btn', 'btn-primary');
            deleteBtn.style.display = 'none'; // Hide delete button while editing
        }
    }

    // --- Save Todo Function (sends data to backend) ---
    function saveTodo(todoItem) {
        const todoId = todoItem.dataset.id;
        const editInput = todoItem.querySelector('.edit-input');
        const editSelect = todoItem.querySelector('.edit-select');

        // Client-side validation for the edit input
        if (editInput.value.trim() === '') {
            alert('Task cannot be empty!');
            return; // Stop the function if validation fails
        }

        const updatedTask = editInput.value.trim();
        const updatedPriority = editSelect.value;

        // Use Fetch API to send a POST request to the server
        fetch('/edit-todo', {
            method: 'POST', // Using POST for form submission style handling
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Standard for form data
            },
            // Convert data to URL-encoded string
            body: `id=${todoId}&task=${encodeURIComponent(updatedTask)}&priority=${encodeURIComponent(updatedPriority)}`
        })
        .then(response => {
            if (response.ok) {
                // If the update was successful, reload the page to reflect changes
                // This is a simple way for beginners; more advanced apps use AJAX to update DOM directly.
                window.location.reload();
            } else {
                alert('Failed to update todo.');
                console.error('Failed to update todo:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error updating todo:', error);
            alert('An error occurred while updating the todo.');
        });
    }

    // --- Delete Todo Function (sends data to backend) ---
    function deleteTodo(todoId) {
        // Use Fetch API to send a POST request to the server
        fetch('/delete-todo', {
            method: 'POST', // Using POST for form submission style handling
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // Convert data to URL-encoded string
            body: `id=${todoId}`
        })
        .then(response => {
            if (response.ok) {
                // If deletion was successful, reload the page
                window.location.reload();
            } else {
                alert('Failed to delete todo.');
                console.error('Failed to delete todo:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting todo:', error);
            alert('An error occurred while deleting the todo.');
        });
    }

    // --- Priority Filter Functionality ---
    if (priorityFilter) {
        priorityFilter.addEventListener('change', (event) => {
            const selectedPriority = event.target.value;
            // Redirect to the home page with the selected priority as a query parameter
            window.location.href = `/?priority=${selectedPriority}`;
        });
    }

    // --- Display Alert for Empty Input (from server redirect) ---
    // Check if there's an 'error=empty' query parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'empty') {
        // If yes, show a custom alert message (or you could use a modal)
        // For this simple case, we'll just remove the parameter after showing the alert
        // to prevent it from showing again on refresh.
        alert('Please enter a task! Input field cannot be empty.');
        urlParams.delete('error');
        // Update the URL without reloading the page
        window.history.replaceState({}, document.title, `${window.location.pathname}?${urlParams.toString()}`);
    }
});
