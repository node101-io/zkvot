import { input, select, confirm } from '@inquirer/prompts';
import fs from 'fs/promises';

export const getInputs = async () => {
  const command = await select({
    message: 'Select command:',
    choices: [
      {
        name: 'start',
        value: 'start',
      },
      {
        name: 'continue',
        value: 'continue',
      },
    ],
  });

  if (command === 'continue') {
    try {
      const env = await fs.readFile('./env.json');

      const json = JSON.parse(env.toString());

      if (!json.votingId || !json.network || !json.lightNode) {
        console.log('Invalid configuration. Please run start command first.');
        process.exit(1);
      }

      console.log('Previous configuration:');
      console.log('Voting ID:', json.votingId);
      console.log('Network:', json.network);
      console.log('Light Node:', json.lightNode);
      console.log('Light Node Port:', json.lightNodePort);
      const confirmContinue = await confirm({
        message: 'Continue with previous configuration?',
        default: true,
        transformer: (value) => (value ? 'yes' : 'No'),
      });
      if (confirmContinue) {
        return;
      } else {
        await fs.unlink('./env.json');

        console.log('Previous configuration deleted.');
      }
    } catch (e) {
      console.log('env.json not found. Please run start command first.');
      process.exit(1);
    }
  }
  const votingId = await input({ message: 'Enter Voting ID:' });

  const network = await select({
    message: 'Select network:',
    choices: [
      {
        name: 'mainnet',
        value: 'mainnet',
      },
      {
        name: 'testnet',
        value: 'testnet',
      },
    ],
  });

  console.log('This election uses both Celestia and Avail.');

  const lightNode = await confirm({
    message:
      'Would you like to run a light node? Select no if you are already have a light node',
    default: true,
    transformer: (value) => (value ? 'yes' : 'No'),
  });
  let lightNodePort = '';
  if (!lightNode) {
    lightNodePort = await input({ message: 'Enter light node port:' });
  }

  await fs.writeFile(
    './env.json',
    JSON.stringify(
      {
        votingId: votingId,
        network: network,
        lightNode: lightNode,
        lightNodePort: lightNodePort,
      },
      null,
      2
    )
  );
};
