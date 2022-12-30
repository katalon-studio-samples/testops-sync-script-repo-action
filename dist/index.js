/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 808:
/***/ ((module) => {

const Apis = {

    s3PresignedUrl: '/api/v1/patches/sample-git-repo-signed-url',
};

module.exports = Apis;


/***/ }),

/***/ 746:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const axios = __nccwpck_require__(879);
const Apis = __nccwpck_require__(808);
const core = __nccwpck_require__(377);

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
        return axios.put(presignedS3Url, {
            file: jsonFile,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
}

module.exports = Services;


/***/ }),

/***/ 377:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 754:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 879:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ }),

/***/ 20:
/***/ ((module) => {

module.exports = eval("require")("fast-xml-parser");


/***/ }),

/***/ 790:
/***/ ((module) => {

module.exports = eval("require")("glob");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(377);
const github = __nccwpck_require__(754)
const { promises: fs } = __nccwpck_require__(147);
const glob = __nccwpck_require__(790)
const path = __nccwpck_require__(17)
const { XMLParser } = __nccwpck_require__(20)
const Services = __nccwpck_require__(746);

const ROOT_FOLDER = core.getInput('path');

// const TEST_SUITE_SCRIPT_REGREX = "Test Suites/!(TestOps)**/*.groovy";
const TEST_SUITE_PATTERN = "Test Suites/**/*.ts";
const TEST_CASE_PATTERN = "Test Cases/**/*.tc";
const EXECUTION_PROFILE_PATTERN = "Profiles/**/*.glbl"

const parseOption = {
  isArray: (name) => name === 'testCaseLink' || name === 'TestSuiteRunConfiguration'
}
const parser = new XMLParser(parseOption)

const scanForEntity = async (pattern, entityType, processEntity) => {
  const files = glob.sync(pattern, { cwd: ROOT_FOLDER })
  const entities = [];
  await Promise.all(files.map(async (filePath) => {
    const realPath = path.resolve(ROOT_FOLDER, filePath)
    const fileContent = await fs.readFile(realPath, { encoding: 'utf8' });
    const entity = parser.parse(fileContent)
    const entityIdString = filePath.replace(/\.[^/.]+$/, "")
    if (!entityType) {
      entities.push(entityIdString)
    } else if (Object.prototype.hasOwnProperty.call(entity, entityType)) {
      let value = entity[entityType]
      if (processEntity) {
        value = processEntity(value)
      }
      entities.push({ id: entityIdString, entity: value })
    }
  }));
  return entities;
}

const processTSC = (tsc) => {
  const configurations = tsc?.testSuiteRunConfigurations.TestSuiteRunConfiguration
  if (configurations) {
    tsc.testSuiteRunConfigurations = configurations
  } else {
    tsc.testSuiteRunConfigurations = []
  }
  return tsc;
}

const main = async () => {
  core.info('Start scanning the repository...');
  const testCases = await scanForEntity(TEST_CASE_PATTERN, '');
  core.info(`Found ${testCases.length} test cases.`);
  const testSuites = await scanForEntity(TEST_SUITE_PATTERN, 'TestSuiteEntity');
  core.info(`Found ${testSuites.length} test suites.`);
  const testSuiteCollections = await scanForEntity(TEST_SUITE_PATTERN, 'TestSuiteCollectionEntity', processTSC);
  core.info(`Found ${testSuiteCollections.length} test suite collections.`);
  const profiles = await scanForEntity(EXECUTION_PROFILE_PATTERN, 'GlobalVariableEntities');
  core.info(`Found ${profiles.length} profiles.`);

  const result = {
    repositoryUrl: github.context.repo.repo,
    branch: '',
    testSuites, 
    profiles, 
    testSuiteCollections, 
    testCases
  }

  core.setOutput('repository', result);

  core.info(`Found github full link ${github.context.repo.repo}`);

  const jsonFile = await fs.writeFile('repository.json', JSON.stringify(result))
  .then(() => fs.readFile('repository.json', 'utf-8'));

  const GITHUB_URL = core.getInput('github-url');

  core.info('Getting signed URL...');
  await Services.getS3PresignedUrl(GITHUB_URL).then((response) => {
    const presignedUrl = response.data;
    core.info('Start uploading...');
    Services.putS3PresignedUrl(presignedUrl, jsonFile);
  })
}

main().catch(err => core.setFailed(err.message))
})();

module.exports = __webpack_exports__;
/******/ })()
;