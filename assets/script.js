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
    
    document.getElementById('settings-button').addEventListener('click', function() { togglePanel('settings-popup'); });
    document.getElementById('plus-button').addEventListener('click', function() { togglePanel('add-menu'); });
    document.getElementById('add-close').addEventListener('click', function() { togglePanel('add-menu'); });
    
    document.getElementById('add-button').addEventListener('click', function() { addShortcut(); });
    initializeShortcuts();
    loadShortcutsFromLocalStorage();
    fetchAndSetBackgroundImage();
});


function addShortcut() {
    var shortcutUrl = document.getElementById('shortcut-url-field').value;
    var iconUrl = document.getElementById('icon-url-field').value;
    var shortcuts = document.getElementById('actions-grid');

    if (shortcutUrl && iconUrl) {
        shortcuts.innerHTML += `<a href="${shortcutUrl}" class="action-icon"><img src="${iconUrl}" alt="Shortcut"></a>`;
        
        saveShortcutToLocalStorage(shortcutUrl, iconUrl);
    } else {
        alert('Please provide both the shortcut URL and the icon URL.');
    }
}

function saveShortcutToLocalStorage(shortcutUrl, iconUrl) {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    shortcuts.push({ url: shortcutUrl, icon: iconUrl });
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    loadShortcutsFromLocalStorage();
}

function initializeShortcuts() {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    
    if (shortcuts.length === 0) {
        const defaultShortcuts = [
            { url: "https://discord.com/channels/@me", icon: "assets/discord.png" },
            { url: "https://www.youtube.com", icon: "assets/youtube.png" },
            { url: "https://www.x.com", icon: "assets/twitter.png" },
            { url: "https://www.github.com", icon: "assets/github.png" }
        ];
        
        localStorage.setItem('shortcuts', JSON.stringify(defaultShortcuts));
    }
}

function loadShortcutsFromLocalStorage() {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    let shortcutsContainer = document.getElementById('actions-grid');
    let addShortcutsContainer = document.getElementById('shortcuts-add');

    shortcutsContainer.innerHTML = '';
    addShortcutsContainer.innerHTML = '';
    
    shortcuts.forEach(shortcut => {
        let shortcutWrapper = document.createElement('div');
        shortcutWrapper.classList.add('shortcut-wrapper', 'fade-in');
        shortcutWrapper.innerHTML = `
            <a href="${shortcut.url}" class="action-icon">
                <img src="${shortcut.icon}" alt="Shortcut">
            </a>
            <button class="remove-shortcut" data-url="${shortcut.url}" style="backdrop-filter: blur(20px);">􀆄</button>
        `;

        addShortcutsContainer.appendChild(shortcutWrapper);

        let actionIcon = document.createElement('a');
        actionIcon.href = shortcut.url;
        actionIcon.classList.add('action-icon', 'fade-in');
        actionIcon.innerHTML = `<img src="${shortcut.icon}" alt="Shortcut">`;

        shortcutsContainer.appendChild(actionIcon);

        setTimeout(() => {
            shortcutWrapper.classList.add('visible');
            actionIcon.classList.add('visible');
        }, 100);
    });

    let addShortcut = document.createElement('a');
    addShortcut.id = 'add-shortcut';
    addShortcut.classList.add('action-icon', 'fade-in');
    addShortcut.innerHTML = '􀅼';

    addShortcutsContainer.appendChild(addShortcut);

    setTimeout(() => {
        addShortcut.classList.add('visible');
    }, 100);

    document.getElementById('add-shortcut').addEventListener('click', function() { togglePanel('add-shortcut-panel'); });
    
    addShortcutsContainer.querySelectorAll('.remove-shortcut').forEach(button => {
        button.addEventListener('click', function() {
            removeShortcut(this.getAttribute('data-url'));
        });
    });
}

function removeShortcut(url) {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    const shortcutElement = document.querySelector(`.shortcut[data-url="${url}"]`);
    
    if (shortcutElement) {
        shortcutElement.classList.add('fade-out');

        setTimeout(() => {
            shortcutElement.remove();
            shortcuts = shortcuts.filter(shortcut => shortcut.url !== url);
            localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
            loadShortcutsFromLocalStorage();
        }, 500);
    } else {
        shortcuts = shortcuts.filter(shortcut => shortcut.url !== url);
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
        loadShortcutsFromLocalStorage();
    }
}


function togglePanel(id) {
    const popup = document.getElementById(id);
    popup.classList.toggle('show');
}

function fetchAndSetBackgroundImage() {
    const imageData = localStorage.getItem('bgImage');
    if (imageData) {
        setBackgroundImage(imageData);
    } else {
        document.body.style.backgroundImage = `url('assets/bg.png')`;
    }
}

function setBackgroundImage(imageData) {
    document.body.style.backgroundImage = `url(${imageData})`;
}

document.getElementById('uploadDiv').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

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
        <p class="section-label" style="text-align: left;">􀇕 Weather</p>

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
                <p style="opacity: 0.8;">${temperature}°</p>
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
    var settingsButton = document.querySelector('#settings-button');
    var settingsMenu = document.querySelector('#settings-menu');
    var closeButton = settingsMenu.querySelector('#settings-close');

    settingsButton.onclick = function() {
        settingsMenu.classList.toggle('open');
    }

    closeButton.onclick = function() {
        settingsMenu.classList.toggle('open');
    }

    window.onclick = function(event) {
        if (event.target == settingsMenu) {
            settingsMenu.classList.toggle('open');
        }
    }
});

updateDateTime();
setInterval(updateDateTime, 1000);
fetchWeather();


document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        'clock-color': document.getElementById('clock-color'),
        'clock-color-alpha': document.getElementById('clock-alpha'),
        'clock-size': document.getElementById('clock-size'),
        'clock-colon': document.getElementById('clock-colon'),
        'clock-colon-alpha': document.getElementById('clock-colon-alpha'),
        'date-color': document.getElementById('date-color'),
        'date-color-alpha': document.getElementById('date-alpha'),
        'date-size': document.getElementById('date-size'),
        'base-background': document.getElementById('base-background'),
        'base-background-alpha': document.getElementById('base-alpha'),
        'base-border': document.getElementById('base-border'),
        'base-roundness': document.getElementById('base-roundness'),
        'base-shadow': document.getElementById('base-shadow'),
        'sc-roundness': document.getElementById('sc-roundness'),
        'sb-background': document.getElementById('sb-background'),
        'sb-background-alpha': document.getElementById('sb-alpha'),
        'saveButton': document.getElementById('save-settings'),
        'resetButton': document.getElementById('reset-settings')
    };

    const cssVars = [
        'clock-color', 'clock-colon', 'clock-size',
        'date-color', 'date-size', 'base-background', 'base-border',
        'base-roundness', 'base-shadow', 'sc-roundness', 'sb-background'
    ];

    // Load saved settings
    chrome.storage.local.get(cssVars, (result) => {
        cssVars.forEach(cssVar => {
            if (result[cssVar]) {
                document.documentElement.style.setProperty(`--${cssVar}`, result[cssVar]);
                const element = elements[cssVar];
                if (element) {
                    if (element.type === 'color') {
                        // Convert RGBA to HEX
                        let rgba = result[cssVar].match(/\d+/g);
                        if (rgba && rgba.length >= 3) {
                            let hex = '#' + ((1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])).toString(16).slice(1);
                            element.value = hex;
                        }
                    } else {
                        element.value = result[cssVar];
                    }
                }
            }
        });
    });

    // Save settings
    elements.saveButton.addEventListener('click', () => {
        const newSettings = {};
        cssVars.forEach(cssVar => {
            const element = elements[cssVar];
            const alphaElement = elements[`${cssVar}-alpha`];
            if (element && alphaElement) {
                const alpha = alphaElement.value;
                const rgba = hexToRGBA(element.value, alpha);
                document.documentElement.style.setProperty(`--${cssVar}`, rgba);
                newSettings[cssVar] = rgba;
            } else if(element) {
                const value = element.value;
                document.documentElement.style.setProperty(`--${cssVar}`, value);
                newSettings[cssVar] = value;
            }
        });
        chrome.storage.local.set(newSettings);
    });

    elements.resetButton.addEventListener('click', () => {
        chrome.storage.local.clear();
        location.reload();
    });

    // Debugging logs
    console.log('Customization menu loaded.');
    cssVars.forEach(cssVar => {
        const element = elements[cssVar];
        if (element) {
            console.log(`Default ${cssVar}:`, element.value);
        } else {
            console.warn(`Element for ${cssVar} not found`);
        }
    });
});

function hexToRGBA(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyAlpha(cssVar, alpha) {
    const element = elements[cssVar];
    const color = element.value;
    const rgba = hexToRGBA(color, alpha);
    document.documentElement.style.setProperty(`--${cssVar}`, rgba);
}