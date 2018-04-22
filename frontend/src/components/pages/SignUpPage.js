import React from 'react'
import { Link } from 'react-router-dom'
import SignupForm from '../forms/SignupForm'
import { Button } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import axios from 'axios'
import '../../styles/signup.css'

class SignUpPage extends React.Component {
  submit = data => {
    this.props.history.push('/login')
  }
  handleback = e => {
    this.props.history.goBack()
  }
  render() {
    return (
      <div>
        <Button onClick={this.handleback} className="back">
          HomePage
        </Button>
        <div className="signup">
          <h1> SignUp Page</h1>
          <SignupForm submit={this.submit} />
        </div>
      </div>
    )
  }
}

SignUpPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
}

export default SignUpPage
