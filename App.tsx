import { StatusBar } from 'expo-status-bar';
import { Image, View, SafeAreaView, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { theme } from './theme';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from "lodash"
import { fetchLocations, fetchWeatherForecast } from './api/api';
import { weatherImages } from './constants';
import { MagnifyingGlassIcon, CalendarDaysIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import * as Progress from 'react-native-progress'

interface ForecastDay {
  date: string | number | Date;
  day: any;
  astro: {
    sunrise: string;
  };
}

interface WeatherForecast {
  forecastday: ForecastDay[];
}

interface WeatherData {
  temp_c: number;
  wind_kph: number;
  humidity: number;
  condition: {
    text: string;
  };
};

interface WeatherForecastResponse {
  cityName: string;
  days: number;
  weatherImage: string;
  weatherDescription: string;
  windSpeed: number;
  humidity: number;
  sunriseTime: string;
  current?: WeatherData;
  forecast?: WeatherForecast;
}

type LocationResponse = {
  name: string;
  country: string;
};


export default function App() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Prague');
  const [selectedCountry, setSelectedCountry] = useState<string>('Czech Republic');
  const [currentWeather, setCurrentWeather] = useState<WeatherForecastResponse | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeatherForecast(selectedCity, 7)
      .then(data => {
        if (data !== null) {
          setCurrentWeather(data);
          setLoading(false)
        }
      });
  }, []);

  const handleLocation = (loc: LocationResponse) => {
    setLoading(true)
    fetchWeatherForecast(loc.name, 7)
      .then(data => {
        if (data !== null) {
          setLoading(false)
          setCurrentWeather(data);
          setSelectedCity(loc.name);
          setSelectedCountry(loc.country)
        }
      });
    setLocations([]);
    toggleSearch(false);
  };

  const handleSearch = (value: string) => {
    if (value.length > 2) {
      fetchLocations(value)
        .then(data => {
          // console.log("got locations: ", data);
          setLocations(Array.isArray(data) ? data : [data]);
        });
    }
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  return (

    <View className='flex-1 relative'>
      <StatusBar style='light' />
      <Image blurRadius={70} source={require("./assets/images/bg.png")} className="absolute h-full w-full" />
      {
        loading ? (
          <View className='flex-1 flex-row justify-center items-center'>
            <Progress.CircleSnail thickness={10} size={140} color="white" />
          </View>
        ) : (
          <SafeAreaView className='flex flex-1'>

            {/* search section */}
            <View style={{ height: "7%" }} className='mx-4 relative z-50'>
              <View className='flex-row justify-end items-center rounded-full' style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent" }}>
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city"
                    placeholderTextColor={"lightgray"}
                    className='pl-6 h-10 flex-1 text-base text-white'
                  />
                ) : null}
                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={{ backgroundColor: theme.bgWhite(0.3) }}
                  className='rounded-full p-3 m-1'
                >
                  <MagnifyingGlassIcon size={25} color="white" />
                </TouchableOpacity>
              </View>
              {locations.length > 0 && showSearch ? (
                <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                  {locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder ? `border-b-2 border-b-gray-400` : "";
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={'flex-row items-center border-0 p-3 px-4 mb-1' + borderClass}
                      >
                        <MapPinIcon size="20" color="gray" />
                        <Text className='text-black text-lg ml-2'>{`${loc.name}, ${loc.country}`}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ) : null}
            </View>

            {/* Forecast section */}
            <View className='mx-4 flex justify-around flex-1 mb-2'>

              {/* location */}
              <Text className='text-white text-center text-2xl font-bold'>
                {selectedCity ? `${selectedCity}, ` : ''}
                <Text className='text-lg font-semibold text-gray-300'>
                  {selectedCountry ? `${selectedCountry}` : ``}
                </Text>
              </Text>

              {/* weather image */}
              <View className='flex-row justify-center'>
                <Image source={weatherImages[currentWeather?.current?.condition.text]}
                  className="w-52 h-52"
                />
              </View>

              {/* degree celcius */}
              <View className='space-y-2'>
                <Text className='text-center font-bold text-white text-6xl ml-5'>
                  {currentWeather?.current?.temp_c ?? ''}&#176;
                </Text>
                <Text className='text-center text-white text-xl tracking-widest'>
                  {currentWeather?.current?.condition.text ?? ''}
                </Text>
              </View>

              {/* other stats */}
              <View className='flex-row justify-between mx-4'>
                <View className='flex-row space-x-2 items-center'>
                  <Image source={require("./assets/icons/wind.png")} className="w-6 h-6" />
                  <Text className='text-white font-semibold text-base'>
                    {currentWeather?.current?.wind_kph ?? ""} km/h
                  </Text>
                </View>
                <View className='flex-row space-x-2 items-center'>
                  <Image source={require("./assets/icons/drop.png")} className="w-6 h-6" />
                  <Text className='text-white font-semibold text-base'>
                    {currentWeather?.current?.humidity ?? ""} %
                  </Text>
                </View>
                <View className='flex-row space-x-2 items-center'>
                  <Image source={require("./assets/icons/sun.png")} className="w-6 h-6" />
                  <Text className='text-white font-semibold text-base'>
                    {currentWeather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>

            {/* forecast for next days */}
            <View className='mb-2 space-y-3'>
              <View className='flex-row items-center mx-5 space-x-2'>
                <CalendarDaysIcon size="22" color="white" />
                <Text className='text-white text-base'>
                  Daily forecast
                </Text>
              </View>

              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {
                  currentWeather?.forecast?.forecastday?.map((item, index) => {
                    let date = new Date(item.date);
                    let options: Intl.DateTimeFormatOptions = { weekday: 'long' };
                    let dayName = date.toLocaleDateString(`en-US`, options);
                    dayName = dayName.split(",")[0]

                    return (
                      <View
                        key={index}
                        className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4'
                        style={{ backgroundColor: theme.bgWhite(0.15) }}
                      >
                        <Image source={weatherImages[item?.day?.condition?.text]}
                          className="w-11 h-11" />
                        <Text className='text-white'>{dayName}</Text>
                        <Text className='text-white text-xl font-semibold'>
                          {item?.day?.avgtemp_c}&#176;
                        </Text>
                      </View>
                    )
                  }) 
                }
              </ScrollView>
            </View>
          </SafeAreaView >
        )
      }
    </View >
  );
}


