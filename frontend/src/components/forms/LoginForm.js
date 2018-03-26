import React from 'react'
import { Form, Button } from 'semantic-ui-react'
import InlineError from '../messages/InlineError'
import PropTypes from 'prop-types'

class LoginForm extends React.Component {
  state = {
    data: {
      name: '',
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
    if (!data.name) errors.name = 'Invalid usrname'
    if (!data.password) errors.password = "Can't be blank"
    return errors
  }

  render() {
    const { data, errors } = this.state

    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Field error={!!errors.name}>
          <label>UserID</label>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={this.onChange}
          />
          {errors.name && <InlineError text={errors.name} />}
        </Form.Field>
        <Form.Field error={!!errors.password}>
          <label>Password</label>
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
