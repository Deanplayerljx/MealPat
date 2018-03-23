import React from 'react'
import './styles/app.css'
import { Route } from 'react-router-dom'
import HomePage from './components/pages/HomePage'
import LoginPage from './components/pages/LoginPage'
import SignUpPage from './components/pages/SignUpPage'
import SearchPage from './components/pages/SearchPage'
import DetailPage from './components/pages/DetailPage'
import Chatroom from './components/pages/Chatroom'

const App = () => (
  <div className="ui container">
    <Route path="/" exact component={HomePage} />
    <Route path="/login" exact component={LoginPage} />
    <Route path="/signup" exact component={SignUpPage} />
    <Route path="/search" exact component={SearchPage} />
    <Route path="/detail" exact component={DetailPage} />
    <Route path="/chatroom" exact component={Chatroom} />
  </div>
)

export default App
