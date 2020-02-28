/* Dependencies */
import React from 'react';
import { shallow } from 'enzyme';

/* Components */
import PostComponent from '../components/Post'

const post = {
    title: 'post title',
    message: 'post message',
    postDate: 'post date',
    postId: 'post id',
    comments: [
      {
        title: 'comment 1',
        message: 'comment 1'
    }
    ]
}

describe('<PostComponent />', () => {
  const wrapper = shallow(<PostComponent props={post}/>);
  it('renders card', () => {
    expect(wrapper.find('Card')).toHaveLength(1)
  })
})