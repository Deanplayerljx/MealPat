import React from 'react'
import { Form, Button } from 'semantic-ui-react'
import InlineError from '../messages/InlineError'
import PropTypes from 'prop-types'

class SignupForm extends React.Component {
  state = {
    data: {
      UID: '',
      phonenumber: '',
      interest: [],
      name: '',
      password: '',
      gender: '',
      address: ''
    },
    loading: false,
    errors: {}
  }

  onChange = e =>
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value }
    })

  onSubmit = e => {
    const errors = this.validate(this.state.data)
    this.setState({ errors })
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true })
      this.props.submit(this.state.data)
      //.catch(err => this.setState({errors:err.response.data.errors,loading = false}))
    }
  }

  validate = data => {
    const errors = {}
    if (!data.UID) errors.UID = 'Invalid username'
    if (!data.password) errors.password = "Can't be blank"
    return errors
  }

  render() {
    const { data, errors, loading } = this.state
    return (
      <Form onSubmit={this.onSubmit} loading={loading}>
        <Form.Group width="equal">
          <Form.Field error={!!errors.UID}>
            <label htmlFor="UID">UserName</label>
            <input
              type="text"
              id="UID"
              name="UID"
              value={data.UID}
              onChange={this.onChange}
            />
            {errors.UID && <InlineError text={errors.UID} />}
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
        </Form.Group>
        <Button primary>Sign Up</Button>
      </Form>
    )
  }
}

// SignupForm.propTypes = {
//   submit: PropTypes.func.isRequired
// }

export default SignupForm
