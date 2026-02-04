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
import { useFonts, DotGothic16_400Regular } from '@expo-google-fonts/dotgothic16';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { Settings, Search, X } from 'lucide-react-native';
import { fetchWeather, reverseGeocode } from './src/api';
import { RealFeelCircle, UVRing, VisibilityCone, HumidityCylinder, SunsetCurve, AQIDotMatrix } from './src/components/NothingWidgets';
import { DotIcon } from './src/components/DotIcons';

const { width } = Dimensions.get('window');

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
        <ActivityIndicator size="large" color="#D71921" />
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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
        {/* Top Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.cityContainer}>
            <Text style={styles.cityName}>{locationName.toUpperCase()}</Text>
            <View style={styles.pagers}>
              <View style={[styles.pagerDot, styles.pagerDotActive]} />
              <View style={styles.pagerDot} />
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
            <Settings size={22} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Current Weather Section (Image 1 Style) */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTemp}>{weather?.current.temp}°</Text>
          <Text style={styles.heroFeelsLike}>FEELS LIKE {weather?.current.feelsLike}°</Text>

          <DotIcon type={weather?.current.description} />

          <Text style={styles.heroCondition}>{weather?.current.description.toUpperCase()}</Text>
        </View>

        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertIcon} />
          <Text style={styles.alertText}>PRECIPITATION EXPECTED LATER TODAY</Text>
          <Text style={styles.alertInfo}>ⓘ</Text>
        </View>

        {/* Circular Stats Grid (Image 1 Bottom) */}
        <View style={styles.circularStatsGrid}>
          <CircularStat label="HI/LO" val={`${weather?.daily.tempMax[0]}°/${weather?.daily.tempMin[0]}°`} />
          <CircularStat label="RAIN" val={`${weather?.hourly.precipitation[0]}%`} />
          <CircularStat label="WIND" val={`${weather?.current.windSpeed}`} sub="KM/H" />
          <CircularStat label="AQI" val="101" sub="POOR" color="#D71921" />
        </View>

        {/* Detailed Dashboard (Image 2 Style) */}
        <View style={styles.detailedGrid}>
          <RealFeelCircle value={weather?.current.feelsLike} sub="REAL FEEL" />
          <DashboardCard title="UV INDEX" val={weather?.current.uvIndex} sub={getUVDesc(weather?.current.uvIndex)} Widget={UVRing} />
          <DashboardCard title="AIR QUALITY" val="28" sub="Fair" Widget={AQIDotMatrix} />
          <DashboardCard title="VISIBILITY" val={`${weather?.current.visibility} KM`} sub="Clear" Widget={VisibilityCone} />
          <DashboardCard title="WIND SPEED" val={`${weather?.current.windSpeed} KM/H`} sub="Storm" Widget={UVRing} />
          <DashboardCard title="HUMIDITY" val={`${weather?.current.humidity}%`} sub="Moderate" Widget={HumidityCylinder} />
          <DashboardCard title="SUNSET" val={formatTime(weather?.daily.sunset[0])} sub={`SET: ${formatTime(weather?.daily.sunset[0])}`} Widget={SunsetCurve} />
          <DashboardCard title="PRESSURE" val={`${weather?.current.pressure}`} sub="HPA" Widget={() => <View style={{ height: 40 }} />} />
        </View>

        {/* Forecast Section */}
        <View style={styles.nothingCard}>
          <Text style={styles.sectionHeader}>24 HOURS FORECAST ›</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
            {weather?.hourly.time.map((time, i) => (
              <View key={i} style={styles.hourlyItem}>
                <Text style={styles.hourText}>{i === 0 ? 'NOW' : new Date(time).getHours() + ' AM'}</Text>
                <Text style={styles.hourIcon}>{weather.hourly.icon[i]}</Text>
                <Text style={styles.hourTemp}>{weather.hourly.temp[i]}°</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.nothingCard}>
          <Text style={styles.sectionHeader}>7 DAYS FORECAST ›</Text>
          {weather?.daily.time.map((time, i) => (
            <View key={i} style={styles.dailyRow}>
              <Text style={styles.dailyDay}>{i === 0 ? 'TODAY' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Text>
              <Text style={styles.dailyIcon}>{weather.daily.icon[i]}</Text>
              <Text style={styles.dailyTemps}>{weather.daily.tempMax[i]}° / {weather.daily.tempMin[i]}°</Text>
            </View>
          ))}
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
              <Text style={styles.settingLabel}>TEMPERATURE UNITS</Text>
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

const CircularStat = ({ label, val, sub, color }) => (
  <View style={styles.circularStatContainer}>
    <View style={[styles.circularBorder, color && { backgroundColor: color, borderColor: color }]}>
      <Text style={[styles.circularVal, color && { color: '#fff' }]}>{val}</Text>
      {sub && <Text style={[styles.circularSub, color && { color: '#fff' }]}>{sub}</Text>}
    </View>
    <Text style={styles.circularLabel}>{label}</Text>
  </View>
);

const DashboardCard = ({ title, val, sub, Widget }) => (
  <View style={styles.dashboardCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardLabel}>{title}</Text>
      <Text style={styles.cardDetail}>{sub}</Text>
    </View>
    <Text style={styles.cardValue}>{val}</Text>
    {Widget && <Widget value={val} />}
  </View>
);

function getUVDesc(val) {
  if (val <= 2) return 'Low';
  if (val <= 5) return 'Normal';
  return 'High';
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
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  cityContainer: {
    alignItems: 'center',
  },
  cityName: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 2,
  },
  pagers: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  pagerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
  pagerDotActive: {
    backgroundColor: '#D71921',
  },
  iconBtn: {
    padding: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  heroTemp: {
    fontSize: 110,
    color: '#fff',
    fontFamily: 'Nothing-Dot',
    lineHeight: 120,
  },
  heroFeelsLike: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 1,
    marginTop: -5,
  },
  heroCondition: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Nothing-Mono',
    letterSpacing: 3,
    marginTop: 10,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#111',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  alertIcon: {
    width: 4,
    height: 12,
    backgroundColor: '#D71921',
    marginRight: 10,
  },
  alertText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Nothing-Mono',
    flex: 1,
  },
  alertInfo: {
    color: '#666',
    fontSize: 12,
  },
  circularStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  circularStatContainer: {
    alignItems: 'center',
  },
  circularBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  circularVal: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Nothing-Dot',
  },
  circularSub: {
    fontSize: 7,
    color: '#888',
    fontFamily: 'Nothing-Mono',
    marginTop: 2,
  },
  circularLabel: {
    fontSize: 8,
    color: '#666',
    fontFamily: 'Nothing-Mono',
  },
  detailedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  dashboardCard: {
    width: (width - 45) / 2,
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    marginBottom: 15,
    minHeight: 160,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardLabel: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Nothing-Mono',
  },
  cardDetail: {
    color: '#AAA',
    fontSize: 9,
    fontFamily: 'Nothing-Mono',
    marginTop: 2,
  },
  cardValue: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Nothing-Dot',
    marginTop: 5,
  },
  nothingCard: {
    marginHorizontal: 15,
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 24,
    marginBottom: 15,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Nothing-Mono',
    letterSpacing: 1,
    marginBottom: 30,
  },
  forecastScroll: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 35,
  },
  hourText: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Nothing-Mono',
    marginBottom: 15,
  },
  hourIcon: {
    fontSize: 20,
    marginBottom: 15,
  },
  hourTemp: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nothing-Dot',
  },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  dailyDay: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Nothing-Mono',
    width: 60,
  },
  dailyIcon: {
    fontSize: 18,
  },
  dailyTemps: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nothing-Dot',
    width: 80,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: '#121212',
    borderRadius: 24,
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
    fontSize: 18,
    fontFamily: 'Nothing-Dot',
  },
  settingItem: {
    marginBottom: 40,
  },
  settingLabel: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Nothing-Mono',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 4,
    borderRadius: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#333',
  },
  toggleText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Nothing-Dot',
  },
  toggleTextActive: {
    color: '#fff',
  },
  doneBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Nothing-Mono',
    fontWeight: 'bold',
  }
});
