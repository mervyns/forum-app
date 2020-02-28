import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import AuthWrapper from './components/AuthWrapper';
import IndexContainer from './containers/index';
import ProfileContainer from './containers/profile';
import PostContainer from './containers/post';
import { useAuth0 } from './utils/auth';
import './App.css';

function App() {
  const { loading } = useAuth0();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Header />
      <Layout.Content className="body-container">
        <Switch>
          <Route exact path="/" component={IndexContainer} />
          <Route exact path="/post/:date/:id" component={PostContainer} />
          <AuthWrapper path="/profile" component={ProfileContainer} />
        </Switch>
      </Layout.Content>
    </BrowserRouter>
  );
}

export default App;
