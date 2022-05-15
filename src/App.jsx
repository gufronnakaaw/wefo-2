import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTemperatureHigh,
    faTemperatureLow,
    faSearch,
    faWind,
    faMountainSun,
    faEye,
    faSun,
    faDroplet,
    faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
    // state section
    const [weather, setWeather] = useState(null);
    const [city, setCity] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [daily, setDaily] = useState(null);

    const API_KEY = import.meta.env.VITE_API_KEY;

    // change background color
    document.body.style.background = "var(--navy)";

    // on first render
    useEffect(function () {
        getCurrentWeather();
    }, []);

    // function section
    // get current weather
    async function getCurrentWeather() {
        // get city on local storage
        const cityName = !getLocalStorage("city")
            ? "jakarta"
            : getLocalStorage("city");

        // do loading
        setLoading(true);

        // do request
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}&lang=id`
        )
            .finally(() => setLoading(false))
            .then((response) => response.json());

        if (currentResponse.cod !== 200) {
            return setError(currentResponse.message);
        }

        // do request
        const dailyResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${currentResponse.coord.lat}&lon=${currentResponse.coord.lon}&exclude=minutely,hourly&units=metric&appid=${API_KEY}&lang=id`
        ).then((response) => response.json());

        // set state
        setWeather(currentResponse);
        setTimeout(() => setDaily(dailyResponse), 1000);
    }

    // search city
    async function searchCity() {
        // check empty
        if (city === "") {
            return setError("Cannot be empty");
        }

        // remove text in input and remove error
        setError(null);

        // do loading
        setLoading(true);

        // add to localstorage
        setLocalStorage("city", city);

        // do request
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=id`
        )
            .finally(() => setLoading(false))
            .then((response) => response.json());

        if (currentResponse.cod !== 200) {
            return setError(currentResponse.message);
        }

        // do loading
        setDaily(null);

        // do request
        const dailyResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${currentResponse.coord.lat}&lon=${currentResponse.coord.lon}&exclude=minutely,hourly&units=metric&appid=${API_KEY}&lang=id`
        ).then((response) => response.json());

        // set state
        setWeather(currentResponse);
        setDaily(dailyResponse);
        setCity("");
    }

    // handle input search
    function handleKeyUp(e) {
        if (e.key === "Enter") {
            // check empty
            if (city === "") {
                return setError("Cannot be empty");
            }

            // remove text in input and remove error
            setError(null);

            // do search city
            searchCity();
        }
    }

    // convert time
    function convertTime(ms) {
        const time = new Date(ms);
        const hour = time.getHours();
        const minutes = time.getMinutes();

        return `${hour < 10 ? `0${hour}` : hour}:${
            minutes < 10 ? `0${minutes}` : minutes
        }`;
    }

    // convert date
    function convertDate(ms) {
        const daysName = ["Sun", "Mon", "Teu", "Wed", "Thu", "Fri", "Sat"];
        const monthsName = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const time = new Date(ms);
        const day = daysName[time.getDay()];
        const month = monthsName[time.getMonth()];
        const date = time.getDate();

        return `${day}, ${date} ${month}`;
    }

    // set local storage with expiry
    function setLocalStorage(key, value) {
        const now = new Date();
        const ttl = 500000; // 8 minutes

        const item = {
            value,
            expiry: now.getTime() + ttl,
        };

        localStorage.setItem(key, JSON.stringify(item));
    }

    // get local storage
    function getLocalStorage(key) {
        const itemStr = localStorage.getItem(key);

        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return;
        }

        return item.value;
    }

    // check weather
    if (!weather) return null;

    const sunrise = convertTime(weather.sys.sunrise * 1000);
    const sunset = convertTime(weather.sys.sunset * 1000);
    const name = weather.name;
    const feels_like = Math.round(weather.main.feels_like);
    const temp = Math.round(weather.main.temp);
    const temp_min = Math.round(weather.main.temp_min);
    const temp_max = Math.round(weather.main.temp_max);
    const icon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    const description = weather.weather[0].description;
    const country = weather.sys.country;
    const humidity = weather.main.humidity;
    const pressure = weather.main.pressure;
    const visibility = Math.round(weather.visibility / 1000);
    const wind = Math.round(weather.wind.speed);

    return (
        <>
            <div
                className="loader"
                style={loading ? { display: "block" } : { display: "none" }}
            ></div>

            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-12">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className={`form-control ${
                                    error ? "is-invalid" : ""
                                }`}
                                placeholder="Search for a city..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                onKeyUp={handleKeyUp}
                            />
                            <div className="input-group-append">
                                <button
                                    className="btn btn-search"
                                    type="button"
                                    onClick={searchCity}
                                >
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        color="white"
                                    />
                                </button>
                            </div>
                            <div className="invalid-feedback">
                                {error ? error : ""}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-7">
                        <div className="current-weather-container py-4">
                            <div className="current-city">
                                {name}
                                <sup>{country}</sup>
                            </div>
                            <div className="current-temp">
                                <p>{temp}&#176;C</p>
                            </div>
                            <div className="current-feels-like">
                                <p>Feels like {feels_like}&#176;C</p>
                            </div>
                            <div className="current-weather-icon">
                                <img src={icon} alt={`icon ${description}`} />
                            </div>
                            <div className="current-description">
                                <p>{description}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="col-12 text-center mb-3">
                            <h5 className="text-white text-daily">
                                Daily Weather
                            </h5>
                        </div>
                        <div className="daily-weather-container">
                            {!daily ? (
                                <div
                                    style={{
                                        color: "var(--grey)",
                                        textAlign: "center",
                                    }}
                                >
                                    <p>loading...</p>
                                </div>
                            ) : (
                                <>
                                    {daily.daily.map((obj, index) => {
                                        return (
                                            <div
                                                className="daily-weather-item"
                                                key={index}
                                            >
                                                <div className="col-md-4">
                                                    {convertDate(obj.dt * 1000)}
                                                </div>
                                                <div className="col-md-4">
                                                    <img
                                                        src={`http://openweathermap.org/img/wn/${obj.weather[0].icon}.png`}
                                                        alt={`icon ${obj.weather[0].description}`}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    {`${Math.round(
                                                        obj.temp.min
                                                    )}~${Math.round(
                                                        obj.temp.max
                                                    )}`}
                                                    &#176;C
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="row mt-5"
                    style={{ color: "var(--white)", textAlign: "center" }}
                >
                    <div className="col-md-6 container-one">
                        <div className="row">
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Sunrise</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {
                                            <FontAwesomeIcon
                                                icon={faMountainSun}
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">{sunrise}</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Sunset</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {<FontAwesomeIcon icon={faSun} />}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">{sunset}</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Wind</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {<FontAwesomeIcon icon={faWind} />}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">{wind} km/h</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Temp Min</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {
                                            <FontAwesomeIcon
                                                icon={faTemperatureLow}
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {temp_min}&#176;C
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 container-two">
                        <div className="row">
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Temp Max</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {
                                            <FontAwesomeIcon
                                                icon={faTemperatureHigh}
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {temp_max}&#176;C
                                    </div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Humidity</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {<FontAwesomeIcon icon={faDroplet} />}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {humidity} %
                                    </div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Visibility</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {<FontAwesomeIcon icon={faEye} />}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {visibility} km
                                    </div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="row">
                                    <div className="col-md-12">Pressure</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {<FontAwesomeIcon icon={faGaugeHigh} />}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {pressure} hPa
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
