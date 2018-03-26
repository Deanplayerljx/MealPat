import React from 'react'
import { Link } from 'react-router-dom'
import SignupForm from '../forms/SignupForm'
import PropTypes from 'prop-types'
import axios from 'axios'

class SignUpPage extends React.Component {
  submit = data => {
    this.props.history.push('/login')
  }

  render() {
    return (
      <div>
        <h1> SignUp Page</h1>
        <SignupForm submit={this.submit} />
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
