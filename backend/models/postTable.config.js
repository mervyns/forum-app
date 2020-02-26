'use strict';

const PostsTableName = 'Posts';
const PostsColumnName = {
	title : 'title',
	message : 'message',
	userName : 'userName',
	user : 'user',
	postId : 'postId',
	postDate : 'postDate',
	comments : 'comments',

};
const PostsTableIndexName = {
	IdUser: 'IdUser',
};


exports.PostsTableName = PostsTableName;
exports.PostsColumnName = PostsColumnName;
exports.PostsTableIndexName = PostsTableIndexName;
