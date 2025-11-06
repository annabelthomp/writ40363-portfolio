// ==========================================
// PROJECT 2: LOCAL FAVORITES TRACKER
// LAB15: localStorage Persistence - COMPLETE!
// ==========================================

console.log('LAB15: localStorage Persistence');
console.log('Project 2: Local Favorites Tracker - COMPLETE!');

// Array to store all favorites
let favorites = [];

// Get references to DOM elements
const form = document.getElementById('add-favorite-form');
const favoritesList = document.getElementById('favorites-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Function to save favorites to localStorage
function saveFavorites() {
    try {
        localStorage.setItem('localFavorites', JSON.stringify(favorites));
        console.log('Favorites saved to localStorage');
        console.log('Saved', favorites.length, 'favorites');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Unable to save favorites. Your browser may have storage disabled.');
    }
}

// Function to load favorites from localStorage
function loadFavorites() {
    try {
        const savedData = localStorage.getItem('localFavorites');

        if (savedData) {
            favorites = JSON.parse(savedData);
            console.log('Favorites loaded from localStorage');
            console.log('Loaded', favorites.length, 'favorites');
        } else {
            console.log('No saved favorites found');
            favorites = [];
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        console.log('Starting with empty favorites array');
        favorites = [];
    }
}

// [Your other functions from LAB13-14: displayFavorites, searchFavorites, deleteFavorite, addFavorite]

// Function to clear all favorites
function clearAllFavorites() {
    const confirmClear = confirm('Are you sure you want to delete ALL favorites? This cannot be undone!');

    if (confirmClear) {
        favorites = [];
        console.log('All favorites cleared');

        localStorage.removeItem('localFavorites');
        console.log('localStorage cleared');

        displayFavorites();
        alert('All favorites have been deleted.');
    } else {
        console.log('Clear all cancelled by user');
    }
        // Display count
    const countMessage = document.createElement('p');
    countMessage.className = 'favorites-count';
    countMessage.textContent = `Showing ${filteredFavorites.length} of ${favorites.length} favorites`;
    favoritesList.prepend(countMessage);
}

// Connect event listeners
form.addEventListener('submit', addFavorite);
searchInput.addEventListener('input', searchFavorites);
categoryFilter.addEventListener('change', searchFavorites);

const clearAllBtn = document.getElementById('clear-all-btn');
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllFavorites);
}

console.log('Event listeners attached - app is ready!');

// Load saved favorites from localStorage on startup
loadFavorites();

// Display the loaded favorites (or empty message)
displayFavorites();

console.log('✅ Project 2: Local Favorites Tracker is ready to use!');