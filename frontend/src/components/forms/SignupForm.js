import React from 'react'
import { Form, Button } from 'semantic-ui-react'
import InlineError from '../messages/InlineError'
import PropTypes from 'prop-types'
import axios from 'axios'

class SignupForm extends React.Component {
  state = {
    data: {
      phonenumber: '',
      interest: '',
      name: '',
      password: '',
      gender: '',
      address: ''
    },
    loading: false,
    errors: {},
    overall: ''
  }

  onChange = e => {
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value }
    })
  }

  onSubmit = e => {
    e.preventDefault()
    const errors = this.validate(this.state.data)
    this.setState({ errors })
    if (Object.keys(errors).length === 0) {
      var self = this
      this.setState({ loading: true })
      axios
        .post(`http://127.0.0.1:8000/sign_up`, this.state.data)
        .then(function(response) {
          self.props.submit()
        })
        .catch(function(error) {
          const errors = {}
          errors.name = error.response.data.message
          self.setState({
            errors,
            loading: false
          })
        })
    }
    console.log(this.state)
  }
  //  this.props.submit(this.state.data)
  //.catch(err => this.setState({errors:err.response.data.errors,loading = false}))

  validate = data => {
    const errors = {}
    if (!data.name) errors.name = 'Invalid username'
    if (!data.password) errors.password = "Can't be blank"
    if (!data.gender) errors.gender = "Can't be blank"
    return errors
  }

  render() {
    const { data, errors, loading } = this.state
    return (
      <Form onSubmit={this.onSubmit} loading={loading} size="big">
        <Form.Group width="equal">
          <Form.Field error={!!errors.name}>
            <label>Username</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Social name"
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
          <Form.Field error={!!errors.gender}>
            <label>Gender</label>
            <input
              type="text"
              id="gender"
              name="gender"
              placeholder="female / male"
              value={data.gender}
              onChange={this.onChange}
            />
            {errors.gender && <InlineError text={errors.gender} />}
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field error={!!errors.phonenumber}>
            <label>Phonenumber</label>
            <input
              type="text"
              id="phonenumber"
              name="phonenumber"
              placeholder="phonenumber"
              value={data.phonenumber}
              onChange={this.onChange}
            />
            {errors.phonenumber && <InlineError text={errors.phonenumber} />}
          </Form.Field>
          <Form.Field error={!!errors.address}>
            <label>Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="address"
              value={data.address}
              onChange={this.onChange}
            />
            {errors.address && <InlineError text={errors.address} />}
          </Form.Field>
        </Form.Group>
        <Form.Field error={!!errors.interest}>
          <label>interest</label>
          <input
            type="text"
            id="interest"
            name="interest"
            placeholder="Please split your interest by ' , ' eg: soccer,video gaming,singing"
            value={data.interest}
            onChange={this.onChange}
          />
          {errors.interest && <InlineError text={errors.interest} />}
        </Form.Field>
        <Button primary>Sign Up</Button>
      </Form>
    )
  }
}

SignupForm.propTypes = {
  submit: PropTypes.func.isRequired
}

export default SignupForm
