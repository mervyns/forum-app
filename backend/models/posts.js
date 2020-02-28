const { v1: uuidv1 } = require('uuid');
const databaseClass = require('../lib/dynamoDB');
const {
  PostsTableName,
  PostsColumnName,
} = require('./postTable.config');
const enumeration = require('../lib/enumeration');

const Database = databaseClass;
const dynamo = new Database();

class Post {
  constructor() {
    this.db = dynamo;
    // data
    this.title = '';
    this.message = '';
    this.userName = '';
    this.user = {};
    this.postId = '';
    this.postDate = '';
    this.comments = [];
  }

  /**
   * Create Post
   * @param {Object} eventBody
   * @returns {Promise} Promise object represent the status of the dynamoDB
   */
  async createPost(eventBody) {
    this.title = eventBody.title;
    this.message = eventBody.message;
    this.postId = uuidv1();
    this.userName = eventBody.user.name;
    this.user = eventBody.user;
    this.postDate = Date.now();
    this.comments = [];

    let PostObj = {};

    // Create Post
    if (this.title === null) {
      return { code: enumeration.STATUS_CODE.FAIL, data: { message: 'title field missing' } };
    }
    if (this.message === null) {
      return { code: enumeration.STATUS_CODE.FAIL, data: { message: 'message field missing' } };
    }
    if (this.userName === null) {
      return { code: enumeration.STATUS_CODE.FAIL, data: { message: 'userName field missing' } };
    }
    if (this.user === null) {
      return { code: enumeration.STATUS_CODE.FAIL, data: { message: 'user field missing' } };
    }

    PostObj = {
      [PostsColumnName.title]: this.title,
      [PostsColumnName.message]: this.message,
      [PostsColumnName.postId]: this.postId,
      [PostsColumnName.userName]: this.userName,
      [PostsColumnName.user]: this.user,
      [PostsColumnName.postDate]: this.postDate,
      [PostsColumnName.comments]: this.comments,
    };

    try {
      if (await this.db.putData(PostsTableName, PostObj)) {
        return {
          code: enumeration.STATUS_CODE.OK,
          data: {
            message: 'Success',
            PostData: PostObj,
          },
        };
      }
    } catch (e) {
      console.log(e);
      return {
        code: enumeration.STATUS_CODE.FAIL,
        data: {
          message: e,
        },
      };
    }
    return PostObj;
  }

  /**
   * Get All Posts
   * @param {Object} eventBody
   * @returns {Promise} Promise object represent the status of the dynamoDB
   */
  async getAllPosts() {
    try {
      const res = await this.db.scanData(PostsTableName);
      return {
        code: enumeration.STATUS_CODE.OK,
        res,
      };
    } catch (e) {
      console.log(e);
      return {
        code: enumeration.STATUS_CODE.FAIL,
        data: {
          message: 'Server Error',
        },
      };
    }
  }

  /**
   * Get List of Posts
   * @param {Object} eventBody
   * @returns {Promise} Promise object represent the status of the dynamoDB
   */
  async getPost(pathParams) {
    const hashKey = {
      postId: pathParams.postId,
      postDate: parseInt(pathParams.postDate, 10),
    };
    try {
      const res = await this.db.getData(PostsTableName, hashKey);
      return {
        code: enumeration.STATUS_CODE.OK,
        items: res,
      };
    } catch (e) {
      console.log(e);
      return {
        code: enumeration.STATUS_CODE.FAIL,
        data: {
          message: 'Server Error',
        },
      };
    }
  }

  /**
   * Get List of Posts
   * @param {Object} eventBody
   * @returns {Promise} Promise object represent the status of the dynamoDB
   */
  async getPosts(userName) {
    const hashKey = {
      userName,
    };
    const additionalParam = {
      indexName: 'StatusIndex',
    };
    try {
      const res = await this.db.getDataBatch(PostsTableName, hashKey, additionalParam);
      return {
        code: enumeration.STATUS_CODE.OK,
        items: res,
      };
    } catch (e) {
      console.log(e);
      return {
        code: enumeration.STATUS_CODE.FAIL,
        data: {
          message: 'Server Error',
        },
      };
    }
  }

  async updatePost(pathParams, eventBody) {
    const tableKeys = {
      postId: pathParams.postId,
      postDate: parseInt(pathParams.postDate, 10),
    };
    const newValues = {
      comments: eventBody.comments,
    };

    try {
      await this.db.updateData(PostsTableName, tableKeys, newValues);

      return {
        code: enumeration.STATUS_CODE.OK,
        data: {
          message: 'Update Success',
        },
      };
    } catch (e) {
      console.log(e);
      return {
        code: enumeration.STATUS_CODE.FAIL,
        data: {
          message: 'Server Error',
        },
      };
    }
  }
}

const PostClass = new Post();
module.exports = PostClass;
