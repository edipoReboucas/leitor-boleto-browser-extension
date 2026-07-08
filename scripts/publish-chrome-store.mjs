import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import chromeWebstoreUpload from 'chrome-webstore-upload';

const zipPath = resolve(process.argv[2] ?? 'extension.zip');

const extensionId = process.env.CHROME_EXTENSION_ID;
const clientId = process.env.CHROME_CLIENT_ID;
const clientSecret = process.env.CHROME_CLIENT_SECRET;
const refreshToken = process.env.CHROME_REFRESH_TOKEN;

const missing = [
  ['CHROME_EXTENSION_ID', extensionId],
  ['CHROME_CLIENT_ID', clientId],
  ['CHROME_CLIENT_SECRET', clientSecret],
  ['CHROME_REFRESH_TOKEN', refreshToken],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const store = chromeWebstoreUpload({
  extensionId,
  clientId,
  clientSecret,
  refreshToken,
});

const zipFile = readFileSync(zipPath);

console.log(`Uploading ${zipPath}...`);
const uploadResult = await store.uploadExisting(zipFile);
console.log('Upload complete.', uploadResult);

console.log('Publishing to default channel...');
const publishResult = await store.publish('default');
console.log('Publish complete.', publishResult);
