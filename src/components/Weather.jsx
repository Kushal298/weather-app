import React, { useCallback, useRef, useState } from 'react'
import './Weather.css'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10.5 3a7.5 7.5 0 1 0 4.6 13.4l4.4 4.4a1 1 0 0 0 1.4-1.4l-4.4-4.4A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11Z" />
    </svg>
  )
}

function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13Zm0 18a5 5 0 0 1-5-5c0-2.4 2.8-6.7 5-9.4c2.2 2.7 5 7 5 9.4a5 5 0 0 1-5 5Z" />
    </svg>
  )
}

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9h11a2 2 0 1 0-2-2a1 1 0 0 0 2 0a4 4 0 1 1-4 4H4a1 1 0 0 0 0-2Zm0 6h14a2 2 0 1 1-2 2a1 1 0 1 0 2 0a4 4 0 1 0-4-4H4a1 1 0 1 0 0 2Zm0-3h16a2 2 0 1 0-2-2a1 1 0 1 0 2 0a4 4 0 1 1-4 4H4a1 1 0 1 0 0 2Z" />
    </svg>
  )
}

const WEATHER_EMOJI_BY_CODE = {
  '01d': '☀️',
  '01n': '🌙',
  '02d': '🌤️',
  '02n': '☁️',
  '03d': '☁️',
  '03n': '☁️',
  '04d': '☁️',
  '04n': '☁️',
  '09d': '🌧️',
  '09n': '🌧️',
  '10d': '🌦️',
  '10n': '🌧️',
  '11d': '⛈️',
  '11n': '⛈️',
  '13d': '❄️',
  '13n': '❄️',
  '50d': '🌫️',
  '50n': '🌫️',
}

const Weather = () => {
  const [city, setCity] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [error, setError] = useState('')

  const abortControllerRef = useRef(null)

  const handleSearch = useCallback(async () => {
    const trimmedCity = city.trim()
    if (!trimmedCity) {
      setError('Enter city name')
      return
    }

    setError('')

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        trimmedCity
      )}&units=metric&appid=${import.meta.env.VITE_APP_ID}`

      const response = await fetch(url, { signal: controller.signal })
      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || 'Failed to fetch weather')
        return
      }

      const iconCode = data?.weather?.[0]?.icon
      const icon = WEATHER_EMOJI_BY_CODE[iconCode] ?? '🌦️'

      const humidity = Math.round(data?.main?.humidity ?? 0)
      const temperature = Math.round(data?.main?.temp ?? 0)
      const windSpeedKmh = Math.round((data?.wind?.speed ?? 0) * 3.6) // API returns m/s
      const location = data?.sys?.country
        ? `${data.name}, ${data.sys.country}`
        : data?.name || trimmedCity

      setWeatherData({
        humidity,
        windSpeed: windSpeedKmh,
        temperature,
        location,
        icon,
      })
    } catch (err) {
      if (err?.name === 'AbortError') return
      setWeatherData(null)
      setError('Network error. Please try again.')
      console.error('Error fetching weather:', err)
    }
  }, [city])

  return (
    <div className='weather'>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city"
          aria-label="City name"
        />
        <button type="submit" className="search-btn" aria-label="Search weather">
          <SearchIcon />
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {weatherData ? (
        <>
          <div className="weather-main">
            <div className="weather-emoji" aria-hidden="true">
              {weatherData.icon}
            </div>
            <p className="temperature">{weatherData.temperature}°C</p>
            <p className="location">{weatherData.location}</p>
          </div>

          <div className="weather-data">
            <div className="col">
              <DropletIcon />
              <div>
                <p className="metric-value">{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>

            <div className="col">
              <WindIcon />
              <div>
                <p className="metric-value">{weatherData.windSpeed} Km/h</p>
                <span>Wind speed</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Weather
