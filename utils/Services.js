const axios = require('axios');
const Apis = require('./Apis.js');
const core = require('@actions/core');

const testOpsBaseUrl = core.getInput('testops-base-url');
const username = core.getInput('username');
const password = core.getInput('password');
const token = core.getInput('token');

const Services = {

    getS3PresignedUrl: (url) => {
        const params = {
            token,
            url
        };

        const auth = {
            username,
            password
        };

        core.info(`Found baseUrl: ${testOpsBaseUrl + Apis.s3PresignedUrl}.`);

        return axios.get(testOpsBaseUrl + Apis.s3PresignedUrl,
            params,
            { auth }
        );
    },

    putS3PresignedUrl: (presignedS3Url, jsonFile) => {
        const data = {
            jsonFile
        };
        const header = { 'Content-Type': 'application/octet-stream' };
        return axios.put(presignedS3Url,
            data,
            { header }
        );
    },
}

module.exports = Services;