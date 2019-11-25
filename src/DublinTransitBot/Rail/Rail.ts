import * as xml2json from 'xml2json';
import Axios from 'axios';
import { RailStations } from './RailStops';

const checkIfDue = (duetime: string) => {
    if (duetime === '0') return 'Due';
    if (duetime === '1') return `1 min`;
    return `${duetime} mins`;
};

const generateInboundAndOutboundRail = (apiResponse: any, stopName: string) => {
    const list = apiResponse.ArrayOfObjStationData.objStationData;
    const northboundList = list.filter((item: any) => item.Direction === 'Northbound' && item.Duein < 30);
    const southboundList = list.filter((item: any) => item.Direction === 'Southbound' && item.Duein < 30);

    let northboundText;
    let southboundText;

    if (northboundList.length > 0) {
        northboundText = northboundList.map((item: any) => {
            return `${item.Origin} -> ${item.Destination}: ${checkIfDue(item.Duein)}`;
        });
    } else {
        northboundText = [`No live info`];
    }

    if (southboundList.length > 0) {
        southboundText = southboundList.map((item: any) => {
            return `${item.Origin} -> ${item.Destination}: ${checkIfDue(item.Duein)}`;
        });
    } else {
        southboundText = [`No live info`];
    }

    return `Irish Rail Live Info 🚂\nTrains due in < 30 mins\n\nStop: ${stopName}\n\nNorthbound\n${northboundText.join(
        '\n',
    )}\n\nSouthbound\n${southboundText.join('\n')}`;
};

const RailApi = (stopName: string) => {
    const apiUrl = `http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByNameXML?StationDesc=${stopName}`;
    return Axios.get(apiUrl).then(result => {
        return xml2json.toJson(result.data, {
            sanitize: true,
            trim: true,
            object: true,
        });
    });
};

export const getRailStopTimes = (stopName: string, res: any, justText = false) => {
    console.log('Getting stop times for rail');

    return RailApi(stopName).then(resultRailApi => {
        const startMessage = generateInboundAndOutboundRail(resultRailApi, stopName);
        console.log(startMessage);
        if (justText) {
            return startMessage;
        }

        return res.json({ rail_text: startMessage });
    });
};

export const getRailClosestMessage = (latLng: string) => {
    const Distance = require('geo-distance');

    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const latLngSplit: [string, string] = latLng.replace(' ', '').split(',');

        const stopsWithDis = RailStations.map(stop => {
            const dis = Distance.between(
                { lat: latLngSplit[0], lon: latLngSplit[1] },
                { lat: stop.lat, lon: stop.lon },
            ).human_readable_in_units('m').distance;
            return {
                ...stop,
                dis,
            };
        });

        const sorted = stopsWithDis
            .sort((a, b) => {
                return a.dis - b.dis;
            })
            .slice(0, 3);
        return `Nearest Rail Stops\n\n${sorted
            .map(stop => {
                return `${stop.name}: ${(stop.dis / 1000).toFixed(2)} km`;
            })
            .join('\n')}`;
    } catch (error) {
        console.error(error);
    }
};
