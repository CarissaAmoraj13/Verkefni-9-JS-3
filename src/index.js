import { el, empty } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

const locations = [
  { title: 'Reykjavík', lat: 64.1355, lng: -21.8954 },
  { title: 'Akureyri', lat: 65.6835, lng: -18.0878 },
  { title: 'New York', lat: 40.7128, lng: -74.006 },
  { title: 'Tokyo', lat: 35.6764, lng: 139.65 },
  { title: 'Sydney', lat: 33.8688, lng: 151.2093 },
];

function renderIntoResultsContent(element) {
  const outputElement = document.querySelector('.output');
  if (!outputElement) {
    console.warn('Could not find .output');
    return;
  }
  empty(outputElement);
  outputElement.appendChild(element);
}

function renderResults(location, results) {
  const header = el(
    'tr',
    {},
    el('th', {}, 'Time'),
    el('th', {}, 'Temperature (°C)'),
    el('th', {}, 'Precipitation (mm)')
  );

  const body = results.map(result =>
    el(
      'tr',
      {},
      el('td', {}, result.time),
      el('td', {}, result.temperature.toFixed(1)),
      el('td', {}, result.precipitation.toFixed(1))
    )
  );

  const resultsTable = el('table', { class: 'forecast' }, header, ...body);

  renderIntoResultsContent(
    el(
      'section',
      {},
      el('h2', {}, `Weather results for: ${location.title}`),
      resultsTable
    )
  );
}

function renderError(error) {
  console.log(error);
  const message = error.message;
  renderIntoResultsContent(el('p', {}, `Error: ${message}`));
}

function renderLoading() {
  renderIntoResultsContent(el('p', {}, 'Loading...'));
}

async function onSearch(location) {
  renderLoading();
  let results;
  try {
    results = await weatherSearch(location.lat, location.lng);
  } catch (error) {
    renderError(error);
    return;
  }
  renderResults(location, results ?? []);
}

async function onSearchMyLocation() {
  renderLoading();
  if (!navigator.geolocation) {
    renderError(new Error("Geolocation is not supported by this browser."));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const results = await weatherSearch(latitude, longitude);
        renderResults({ title: 'Your Location' }, results ?? []);
      } catch (error) {
        renderError(error);
      }
    },
    () => {
      renderError(new Error("Unable to retrieve your location."));
    }
  );
}

function renderLocationButton(locationTitle, onSearch) {
  return el(
    'li',
    { class: 'locations__location' },
    el('button', { class: 'locations__button', click: onSearch }, locationTitle)
  );
}

function render(container, locations, onSearch, onSearchMyLocation) {
  const parentElement = document.createElement('main');
  parentElement.classList.add('weather');

  const headerElement = document.createElement('header');
  const heading = document.createElement('h1');
  heading.appendChild(document.createTextNode('Weather Forecast'));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  const introText = el('p', {}, 'Select a location to view the forecast, or search for your current location.');
  parentElement.appendChild(introText);

  const locationsElement = document.createElement('div');
  locationsElement.classList.add('locations');

  const locationsListElement = document.createElement('ul');
  locationsListElement.classList.add('locations__list');

  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => onSearch(location));
    locationsListElement.appendChild(liButtonElement);
  }
  locationsElement.appendChild(locationsListElement);

  const myLocationButton = el(
    'button',
    { class: 'locations__button', click: onSearchMyLocation },
    'Use My Location'
  );

  parentElement.appendChild(myLocationButton);
  parentElement.appendChild(locationsElement);

  const outputElement = document.createElement('div');
  outputElement.classList.add('output');
  parentElement.appendChild(outputElement);

  container.appendChild(parentElement);
}

render(document.body, locations, onSearch, onSearchMyLocation);
