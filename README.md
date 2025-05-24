# To-Do List

This is a modern and interactive To-Do List application designed to help you manage your tasks effectively. It goes beyond basic functionality by incorporating features like task status tracking, tag filtering, duration tracking with a stopwatch, and a comprehensive activity log for each task.


## Features

- **Add/Delete Tasks:** Easily add new tasks and remove completed or unwanted ones.
- **Mark as Complete:** Toggle the completion status of tasks.
- **Edit Tasks:** Modify task descriptions, status, tags, duration, and attachments.
- **Task Details:** View detailed information for each task, including its status, associated tags, tracked duration, and any attachments.
- **Task Activities (Comments):** Keep a running log of comments and notes for each task, complete with timestamps.
- **Stopwatch Functionality:** Track the time spent on each task directly within the application.
- **Status Filtering:** Filter tasks by "All," "To Do," "In Progress," or "Done" statuses.
- **Tag Filtering:** Search and filter tasks using comma-separated tags.
- **Clear Filters:** Quickly reset all applied filters.
- **Responsive Design:** The application is designed to work well on various screen sizes.
- **Local Storage:** All your tasks are saved automatically to your browser's local storage, so you won't lose your progress even if you close the tab.


## Technologies Used

- **HTML5:** For the basic structure and content of the web page.
- **CSS3:** For styling and layout, including a modern aesthetic and responsive design.
- **JavaScript (ES6+):** For all the interactive functionality, task management, and data handling.


## How to Use

1.  **Add a New Task:**
    - Type your task in the "Add a new task..." input field.
    - Click the "Add Task" button or press `Enter`.
2.  **Manage Tasks:**
    - **Complete/Uncomplete:** Click the **"Complete"** button next to a task to mark it as done (or "Uncomplete" to revert).
    - **Edit:** Click the **"Edit"** button to modify a task. In edit mode, you can change the task text, update its status using the dropdown, add/edit tags (comma-separated), manage          attachments, and use the stopwatch. Click **"Save"** to apply changes.
    - **Delete:** Click the **"Delete"** button to remove a task permanently.
    - **Details:** Click the **"Details"** button to expand and view the task's status, tags, duration, and attachment.
    - **Activities:** Click the **"Activities"** button to view or add comments to a task.
3.  **Use the Stopwatch (in Edit Mode):**
    - When editing a task, click **"Start Timer"** to begin tracking time.
    - Click **"Stop Timer"** to pause and save the tracked duration.
4.  **Filter Tasks:**
    - **By Status:** Use the "Filter by Status" dropdown to show tasks based on their progress.
    - **By Tags:** Type comma-separated tags in the "Filter by Tags" input field to narrow down tasks.
    - **Clear Filters:** Click the **"Clear Filters"** button to remove all active filters.


## Setup (For Developers)

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd enhanced-todo-list
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser. There's no need for a local server as it's a client-side only application.

## Project Structure
to-do list
├── index.html          # Main HTML file
├── style.css           # CSS for styling the application
└── script.js           # JavaScript for all interactive functionality
