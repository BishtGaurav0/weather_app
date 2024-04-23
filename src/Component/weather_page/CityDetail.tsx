import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloudSun, faCloud, faCloudShowersHeavy, faBolt, faSnowflake, faSmog } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
}

const weatherIcons = {
  'clear sky': faSun,
  'few clouds': faCloudSun,
  'scattered clouds': faCloud,
  'broken clouds': faCloud,
  'shower rain': faCloudShowersHeavy,
  'rain': faCloudShowersHeavy,
  'thunderstorm': faBolt,
  'snow': faSnowflake,
  'mist': faSmog,
};

const CityDetail: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [units, setUnits] = useState<string>('metric'); // Default units
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);

  const weatherIconKey = weatherData?.description.toLowerCase() as keyof typeof weatherIcons;

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        if (!cityName) {
          throw new Error('City name is undefined');
        }

        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=ee024a3f7dbb8e09b2643441d3e55d84&units=${units}`
        );
        const data = response.data;
        const weatherInfo: WeatherData = {
          temperature: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          pressure: data.main.pressure,
        };
        setWeatherData(weatherInfo);
        setCity({ name: cityName, latitude: data.coord.lat, longitude: data.coord.lon });

      } catch (error) {
        setError('Error fetching weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [cityName, units]);

  useEffect(() => {
    // Load favorite cities from localStorage on component mount
    const savedFavoriteCities = localStorage.getItem('favoriteCities');
    if (savedFavoriteCities) {
      setFavoriteCities(JSON.parse(savedFavoriteCities));
    }
  }, []);

  const handleUnitChange = (selectedUnit: string) => {
    setUnits(selectedUnit);
  };

  const toggleFavorite = () => {
    // Toggle favorite status of the current city
    if (cityName && !favoriteCities.includes(cityName)) {
      const updatedFavoriteCities = [...favoriteCities, cityName];
      setFavoriteCities(updatedFavoriteCities);
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavoriteCities));
    } else if (cityName && favoriteCities.includes(cityName)) {
      const updatedFavoriteCities = favoriteCities.filter(city => city !== cityName);
      setFavoriteCities(updatedFavoriteCities);
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavoriteCities));
    }
  };

  const isFavorite = cityName ? favoriteCities.includes(cityName) : false;

  if (loading) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  if (!weatherData || !city) {
    return <ErrorContainer>No weather data available for {cityName}.</ErrorContainer>;
  }

  return (
    <Container>
      <Title>
        Weather for {city.name}
        <FavoriteButton onClick={toggleFavorite}>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</FavoriteButton>
      </Title>
      <WeatherContainer>
        <WeatherIcon icon={weatherIcons[weatherIconKey]} />
        <WeatherInfo>Temperature: {weatherData.temperature}°{units === 'metric' ? 'C' : 'F'}</WeatherInfo>
        <WeatherInfo>Description: {weatherData.description}</WeatherInfo>
        <WeatherInfo>Humidity: {weatherData.humidity}%</WeatherInfo>
        <WeatherInfo>Wind Speed: {weatherData.windSpeed} {units === 'metric' ? 'm/s' : 'mph'}</WeatherInfo>
        <WeatherInfo>Pressure: {weatherData.pressure} hPa</WeatherInfo>
        <UnitSelector>
          <button onClick={() => handleUnitChange('metric')}>Celsius</button>
          <button onClick={() => handleUnitChange('imperial')}>Fahrenheit</button>
        </UnitSelector>
      </WeatherContainer>
      <Link to="/">Return to homepage</Link>
    </Container>
  );
};

export default CityDetail;

const Container = styled.div`
  padding: 20px;
  background-image: url('/images/city.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh; /* Set height to 100% of the viewport height */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; /* Center content vertically and horizontally */
`;

const Title = styled.h1`
  color: #fff;
`;

const WeatherContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.8); /* Add opacity to make text more readable */
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 768px) {
    /* Adjust styles for larger screens */
    padding: 40px;
  }
`;

const WeatherIcon = styled(FontAwesomeIcon)`
  font-size: 64px;
  margin-right: 20px;

  @media screen and (max-width: 768px) {
    /* Adjust styles for smaller screens */
    font-size: 48px;
  }
`;

const WeatherInfo = styled.p`
  margin: 0;
`;

const LoadingContainer = styled.div`
  color: #fff;
`;

const ErrorContainer = styled.div`
  color: #fff;
`;

const UnitSelector = styled.div`
  margin-top: 20px;

  button {
    margin-right: 10px;
    cursor: pointer;
    background-color: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #40a9ff;
  }
`;

const FavoriteButton = styled.button`
  margin-left: 20px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #40a9ff;
  }
`;
