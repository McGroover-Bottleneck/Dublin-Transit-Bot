import { BikesStations } from './BikesStations';
const Distance = require('geo-distance');

export const getBikesDisMessage = (latLng: any) => {
    const latLngSplit: [string, string] = latLng.replace(' ', '').split(',');
    const stopsWithDistance = BikesStations.map(stop => {
        const dis = Distance.between(
            { lat: latLngSplit[0], lon: latLngSplit[1] },
            { lat: stop.latitude, lon: stop.longitude },
        ).human_readable_in_units('m').distance;
        return { ...stop, dis };
    })
        .sort((a, b) => {
            return a.dis - b.dis;
        })
        .slice(0, 3);

    return `Nearest Bike Stops\n\n${stopsWithDistance
        .map(stop => {
            return `${stop.address}: ${(stop.dis / 1000).toFixed(2)} km`;
        })
        .join('\n')}`;
};

export const getBikeDis = (latLng: any, res: any) => res.json({ text: getBikesDisMessage(latLng) });
