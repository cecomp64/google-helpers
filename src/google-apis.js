require('dotenv').config();
const {GoogleAuth} = require('google-auth-library');
const {OAuth2} = require('google-auth-library');
const { google } = require('googleapis');
const {scopes} = require('./shared-variables');

async function google_auth() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf-8')
  );

  const auth = new GoogleAuth({
    scopes: scopes,
    credentials: credentials,
  });
  var client = await auth.getClient();

  return client;
}

async function google_impersonate() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf-8')
  );

  const auth = new GoogleAuth({
    scopes: scopes,
    credentials: credentials,
    clientOptions: {
      subject: 'ephemeris.production@sjaa.net'
    }
  });
  var client = await auth.getClient();

  /*
  console.log('Authenticating...')
  const client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0],
  );

  console.log('Getting Tokens...')
  const { tokens } = await client.getToken(process.env.GOOGLE_EPHEMERIS_AUTH_CODE);

  console.log('Setting Credentials...')
  client.setCredentials({subject: 'ephemeris.production@sjaa.net', refresh_token: tokens.refresh_token})
*/
  return client;
}

async function read_spreadsheet(client, sheetId, range) {
  // Now let's make a request to the Google Sheets API 
  const sheets = google.sheets({version: 'v4', auth: client}); 
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: range, }); 
  //console.log('Data from sheet:', response.data.values);

  return response.data.values;
}

async function write_spreadsheet(client, sheetId, range, values) {
  const sheets = google.sheets({version: 'v4', auth: client});
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        majorDimension: 'ROWS',
        values: values
      },
    });
    console.log(`${response.data.updatedCells} cells updated.`);
  } catch (err) {
    console.error('Error writing to sheet:', err);
  }
}

async function lookup_group_members(client, group = process.env.GOOGLE_MEMBERSHIP_GROUP) {
  const service = google.admin({ version: 'directory_v1', auth: client });
  console.log('Listing members...')
  const res = await service.members.list({groupKey: group});
  console.dir(res);

  return res;
}

module.exports = { 
  google_auth, 
  read_spreadsheet, 
  write_spreadsheet,
  lookup_group_members,
  google_impersonate,
};