// Get DOM elements
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

const statusFilterSelect = document.getElementById('status-filter');
const tagsFilterInput = document.getElementById('tags-filter');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

// Array to store tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activeTimer = null; // Stores the interval ID for the active stopwatch
let activeTimerTaskId = null; // Stores the ID of the task with the active stopwatch
let timerStartTime = null; // Stores the start time of the active stopwatch

// Filter state variables
let currentStatusFilter = 'all';
let currentTagFilter = '';

/**
 * Saves the current tasks array to local storage.
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Formats seconds into HH:MM:SS string.
 * @param {number} totalSeconds - The total number of seconds.
 * @returns {string} Formatted time string.
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Renders all tasks from the tasks array to the DOM, applying current filters.
 */
function renderTasks() {
    taskList.innerHTML = ''; // Clear existing tasks

    const filteredTasks = tasks.filter(task => {
        // Filter by status
        const statusMatch = currentStatusFilter === 'all' || task.status === currentStatusFilter;

        // Filter by tags
        const tagsToMatch = currentTagFilter.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const tagMatch = tagsToMatch.length === 0 || tagsToMatch.some(filterTag =>
            task.tags.some(taskTag => taskTag.toLowerCase().includes(filterTag.toLowerCase()))
        );

        return statusMatch && tagMatch;
    });


    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id; // Store task ID on the list item
        if (task.completed) {
            li.classList.add('completed');
        }

        // Task Header: Text and main action buttons
        const taskHeader = document.createElement('div');
        taskHeader.classList.add('task-header');

        const taskTextSpan = document.createElement('span');
        taskTextSpan.classList.add('task-text');
        taskTextSpan.textContent = task.text;
        taskHeader.appendChild(taskTextSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions-div');

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.textContent = task.completed ? 'Uncomplete' : 'Complete';
        completeBtn.addEventListener('click', () => toggleComplete(task.id));
        actionsDiv.appendChild(completeBtn);

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id));
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        actionsDiv.appendChild(deleteBtn);

        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.classList.add('view-details-btn');
        viewDetailsBtn.textContent = 'Details';
        viewDetailsBtn.addEventListener('click', () => toggleDetails(task.id));
        actionsDiv.appendChild(viewDetailsBtn);

        const viewActivitiesBtn = document.createElement('button');
        viewActivitiesBtn.classList.add('view-activities-btn');
        viewActivitiesBtn.textContent = 'Activities';
        viewActivitiesBtn.addEventListener('click', () => toggleActivities(task.id));
        actionsDiv.appendChild(viewActivitiesBtn);

        taskHeader.appendChild(actionsDiv);
        li.appendChild(taskHeader);

        // Task Details Section (initially hidden)
        const detailsSection = document.createElement('div');
        detailsSection.classList.add('task-details-section');
        detailsSection.dataset.id = `details-${task.id}`;

        // Status
        const statusItem = document.createElement('div');
        statusItem.classList.add('detail-item');
        statusItem.innerHTML = `<strong>Status:</strong> <span class="task-status-display">${task.status}</span>`;
        detailsSection.appendChild(statusItem);

        // Tags
        const tagsItem = document.createElement('div');
        tagsItem.classList.add('detail-item');
        tagsItem.innerHTML = `<strong>Tags:</strong> <span class="task-tags-display">${task.tags.join(', ')}</span>`;
        detailsSection.appendChild(tagsItem);

        // Duration
        const durationItem = document.createElement('div');
        durationItem.classList.add('detail-item');
        durationItem.innerHTML = `<strong>Duration:</strong> <span class="task-duration-display">${formatTime(task.duration)}</span>`;
        detailsSection.appendChild(durationItem);

        // Attachment
        const attachmentItem = document.createElement('div');
        attachmentItem.classList.add('detail-item');
        attachmentItem.innerHTML = `<strong>Attachment:</strong> <span class="task-attachment-display">${task.attachment || 'None'}</span>`;
        detailsSection.appendChild(attachmentItem);

        li.appendChild(detailsSection);

        // Task Activities Section (initially hidden)
        const activitiesSection = document.createElement('div');
        activitiesSection.classList.add('task-activities-section');
        activitiesSection.dataset.id = `activities-${task.id}`;

        const commentsList = document.createElement('div');
        commentsList.classList.add('comments-list');
        task.comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');
            commentItem.innerHTML = `<span>${comment.text}</span><small>${new Date(comment.timestamp).toLocaleString()}</small>`;
            commentsList.appendChild(commentItem);
        });
        activitiesSection.appendChild(commentsList);

        const commentInputSection = document.createElement('div');
        commentInputSection.classList.add('comment-input-section');
        const commentInput = document.createElement('textarea');
        commentInput.placeholder = 'Add a comment...';
        commentInput.dataset.taskId = task.id; // Link comment input to task
        commentInputSection.appendChild(commentInput);

        const addCommentBtn = document.createElement('button');
        addCommentBtn.textContent = 'Add Comment';
        addCommentBtn.addEventListener('click', () => addComment(task.id, commentInput.value));
        commentInputSection.appendChild(addCommentBtn);
        activitiesSection.appendChild(commentInputSection);

        li.appendChild(activitiesSection);

        taskList.appendChild(li);
    });
}

/**
 * Adds a new task to the list.
 */
function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') {
        return; // Do nothing if input is empty
    }

    const newTask = {
        id: Date.now().toString(), // Unique ID for the task
        text: taskText,
        completed: false,
        status: 'To Do',
        tags: [],
        duration: 0, // Duration in seconds
        attachment: '',
        comments: []
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    newTaskInput.value = ''; // Clear input field
}

/**
 * Toggles the completion status of a task.
 * @param {string} id - The ID of the task to toggle.
 */
function toggleComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

/**
 * Deletes a task from the list.
 * @param {string} id - The ID of the task to delete.
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

/**
 * Enters edit mode for a task.
 * @param {string} id - The ID of the task to edit.
 */
function editTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (!li) return;

    // Get references to buttons within the current task's list item
    const completeBtn = li.querySelector('.complete-btn');
    const editBtn = li.querySelector('.edit-btn'); // This will be the original edit button
    const deleteBtn = li.querySelector('.delete-btn');
    const viewDetailsBtn = li.querySelector('.view-details-btn');
    const viewActivitiesBtn = li.querySelector('.view-activities-btn');

    // IMPORTANT: Check if the task is already in edit mode
    // If the editBtn has already been changed to 'Save', it means we are in edit mode.
    // This check must happen *before* modifying the taskTextSpan.
    if (editBtn && editBtn.classList.contains('save-btn')) {
        console.log('Task is already in edit mode. Please save or cancel current edit.');
        return; // Do nothing if already editing
    }

    // Stop any active timer if a different task is being edited
    if (activeTimer && activeTimerTaskId !== id) {
        clearInterval(activeTimer);
        activeTimer = null;
        activeTimerTaskId = null;
        timerStartTime = null;
        // Re-render to update the display of the previously active timer
        renderTasks();
    }

    // Now that we've confirmed not in edit mode, proceed to modify the DOM
    const taskTextSpan = li.querySelector('.task-text');
    // Add a null check for taskTextSpan just in case, although the above logic should prevent it.
    if (!taskTextSpan) {
        console.error("Error: taskTextSpan not found for task ID:", id);
        return;
    }
    const originalText = taskTextSpan.textContent;
    taskTextSpan.innerHTML = ''; // Clear content

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.classList.add('edit-input');
    editInput.value = originalText;
    taskTextSpan.appendChild(editInput);
    editInput.focus();

    // Show details section for editing
    const detailsSection = li.querySelector('.task-details-section');
    detailsSection.classList.add('active'); // Ensure details are visible for editing

    // Edit Status
    const statusDisplay = li.querySelector('.task-status-display');
    const originalStatus = task.status;
    statusDisplay.innerHTML = '';
    const statusSelect = document.createElement('select');
    ['To Do', 'In Progress', 'Done'].forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (status === originalStatus) {
            option.selected = true;
        }
        statusSelect.appendChild(option);
    });
    statusDisplay.appendChild(statusSelect);

    // Edit Tags
    const tagsDisplay = li.querySelector('.task-tags-display');
    const originalTags = task.tags.join(', ');
    tagsDisplay.innerHTML = '';
    const tagsInput = document.createElement('input');
    tagsInput.type = 'text';
    tagsInput.value = originalTags;
    tagsInput.placeholder = 'Comma-separated tags';
    tagsDisplay.appendChild(tagsInput);

    // Edit Duration with Stopwatch controls
    const durationDisplay = li.querySelector('.task-duration-display');
    durationDisplay.innerHTML = ''; // Clear existing display

    const durationInput = document.createElement('input');
    durationInput.type = 'text';
    durationInput.value = formatTime(task.duration);
    durationInput.placeholder = 'HH:MM:SS';
    durationInput.readOnly = true; // Make it read-only, updated by timer
    durationDisplay.appendChild(durationInput);

    const timerControlsDiv = document.createElement('div');
    timerControlsDiv.classList.add('timer-controls');

    const startTimerBtn = document.createElement('button');
    startTimerBtn.textContent = 'Start Timer';
    startTimerBtn.classList.add('start-timer-btn');
    startTimerBtn.addEventListener('click', () => startTimer(id, durationInput));
    timerControlsDiv.appendChild(startTimerBtn);

    const stopTimerBtn = document.createElement('button');
    stopTimerBtn.textContent = 'Stop Timer';
    stopTimerBtn.classList.add('stop-timer-btn');
    stopTimerBtn.style.display = 'none'; // Initially hidden
    stopTimerBtn.addEventListener('click', () => stopTimer(id));
    timerControlsDiv.appendChild(stopTimerBtn);

    durationDisplay.parentNode.appendChild(timerControlsDiv); // Append controls next to duration display

    // If this task had an active timer before, restart its display
    if (activeTimerTaskId === id && activeTimer) {
        startTimerBtn.style.display = 'none';
        stopTimerBtn.style.display = 'inline-block';
        // Re-calculate elapsed time and update display
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        durationInput.value = formatTime(task.duration + elapsed);
    }


    // Edit Attachment
    const attachmentDisplay = li.querySelector('.task-attachment-display');
    const originalAttachment = task.attachment;
    attachmentDisplay.innerHTML = '';
    const attachmentInput = document.createElement('input');
    attachmentInput.type = 'text'; // Using text for simplicity, could be type="file"
    attachmentInput.value = originalAttachment;
    attachmentInput.placeholder = 'File name or link';
    attachmentDisplay.appendChild(attachmentInput);


    // Change Edit button to Save button
    editBtn.textContent = 'Save';
    editBtn.classList.remove('edit-btn');
    editBtn.classList.add('save-btn');
    editBtn.removeEventListener('click', () => editTask(id)); // Remove old listener
    editBtn.addEventListener('click', () => saveTask(
        id,
        editInput.value,
        statusSelect.value,
        tagsInput.value,
        durationInput.value, // Pass the current displayed duration
        attachmentInput.value
    ));

    // Hide other action buttons during edit
    completeBtn.style.display = 'none';
    deleteBtn.style.display = 'none';
    viewDetailsBtn.style.display = 'none';
    viewActivitiesBtn.style.display = 'none';
}

/**
 * Saves the edited task.
 * @param {string} id - The ID of the task.
 * @param {string} newText - The new task text.
 * @param {string} newStatus - The new status.
 * @param {string} newTagsString - Comma-separated tags string.
 * @param {string} newDurationString - Formatted duration string (HH:MM:SS).
 * @param {string} newAttachment - The new attachment string.
 */
function saveTask(id, newText, newStatus, newTagsString, newDurationString, newAttachment) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return;

    // Stop the timer if it's running for this task
    if (activeTimerTaskId === id && activeTimer) {
        stopTimer(id);
    }

    // Convert formatted duration string back to seconds
    const parts = newDurationString.split(':').map(Number);
    let totalSeconds = 0;
    if (parts.length === 3) { // HH:MM:SS
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // MM:SS
        totalSeconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) { // SS
        totalSeconds = parts[0];
    }

    tasks[taskIndex].text = newText.trim();
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].tags = newTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    tasks[taskIndex].duration = totalSeconds;
    tasks[taskIndex].attachment = newAttachment.trim();

    saveTasks();
    renderTasks(); // Re-render to show updated task and exit edit mode
}

/**
 * Starts the stopwatch for a specific task.
 * @param {string} id - The ID of the task.
 * @param {HTMLInputElement} durationInput - The input field to update.
 */
function startTimer(id, durationInput) {
    // If another timer is active, stop it first
    if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
        activeTimerTaskId = null;
        timerStartTime = null;
        // Re-render to update the display of the previously active timer
        renderTasks();
    }

    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return;

    activeTimerTaskId = id;
    timerStartTime = Date.now(); // Record start time for accurate elapsed calculation

    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) {
        li.querySelector('.start-timer-btn').style.display = 'none';
        li.querySelector('.stop-timer-btn').style.display = 'inline-block';
    }

    activeTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const currentDuration = tasks[taskIndex].duration + elapsed;
        durationInput.value = formatTime(currentDuration);
    }, 1000);
}

/**
 * Stops the stopwatch for a specific task.
 * @param {string} id - The ID of the task.
 */
function stopTimer(id) {
    if (activeTimer && activeTimerTaskId === id) {
        clearInterval(activeTimer);
        activeTimer = null;
        activeTimerTaskId = null;

        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1 && timerStartTime) {
            const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
            tasks[taskIndex].duration += elapsed; // Add elapsed time to total duration
            timerStartTime = null;
        }
        saveTasks();

        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            const startBtn = li.querySelector('.start-timer-btn');
            const stopBtn = li.querySelector('.stop-timer-btn');
            if (startBtn) startBtn.style.display = 'inline-block';
            if (stopBtn) stopBtn.style.display = 'none';
        }
    }
}

/**
 * Toggles the visibility of the task details section.
 * @param {string} id - The ID of the task.
 */
function toggleDetails(id) {
    const detailsSection = document.querySelector(`[data-id="details-${id}"]`);
    if (detailsSection) {
        detailsSection.classList.toggle('active');
    }
}

/**
 * Toggles the visibility of the task activities section.
 * @param {string} id - The ID of the task.
 */
function toggleActivities(id) {
    const activitiesSection = document.querySelector(`[data-id="activities-${id}"]`);
    if (activitiesSection) {
        activitiesSection.classList.toggle('active');
    }
}

/**
 * Adds a comment to a task.
 * @param {string} id - The ID of the task.
 * @param {string} commentText - The text of the comment.
 */
function addComment(id, commentText) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1 && commentText.trim() !== '') {
        tasks[taskIndex].comments.push({
            text: commentText.trim(),
            timestamp: new Date().toISOString() // Store timestamp
        });
        saveTasks();
        renderTasks(); // Re-render to show new comment
    }
}

/**
 * Applies the selected filters and re-renders tasks.
 */
function applyFilters() {
    currentStatusFilter = statusFilterSelect.value;
    currentTagFilter = tagsFilterInput.value;
    renderTasks();
}

/**
 * Clears all filters and re-renders tasks.
 */
function clearFilters() {
    statusFilterSelect.value = 'all';
    tagsFilterInput.value = '';
    currentStatusFilter = 'all';
    currentTagFilter = '';
    renderTasks();
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Filter event listeners
statusFilterSelect.addEventListener('change', applyFilters);
tagsFilterInput.addEventListener('input', applyFilters); // Use 'input' for real-time filtering
clearFiltersBtn.addEventListener('click', clearFilters);

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', renderTasks);

