const core = require('@actions/core');
const { default: axios } = require('axios');
const { promises: fs } = require('fs');
const glob = require('glob')
const path = require('path')
const { XMLParser } = require('fast-xml-parser')


// const ROOT_FOLDER = "C:\\Users\\anhqle\\Katalon Studio\\Sample Shopping cart"
const ROOT_FOLDER = "C:\\Users\\anhqle\\Katalon Studio\\shopping-cart-tests"

// const TEST_SUITE_SCRIPT_REGREX = "Test Suites/!(TestOps)**/*.groovy";
const TEST_SUITE_PATTERN = "Test Suites/**/*.ts";
const TEST_CASE_PATTERN = "Test Cases/**/*.tc";
const EXECUTION_PROFILE_PATTERN = "Profiles/**/*.glbl"

const parseOption = {
  isArray: (name, jpath, isLeafNode, isAttribute) => name === 'testCaseLink' || name === 'TestSuiteRunConfiguration'
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
  const testCases = await scanForEntity(TEST_CASE_PATTERN, '');
  const testSuites = await scanForEntity(TEST_SUITE_PATTERN, 'TestSuiteEntity');
  const testSuiteCollections = await scanForEntity(TEST_SUITE_PATTERN, 'TestSuiteCollectionEntity', processTSC);
  const profiles = await scanForEntity(EXECUTION_PROFILE_PATTERN, 'GlobalVariableEntities');

  const result = {
    repositoryUrl: '', // get from github
    branch: '',
    testSuites, 
    profiles, 
    testSuiteCollections, 
    testCases
  }
  console.dir(result, { depth: null, colors: true })
  //TODO: get signed URL from TestOps and upload result to S3
}

main().catch(err => core.setFailed(err.message))