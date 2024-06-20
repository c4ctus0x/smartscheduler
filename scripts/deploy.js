const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute command: "${command}"`, error);
    throw new Error(`Command execution failure: "${command}"`);
  }
};

const cloneRepository = () => {
  try {
    const repositoryUrl = 'https://github.com/path-to/SmartScheduler.git';
    const cloneCommand = `git clone ${repositoryUrl}`;
    console.log('Cloning SmartScheduler repository...');
    runCommand(cloneCommand);
  } catch (error) {
    console.error('Failed to clone repository.', error);
    process.exit(1);
  }
};

const setupServer = () => {
  try {
    console.log('Setting up server configurations...');
    process.chdir('./SmartScheduler');
    console.log('Installing dependencies...');
    runCommand('npm install');
  } catch (error) {
    console.error('Failed to setup the server.', error);
    process.exit(1);
  }
};

const setupDatabase = () => {
  try {
    console.log('Configuring database connections...');
    const dbConfigPath = path.join(__dirname, 'SmartScheduler', 'config', 'database.js');
    const dbConfigContent = `
      module.exports = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      };
    `;
    fs.writeFileSync(dbConfigPath, dbConfigContent);
    console.log('Running database migrations...');
    runCommand('npx sequelize db:migrate');
    console.log('Seeding initial data...');
    runCommand('npx sequelize db:seed:all');
  } catch (error) {
    console.error('Failed to setup the database.', error);
    process.exit(1);
  }
};

const verifyEnvironmentVariables = () => {
  try {
    const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const unsetEnv = requiredEnv.filter((envVar) => !(typeof process.env[envVar] !== 'undefined'));

    if(unsetEnv.length > 0) {
      throw new Error(`Required environment variables are not set: [${unsetEnv.join(', ')}]`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const deploySmartScheduler = async () => {
  try {
    verifyEnvironmentVariables();
    cloneRepository();
    setupServer();
    setupDatabase();
    console.log('SmartScheduler has been successfully deployed!');
  } catch (error) {
    console.error('Deployment failed.', error);
    process.exit(1);
  }
};

deploySmartScheduler();