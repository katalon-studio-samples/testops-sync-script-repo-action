const core = require('@actions/core');
const github = require('@actions/github')
const { promises: fs } = require('fs');
const glob = require('glob')
const path = require('path')
const { XMLParser } = require('fast-xml-parser')

const ROOT_FOLDER = process.env.GITHUB_WORKSPACE;

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
  core.setOutput('repository', result)
  //TODO: get signed URL from TestOps and upload result to S3
}

main().catch(err => core.setFailed(err.message))