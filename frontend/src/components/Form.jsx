import React from 'react';
import { Form, Input } from 'antd';
import FormContext from '../context/FormContext';

const FormComponent = () => (
  <>
    <FormContext.Consumer>
      {({ setTitle, setMessage }) => (
        <Form className="login-form">
          <Form.Item>
            <Input
              placeholder="Title"
              onChange={setTitle}
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Your thoughts please?"
              onChange={setMessage}
            />
          </Form.Item>
        </Form>
      )}
    </FormContext.Consumer>
  </>
);

export default FormComponent;
