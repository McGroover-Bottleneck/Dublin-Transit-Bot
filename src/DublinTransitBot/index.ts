import { getLuasClosestMessage } from './Luas/LuasDis';
import { getRailClosestMessage } from './Rail/Rail';
import { getBikesDisMessage } from './Bikes/BikesDis';

export const getClosestStops = (location: any, res: any) => {
    const luas = getLuasClosestMessage(location);
    const rail = getRailClosestMessage(location);
    const bikes = getBikesDisMessage(location);
    return res.json({ text: `${luas}\n\n${rail}\n\n${bikes}` });
};
