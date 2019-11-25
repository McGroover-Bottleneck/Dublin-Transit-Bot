/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { luas_stops } from './luas_stops';
const Distance = require('geo-distance');

export const getLuasClosestMessage = (latLng: string) => {
    try {
        // @ts-ignore
        const latLngSplit: [string, string] = latLng.replace(' ', '').split(',');
        console.log(latLngSplit);

        const green = luas_stops['Green Line'].map(stop => {
            const dis = Distance.between(
                { lat: latLngSplit[0], lon: latLngSplit[1] },
                { lat: stop.lat, lon: stop.long },
            ).human_readable_in_units('m').distance;
            return {
                ...stop,
                dis,
            };
        });
        const red = luas_stops['Red Line'].map(stop => {
            const dis = Distance.between(
                { lat: latLngSplit[0], lon: latLngSplit[1] },
                { lat: stop.lat, lon: stop.long },
            ).human_readable_in_units('m').distance;
            return {
                ...stop,
                dis,
            };
        });

        console.log(red);

        const combined = red.concat(green);
        console.log(combined);
        console.log(combined.length);

        const sorted = combined
            .sort((a, b) => {
                return a.dis - b.dis;
            })
            .slice(0, 3);
        console.log(sorted);
        return `Nearest Luas Stops\n\n${sorted
            .map(stop => {
                return `${stop.text}: ${(stop.dis / 1000).toFixed(2)} km`;
            })
            .join('\n')}`;
    } catch (error) {
        console.error(error);
    }
};

export const getLuasClosest = (latLng: any, res: any) => {
    const message = getLuasClosestMessage(latLng);
    return res.json({ text: message });
};
