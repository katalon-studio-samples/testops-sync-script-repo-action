import axios from 'axios';
import Apis from './Apis.jsx';
import core from '@actions/core';

const CREDENTIALS = core.getInput('credentials');

const Services = {

    getS3PresignedUrl: (url) => {
        const data = {
            token: CREDENTIALS.token,
            url
        };
        const auth = {
            username: CREDENTIALS.username,
            password: CREDENTIALS.password
        };
        return axios.get(Apis.s3PresignedUrl,
            data,
            auth
        );
    },

    putS3PresignedUrl: (presignedS3Url, jsonFile) => {
        const data = {
            jsonFile
        };
        const header =
        {
            headers: { 'Content-Type': 'application/octet-stream' }
        };
        return axios.put(presignedS3Url,
            data,
            header
        );
    },
}

export default Services;