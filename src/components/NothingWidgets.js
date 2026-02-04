import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Large White Circle for RealFeel
export const RealFeelCircle = ({ value }) => (
    <View style={styles.realFeelContainer}>
        <View style={styles.whiteCircle}>
            <Text style={styles.realFeelLabel}>REAL FEEL</Text>
            <Text style={styles.realFeelValue}>{value}°</Text>
        </View>
    </View>
);

// UV Ring Chart
export const UVRing = () => (
    <View style={styles.widgetSubContainer}>
        <Svg height="40" width="80" viewBox="0 0 80 40">
            <Path d="M10 35 Q 40 5 70 35" fill="none" stroke="#222" strokeWidth="3" />
            <Path d="M10 35 Q 40 5 70 35" fill="none" stroke="#AAA" strokeWidth="3" strokeDasharray="1, 6" />
            <Circle cx="40" cy="20" r="3" fill="#D71921" />
        </Svg>
    </View>
);

// Visibility Cone
export const VisibilityCone = () => (
    <View style={styles.widgetSubContainer}>
        <Svg height="40" width="80" viewBox="0 0 80 40">
            <Path d="M10 20 L 70 5 L 70 35 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            <Path d="M25 17 L 25 23" stroke="#444" strokeWidth="1" />
            <Path d="M40 14 L 40 26" stroke="#444" strokeWidth="1" />
            <Path d="M55 10 L 55 30" stroke="#444" strokeWidth="1" />
            <Path d="M10 20 L 40 13" stroke="#D71921" strokeWidth="1" />
        </Svg>
    </View>
);

// Humidity Cylinder
export const HumidityCylinder = () => (
    <View style={styles.widgetSubContainer}>
        <Svg height="40" width="40" viewBox="0 0 40 40">
            <Ellipse cx="20" cy="10" rx="10" ry="4" stroke="#FFFFFF" fill="none" />
            <Path d="M10 10 L 10 30 Q 20 38 30 30 L 30 10" stroke="#FFFFFF" fill="none" />
            <Ellipse cx="20" cy="30" rx="10" ry="4" stroke="#FFFFFF" fill="none" />
            <Rect x="10" y="22" width="20" height="8" fill="rgba(255,255,255,0.2)" />
        </Svg>
    </View>
);

// Sunset/Sunrise Curve
export const SunsetCurve = () => (
    <View style={styles.widgetSubContainer}>
        <Svg height="40" width="100" viewBox="0 0 100 40">
            <Path d="M10 35 Q 50 5 90 35" fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M5 35 L 95 35" stroke="#222" strokeWidth="1" />
            <Circle cx="35" cy="15" r="3" fill="#D71921" />
        </Svg>
    </View>
);

// Air Quality Dot Matrix
export const AQIDotMatrix = () => (
    <View style={styles.widgetSubContainer}>
        <Svg height="30" width="80" viewBox="0 0 80 30">
            {Array.from({ length: 3 }).map((_, r) =>
                Array.from({ length: 10 }).map((_, c) => (
                    <Circle key={`${r}-${c}`} cx={10 + c * 6} cy={10 + r * 6} r="1.2" fill={c < 4 ? "#FFF" : "#222"} />
                ))
            )}
        </Svg>
    </View>
);

const styles = StyleSheet.create({
    realFeelContainer: {
        width: (width - 45) / 2, // Match card width exactly
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    whiteCircle: {
        width: '95%',
        height: '95%',
        backgroundColor: '#FFFFFF',
        borderRadius: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    realFeelLabel: {
        fontSize: 8,
        fontFamily: 'Nothing-Mono',
        color: '#000',
        marginBottom: 8,
    },
    realFeelValue: {
        fontSize: 40, // Increased size
        fontFamily: 'Nothing-Dot',
        color: '#000',
    },
    widgetSubContainer: {
        height: 50, // Reduced height to prevent stretching
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    }
});
