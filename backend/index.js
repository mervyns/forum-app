require('dotenv').config();

const posts = require('./models/posts');
const enumeration = require('./lib/enumeration');

// eslint-disable-next-line no-unused-vars
exports.handler = async (event) => {
  // const corsUrl = process.env.CORS_URL;
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5000',
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
        break;
      case '/posts/create':
        if (event.httpMethod === 'POST') {
          const result = await posts.createPost(JSON.parse(event.body));
          response.body = JSON.stringify(result);
          break;
        }
        response.statusCode = enumeration.STATUS_CODE.FORBIDDEN;
        break;
      case '/posts/list':
        if (event.httpMethod === 'GET') {
          const result = await posts.getAllPosts();
          response.body = JSON.stringify(result);
          break;
        }
        response.statusCode = enumeration.STATUS_CODE.FORBIDDEN;
        break;
      case '/post/{postDate}/{postId}':
        if (event.httpMethod === 'GET') {
          const { pathParameters } = event;
          const result = await posts.getPost(pathParameters);
          response.body = JSON.stringify(result);
          break;
        } else if (event.httpMethod === 'POST') {
          const { body, pathParameters } = event;
          const result = await posts.updatePost(pathParameters, JSON.parse(body));
          response.body = JSON.stringify(result);
          break;
        }
        response.statusCode = enumeration.STATUS_CODE.FORBIDDEN;
        break;
      default:
    }
  } catch (err) {
    console.log(err);
    return err;
  }
  return response;
};
