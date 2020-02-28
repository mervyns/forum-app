import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useAuth0 } from '../utils/auth';

const Header = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { Item } = Menu;

  return (
    <Layout>
      <Layout.Header>
        <Menu
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '64px' }}
        >
          <Item key="home">
            <Link to="/">Home</Link>
          </Item>
          {!isAuthenticated && (<Item key="login" onClick={() => loginWithRedirect({})}>Log in</Item>)}
          {isAuthenticated && (
            <Item key="profile">
              <Link to="/profile">Profile</Link>
            </Item>
          )}
          {isAuthenticated && (
            <Item key="logout" onClick={() => logout()}>Log out</Item>
          )}
        </Menu>
      </Layout.Header>
    </Layout>
  );
};

export default Header;
