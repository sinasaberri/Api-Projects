// API Configuration - Replace with your actual API key
        const API_KEY = "316da2d9aa95c07ceab0a28792420bbc";
        const API_BASE_URL = "https://api.openweathermap.org/data/2.5";
        
        // DOM Elements
        const citiesContainer = document.getElementById('citiesContainer');
        const searchInput = document.getElementById('searchInput');
        const searchError = document.getElementById('searchError');
        const themeToggle = document.getElementById('themeToggle');
        const unitToggle = document.getElementById('unitToggle');
        
        // State management
        let cities = JSON.parse(localStorage.getItem('weatherCities')) || [];
        let temperatureUnit = localStorage.getItem('temperatureUnit') || 'celsius';
        let currentTheme = localStorage.getItem('theme') || 'light';
        
        // Weather condition mapping
        const weatherConditions = {
            sunny: ['clear'],
            cloudy: ['clouds'],
            rainy: ['rain', 'drizzle', 'thunderstorm'],
            snowy: ['snow'],
            night: ['night']
        };
        
        // Initialize the app
        function init() {
            // Set theme
            document.body.setAttribute('data-theme', currentTheme);
            updateThemeIcon();
            
            // Set temperature unit
            updateUnitToggle();
            
            // Load cities
            if (cities.length > 0) {
                cities.forEach(city => {
                    addCityCard(city);
                });
            } else {
                // Add default city if none exist
                addCity('London').catch(() => {
                    // Fallback to geolocation if API fails
                    getCurrentLocation();
                });
            }
            
            // Event listeners
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchCity();
                }
            });
            
            themeToggle.addEventListener('click', toggleTheme);
            unitToggle.addEventListener('click', toggleUnit);
        }
        
        // Get user's current location
        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchWeatherByCoordinates(latitude, longitude);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        // Fallback to a default city
                        addCity('New York');
                    }
                );
            } else {
                // Fallback to a default city
                addCity('Tokyo');
            }
        }
        
        // Search for a city
        function searchCity() {
            const cityName = searchInput.value.trim();
            if (cityName) {
                addCity(cityName)
                    .then(() => {
                        searchInput.value = '';
                        searchError.style.display = 'none';
                    })
                    .catch(() => {
                        showError();
                    });
            }
        }
        
        // Show error message
        function showError() {
            searchError.style.display = 'block';
            searchInput.classList.add('shake');
            setTimeout(() => {
                searchInput.classList.remove('shake');
            }, 500);
        }
        
        // Add a city to the dashboard
        async function addCity(cityName) {
            try {
                const cityData = await fetchWeatherData(cityName);
                if (!cities.find(city => city.id === cityData.id)) {
                    cities.push(cityData);
                    localStorage.setItem('weatherCities', JSON.stringify(cities));
                    addCityCard(cityData);
                }
                return cityData;
            } catch (error) {
                console.error('Error adding city:', error);
                throw error;
            }
        }
        
        // Fetch weather data by city name
        async function fetchWeatherData(cityName) {
            const response = await fetch(`${API_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const data = await response.json();
            return processWeatherData(data);
        }
        
        // Fetch weather data by coordinates
        async function fetchWeatherByCoordinates(lat, lon) {
            const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
            if (!response.ok) {
                throw new Error('Location not found');
            }
            const data = await response.json();
            const cityData = processWeatherData(data);
            
            if (!cities.find(city => city.id === cityData.id)) {
                cities.unshift(cityData);
                localStorage.setItem('weatherCities', JSON.stringify(cities));
                addCityCard(cityData, true);
            }
        }
        
        // Process raw weather data
        function processWeatherData(data) {
            return {
                id: data.id,
                name: data.name,
                country: data.sys.country,
                temp: data.main.temp,
                feelsLike: data.main.feels_like,
                condition: data.weather[0].main.toLowerCase(),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                pressure: data.main.pressure,
                icon: data.weather[0].icon,
                lat: data.coord.lat,
                lon: data.coord.lon,
                timezone: data.timezone
            };
        }
        
        // Create and add city card to DOM
        function addCityCard(cityData, prepend = false) {
            const card = document.createElement('div');
            card.className = 'city-card';
            card.dataset.cityId = cityData.id;
            
            // Determine background based on weather condition
            let bgClass = 'sunny-bg';
            if (weatherConditions.cloudy.some(cond => cityData.condition.includes(cond))) {
                bgClass = 'cloudy-bg';
            } else if (weatherConditions.rainy.some(cond => cityData.condition.includes(cond))) {
                bgClass = 'rainy-bg';
            } else if (weatherConditions.snowy.some(cond => cityData.condition.includes(cond))) {
                bgClass = 'snowy-bg';
            } else if (Math.abs(cityData.timezone / 3600) > 12) {
                bgClass = 'night-bg';
            }
            
            card.classList.add(bgClass);
            
            // Convert temperature if needed
            const displayTemp = temperatureUnit === 'celsius' ? 
                Math.round(cityData.temp) : 
                Math.round((cityData.temp * 9/5) + 32);
                
            const displayFeelsLike = temperatureUnit === 'celsius' ? 
                Math.round(cityData.feelsLike) : 
                Math.round((cityData.feelsLike * 9/5) + 32);
            
            const unitSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
            
            card.innerHTML = `
                <div class="city-header">
                    <div>
                        <div class="city-name">${cityData.name}</div>
                        <div class="city-country">${cityData.country}</div>
                    </div>
                    <div class="card-controls">
                        <button class="card-btn refresh-btn" data-city-id="${cityData.id}">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="card-btn remove-btn" data-city-id="${cityData.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="weather-main">
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${cityData.icon}@2x.png" alt="${cityData.description}">
                    </div>
                    <div>
                        <div class="weather-temp">${displayTemp}<span class="unit-symbol">${unitSymbol}</span></div>
                        <div class="weather-feels-like">Feels like ${displayFeelsLike}°</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="detail-item">
                        <div class="detail-label">Humidity</div>
                        <div class="detail-value">${cityData.humidity}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Wind Speed</div>
                        <div class="detail-value">${cityData.windSpeed} m/s</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Pressure</div>
                        <div class="detail-value">${cityData.pressure} hPa</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Condition</div>
                        <div class="detail-value">${cityData.description}</div>
                    </div>
                </div>
                <div class="forecast-title">5-Day Forecast</div>
                <div class="forecast-container" id="forecast-${cityData.id}">
                    <!-- Forecast will be loaded here -->
                </div>
            `;
            
            if (prepend) {
                citiesContainer.insertBefore(card, citiesContainer.firstChild);
            } else {
                citiesContainer.appendChild(card);
            }
            
            // Load forecast data
            loadForecast(cityData.id, cityData.lat, cityData.lon);
            
            // Add event listeners to card buttons
            card.querySelector('.remove-btn').addEventListener('click', () => removeCity(cityData.id));
            card.querySelector('.refresh-btn').addEventListener('click', () => refreshCity(cityData.id));
        }
        
        // Load forecast data
        async function loadForecast(cityId, lat, lon) {
            try {
                const response = await fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                if (!response.ok) throw new Error('Forecast data unavailable');
                
                const data = await response.json();
                const forecastContainer = document.getElementById(`forecast-${cityId}`);
                
                // Clear existing forecast
                forecastContainer.innerHTML = '';
                
                // Process forecast data (get one entry per day)
                const dailyData = {};
                data.list.forEach(item => {
                    const date = new Date(item.dt * 1000);
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    if (!dailyData[day]) {
                        dailyData[day] = {
                            date: day,
                            temp: item.main.temp,
                            icon: item.weather[0].icon,
                            condition: item.weather[0].main
                        };
                    }
                });
                
                // Display forecast (max 5 days)
                const forecastDays = Object.values(dailyData).slice(0, 5);
                forecastDays.forEach(day => {
                    const displayTemp = temperatureUnit === 'celsius' ? 
                        Math.round(day.temp) : 
                        Math.round((day.temp * 9/5) + 32);
                        
                    const unitSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
                    
                    const forecastDay = document.createElement('div');
                    forecastDay.className = 'forecast-day';
                    forecastDay.innerHTML = `
                        <div class="forecast-date">${day.date}</div>
                        <div class="forecast-icon">
                            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.condition}">
                        </div>
                        <div class="forecast-temp">${displayTemp}${unitSymbol}</div>
                    `;
                    forecastContainer.appendChild(forecastDay);
                });
            } catch (error) {
                console.error('Error loading forecast:', error);
            }
        }
        
        // Remove a city
        function removeCity(cityId) {
            cities = cities.filter(city => city.id !== cityId);
            localStorage.setItem('weatherCities', JSON.stringify(cities));
            document.querySelector(`.city-card[data-city-id="${cityId}"]`).remove();
        }
        
        // Refresh a city's data
        async function refreshCity(cityId) {
            try {
                const cityIndex = cities.findIndex(city => city.id === cityId);
                if (cityIndex !== -1) {
                    const cityName = cities[cityIndex].name;
                    const updatedData = await fetchWeatherData(cityName);
                    cities[cityIndex] = updatedData;
                    localStorage.setItem('weatherCities', JSON.stringify(cities));
                    
                    // Remove old card and add updated one
                    document.querySelector(`.city-card[data-city-id="${cityId}"]`).remove();
                    addCityCard(updatedData);
                }
            } catch (error) {
                console.error('Error refreshing city:', error);
            }
        }
        
        // Toggle theme between light and dark
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            document.body.setAttribute('data-theme', currentTheme);
            updateThemeIcon();
        }
        
        // Update theme toggle icon
        function updateThemeIcon() {
            const icon = themeToggle.querySelector('i');
            if (currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
        
        // Toggle temperature unit
        function toggleUnit() {
            temperatureUnit = temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
            localStorage.setItem('temperatureUnit', temperatureUnit);
            updateUnitToggle();
            updateAllTemperatures();
        }
        
        // Update unit toggle display
        function updateUnitToggle() {
            const unitSpan = unitToggle.querySelector('span');
            const unitIcon = unitToggle.querySelector('i');
            
            if (temperatureUnit === 'celsius') {
                unitSpan.textContent = '°C';
                unitIcon.className = 'fas fa-temperature-celsius';
            } else {
                unitSpan.textContent = '°F';
                unitIcon.className = 'fas fa-temperature-fahrenheit';
            }
        }
        
        // Update all temperature displays
        function updateAllTemperatures() {
            document.querySelectorAll('.weather-temp').forEach(tempEl => {
                const cityId = tempEl.closest('.city-card').dataset.cityId;
                const city = cities.find(c => c.id === parseInt(cityId));
                
                if (city) {
                    const displayTemp = temperatureUnit === 'celsius' ? 
                        Math.round(city.temp) : 
                        Math.round((city.temp * 9/5) + 32);
                        
                    const unitSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
                    tempEl.innerHTML = `${displayTemp}<span class="unit-symbol">${unitSymbol}</span>`;
                }
            });
            
            document.querySelectorAll('.weather-feels-like').forEach(feelsEl => {
                const cityId = feelsEl.closest('.city-card').dataset.cityId;
                const city = cities.find(c => c.id === parseInt(cityId));
                
                if (city) {
                    const displayFeels = temperatureUnit === 'celsius' ? 
                        Math.round(city.feelsLike) : 
                        Math.round((city.feelsLike * 9/5) + 32);
                    feelsEl.textContent = `Feels like ${displayFeels}°`;
                }
            });
            
            // Update forecast temperatures
            cities.forEach(city => {
                const forecastContainer = document.getElementById(`forecast-${city.id}`);
                if (forecastContainer) {
                    forecastContainer.querySelectorAll('.forecast-temp').forEach(forecastTemp => {
                        // We would need to store forecast data to update properly
                        // For simplicity, we'll just reload forecasts
                        loadForecast(city.id, city.lat, city.lon);
                    });
                }
            });
        }
        
        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);