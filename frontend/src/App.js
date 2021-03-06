import React from 'react'
import './styles/app.css'
import { Route } from 'react-router-dom'
import HomePage from './components/pages/HomePage'
import LoginPage from './components/pages/LoginPage'
import SignUpPage from './components/pages/SignUpPage'
import SearchPage from './components/pages/SearchPage'
import DetailPage from './components/pages/DetailPage'
import Chatroom from './components/pages/Chatroom'
import PostdetailPage from './components/pages/PostdetailPage'
import SimpleMap from './components/pages/Maps'
import Navigation from './components/pages/Navigation'
import IndividualChatroom from './components/pages/IndividualChatroom'
const App = () => (
  <div className="ui container">
    <Route path="/" exact component={HomePage} />
    <Route path="/login" exact component={LoginPage} />
    <Route path="/signup" exact component={SignUpPage} />
    <Route path="/search" exact component={SearchPage} />
    <Route path="/detail" exact component={DetailPage} />
    <Route path="/chatroom" exact component={Chatroom} />
    <Route path="/postdetail" exact component={PostdetailPage} />
    <Route path="/map" exact component={SimpleMap} />
    <Route path="/navigate" exact component={Navigation} />
    <Route path="/individual_chat" exact component={IndividualChatroom} />
  </div>
)

export default App
