const axios = require('axios');
const Apis = require('./Apis.js');
const core = require('@actions/core');

const testOpsBaseUrl = core.getInput('testops-base-url');
const username = core.getInput('username');
const password = core.getInput('password');
const token = core.getInput('token');

const Services = {

    getS3PresignedUrl: (url) => {
        const api = testOpsBaseUrl + Apis.s3PresignedUrl;
        core.info(`Found api: ${api}.`);

        return axios.get(api, {
            params: {
                token: 'toidihoc123',
                url: url
            },
            withCredentials: true,
            auth: {
                username: 'hiep.vu@katalon.com',
                password: 'Ntchang121099.'
            }
        });
    },

    putS3PresignedUrl: (presignedS3Url, jsonFile) => {
        return axios.put(presignedS3Url, {
            data: jsonFile,
        }, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
    },
}

module.exports = Services;