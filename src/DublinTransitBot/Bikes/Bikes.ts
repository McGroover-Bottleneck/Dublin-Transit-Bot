import { BikesStations, BikeResponse } from './BikesStations';
import Axios from 'axios';

export const getBikeInfo = (stop: string, res: any) => {
    const station = BikesStations.find(({ address }) => address === stop);
    console.log(station);
    if (station) {
        const url = `https://api.jcdecaux.com/vls/v1/stations/${station['number']}?contract=dublin&apiKey=${process.env.BIKES_KEY}`;
        console.log(url);
        return Axios.get(url).then(result => {
            console.log(result.data);
            const bike: BikeResponse = result.data;
            const message = `Dublin Bikes Live Info 🚲\n\nStation: ${bike.address}\n\nOpen Stands: ${
                bike.available_bike_stands
            }\nBikes: ${bike.available_bikes}\nLast Updated: ${new Date(bike.last_update).toLocaleTimeString()}`;
            return res.json({ bike_text: message });
        });
    }
    console.error(new Error(`No station: ${stop}`));
    return res.send(404);
};
