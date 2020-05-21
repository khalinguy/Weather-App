// API provider: https://openweathermap.org/api
// api key : a9e2ee10b9b9fa9da315c5d176375fff


// CREATE ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const dateElement =  document.getElementById("date-time");
const buttonElement = document.querySelector(".button-click");
// STORE DATA
const weather = {};
const forecastWeather = {};
//STORE forecastTempData
const maxTemp = [];
const minTemp = [];

var maxFTemp = [celsiusToFahrenheit(maxTemp[0]), celsiusToFahrenheit(maxTemp[1]), celsiusToFahrenheit(maxTemp[2])];
var minFTemp = [celsiusToFahrenheit(minTemp[0]), celsiusToFahrenheit(minTemp[1]), celsiusToFahrenheit(minTemp[2])];

weather.temperature = {
    unit : "celsius"
};

//FORECAST BUTTON
var buttonStatus = false;

//Get current time
var day = new Date();

// APP CONSTS AND VARS
const KELVIN = 273;

// API KEY
const key = "a9e2ee10b9b9fa9da315c5d176375fff";


//START APP
$(document).ready(function(){
    checkGeolocation();
});


// CHECK IF BROWSER SUPPORTS GEOLOCATION
function checkGeolocation (){
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(setPositionCurrent, showError);
    } else {
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
    }
}

// SET USER'S POSITION
function setPositionCurrent(position){
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    getWeather(latitude, longitude);
}

// CALL BACK FUNCTION TO GET LAT, LNG FOR FORECAST DATA
function getLocation(callback) {
    if (navigator.geolocation) {
        var lat_lng = navigator.geolocation.getCurrentPosition(function(position){
            var user_position = {};
            user_position.lat = position.coords.latitude;
            user_position.lng = position.coords.longitude;
            callback(user_position);
        });
    } else {
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
    }
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
function showError(error){
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// GET WEATHER FROM API PROVIDER
function getWeather(latitude, longitude){
    let url = `https://api.openweathermap.org/data/2.5/weather?`+
                `lat=${latitude}`+
                `&lon=${longitude}`+
                `&appid=${key}`;
    fetch(url)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
        })
        .then(function(){
            displayWeather();
        });
}

//GET FORECAST WEATHER
function getForecastWeather(latitude, longitude){
    let url =   `https://api.openweathermap.org/data/2.5/onecall?`+
        `lat=${latitude}`+
        `&lon=${longitude}`+
        `&exclude={current,minutely,hourly}`+
        `&appid=a9e2ee10b9b9fa9da315c5d176375fff`;
    fetch(url)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){

            //Forecast for 3 following days
            for(i = 0; i < 3; i++) {
                forecastWeather.maxTemperature = Math.floor(data.daily[i].temp.max - KELVIN);
                maxTemp.insert(i,Math.floor(data.daily[i].temp.max - KELVIN));
                maxFTemp.insert(i,celsiusToFahrenheit(maxTemp[i]));
                forecastWeather.minTemperature = Math.floor(data.daily[i].temp.min - KELVIN);
                minTemp.insert(i,Math.floor(data.daily[i].temp.min - KELVIN));
                minFTemp.insert(i,celsiusToFahrenheit(minTemp[i]));
                forecastWeather.iconId = data.daily[i].weather[0].icon;
                forecastWeather.description = data.daily[i].weather[0].description;

                createElement(i, forecastWeather);
            }
        })
}

// DISPLAY CURRENT WEATHER TO UI
function displayWeather(){
    iconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather.iconId}@2x.png"/>`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = capitalizeFirstLetter(weather.description);
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    dateElement.innerHTML = `<div style="text-align: center;"><span style="color: #293251;font-family: Tahoma, Geneva, sans-serif;">${day.toDateString()}</span>
                            <br /><span style="color: #293251;font-family: Tahoma, Geneva, sans-serif;">${day.toTimeString()}</span></div>`;
}

//FORECAST BUTTON
buttonElement.addEventListener("click", function () {
        if(!buttonStatus){
            getLocation(function(lat_lng){
                getForecastWeather(lat_lng.lat, lat_lng.lng);
            });
            buttonStatus = true;
            document.querySelector('.container').style.height = '930px';
        } else {
            $(".forecast").remove();
            buttonStatus = false;
            document.querySelector('.container').style.height = '400px';
        }
    });

// C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}

// WHEN THE USER CLICKS ON THE TEMPERATURE ELEMENET
tempElement.addEventListener("click", function(){
    if(weather.temperature.value === undefined) return;

    if(weather.temperature.unit == "celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);

        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";

        if(buttonStatus) {

            //Change Data
            document.getElementById(`temp-${0}`).innerHTML
                = `<span style="color: #293251;">${maxFTemp[0]}°<span>F</span><br><span style="color: #f0f0ef;">${minFTemp[0]}°<span>F</span></span></br></span>`;
            document.getElementById(`temp-${1}`).innerHTML
                = `<span style="color: #293251;" >${maxFTemp[1]}°<span>F</span><br><span style="color: #f0f0ef;">${minFTemp[1]}°<span>F</span></span></br></span>`;
            document.getElementById(`temp-${2}`).innerHTML
                = `<span style="color: #293251;">${maxFTemp[2]}°<span>F</span><br><span style="color: #f0f0ef;">${minFTemp[2]}°<span>F</span></span></br></span>`;
        }

    } else {
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius";
        if(buttonStatus) {
            document.getElementById(`temp-${0}`).innerHTML
                = `<span style="color: #293251;">${maxTemp[0]}°<span>C</span><br><span style="color: #2B3F60;">${minTemp[0]}°<span>C</span></span></br></span>`;
            document.getElementById(`temp-${1}`).innerHTML
                = `<span style="color: #293251;">${maxTemp[1]}°<span>C</span><br><span style="color: #2B3F60;">${minTemp[1]}°<span>C</span></span></br></span>`;
            document.getElementById(`temp-${2}`).innerHTML
                = `<span style="color: #293251;">${maxTemp[2]}°<span>C</span><br><span style="color: #2B3F60;">${minTemp[2]}°<span>C</span></span></br></span>`;
        }
    }
});

//CAPITALIZE STRING
function capitalizeFirstLetter(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//CREATE FORECAST ELEMENT
function createElement(a, value) {
    //Date for forecast weather
    var date = new Date();
    date.setDate(date.getDate() + a + 1);
    var day = date.toDateString();

    //Captilize description
    value.description = capitalizeFirstLetter(value.description);

    //Create new div element

    var newElement = document.createElement('div');

    newElement.className = `forecast`;
    newElement.id = `forecast-${a}`;

    newElement.style.cssText = 'position: relative;' +
        'width: 350px;' +
        'height: 150px;'+
        'background-color: #d1d5d9;' +
        'border-radius: 10px;' +
        'left: 50%;' +
        'margin-left: -175.5px';
    if(a == 0){
        newElement.style.top = '20px';
    } else if (a == 1){
        newElement.style.top = '40px';
    } else {
        newElement.style.top = '60px';
    }
    //Check if current unit is C or F
    if (weather.temperature.unit == "celsius") {
        newElement.innerHTML =`<table>`+
            `<p class="p" style = " height: 40px; display: flex; justify-content: center; align-content: center; align-items: center; margin: 0 auto;position: relative
                bottom: 0; top: 10px;
                font-size: 20px; font-family: Tahoma, Geneva, sans-serif;
                color: #293251;">${day}</p>` +
            `<table class="table" style="width: 350px; height: 100px">
                <tr>
                    <th style="width: 100px"><img class="icon" src="http://openweathermap.org/img/wn/${value.iconId}@2x.png"/></th>
                    <th style="width: 150px; font-family: Tahoma, Geneva, sans-serif;
                            font-size: 25px;">
                            <div id = 'temp-${a}'>
                                <span style=" color: #293251;">${maxTemp[a]}°<span>C</span></span>
                                <span style="color: #2B3F60;text-align:start">
                                <br>${minTemp[a]}°<span>C</span></br></span></th> 
                            </div>    
                    <th><p class="des" style="position: relative; text-align: center; font-weight: lighter;
                            font-size: 18px; font-family: Tahoma, Geneva, sans-serif;color: #293251; right:5px">
                                ${value.description}</p></th>
                </tr>
            </table>`+
        `</div>`;


        document.querySelector('.container').append(newElement);
    } else {
        newElement.innerHTML = `<div>`+
            `<p class="p" style = " height: 30px; display: flex; justify-content: center; align-content: center; align-items: center; margin: 0 auto;position: relative
                bottom: 0;
                font-size: 20px; font-family: Tahoma, Geneva, sans-serif;
                color: #293251;">${day}</p>` +
            `<table class="table" style="width: 350px; height: 100px">
                <tr>
                    <th style="width: 100px"><img class="icon" src="http://openweathermap.org/img/wn/${value.iconId}@2x.png"/></th>
                    <th style="width: 150px;
                            font-size: 25px; font-family: Tahoma, Geneva, sans-serif;">
                            <div id = 'temp-${a}'>
                                <span style=" color: #293251;">${maxFTemp[a]}°<span>F</span></span>
                            <span style=" color: #2B3F60; ;text-align:start">
                                <br>${minFTemp[a]}°<span>F</span></br></span></th> 
                             </div>   
                    <th><p class="des" style="position: relative; text-align: center; font-weight: lighter;
                            font-size: 18px; font-family: Tahoma, Geneva, sans-serif;color: #293251;right:5px">${value.description}</p></th>
                </tr>
            </table>`+
            `</div>`;

        document.querySelector('.container').append(newElement);
    }

}

//Insert array
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
