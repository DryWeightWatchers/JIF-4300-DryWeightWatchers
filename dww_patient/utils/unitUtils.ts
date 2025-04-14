export const convertWeight = (weight: number, fromUnit: 'imperial' | 'metric', toUnit: 'imperial' | 'metric'): number => {
    if (fromUnit === toUnit) {
        return weight;
    }

    if (fromUnit === 'imperial' && toUnit === 'metric') {
        // Convert lbs to kg
        return Number((weight * 0.45359237).toFixed(2));
    } else if (fromUnit === 'metric' && toUnit === 'imperial') {
        // Convert kg to lbs
        return Number((weight * 2.20462262).toFixed(2));
    }

    throw new Error(`Invalid unit conversion: ${fromUnit} to ${toUnit}`);
};

export const formatWeight = (weight: number, unit: 'imperial' | 'metric'): string => {
    if (unit === 'imperial') {
        return `${weight} lbs`;
    } else if (unit === 'metric') {
        return `${weight} kg`;
    }
    throw new Error(`Invalid unit: ${unit}`);
}; 