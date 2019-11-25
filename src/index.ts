import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { getLuasStopTimes } from './DublinTransitBot/Luas/Luas';
import { getClosestStops } from './DublinTransitBot';
import { getRailStopTimes } from './DublinTransitBot/Rail/Rail';
import { getBusStopTimes } from './DublinTransitBot/Bus/Bus';
import { getBikeDis } from './DublinTransitBot/Bikes/BikesDis';
import { getBikeInfo } from './DublinTransitBot/Bikes/Bikes';

dotenv.config();
const app = express();
app.use(bodyParser.json());

let mongoClient: MongoClient;

const connectToClientIfDropped: () => Promise<void> = async () => {
    if (mongoClient && mongoClient.isConnected()) {
        console.log('MongoDb connection is cached');
        return;
    }

    const uri = process.env.MONGODB_CONNECTION_URI;

    if (uri === null) {
        console.error(new Error('uri not defined'));
    }

    if (typeof uri === 'string')
        try {
            console.log('Creating new mongo connection');
            mongoClient = await MongoClient.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
        } catch (e) {
            console.error(new Error(e));
            console.error(new Error('Failed to connect to Mongo'));
        }
};

const logAnyData = (mClient: MongoClient, collectionName: string, data: any) => {
    return mClient
        .db(process.env.DB_NAME)
        .collection(collectionName)
        .insertOne(data);
};

app.get('/hello', (req, res) => res.sendStatus(200));

app.post('/dublinTransitBot', async (req, res) => {
    if (req.headers['api-key'] === process.env.KEY) {
        const { stop, service, latLng } = req.body;

        switch (service) {
            case 'log':
                await res.send(200);
                await connectToClientIfDropped().catch(err => {
                    console.error(err.message, err.error);
                    res.status(500).end(err.message);
                    return;
                });
                return logAnyData(mongoClient, 'transitBot', req.body.data);
            case 'luas':
                return getLuasStopTimes(stop, res, false);
            case 'distance':
                return getClosestStops(latLng, res);
            case 'rail':
                return getRailStopTimes(stop, res, false);
            case 'bus':
                return getBusStopTimes(stop, res, false);
            case 'bike-dis':
                return getBikeDis(latLng, res);
            case 'bike':
                return getBikeInfo(stop, res);
            default:
                console.error(new Error(`missing service in dub transit bot: ${stop}`));
        }
    }
    console.log('Denied access');
    return res.sendStatus(404);
});

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
