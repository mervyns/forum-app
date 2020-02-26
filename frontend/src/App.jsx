import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import AuthWrapper from './components/AuthWrapper';
import IndexContainer from './containers/index';
import ProfileContainer from "./containers/profile";
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
      <Layout.Content style={{ padding: '0 50px' }}>
        <Switch>
          <Route exact path="/" component={IndexContainer} />
          <AuthWrapper path="/profile" component={ProfileContainer} />
        </Switch>
      </Layout.Content>
    </BrowserRouter>
  );
}

export default App;