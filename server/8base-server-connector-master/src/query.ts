require('dotenv').config();

import gql from 'graphql-tag';

import { GraphQLClient } from 'graphql-request';

if (!process.env.GRAPHQL_HOST) throw new Error('Missing process.env.GRAPHQL_HOST!');
if (!process.env.API_TOKEN) throw new Error('Missing process.env.API_TOKEN!');

const client = new GraphQLClient(process.env.GRAPHQL_HOST,
    {
        headers: {
            'authorization': process.env.API_TOKEN
        }
    });

export interface HealthRecordParameters {
    lon?: number,
    lat?: number,
    speed?: number,
    stepCount?: number,
    altitude?: number,
    distance?: number,
    gender?: 'male' | 'female',
    heartRate?: number,
    time?: Date
}

export type HealthRecord = HealthRecordParameters & {
    id: string
} 

export interface HealthListResponse {
    healthDataList: {
        items: HealthRecord[]
    }
}

export const listHealthData = () => {//use this to get
    const query = gql`
        query HealthRecord {
            healthDataList {
                items {
                    id
                    lon
                    lat
                    speed
                    stepCount
                    altitude
                    distance
                    gender
                    time
                }
            }
        }
        `;

    return client.request<HealthListResponse>(query);
}

export interface HealthDatumCreateResponse {
    healthDatumCreate: {
        id: string
    }
}

export const createHealthDatum = (record: HealthRecordParameters) => {//use this one to save
    const query = gql`
        mutation HealthDatumCreateMutation($data: HealthDatumCreateInput!) {
            healthDatumCreate(data: $data) {
                id
            }
        }`;

    const variables = {
        "data": record
    };

    return client.request<HealthDatumCreateResponse>(query, variables);
}

/*
api.createHealthDatum(record).then(data => {
    console.log(data.healthDatumCreate.id);
})

api.listHealthData().then(data => {
    console.log(JSON.stringify(data, null, ' '));
});
*/