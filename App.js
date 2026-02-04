import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useFonts, DotGothic16_400Regular } from '@expo-google-fonts/dotgothic16';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { Settings, Wind, Droplets, Sun, Eye, Gauge, Thermometer, X, Cloud, CloudRain, CloudLightning, SunDim } from 'lucide-react-native';
import { fetchWeather, reverseGeocode } from './src/api';

const { width } = Dimensions.get('window');

const ICON_MAP = {
  'Clear sky': Sun,
  'Mainly clear': SunDim,
  'Partly cloudy': Cloud,
  'Overcast': Cloud,
  'Rain': CloudRain,
  'Drizzle': CloudRain,
  'Thunderstorm': CloudLightning,
  'Night': Sun, // Should be Moon but Lucide Moon is fine
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Nothing-Dot': DotGothic16_400Regular,
    'Nothing-Mono': VT323_400Regular,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('Loading...');
  const [unit, setUnit] = useState('celsius');
  const [showSettings, setShowSettings] = useState(false);

  const loadData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Permission Denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [weatherData, cityName] = await Promise.all([
        fetchWeather(latitude, longitude, unit),
        reverseGeocode(latitude, longitude)
      ]);

      setWeather(weatherData);
      setLocationName(cityName);
    } catch (error) {
      console.error(error);
      setLocationName('Error Loading');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [unit]);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const WeatherIcon = ICON_MAP[weather?.current.description] || Cloud;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D71921" />
        }
      >
        <SafeAreaView style={styles.header}>
          <View>
            <Text style={styles.cityName}>{locationName.toUpperCase()}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
            <Settings size={20} color="#fff" strokeWidth={1} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.currentSection}>
          <Text style={styles.mainTemp}>{weather?.current.temp}°</Text>
          <Text style={styles.weatherDesc}>{weather?.current.description.toUpperCase()}</Text>
          <View style={styles.dotLine} />
          <Text style={styles.highLow}>
            MAX {weather?.daily.tempMax[0]}° / MIN {weather?.daily.tempMin[0]}°
          </Text>
        </View>

        <View style={styles.nothingCard}>
          <Text style={styles.cardTitle}>24-HOUR FORECAST</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weather?.hourly.time.map((time, i) => (
              <View key={i} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{new Date(time).getHours()}:00</Text>
                <Text style={styles.hourlyIcon}>{weather.hourly.icon[i]}</Text>
                <Text style={styles.hourlyTemp}>{weather.hourly.temp[i]}°</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.nothingCard}>
          <Text style={styles.cardTitle}>7-DAY FORECAST</Text>
          {weather?.daily.time.map((time, i) => (
            <View key={i} style={styles.dailyItem}>
              <Text style={styles.dailyDay}>{i === 0 ? 'TODAY' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Text>
              <Text style={styles.dailyIcon}>{weather.daily.icon[i]}</Text>
              <View style={styles.dailyTempRange}>
                <Text style={styles.dailyTempText}>{weather.daily.tempMax[i]}° / {weather.daily.tempMin[i]}°</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          <DetailTile label="UV INDEX" value={weather?.current.uvIndex} sub={getUVDesc(weather?.current.uvIndex)} Icon={Sun} />
          <DetailTile label="SUNRISE" value={formatTime(weather?.daily.sunrise[0])} sub={`SET: ${formatTime(weather?.daily.sunset[0])}`} Icon={Sun} />
          <DetailTile label="WIND" value={`${weather?.current.windSpeed}`} sub="KM/H" Icon={Wind} />
          <DetailTile label="FEELS LIKE" value={`${weather?.current.feelsLike}°`} sub={`REAL: ${weather?.current.temp}°`} Icon={Thermometer} />
          <DetailTile label="HUMIDITY" value={`${weather?.current.humidity}%`} sub="WATER" Icon={Droplets} />
          <DetailTile label="VISIBILITY" value={`${weather?.current.visibility} KM`} sub="CLEAR" Icon={Eye} />
          <DetailTile label="PRESSURE" value={`${weather?.current.pressure}`} sub="HPA" Icon={Gauge} />
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SETTINGS</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X color="#fff" size={24} strokeWidth={1} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>UNITS</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, unit === 'celsius' && styles.toggleBtnActive]}
                  onPress={() => setUnit('celsius')}
                >
                  <Text style={[styles.toggleText, unit === 'celsius' && styles.toggleTextActive]}>°C</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, unit === 'fahrenheit' && styles.toggleBtnActive]}
                  onPress={() => setUnit('fahrenheit')}
                >
                  <Text style={[styles.toggleText, unit === 'fahrenheit' && styles.toggleTextActive]}>°F</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowSettings(false)}>
              <Text style={styles.doneBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailTile({ label, value, sub, Icon }) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileHeader}>
        <Icon size={12} color="#D71921" strokeWidth={1.5} />
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileSub}>{sub.toUpperCase()}</Text>
    </View>
  );
}

function getUVDesc(val) {
  if (val <= 2) return 'LOW';
  if (val <= 5) return 'MID';
  return 'HIGH';
}

function formatTime(iso) {
  const date = new Date(iso);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 10,
  },
  cityName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Nothing-Dot',
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 2,
    marginTop: 4,
  },
  settingsBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  currentSection: {
    alignItems: 'flex-start',
    marginBottom: 50,
    paddingLeft: 5,
  },
  mainTemp: {
    fontSize: 120,
    color: '#fff',
    fontFamily: 'Nothing-Dot',
    lineHeight: 130,
  },
  weatherDesc: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 3,
    marginTop: -10,
  },
  dotLine: {
    height: 1,
    width: 60,
    backgroundColor: '#D71921',
    marginVertical: 15,
  },
  highLow: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 1,
  },
  nothingCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#000',
  },
  cardTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 1,
    marginBottom: 20,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 30,
    minWidth: 45,
  },
  hourlyTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Nothing-Mono',
    marginBottom: 10,
  },
  hourlyIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nothing-Mono',
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dailyDay: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nothing-Mono',
    width: 70,
  },
  dailyIcon: {
    fontSize: 20,
  },
  dailyTempRange: {
    width: 100,
    alignItems: 'flex-end',
  },
  dailyTempText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nothing-Mono',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: (width - 55) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    aspectRatio: 1.2,
    marginBottom: 15,
    padding: 15,
    justifyContent: 'space-between',
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tileLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: 'Nothing-Mono',
    letterSpacing: 1,
  },
  tileValue: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Nothing-Dot',
    marginVertical: 4,
  },
  tileSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontFamily: 'Nothing-Mono',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#000',
    padding: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Nothing-Dot',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nothing-Mono',
    letterSpacing: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#D71921',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontFamily: 'Nothing-Mono',
  },
  toggleTextActive: {
    color: '#fff',
  },
  doneBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 15,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nothing-Mono',
    letterSpacing: 3,
  }
});
