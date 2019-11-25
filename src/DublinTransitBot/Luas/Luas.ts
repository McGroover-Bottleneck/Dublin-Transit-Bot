import { luas_stops } from './luas_stops';
import Axios from 'axios';
import * as xml2json from 'xml2json';

const isObject = (value: any) => value && typeof value === 'object' && value.constructor === Object;

const minsOrDue = (text: string) => {
    if (text === 'DUE') {
        return text;
    } else if (text === '1') {
        return `${text} min`;
    }
    return `${text} mins`;
};
const LuasApi = (abbreviation: string) => {
    const apiUrl = 'https://luasforecasts.rpa.ie/xml/get.ashx';

    const qs = {
        stop: abbreviation,
        action: 'forecast',
        encrypt: false,
    };

    return Axios.get(apiUrl, {
        params: qs,
    }).then(result => {
        return xml2json.toJson(result.data, {
            sanitize: true,
            trim: true,
            object: true,
        });
    });
};

const generateTextForMultiple = (trams: any) => {
    const text = trams.map((tram: any) => {
        if (tram.destination === 'No trams forecast') {
            return `No trams forecast`;
        }
        return `${tram.destination}: ${minsOrDue(tram.dueMins)}`;
    });

    return `${text.join('\n')}`;
};

const generateInboundAndOutboundLuas = (apiResponse: any, stopName: any, mini = false) => {
    const Inbound = apiResponse.direction[0].tram;
    const Outbound = apiResponse.direction[1].tram;
    let inboundMessage = '';
    let outboundMessage = '';
    console.log(Inbound);
    if (isObject(Inbound)) {
        if (Inbound.destination === 'No trams forecast' || Inbound.destination === 'No Northbound Service') {
            inboundMessage = `Inbound: \nNo trams forecast 😔`;
        } else {
            inboundMessage = `Inbound:\n${Inbound.destination}: ${minsOrDue(Inbound.dueMins)}`;
        }
    } else {
        inboundMessage = `Inbound\n${generateTextForMultiple(Inbound)}`;
    }

    if (isObject(Outbound)) {
        if (Outbound.destination === 'No trams forecast' || Outbound.destination === 'No Southbound Service') {
            outboundMessage = `\nOutbound: \nNo trams forecast 😔`;
        } else {
            outboundMessage = `\nOutbound:\n${Outbound.destination} ${minsOrDue(Outbound.dueMins)}`;
        }
    } else {
        outboundMessage = `\nOutbound:\n${generateTextForMultiple(Outbound)}`;
    }

    return `Luas Live Info 🚈\n\nStop: ${stopName}\n\n${inboundMessage}\n${outboundMessage}`;
};

const getLuasStopInfo = (displayName: string) => {
    const filteredStopRed = luas_stops['Red Line'].find(stop => stop.text === displayName);
    const filteredStopGreen = luas_stops['Green Line'].find(stop => stop.text === displayName);

    if (filteredStopRed) return filteredStopRed;
    return filteredStopGreen;
};

export const getLuasStopTimes = (stopName: any, res: any, justText = false) => {
    const luasStopInfo = getLuasStopInfo(stopName);
    if (luasStopInfo) {
        return LuasApi(luasStopInfo.abrev).then((result: any) => {
            const startMessage = generateInboundAndOutboundLuas(result.stopInfo, stopName);

            if (justText) {
                return startMessage;
            }

            return res.json({ luas_text: startMessage });
        });
    }
    console.error(new Error(`missing stop info ${stopName}`));
    return;
};
