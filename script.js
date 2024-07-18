let is24HourFormat = localStorage.getItem('is24HourFormat') === 'true' || false;
let isCelsius = localStorage.getItem('isCelsius') === 'true' || false;
// localStorage = new LocalStorage('./scratch', Number.MAX_VALUE);

var toggler_24h = document.querySelector('.toggle-24h');
var toggler_celsius = document.querySelector('.toggle-celsius');

if (is24HourFormat) {
    toggler_24h.classList.add('active');
}
if (isCelsius) {
    toggler_celsius.classList.add('active');
}

toggler_24h.onclick = function() {
    toggler_24h.classList.toggle('active');
    is24HourFormat = !is24HourFormat;
    localStorage.setItem('is24HourFormat', is24HourFormat);
    updateDateTime();
}

toggler_celsius.onclick = function() {
    toggler_celsius.classList.toggle('active');
    isCelsius = !isCelsius;
    localStorage.setItem('isCelsius', isCelsius);
    fetchWeather();
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxWidth = 3200;
                const maxHeight = 2400;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        width = maxWidth;
                        height = Math.round(maxWidth * img.height / img.width);
                    } else {
                        height = maxHeight;
                        width = Math.round(maxHeight * img.width / img.height);
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                const base64Image = canvas.toDataURL('image/jpeg', 3.0);
                localStorage.setItem('bgImage', base64Image);
                alert('Background saved! Please refresh the page.');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select a valid image file.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('settings-button').addEventListener('click', toggleSettingsPanel);
    fetchAndSetBackgroundImage();
});

function fetchAndSetBackgroundImage() {
    const imageData = localStorage.getItem('bgImage');
    if (imageData) {
        setBackgroundImage(imageData);
    } else {
        document.body.style.backgroundImage = `url('bg.png')`;
    }
}

function setBackgroundImage(imageData) {
    document.body.style.backgroundImage = `url(${imageData})`;
}

document.getElementById('uploadDiv').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

function toggleSettingsPanel() {
    const settingsPopup = document.getElementById('settings-popup');
    settingsPopup.classList.toggle('show');
}

function updateDateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    if (!is24HourFormat) {
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
    }

    const dateElement = document.getElementById('date');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');

    if (dateElement.textContent !== dateString) {
        dateElement.textContent = dateString;
        dateElement.classList.add('fade-in');
        setTimeout(() => dateElement.classList.remove('fade-in'), 500);
    }

    if (hoursElement.textContent !== hours.toString().padStart(2, '0')) {
        hoursElement.textContent = hours.toString().padStart(2, '0');
        hoursElement.classList.add('fade-in');
        setTimeout(() => hoursElement.classList.remove('fade-in'), 500);
    }

    if (minutesElement.textContent !== minutes) {
        minutesElement.textContent = minutes;
        minutesElement.classList.add('fade-in');
        setTimeout(() => minutesElement.classList.remove('fade-in'), 500);
    }
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

            const temperatureUnit = isCelsius ? 'celsius' : 'fahrenheit';
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${temperatureUnit}&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=1`)
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
            <h1 id="weather-temp">${temperature}°</h1>

            <div class="weather-vstack">
                <p id="weather-desc">${weatherDescription}</p>
                <p id="weather-margin">H: ${high}° L: ${low}°</p>
            </div>
        </div>
    `;
    
    const weatherInfoElement = document.getElementById('weather-info');
    weatherInfoElement.innerHTML = weatherHTML;

    const tempElement = document.getElementById('weather-temp');
    const descElement = document.getElementById('weather-desc');
    const marginElement = document.getElementById('weather-margin');

    tempElement.classList.add('fade-in');
    descElement.classList.add('fade-in');
    marginElement.classList.add('fade-in');

    setTimeout(() => {
        tempElement.classList.remove('fade-in');
        descElement.classList.remove('fade-in');
        marginElement.classList.remove('fade-in');
    }, 500);
}

function displayHourlyForecast(data) {
    const now = new Date();
    const forecastHTML = [];

    for (let i = 0; i < 5; i++) {
        const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        let hour = futureTime.getHours();
        let period = '';
        
        if (!is24HourFormat) {
            period = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
        } else {
            hour = hour.toString().padStart(2, '0');
        }
        
        const temperature = data.hourly.temperature_2m[i];
        const weatherCode = data.hourly.weathercode[i];
        const weatherDescription = getWeatherIcon(weatherCode);

        forecastHTML.push(`
            <div class="forecast-hour fade-in">
                <p>${hour}${is24HourFormat ? ':00' : period}</p>
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

    const weatherInfoElement = document.getElementById('weather-info');
    weatherInfoElement.innerHTML += hourlyForecastHTML;

    const forecastHourElements = document.querySelectorAll('.forecast-hour');
    forecastHourElements.forEach((element) => {
        element.classList.add('fade-in');
        setTimeout(() => {
            element.classList.remove('fade-in');
        }, 500);
    });
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

document.addEventListener('DOMContentLoaded', function() {
    var settingsButton = document.getElementById('settings-button');
    var settingsModal = document.getElementById('settings-modal');
    var closeButton = settingsModal.querySelector('.close');

    settingsButton.onclick = function() {
        settingsModal.style.display = 'block';
    }

    closeButton.onclick = function() {
        settingsModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = 'none';
        }
    }
});

updateDateTime();
setInterval(updateDateTime, 1000);
fetchWeather();
