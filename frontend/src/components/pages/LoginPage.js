import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'
import axios from 'axios'

class LoginPage extends React.Component {
  submit = data => {
    console.log(data)
    var self = this
    axios
      .get('http://127.0.0.1:8000/log_in', { params: data })
      .then(function(response) {
        console.log(response)
        console.log(response.data.result)
        response.data.result.username = data.name
        self.props.history.push({
          pathname: '/search',
          state: response.data.result
        })
      })
      .catch(function(error) {
        console.log(error)
      })
  }
  render() {
    return (
      <div>
        <h1> loginpage</h1>
        <LoginForm submit={this.submit} />
      </div>
    )
  }
}

export default LoginPage
