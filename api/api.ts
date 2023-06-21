import axios, { AxiosResponse } from 'axios';
import { apiKey } from '../constants';

interface WeatherForecastResponse {
  cityName: string;
  days: number;
  weatherImage: string; 
  temp_c: number;
  weatherDescription: string;
  windSpeed: number;
  humidity: number;
  sunriseTime: string;
}

interface LocationResponse {
  cityName: string;
  countryName: string;
}

const forecastEndpoint = (cityName: string, days: number): string => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=${days}`;
const locationsEndpoint = (cityName: string): string => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${cityName}`;

const apiCall = async <T>(endpoint: string): Promise<T | null> => {
  const options = {
    method: 'GET',
    url: endpoint,
  };

  try {
    const response: AxiosResponse = await axios.request(options);
    return response.data as T;
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
};

export const fetchWeatherForecast = (cityName: string, days: number): Promise<WeatherForecastResponse | null> => {
  const forecastUrl = forecastEndpoint(cityName, days);
  return apiCall<WeatherForecastResponse>(forecastUrl);
};

export const fetchLocations = (cityName: string): Promise<LocationResponse | null> => {
  const locationsUrl = locationsEndpoint(cityName);
  return apiCall<LocationResponse>(locationsUrl);
};