const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute command ${command}`, error);
    process.exit(1);
  }
};
const cloneRepository = () => {
  const repositoryUrl = 'https://github.com/path-to/SmartScheduler.git';
  const cloneCommand = `git clone ${repositoryUrl}`;
  console.log('Cloning SmartScheduler repository...');
  runCommand(cloneCommand);
};
const setupServer = () => {
  console.log('Setting up server configurations...');
  process.chdir('./SmartScheduler');
  console.log('Installing dependencies...');
  runCommand('npm install');
};
const setupDatabase = () => {
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
};
const deploySmartScheduler = async () => {
  cloneRepository();
  setupServer();
  setupDatabase();
  console.log('SmartScheduler has been successfully deployed!');
};
deploySmartScheduler();