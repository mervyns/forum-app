/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button, Card, Form, Input, Skeleton, Timeline,
} from 'antd';
import moment from 'moment';

import { useAuth0 } from '../utils/auth';

const PostContainer = (props) => {
  const [loading, changeLoading] = useState(true);
  const [postData, setPostData] = useState({});
  const [commentState, setComment] = useState({ title: '', message: '' });

  const { match, form } = props;
  const { getFieldDecorator, validateFields } = form;
  const { params } = match;
  const { date, id } = params;

  const { user } = useAuth0();

  const getPost = () => {
    axios.get(`http://127.0.0.1:3000/post/${date}/${id}`)
      .then((response) => {
        setPostData(response.data.items);
        changeLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const setTitle = (e) => {
    setComment({ ...commentState, title: e.target.value });
  };

  const setMessage = (e) => {
    setComment({ ...commentState, message: e.target.value });
  };

  const handleClick = () => {
    setComment({ ...commentState, user });
    validateFields((err, values) => {
      if (err) {
        console.log(err, values);
      } else {
        console.log([...postData.comments, commentState]);
        axios.post(`http://127.0.0.1:3000/post/${date}/${id}`, {
          comments: [
            commentState,
            ...postData.comments,
          ],
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
          .then(() => {
            setComment({ title: '', message: '' });
            form.resetFields();
            console.log('done');
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const formRules = [
    { required: true, message: 'Field is Required' },
  ];

  useEffect(() => {
    getPost();
    setComment({ ...commentState, user });
  }, [loading]);

  const dateTime = moment(postData.postDate).format('LLLL');
  return (
    <>
      <div>
        <h1>View Post</h1>
        <Skeleton loading={loading} active />
        {!loading && (
        <div>
          <Card title={postData.title}>
            <p>{postData.message}</p>
            <p>Posted on: {dateTime}</p>
          </Card>
          <div>
            <h1>Comments</h1>
            {postData.comments === undefined || postData.comments.length === 0
              ? <h1>No Comments Yet</h1>
              : (
                <Timeline>
                  {postData.comments.map((comment) => (
                    <Timeline.Item key={comment.index}>
                      <p>Title: {comment.title}</p>
                      <p>Comment: {comment.message}</p>
                      <p>Posted By: {comment.user ? comment.user.name : 'Anonymous'}</p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
          </div>
          <Form className="comments-form">
            <h1>Post your comment</h1>
            <Form.Item>
              {getFieldDecorator('title', { initialValue: '', rules: formRules })(
                <Input
                  placeholder="Title"
                  onChange={setTitle}
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('message', { initialValue: '', rules: formRules })(
                <Input
                  placeholder="Your comments please?"
                  onChange={setMessage}
                />,
              )}
            </Form.Item>
            <Button type="primary" onClick={handleClick}>
              Submit
            </Button>
          </Form>
        </div>
        )}
      </div>
    </>
  );
};

export default Form.create()(PostContainer);
