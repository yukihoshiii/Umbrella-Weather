import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DOT_SIZE = 4;
const SPACING = 2;

const DotGrid = ({ grid, activeColor = "#FFF", inactiveColor = "#111" }) => (
    <Svg height={grid.length * (DOT_SIZE + SPACING)} width={grid[0].length * (DOT_SIZE + SPACING)}>
        {grid.map((row, r) =>
            row.split('').map((dot, c) => (
                <Circle
                    key={`${r}-${c}`}
                    cx={c * (DOT_SIZE + SPACING) + DOT_SIZE / 2}
                    cy={r * (DOT_SIZE + SPACING) + DOT_SIZE / 2}
                    r={DOT_SIZE / 2}
                    fill={dot === '1' ? activeColor : inactiveColor}
                />
            ))
        )}
    </Svg>
);

const SUN = [
    "   1111   ",
    "  111111  ",
    " 11111111 ",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    " 11111111 ",
    "  111111  ",
    "   1111   ",
];

const CLOUD = [
    "      1111      ",
    "    11111111    ",
    "  111111111111  ",
    " 11111111111111 ",
    "1111111111111111",
    "1111111111111111",
];

export const DotIcon = ({ type }) => {
    let grid = SUN;
    if (type === 'Cloud' || type === 'Overcast') grid = CLOUD;
    // Add more patterns as needed

    return (
        <View style={styles.container}>
            <DotGrid grid={grid} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    }
});
