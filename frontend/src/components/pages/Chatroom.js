import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'

class Chatroom extends React.Component {
  submit = data => {
    console.log(data)
  }
  render() {
    return (
      <div>
        <h1> SignUp Page</h1>
        <LoginForm submit={this.submit} />
      </div>
    )
  }
}

export default Chatroom
