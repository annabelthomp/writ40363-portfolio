// ==========================================
// PROJECT 3: PERSONAL DATA DASHBOARD
// LAB16: fetch() and JSON Basics
// ==========================================
// Theme Management
function initializeTheme() {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('dashboardTheme');

  if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
    updateThemeIcon('dark');
  } else {
    updateThemeIcon('light');
  }
}
function toggleTheme() {
  const isDark = document.body.classList.toggle('theme-dark');

  // Save preference
  localStorage.setItem('dashboardTheme', isDark ? 'dark' : 'light');

  // Update icon
  updateThemeIcon(isDark ? 'dark' : 'light');

  console.log('Theme switched to:', isDark ? 'dark' : 'light');
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');

  if (theme === 'dark') {
    themeIcon.textContent = '☀️'; // Sun for dark mode (to switch to light)
  } else {
    themeIcon.textContent = '🌙'; // Moon for light mode (to switch to dark)
  }
}

function setupThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

// Call these when page loads
initializeTheme();
setupThemeToggle();

console.log('Dashboard app loaded!');
console.log('LAB16: Learning fetch() API');

// Function to load weather data
function loadWeather() {
    console.log('🌤️ Loading weather data...');

    fetch('./data/weather.json')
        .then(response => {
            console.log('✅ Got response:', response);
            return response.json();
        })
        .then(data => {
            console.log('✅ Weather data loaded:', data);
            displayWeather(data);
        })
        .catch(error => {
            console.error('❌ Error loading weather:', error);
            displayWeatherError();
        });
}

// Function to display weather data in the DOM
function displayWeather(weather) {
    console.log('📊 Displaying weather data...');

    const weatherDisplay = document.getElementById('weather-display');

    weatherDisplay.innerHTML = `
        <div class="weather-current">
            <div class="weather-icon">${weather.icon}</div>
            <div class="weather-temp">${weather.temperature}°F</div>
            <div class="weather-location">${weather.location}</div>
            <div class="weather-condition">${weather.condition}</div>
        </div>
        <div class="weather-details">
            <div class="weather-detail">
                <span>💧 Humidity</span>
                <strong>${weather.humidity}%</strong>
            </div>
            <div class="weather-detail">
                <span>💨 Wind Speed</span>
                <strong>${weather.windSpeed} mph</strong>
            </div>
            <div class="weather-detail">
                <span>🌡️ Feels Like</span>
                <strong>${weather.feelsLike}°F</strong>
            </div>
        </div>
        ${weather.forecast ? `
        <div class="weather-forecast">
            <h3 class="forecast-title">3-Day Forecast</h3>
            <div class="forecast-grid">
                ${weather.forecast.map(day => `
                    <div class="forecast-day">
                        <div class="forecast-day-name">${day.day}</div>
                        <div class="forecast-icon">${day.icon}</div>
                        <div class="forecast-temp">
                            <span class="temp-high">${day.high}°</span>
                            <span class="temp-divider">/</span>
                            <span class="temp-low">${day.low}°</span>
                        </div>
                        <div class="forecast-condition">${day.condition}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;

    console.log('✅ Weather displayed successfully!');
}

// Function to show error message if weather data fails to load
function displayWeatherError() {
    const weatherDisplay = document.getElementById('weather-display');

    weatherDisplay.innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <p>Could not load weather data</p>
            <p class="error-hint">Check console for details</p>
        </div>
    `;
}

// Load weather data when page loads
loadWeather();

// Global variable to store all quotes
let allQuotes = [];
let currentQuoteIndex = -1; // Track current quote to avoid repeats

// Function to load quotes from JSON
function loadQuotes() {
  console.log('Loading quotes...');

  fetch('data/quotes.json')
    .then(response => {
      console.log('Got quotes response:', response);
      return response.json();
    })
    .then(data => {
      console.log('Quotes data:', data);
      allQuotes = data; // Store quotes in global variable
      displayRandomQuote(); // Show first quote
    })
    .catch(error => {
      console.error('Error loading quotes:', error);
      displayQuotesError();
    });
}

// ========================================
// TASKS WIDGET (from LAB18)
// ========================================

// Function to load tasks from localStorage
function loadTasks() {
  const tasksJSON = localStorage.getItem('dashboardTasks');

  if (tasksJSON) {
    return JSON.parse(tasksJSON);
  } else {
    return []; // Return empty array if no tasks yet
  }
}

// Function to save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('dashboardTasks', JSON.stringify(tasks));
  console.log('Tasks saved:', tasks);
}

// Function to display all tasks
function displayTasks() {
  const tasks = loadTasks();
  const tasksList = document.getElementById('tasks-list');

  // If no tasks, show message
  if (tasks.length === 0) {
    tasksList.innerHTML = `
      <div class="no-tasks">
        No tasks yet. Add one above! ✨
      </div>
    `;
    updateTaskStats(tasks);
    return;
  }

  // Clear existing tasks
  tasksList.innerHTML = '';

  // Display each task
  tasks.forEach((task, index) => {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(index));

    // Create task text
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(index));

    // Append all elements to task item
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteBtn);

    tasksList.appendChild(taskItem);
  });

  updateTaskStats(tasks);
}

// Function to add a new task
function addTask(taskText) {
  const tasks = loadTasks();

  const newTask = {
    text: taskText,
    completed: false,
    id: Date.now() // Unique ID using timestamp
  };

  tasks.push(newTask);
  saveTasks(tasks);
  displayTasks();

  console.log('Task added:', newTask);
}

// Set up form submission
function setupTaskForm() {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    const taskText = taskInput.value.trim();

    if (taskText) {
      addTask(taskText);
      taskInput.value = ''; // Clear input
      taskInput.focus(); // Focus back on input
    }
  });
}
// Function to toggle task complete/incomplete
function toggleTask(index) {
  const tasks = loadTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTasks(tasks);
  displayTasks();

  console.log('Task toggled:', tasks[index]);
}

// Function to delete a task
function deleteTask(index) {
  const tasks = loadTasks();
  const taskToDelete = tasks[index];

  // Optional: Confirm before deleting
  if (confirm(`Delete task: "${taskToDelete.text}"?`)) {
    tasks.splice(index, 1);
    saveTasks(tasks);
    displayTasks();

    console.log('Task deleted');
  }
}

// Function to update task statistics
function updateTaskStats(tasks) {
  const statsDiv = document.getElementById('task-stats');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  if (totalTasks === 0) {
    statsDiv.innerHTML = `
      <div class="stats-empty">
        <span>📊</span>
        <p>No tasks yet. Add some to see your progress!</p>
      </div>
    `;
    return;
  }

  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  statsDiv.innerHTML = `
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon">📝</div>
        <div class="stat-label">Total</div>
        <div class="stat-value">${totalTasks}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">✅</div>
        <div class="stat-label">Completed</div>
        <div class="stat-value">${completedTasks}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">⏳</div>
        <div class="stat-label">Pending</div>
        <div class="stat-value">${pendingTasks}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">📈</div>
        <div class="stat-label">Progress</div>
        <div class="stat-value">${completionPercentage}%</div>
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${completionPercentage}%"></div>
    </div>
  `;
}
// Initialize tasks when page loads
displayTasks();
setupTaskForm();


// Function to display a random quote
function displayRandomQuote() {
  // Make sure we have quotes loaded
  if (allQuotes.length === 0) {
    console.error('No quotes available');
    return;
  }

  // Get random index
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * allQuotes.length);
  } while (randomIndex === currentQuoteIndex && allQuotes.length > 1);

  currentQuoteIndex = randomIndex;
  const quote = allQuotes[randomIndex];

  // Display the quote
  const quotesDisplay = document.getElementById('quotes-display');
  quotesDisplay.innerHTML = `
    <div class="quote-card">
      <div class="quote-text">"${quote.text}"</div>
      <div class="quote-author">— ${quote.author}</div>
      <button class="btn-copy-quote" onclick="copyQuoteToClipboard()">📋 Copy Quote</button>
    </div>
  `;

  console.log('Displayed quote:', quote);
}

// Function to copy current quote to clipboard
function copyQuoteToClipboard() {
  const quoteText = document.querySelector('.quote-text').textContent;
  const quoteAuthor = document.querySelector('.quote-author').textContent;
  const textToCopy = `"${quoteText}" - ${quoteAuthor}`;
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    console.log('Quote copied to clipboard!');
    
    // Visual feedback
    const copyBtn = document.querySelector('.btn-copy-quote');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.background = '#48bb78';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy quote:', err);
  });
}

// Function to show error message
function displayQuotesError() {
  const quotesDisplay = document.getElementById('quotes-display');
  quotesDisplay.innerHTML = `
    <div class="error-message">
      ⚠️ Could not load quotes
    </div>
  `;
}

// Call loadQuotes when page loads
loadQuotes();

// Set up "New Quote" button
function setupQuotesButton() {
  const newQuoteBtn = document.getElementById('new-quote-btn');

  newQuoteBtn.addEventListener('click', () => {
    console.log('New quote button clicked!');
    displayRandomQuote();
  });
}

// Call setupQuotesButton after DOM is loaded
setupQuotesButton();

// Set up "New Quote" button
function setupQuotesButton() {
  const newQuoteBtn = document.getElementById('new-quote-btn');

  newQuoteBtn.addEventListener('click', () => {
    console.log('New quote button clicked!');
    displayRandomQuote();
  });
}

// Call setupQuotesButton after DOM is loaded
setupQuotesButton();

