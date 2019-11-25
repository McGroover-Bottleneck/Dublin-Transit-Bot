import Axios from 'axios';

export interface RTPIResponse {
    errorcode: string;
    errormessage: string;
    numberofresults: number;
    stopid: string;
    timestamp: string;
    results: { [key: string]: string }[];
}

const checkIfDue = (duetime: string) => {
    if (duetime === 'Due') return 'Due';
    if (duetime === '1') return `1 min`;
    return `${duetime} mins`;
};

const createBusMessage = (BusData: RTPIResponse) => {
    const stops: RTPIResponse = BusData;
    return stops.results
        .slice(0, 9)
        .map(each => {
            return `${each.route}  : ${checkIfDue(each.duetime)}`;
        })
        .join('\n');
};

const BusApi = (stopNumber: string) => {
    const apiUrl = `https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=${stopNumber}&format=json`;
    return Axios.get(apiUrl).then(result => {
        return result;
    });
};

export const getBusStopTimes = (stopNumber: string, res: any, justText = false) => {
    return BusApi(stopNumber).then((result: any) => {
        console.log(`Bus: ${JSON.stringify(result.data)}`);

        if (result.data.errorcode > 0) {
            return res.json({ bus_text: `No real time info for ${stopNumber}` });
        }
        const busMessage = createBusMessage(result.data);
        const startMessage = `Dublin Bus Live Info 🚌\nStop: ${stopNumber}\n\n${busMessage}`;
        return res.json({ bus_text: startMessage });
    });
};
