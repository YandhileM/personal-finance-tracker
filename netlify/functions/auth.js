/* eslint-env node */
const crypto = require('crypto')

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
    const { username, password } = JSON.parse(event.body || '{}')

    if (
      username !== process.env.APP_USERNAME ||
      password !== process.env.APP_PASSWORD
    ) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      }
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token, expiresAt }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
