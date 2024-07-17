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

function fetchWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=1`)
                .then(response => response.json())
                .then(data => {
                    displayCurrentWeather(data);
                    displayHourlyForecast(data);
                })
                .catch(error => {
                    console.error('Error fetching weather:', error);
                    document.getElementById('weather-info').innerHTML = '<p>Unable to fetch weather information</p>';
                });
        }, error => {
            console.error('Error getting location:', error);
            document.getElementById('weather-info').innerHTML = '<p>Unable to retrieve your location</p>';
        });
    } else {
        console.error('Geolocation is not supported by this browser');
        document.getElementById('weather-info').innerHTML = '<p>Geolocation is not supported by this browser</p>';
    }
}

function displayCurrentWeather(data) {
    const temperature = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;
    
    const high = Math.max(...data.hourly.temperature_2m.slice(0, 24));
    const low = Math.min(...data.hourly.temperature_2m.slice(0, 24));
    
    const weatherDescription = getWeatherDescription(weatherCode);
    
    const weatherHTML = `
        <p style="color: white; margin-top: 0; margin-bottom: 0;">􀇕 Weather</p>

        <div class="weather-hstack">
            <h1>${temperature}°</h1>

            <div class="weather-vstack">
                <p id="weather-desc">${weatherDescription}</p>
                <p id="weather-margin">H: ${high}° L: ${low}°</p>
            </div>
        </div>
    `;
    
    document.getElementById('weather-info').innerHTML = weatherHTML;
}

function displayHourlyForecast(data) {
    const now = new Date();
    const forecastHTML = [];

    for (let i = 0; i < 5; i++) {
        const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hour = futureTime.getHours().toString().padStart(2, '0');
        const temperature = data.hourly.temperature_2m[i];
        const weatherCode = data.hourly.weathercode[i];
        const weatherDescription = getWeatherIcon(weatherCode);

        forecastHTML.push(`
            <div class="forecast-hour">
                <p>${hour}:00</p>
                <p id="forecast-icon" style="color: ${weatherDescription.color};">${weatherDescription.icon}</p>
                <p>${temperature}°</p>
            </div>
        `);
    }

    const hourlyForecastHTML = `
        <div id="hourly-forecast">
            ${forecastHTML.join('')}
        </div>
    `;

    document.getElementById('weather-info').innerHTML += hourlyForecastHTML;
}


function getWeatherIcon(code) {
    const weatherDetails = {
        0: { icon: '􀆮', color: '#ffcc00' },
        1: { icon: '􀆬', color: '#999999' },
        2: { icon: '􀇕', color: '#999999' },
        3: { icon: '􀇃', color: '#999999' },
        45: { icon: '􀇋', color: '#999999' },
        48: { icon: '􀇋', color: '#999999' },
        51: { icon: '􀇅', color: '#009dff' },
        53: { icon: '􀇇', color: '#009dff' },
        55: { icon: '􀇉', color: '#009dff' },
        61: { icon: '􀇉', color: '#009dff' },
        63: { icon: '􀇉', color: '#009dff' },
        65: { icon: '􀇉', color: '#009dff' },
        71: { icon: '􀇏', color: '#ffffff' },
        73: { icon: '􀇏', color: '#ffffff' },
        75: { icon: '􀇥', color: '#ffffff' },
        95: { icon: '􀇓', color: '#b88400' },
    };
    
    return weatherDetails[code] || { icon: 'Unknown', color: '#ffcc00' };
}


function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        95: 'Thunderstorm',
    };
    
    return weatherCodes[code] || 'Unknown';
}

updateDateTime();
setInterval(updateDateTime, 1000);
fetchWeather();
