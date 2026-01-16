// Live Clock Update Function
function updateClock() {
    const now = new Date();

    // Get hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Add leading zeros if needed
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // Format time string
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Update the clock element
    const clockElement = document.getElementById('clock-time');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// Update clock immediately on page load
updateClock();

// Update clock every second
setInterval(updateClock, 1000);

// ==========================================
// Page View Counter (Issue #691)
// ==========================================

// Function to increment and display page view count
function updatePageViewCounter() {
    // Get the current page view count from local storage
    let pageViews = localStorage.getItem('ecolife_page_views');

    // If no count exists, initialize to 0
    if (pageViews === null) {
        pageViews = 0;
    } else {
        pageViews = parseInt(pageViews, 10);
    }

    // Increment the count
    pageViews++;

    // Save the new count to local storage
    localStorage.setItem('ecolife_page_views', pageViews);

    // Update the display element
    const countElement = document.getElementById('page-view-count');
    if (countElement) {
        // Format the number with comma separators for better readability
        countElement.textContent = pageViews.toLocaleString();
    }
}

// Initialize page view counter on page load
updatePageViewCounter();
