import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Wind, Droplets, Sun, Eye, Gauge, Thermometer, X } from 'lucide-react-native';
import { fetchWeather, reverseGeocode } from './src/api';

const { width } = Dimensions.get('window');

const THEMES = {
  'Clear sky': ['#4facfe', '#00f2fe'],
  'Mainly clear': ['#4facfe', '#00f2fe'],
  'Partly cloudy': ['#606c88', '#3f4c6b'],
  'Overcast': ['#606c88', '#3f4c6b'],
  'Rain': ['#667eea', '#764ba2'],
  'Drizzle': ['#667eea', '#764ba2'],
  'Thunderstorm': ['#1e3c72', '#2a5298'],
  'Night': ['#1e3c72', '#2a5298'],
};

export default function App() {
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

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const currentTheme = THEMES[weather?.current.description] || THEMES['Overcast'];
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;
  const finalTheme = (isNight && weather?.current.description === 'Clear sky') ? THEMES['Night'] : currentTheme;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={finalTheme} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <SafeAreaView style={styles.header}>
          <View>
            <Text style={styles.cityName}>{locationName}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
            <Settings size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.currentSection}>
          <View style={styles.tempContainer}>
            <Text style={styles.mainTemp}>{weather?.current.temp}</Text>
            <Text style={styles.unitSym}>°</Text>
          </View>
          <Text style={styles.weatherDesc}>{weather?.current.icon} {weather?.current.description}</Text>
          <Text style={styles.highLow}>
            H:{weather?.daily.tempMax[0]}°  L:{weather?.daily.tempMin[0]}°
          </Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>HOURLY FORECAST</Text>
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

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>7-DAY FORECAST</Text>
          {weather?.daily.time.map((time, i) => (
            <View key={i} style={styles.dailyItem}>
              <Text style={styles.dailyDay}>{i === 0 ? 'Today' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={styles.dailyIcon}>{weather.daily.icon[i]}</Text>
              <View style={styles.dailyTempRange}>
                <Text style={styles.dailyTempMax}>{weather.daily.tempMax[i]}°</Text>
                <Text style={styles.dailyTempMin}>{weather.daily.tempMin[i]}°</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          <DetailTile label="UV INDEX" value={weather?.current.uvIndex} sub={getUVDesc(weather?.current.uvIndex)} Icon={Sun} />
          <DetailTile label="SUNRISE" value={formatTime(weather?.daily.sunrise[0])} sub={`Sunset: ${formatTime(weather?.daily.sunset[0])}`} Icon={Sun} />
          <DetailTile label="WIND" value={`${weather?.current.windSpeed}`} sub="km/h" Icon={Wind} />
          <DetailTile label="FEELS LIKE" value={`${weather?.current.feelsLike}°`} sub={`Actual: ${weather?.current.temp}°`} Icon={Thermometer} />
          <DetailTile label="HUMIDITY" value={`${weather?.current.humidity}%`} sub="Dew point: --" Icon={Droplets} />
          <DetailTile label="VISIBILITY" value={`${weather?.current.visibility} km`} sub="Clear view" Icon={Eye} />
          <DetailTile label="PRESSURE" value={`${weather?.current.pressure}`} sub="hPa" Icon={Gauge} />
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Units</Text>
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
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailTile({ label, value, sub, Icon }) {
  return (
    <View style={[styles.glassCard, styles.tile]}>
      <View style={styles.tileHeader}>
        <Icon size={12} color="rgba(255,255,255,0.6)" />
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </View>
  );
}

function getUVDesc(val) {
  if (val <= 2) return 'Low';
  if (val <= 5) return 'Moderate';
  return 'High';
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
    marginBottom: 20,
    marginTop: 10,
  },
  cityName: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '400',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainTemp: {
    fontSize: 90,
    color: '#fff',
    fontWeight: '200',
  },
  unitSym: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '300',
    marginTop: 15,
  },
  weatherDesc: {
    fontSize: 22,
    color: '#fff',
    marginTop: -10,
  },
  highLow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    marginTop: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginBottom: 15,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 25,
    minWidth: 40,
  },
  hourlyTime: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  hourlyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dailyDay: {
    color: '#fff',
    fontSize: 17,
    width: 60,
  },
  dailyIcon: {
    fontSize: 22,
  },
  dailyTempRange: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'flex-end',
  },
  dailyTempMax: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    marginRight: 15,
  },
  dailyTempMin: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 17,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: (width - 55) / 2,
    aspectRatio: 1.3,
    marginBottom: 15,
    padding: 12,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tileLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  tileValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '400',
    marginVertical: 4,
  },
  tileSub: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 17,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#636366',
  },
  toggleText: {
    color: '#8e8e93',
    fontSize: 15,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
  },
  doneBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  }
});
