import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';
import PostComponent from './Post';

const ListComponent = (props) => {
  const { posts, loading } = props;


  return (
    <>
      <List
        itemLayout="vertical"
        loading={loading}
        size="large"
        pagination={{
          pageSize: 5,
        }}
        dataSource={posts}
        renderItem={(item) => (
          <List.Item>
            <PostComponent
              key={item.postId}
              post={item}
            />
          </List.Item>
        )}
      />
    </>
  );
};

ListComponent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  posts: PropTypes.array,
  loading: PropTypes.bool,
};

ListComponent.defaultProps = {
  posts: {},
  loading: true,
};

export default ListComponent;
