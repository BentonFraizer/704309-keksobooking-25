import { renderPopup } from './render-ads.js';
import { getData } from './server-data.js';
import { openModalServerError } from './modals.js';
import { getFilteredData, savedTenRowDataElements } from './map-filter.js';

const START_COORDS = {
  lat: 35.6824,
  lng: 139.75219,
};
const MAP_ZOOM = 13;
const adForm = document.querySelector('.ad-form');
const mapForm = document.querySelector('.map__filters');
const mapFormFields = mapForm.children;
const adFormFields = adForm.children;
const urlToGetData = 'https://25.javascript.pages.academy/keksobooking/data';
const MAIN_PIN_ICON_SIZE = [52, 52];
const MAIN_PIN_ICON_SETTINGS = [26, 52];
const PIN_ICON_SIZE = [40, 40];
const PIN_ICON_SETTINGS = [20, 40];
const addressFieldElement = document.querySelector('#address');

//Изменение состояния страницы (Активное/Неактивное)
const activatePage = (activate = false) => {
  mapForm.classList[activate ? 'remove' : 'add']('map__filters--disabled');
  adForm.classList[activate ? 'remove' : 'add']('ad-form--disabled');
  for (const mapFormField of mapFormFields){
    mapFormField[activate ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
  }
  for (const adFormField of adFormFields) {
    adFormField[activate ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
  }
};

//Создание карты
const map = L.map('map-canvas')
  .on('load', () => {
    getData(getFilteredData, openModalServerError, urlToGetData);
  })
  .setView({
    lat: START_COORDS.lat,
    lng: START_COORDS.lng,
  }, MAP_ZOOM);

//Создание слоя с изображениями карт
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);

//Замена изображения штатной иконки для главной метки
const mainPinIcon = L.icon({
  iconUrl: './img/main-pin.svg',
  iconSize: MAIN_PIN_ICON_SIZE,
  iconAnchor: MAIN_PIN_ICON_SETTINGS,
});

//Создание главного маркера
const mainMarker = L.marker(
  {
    lat: START_COORDS.lat,
    lng: START_COORDS.lng,
  },
  {
    draggable: true,
    icon: mainPinIcon,
  }
);

//Добавление главного маркера на карту
mainMarker.addTo(map);

//Запись координат главной метки в поле address
mainMarker.on('moveend', (evt) => {
  const mainMarkerСoordinates = evt.target.getLatLng();
  addressFieldElement.value = `${(mainMarkerСoordinates.lat).toFixed(5)}, ${(mainMarkerСoordinates.lng).toFixed(5)}`;
});

//Возврат в главной метки в изначальное положение, восстановление изначального масштаба карты
const resetMarkersAndMapCoords = () => {
  mainMarker.setLatLng({
    lat: START_COORDS.lat,
    lng: START_COORDS.lng,
  });

  map.setView({
    lat: START_COORDS.lat,
    lng: START_COORDS.lng,
  }, MAP_ZOOM);
};

//Замена изображения штатной иконки для обычной метки
const icon = L.icon({
  iconUrl: './img/pin.svg',
  iconSize: PIN_ICON_SIZE,
  iconAnchor: PIN_ICON_SETTINGS,
});

//Создание слоя для отрисовки на нём обычных меток
const markerGroup = L.layerGroup().addTo(map);

//Функция для очистки слоя со всеми штатными метками
const deleteMarkerGroupLayer = () => {
  markerGroup.clearLayers();
};

//Функция для оторисовки обычных меткок на карте. Реализация показа всплывающего окна с подробной информацией
//при нажатии нажатии на любую из обычных меток
const renderSimpleMarkers = (cards = savedTenRowDataElements) => {
  deleteMarkerGroupLayer();
  for (let i = 0; i < cards.length; i++) {
    const {lat, lng} = cards[i].location;
    const marker = L.marker({
      lat,
      lng,
    },
    {
      icon,
    }
    );

    marker
      .addTo(markerGroup)
      .bindPopup(renderPopup(cards[i]));
  }
  activatePage(true);
};

//Функция для закрытия открытого попапа с информацией об объявлении
const closePopup = () => {
  map.closePopup();
};

export { resetMarkersAndMapCoords, closePopup, activatePage, renderSimpleMarkers, deleteMarkerGroupLayer };
