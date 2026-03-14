/* eslint-env node */
const { google } = require('googleapis')

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const spreadsheetId = process.env.VITE_SPREADSHEET_ID

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth })
    const { action, payload } = JSON.parse(event.body || '{}')

    // READ
    if (event.httpMethod === 'GET') {
      const range = event.queryStringParameters?.range
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
      return { statusCode: 200, headers, body: JSON.stringify(res.data.values) }
    }

    // WRITE / APPEND
    if (action === 'append') {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: payload.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: payload.values },
      })
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    }

    // UPDATE single cell or range
    if (action === 'update') {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: payload.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: payload.values },
      })
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
