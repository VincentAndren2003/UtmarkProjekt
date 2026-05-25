import { MapStyleElement } from 'react-native-maps';

const COLORS = {
    roadFill: '#E7AB83',
    roadOutline: '#000000',
    waterFill: '#009ee2',
    forestFill: '#ffffff',
    parkFill: '#FFBA36',
};

export const CustomMapStyle: MapStyleElement[] = [
    {
        elementType: 'labels',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: COLORS.roadFill,
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: COLORS.roadOutline,
            },
            {
                weight: 0.5,
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: COLORS.waterFill,
            },
        ],
    },
    {
        featureType: 'landscape',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: COLORS.forestFill,
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: COLORS.parkFill,
            },
        ],
    },
]as MapStyleElement[];
