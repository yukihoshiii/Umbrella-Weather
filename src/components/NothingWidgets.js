import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Large White Circle for RealFeel
export const RealFeelCircle = ({ value, sub }) => (
    <View style={styles.realFeelContainer}>
        <View style={styles.whiteCircle}>
            <Text style={styles.realFeelLabel}>REAL FEEL</Text>
            <Text style={styles.realFeelValue}>{value}°</Text>
        </View>
    </View>
);

// UV Ring Chart
export const UVRing = ({ value }) => {
    const rotation = (value / 11) * 180 - 90; // Approximation
    return (
        <View style={styles.widgetSubContainer}>
            <Svg height="60" width="80" viewBox="0 0 80 60">
                <Path d="M10 50 Q 40 10 70 50" fill="none" stroke="#222" strokeWidth="4" />
                <Path d="M10 50 Q 40 10 70 50" fill="none" stroke="#AAA" strokeWidth="4" strokeDasharray="1, 8" />
                {/* Simplified indicator */}
                <Circle cx="40" cy="30" r="3" fill="#D71921" />
            </Svg>
        </View>
    );
};

// Visibility Cone
export const VisibilityCone = ({ value }) => (
    <View style={styles.widgetSubContainer}>
        <Svg height="60" width="80" viewBox="0 0 80 60">
            <Path d="M10 30 L 70 10 L 70 50 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            <Path d="M20 27 L 20 33" stroke="#AAA" strokeWidth="1" />
            <Path d="M35 23 L 35 37" stroke="#AAA" strokeWidth="1" />
            <Path d="M50 18 L 50 42" stroke="#AAA" strokeWidth="1" />
            <Path d="M65 13 L 65 47" stroke="#AAA" strokeWidth="1" />
            <Path d="M10 30 L 40 20" stroke="#D71921" strokeWidth="1" />
        </Svg>
    </View>
);

// Humidity Cylinder
export const HumidityCylinder = ({ value }) => (
    <View style={styles.widgetSubContainer}>
        <Svg height="60" width="50" viewBox="0 0 50 60">
            <Ellipse cx="25" cy="15" rx="15" ry="5" stroke="#FFFFFF" fill="none" />
            <Path d="M10 15 L 10 45 Q 25 55 40 45 L 40 15" stroke="#FFFFFF" fill="none" />
            <Ellipse cx="25" cy="45" rx="15" ry="5" stroke="#FFFFFF" fill="none" />
            <Rect x="10" y="30" width="30" height="15" fill="rgba(255,255,255,0.1)" />
        </Svg>
    </View>
);

// Sunset/Sunrise Curve
export const SunsetCurve = ({ sunrise, sunset }) => (
    <View style={styles.widgetSubContainer}>
        <Svg height="50" width="120" viewBox="0 0 120 50">
            <Path d="M10 40 Q 60 0 110 40" fill="none" stroke="#AAA" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M10 40 L 110 40" stroke="#222" strokeWidth="1" />
            <Circle cx="40" cy="18" r="4" fill="#D71921" />
        </Svg>
    </View>
);

// Air Quality Dot Matrix
export const AQIDotMatrix = () => (
    <View style={styles.widgetSubContainer}>
        <Svg height="40" width="100" viewBox="0 0 100 40">
            {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 12 }).map((_, c) => (
                    <Circle key={`${r}-${c}`} cx={10 + c * 7} cy={10 + r * 7} r="1.5" fill={c < 4 ? "#FFF" : "#222"} />
                ))
            )}
        </Svg>
    </View>
);

const styles = StyleSheet.create({
    realFeelContainer: {
        width: (width - 60) / 2,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    whiteCircle: {
        width: '90%',
        height: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    realFeelLabel: {
        fontSize: 8,
        fontFamily: 'Nothing-Mono',
        color: '#000',
        marginBottom: 4,
    },
    realFeelValue: {
        fontSize: 32,
        fontFamily: 'Nothing-Dot',
        color: '#000',
    },
    widgetSubContainer: {
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    }
});
