import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'
import { Button } from 'semantic-ui-react'
import axios from 'axios'
import '../../styles/login.css'

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
        alert('Wrong password or user not exist')
      })
  }
  handleback = e => {
    console.log(this.props.history)
    this.props.history.goBack()
  }
  render() {
    return (
      <div>
        <Button onClick={this.handleback} className="back">
          HomePage
        </Button>
        <div className="login">
          <h1> loginpage</h1>
          <LoginForm submit={this.submit} />
        </div>
      </div>
    )
  }
}

export default LoginPage
