'use strict';

require('dotenv').config();

const posts = require('./models/posts')
const enumeration = require('./lib/enumeration');

// eslint-disable-next-line no-unused-vars
exports.handler = async (event) => {
  // const corsUrl = process.env.CORS_URL;
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8080',
      'Access-Control-Allow-Methods': 'POST, PUT, GET, OPTIONS',
    },
  };
  try {
    switch (event.resource) {
      case '/health':
        if (event.httpMethod === 'GET') {
          response.body = {
            code: enumeration.STATUS_CODE.OK,
            data: 'hello world',
          };
          break;
        }
      case '/posts/create':
        if (event.httpMethod === 'POST') {
          const result = await posts.createPost(JSON.parse(event.body))
          console.log(result);
          response.body = JSON.stringify(result)
        };
        response.statusCode = enumeration.STATUS_CODE.FORBIDDEN
        break;
      default:
    }
  } catch (err) {
    console.err(err);
    return err;
    }
  return response;
}
