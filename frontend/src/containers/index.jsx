import React, { useEffect, useState } from 'react';
import {
  Col, Modal, Button, Row,
} from 'antd';
import axios from 'axios';

import FormComponent from '../components/Form';
import ListComponent from '../components/List';
import FormContext from '../context/FormContext';
import { useAuth0 } from '../utils/auth';


const IndexContainer = () => {
  const [loading, changeLoading] = useState(true);
  const [showModal, toggleShowModal] = useState(false);
  const [postsList, updatePostsList] = useState([]);
  const [postsCount, updatePostsCount] = useState();
  const [postState, updatePost] = useState({ title: '', message: '' });

  const { user } = useAuth0();

  const setTitle = (e) => {
    updatePost({ ...postState, title: e.target.value });
  };

  const setMessage = (e) => {
    updatePost({ ...postState, message: e.target.value });
  };

  const sorter = (a, b) => {
    let comparison = 0;
    if (a.postDate > b.postDate) {
      comparison = -1;
    } else {
      comparison = 1;
    }
    return comparison;
  };

  const getPosts = () => {
    axios.get('http://127.0.0.1:3000/posts/list')
      .then((response) => {
        const sortedArray = response.data.res.Items.sort(sorter);
        updatePostsList(sortedArray);
        updatePostsCount(response.data.res.Count);
        changeLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const submitPost = () => {
    axios.post('http://127.0.0.1:3000/posts/create', {
      ...postState,
      user,
    })
      .then((response) => {
        updatePost({ title: '', message: '' });
        updatePostsCount(postsCount + 1);
        toggleShowModal(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getPosts();
  }, [postsCount]);

  return (
    <div>
      <FormContext.Provider
        value={{
          setTitle,
          setMessage,
        }}
      >
        <Row align="middle">
          <div className="title-container">
            <Col s={24} l={18}>
              <h1>
                X---it Forum Management App
              </h1>
            </Col>
            <Col s={24} l={6}>
              <Button type="primary" onClick={() => (toggleShowModal(true))}>
                Create New Post
              </Button>
            </Col>
          </div>
        </Row>
        <div>
          <ListComponent
            posts={postsList}
            loading={loading}
          />
        </div>
        <Modal
          title="Create New Post"
          visible={showModal}
          onCancel={() => toggleShowModal(false)}
          onOk={submitPost}
        >
          <FormComponent />
        </Modal>
      </FormContext.Provider>
    </div>
  );
};

export default IndexContainer;
