import React from 'react'
import { Link } from 'react-router-dom'
import SignupForm from '../forms/SignupForm'
import PropTypes from 'prop-types'

class SignUpPage extends React.Component {
  submit = data => {
    // this.props.signup(data).then(() =>

    this.props.history.push('/Search')
    console.log(data)
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
  }).isRequired,
  signup: PropTypes.func.isRequired
}

export default SignUpPage
