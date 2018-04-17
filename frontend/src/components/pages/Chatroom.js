import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'
import { Form, Button } from 'semantic-ui-react'
import io from 'socket.io-client'
class Chatroom extends React.Component {
  constructor(props) {
    console.log(props)
    super(props)
    this.state = props.location.state
    this.state['messages'] = ['hi', 'how are you']
    this.socket = io.connect('http://127.0.0.1:8000')
    this.socket.on('connect', () => {
      console.log('connect success')
    })
    this.socket.on('message', function() {
      console.log('receive message')
    })
    //  this.handleJoin = this.handleJoin.bind(this)
  }
  componentDidMount() {}
  handleSend = e => {}

  textChangeHandler = e => {
    let val = e.target.value
    this.setState({ cur_message: val })
    console.log(this.state)
  }

  render() {
    console.log(this.state)
    const messages = this.state.messages.map((message, i) => {
      return <li key={i}>{message}</li>
    })

    return (
      <div>
        <h1> Chatroom</h1>
        <div>
          <ul>{messages}</ul>
        </div>
        <input
          type="text"
          onChange={this.textChangeHandler}
          value={this.state.cur_message}
          placeholder="Write a message..."
          required
        />
        <Button positive size="tiny" onClick={this.handleSend.bind(this)}>
          send
        </Button>
      </div>
    )
  }
}

export default Chatroom
