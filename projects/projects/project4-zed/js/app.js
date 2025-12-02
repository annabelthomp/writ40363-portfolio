// Event Countdown Timer Application
// Uses localStorage for persistence and browser notifications

console.log('🚀 Event Countdown Timer initialized');

// Configuration
const CONFIG = {
    STORAGE_KEY: 'countdownEvents',
    THEME_KEY: 'countdownTheme',
    UPDATE_INTERVAL: 1000, // Update every second
    NOTIFICATION_ADVANCE: 60000 // Notify 1 minute before
};

// State Management
let events = [];
let editingEventId = null;
let countdownIntervals = {};
let notificationsEnabled = false;
let currentCalendarMonth = new Date();
let currentCalendarYear = new Date().getFullYear();

// DOM Elements
const eventForm = document.getElementById('eventForm');
const eventNameInput = document.getElementById('eventName');
const eventDateInput = document.getElementById('eventDate');
const eventDescriptionInput = document.getElementById('eventDescription');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const eventsContainer = document.getElementById('eventsContainer');
const notificationBtn = document.getElementById('notificationBtn');
const themeToggle = document.getElementById('themeToggle');
const calendarElement = document.getElementById('calendar');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

// Initialize App
function init() {
    console.log('📋 Initializing application...');
    loadTheme();
    loadEvents();
    setupEventListeners();
    checkNotificationPermission();
    renderEvents();
    renderCalendar();
    console.log('✅ Application ready');
}

// Setup Event Listeners
function setupEventListeners() {
    eventForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', handleCancelEdit);
    notificationBtn.addEventListener('click', requestNotificationPermission);
    themeToggle.addEventListener('click', toggleTheme);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
}

// Theme Management
function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            updateThemeIcon(true);
        }
        console.log(`🎨 Loaded theme: ${savedTheme || 'light'}`);
    } catch (error) {
        console.error('❌ Error loading theme from localStorage:', error);
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    try {
        localStorage.setItem(CONFIG.THEME_KEY, isDarkMode ? 'dark' : 'light');
        console.log(`🎨 Theme switched to: ${isDarkMode ? 'dark' : 'light'}`);
    } catch (error) {
        console.error('❌ Error saving theme to localStorage:', error);
    }
    
    updateThemeIcon(isDarkMode);
}

function updateThemeIcon(isDarkMode) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = isDarkMode ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
}

// Load Events from localStorage
function loadEvents() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        events = stored ? JSON.parse(stored) : [];
        console.log(`📦 Loaded ${events.length} events from storage`);
    } catch (error) {
        console.error('❌ Error loading events from localStorage:', error);
        events = [];
    }
}

// Save Events to localStorage
function saveEvents() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(events));
        console.log(`💾 Saved ${events.length} events to storage`);
    } catch (error) {
        console.error('❌ Error saving events to localStorage:', error);
    }
}

// Handle Form Submit (Add or Edit)
function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = eventNameInput.value.trim();
    const dateTime = eventDateInput.value;
    const description = eventDescriptionInput.value.trim();
    
    if (!name || !dateTime) {
        alert('Please fill in all required fields');
        return;
    }
    
    const eventDate = new Date(dateTime);
    
    if (eventDate < new Date()) {
        alert('Please select a future date and time');
        return;
    }
    
    if (editingEventId) {
        updateEvent(editingEventId, name, eventDate, description);
    } else {
        addEvent(name, eventDate, description);
    }
    
    resetForm();
    renderEvents();
    renderCalendar();
}

// Add New Event
function addEvent(name, date, description) {
    const newEvent = {
        id: Date.now().toString(),
        name,
        date: date.toISOString(),
        description,
        notified: false,
        created: new Date().toISOString()
    };
    
    events.push(newEvent);
    saveEvents();
    console.log(`➕ Added event: ${name}`);
}

// Update Existing Event
function updateEvent(id, name, date, description) {
    const index = events.findIndex(e => e.id === id);
    
    if (index !== -1) {
        events[index] = {
            ...events[index],
            name,
            date: date.toISOString(),
            description,
            notified: false // Reset notification flag when editing
        };
        saveEvents();
        console.log(`✏️ Updated event: ${name}`);
    }
}

// Delete Event
function deleteEvent(id) {
    const event = events.find(e => e.id === id);
    
    if (event && confirm(`Delete "${event.name}"?`)) {
        events = events.filter(e => e.id !== id);
        
        // Clear countdown interval
        if (countdownIntervals[id]) {
            clearInterval(countdownIntervals[id]);
            delete countdownIntervals[id];
        }
        
        saveEvents();
        renderEvents();
        renderCalendar();
        console.log(`🗑️ Deleted event: ${event.name}`);
    }
}

// Start Editing Event
function editEvent(id) {
    const event = events.find(e => e.id === id);
    
    if (event) {
        editingEventId = id;
        eventNameInput.value = event.name;
        eventDateInput.value = new Date(event.date).toISOString().slice(0, 16);
        eventDescriptionInput.value = event.description || '';
        submitBtn.textContent = 'Update Event';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        eventForm.scrollIntoView({ behavior: 'smooth' });
        console.log(`✏️ Editing event: ${event.name}`);
    }
}

// Cancel Edit
function handleCancelEdit() {
    resetForm();
}

// Reset Form
function resetForm() {
    editingEventId = null;
    eventForm.reset();
    submitBtn.textContent = 'Add Event';
    cancelBtn.style.display = 'none';
}

// Render All Events
function renderEvents() {
    // Clear existing intervals
    Object.values(countdownIntervals).forEach(clearInterval);
    countdownIntervals = {};
    
    const now = new Date();
    
    // Show only upcoming events
    const upcomingEvents = events.filter(event => new Date(event.date) >= now);
    
    if (upcomingEvents.length === 0) {
        eventsContainer.innerHTML = '<p class="empty-state">No events yet. Add your first countdown above! 🎉</p>';
        return;
    }
    
    // Sort upcoming events by date
    const sortedUpcoming = upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    eventsContainer.innerHTML = sortedUpcoming.map(event => createEventCard(event)).join('');
    
    // Start countdown for each upcoming event
    sortedUpcoming.forEach(event => startCountdown(event.id));
}

// Create Event Card HTML
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isExpired = eventDate < now;
    
    const formattedDate = eventDate.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="event-card ${isExpired ? 'expired' : ''}" data-event-id="${event.id}">
            <div class="event-header">
                <div>
                    <div class="event-name">${escapeHtml(event.name)}</div>
                    <div class="event-date">📅 ${formattedDate}</div>
                </div>
                <div class="event-actions">
                    <button class="icon-btn" onclick="editEvent('${event.id}')" title="Edit">✏️</button>
                    <button class="icon-btn" onclick="deleteEvent('${event.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            ${event.description ? `<div class="event-description">${escapeHtml(event.description)}</div>` : ''}
            <div id="countdown-${event.id}">
                ${isExpired ? '<div class="expired-message">🎉 Event has passed!</div>' : '<div class="countdown"></div>'}
            </div>
        </div>
    `;
}

// Start Countdown for Event
function startCountdown(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const eventDate = new Date(event.date).getTime();
        const distance = eventDate - now;
        
        const countdownElement = document.getElementById(`countdown-${eventId}`);
        if (!countdownElement) return;
        
        if (distance < 0) {
            countdownElement.innerHTML = '<div class="expired-message">🎉 Event has passed!</div>';
            clearInterval(countdownIntervals[eventId]);
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update countdown display
        countdownElement.innerHTML = `
            <div class="countdown">
                <div class="countdown-item">
                    <span class="countdown-value">${days}</span>
                    <span class="countdown-label">Days</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value">${hours}</span>
                    <span class="countdown-label">Hours</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value">${minutes}</span>
                    <span class="countdown-label">Minutes</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value">${seconds}</span>
                    <span class="countdown-label">Seconds</span>
                </div>
            </div>
        `;
        
        // Check for notification trigger (1 minute before)
        if (notificationsEnabled && !event.notified && distance <= CONFIG.NOTIFICATION_ADVANCE && distance > 0) {
            sendNotification(event);
            event.notified = true;
            saveEvents();
        }
    };
    
    // Update immediately and then every second
    updateCountdown();
    countdownIntervals[eventId] = setInterval(updateCountdown, CONFIG.UPDATE_INTERVAL);
}

// Check Notification Permission
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('⚠️ Browser does not support notifications');
        notificationBtn.style.display = 'none';
        return;
    }
    
    if (Notification.permission === 'granted') {
        notificationsEnabled = true;
        notificationBtn.textContent = '🔔 Notifications Enabled';
        notificationBtn.classList.add('enabled');
        console.log('✅ Notifications are enabled');
    } else if (Notification.permission === 'denied') {
        notificationBtn.textContent = '🔕 Notifications Blocked';
        notificationBtn.disabled = true;
        console.warn('⚠️ Notifications are blocked');
    }
}

// Request Notification Permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Your browser does not support notifications');
        return;
    }
    
    if (Notification.permission === 'granted') {
        alert('Notifications are already enabled!');
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            notificationsEnabled = true;
            notificationBtn.textContent = '🔔 Notifications Enabled';
            notificationBtn.classList.add('enabled');
            console.log('✅ Notification permission granted');
            
            // Show test notification
            new Notification('Notifications Enabled!', {
                body: 'You will be notified 1 minute before your events.',
                icon: '⏰'
            });
        } else {
            console.warn('⚠️ Notification permission denied');
            alert('Notification permission was denied. Please enable it in your browser settings.');
        }
    } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
    }
}

// Send Notification
function sendNotification(event) {
    if (!notificationsEnabled || Notification.permission !== 'granted') {
        return;
    }
    
    const notification = new Notification(`Upcoming Event: ${event.name}`, {
        body: `Your event "${event.name}" is starting in 1 minute!`,
        icon: '⏰',
        requireInteraction: true
    });
    
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
    
    console.log(`🔔 Notification sent for: ${event.name}`);
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Calendar Functions
function renderCalendar() {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    
    // Update month display
    currentMonthElement.textContent = currentCalendarMonth.toLocaleString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Create calendar HTML
    let calendarHTML = '<div class="calendar-header">';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-days">';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-cell empty"></div>';
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isToday = currentDate.toDateString() === today.toDateString();
        const isPast = currentDate < today && !isToday;
        
        // Get events for this day
        const dayEvents = getEventsForDate(currentDate);
        
        let cellClass = 'calendar-cell';
        if (isToday) cellClass += ' today';
        if (isPast) cellClass += ' past';
        if (dayEvents.length > 0) cellClass += ' has-events';
        
        calendarHTML += `
            <div class="${cellClass}">
                <div class="calendar-date">${day}</div>
                ${dayEvents.length > 0 ? `
                    <div class="calendar-events">
                        ${dayEvents.map(event => `
                            <div class="calendar-event" title="${escapeHtml(event.name)}">
                                ${escapeHtml(event.name)}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendarElement.innerHTML = calendarHTML;
}

function getEventsForDate(date) {
    const now = new Date();
    return events.filter(event => {
        const eventDate = new Date(event.date);
        // Only show future events in calendar
        return eventDate >= now && 
               eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
    });
}

function changeMonth(direction) {
    currentCalendarMonth = new Date(
        currentCalendarMonth.getFullYear(),
        currentCalendarMonth.getMonth() + direction,
        1
    );
    renderCalendar();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
