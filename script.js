function updateDateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('date').textContent = dateString;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
}

document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const searchQuery = this.value.trim();
        if (searchQuery) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(searchUrl, '_blank');
            this.value = '';
        }
    }
});

updateDateTime();
setInterval(updateDateTime, 1000);