const axios = require('axios');
const Apis = require('./Apis.js');
const core = require('@actions/core');

const testOpsBaseUrl = core.getInput('testops-base-url');
const username = core.getInput('username');
const password = core.getInput('password');
const token = core.getInput('token');

const Services = {

    getS3PresignedUrl: (url) => {
        return axios.get(testOpsBaseUrl + Apis.s3PresignedUrl, {
            params: {
                token: token,
                url: url
            },
            withCredentials: true,
            auth: {
                username: username,
                password: password
            }
        });
    },

    putS3PresignedUrl: (presignedS3Url, jsonFile) => {
        return axios.put(presignedS3Url, jsonFile, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
}

module.exports = Services;
