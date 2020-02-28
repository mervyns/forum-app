import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Card } from 'antd';

const PostComponent = (props) => {
  const { post } = props;
  const {
    title,
    message,
    postDate,
    postId,
  } = post;


  return (
    <>
      <Card
        title={(
          <Link to={`/post/${postDate}/${postId}`}>
            {title}
          </Link>
        )}
        headStyle={{
          backgroundColor: '#F0A95B',
        }}
        className="post-card"
      >
        <Avatar
          src={post.user.picture}
          style={{
            marginRight: '0.5rem',
          }}
        />
        {message}
      </Card>
    </>
  );
};

PostComponent.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    postId: PropTypes.string,
    postDate: PropTypes.number,
    user: PropTypes.shape({
      picture: PropTypes.string,
    }),
  }),
};

PostComponent.defaultProps = {
  post: {
    title: 'title',
    message: 'message',
    postDate: '',
    postId: '',
    user: {
      picture: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    },
  },
};

export default PostComponent;
