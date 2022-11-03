// Weather API request template "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}"

// Declaring Globals
var searchHistory = [];
var weatherApiRoot = 'https://api.openweathermap.org';

var apiKeySuffix = '&appid=d91f911bcf2c0f925fb6535547a5ddc9'

// DOM element references
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var searchBtn = document.querySelector('#search-button');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');

// Add event handler for search button
function handleSearchSubmit(e) {
    if (!searchInput.value) {
        return;
    }
    e.preventDefault();
    var search = searchInput.value.trim();
    fetchCoords(search)
    searchInput.value = '';
} searchForm.addEventListener('submit', handleSearchSubmit);

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function renderItems(city, data) {
      renderCurrentWeather(city, data.current, data.timezone);
      renderForecast(data.daily, data.timezone);
    }
    

function addToHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderSearchHistory();
}

function renderSearchHistory() {
    searchHistoryContainer.innerHTML = '';
    for (var i = searchHistory.length - 1; i >= 0; i--) {
        var newBtn = document.createElement('button');
        newBtn.setAttribute('type', 'button');
        newBtn.setAttribute('aria-controls', 'today forcast');


        newBtn.classList.add('history-btn');
        newBtn.setAttribute('data-search', searchHistory[i]);
        newBtn.textContent = searchHistory[i];
        searchHistoryContainer.append(newBtn);
    }
}

function initSearchHistory() {
    var historyStorage = localStorage.getItem('search-history');
    if (historyStorage) {
        searchHistory = JSON.parse(historyStorage);
    }
    renderSearchHistory();
}


function fetchCoords(search) {
    var apiUrl = `${weatherApiRoot}/geo/1.0/direct?q=${search}${apiKeySuffix}`

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert('Sorry, the location you entered is invalid. Please try again.')
            } else {
                addToHistory(search)
                fetchWeather(data[0]);
                console.log(data[0]);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}


function fetchWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
    var apiUrl = `${weatherApiRoot}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly${apiKeySuffix}`;

    fetch(apiUrl)
        .then(function(res) {
            return res.json();
        })
        .then(function (data) {
            console.log("DATA", data)
            renderItems(city, data)
        })
        .catch(function(err) {
                console.error(err);
        });
}
function renderForecast(dailyForecast, timezone) {
    // Create unix timestamps for start and end of 5 day forecast
    var startDt = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
    var endDt = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();
  
    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');
  
    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);
  
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
    for (var i = 0; i < dailyForecast.length; i++) {
  
      if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
        renderForecastCard(dailyForecast[i], timezone);
      }
    }
  }

function renderForecastCard(forecast, timezone) {
    // variables for data from api
    var unixTs = forecast.dt;
    var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var iconDescription = forecast.weather[0].description;
    var tempF = forecast.temp.day;
    var { humidity } = forecast;
    var windMph = forecast.wind_speed;
  
    // Create elements for a card
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
  
    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  
    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    // Add content to elements
    cardTitle.textContent = dayjs.unix(unixTs).tz(timezone).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${tempF} °F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
  
    forecastContainer.append(col);
  }

  function renderCurrentWeather(city, weather, timezone) {
    todayContainer.innerHTML = '';
    var date = dayjs().tz(timezone).format('M/D/YYYY');

    var tempF = weather.temp;
    var humidity = weather.humidity;
    var windMph = weather.wind_speed;
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description;

    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h3');
    var heading = document.createElement('h4');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    col.append(card);
    card.append(cardBody);

    col.setAttribute('class', 'col-md');

    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    heading.setAttribute('class', 'card-title');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);

    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    cardTitle.textContent = 'Current Weather Forecast'
    heading.textContent = `${city} ${date}`;
    heading.append(weatherIcon);
    tempEl.textContent = `Temp: ${tempF} °F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    cardBody.append(cardTitle, heading, tempEl, windEl, humidityEl);

    todayContainer.append(col);

}

