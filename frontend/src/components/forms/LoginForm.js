import React from 'react'
import { Form, Button } from 'semantic-ui-react'
import InlineError from '../messages/InlineError'
import PropTypes from 'prop-types'

class LoginForm extends React.Component {
  state = {
    data: {
      usrname: '',
      password: ''
    },
    loading: false,
    errors: {}
  }

  onChange = e =>
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value }
    })

  onSubmit = () => {
    const errors = this.validate(this.state.data)
    this.setState({ errors })
    if (Object.keys(errors).length === 0) {
      this.props.submit(this.state.data)
    }
  }

  validate = data => {
    const errors = {}
    if (!data.usrname) errors.usrname = 'Invalid username'
    if (!data.password) errors.password = "Can't be blank"
    return errors
  }

  render() {
    const { data, errors } = this.state

    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Field error={!!errors.usrname}>
          <label htmlFor="usrname">UserName</label>
          <input
            type="text"
            id="usrname"
            name="usrname"
            value={data.usrname}
            onChange={this.onChange}
          />
          {errors.usrname && <InlineError text={errors.usrname} />}
        </Form.Field>
        <Form.Field error={!!errors.password}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Make it secure"
            value={data.password}
            onChange={this.onChange}
          />
          {errors.password && <InlineError text={errors.password} />}
        </Form.Field>
        <Button primary> Login</Button>
      </Form>
    )
  }
}

LoginForm.propTypes = {
  submit: PropTypes.func.isRequired
}

export default LoginForm
