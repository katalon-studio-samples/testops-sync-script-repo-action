import axios from 'axios';
import Apis from './Apis.jsx';
import core from '@actions/core';

const testOpsBaseUrl = core.getInput('testops-base-url');
const username = core.getInput('username');
const password = core.getInput('password');
const token = core.getInput('token');

const Services = {

    getS3PresignedUrl: (url) => {
        const data = {
            token,
            url
        };
        const auth = {
            username,
            password
        };
        return axios.get(testOpsBaseUrl + Apis.s3PresignedUrl,
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