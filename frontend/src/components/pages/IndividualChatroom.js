import React from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import { Button, TextArea, Form } from 'semantic-ui-react'
import '../../styles/chatroom.css'
class Chatroom extends React.Component {
  constructor(props) {
    console.log(props)
    super(props)
    this.state = props.location.state
    this.state['messages'] = []
    this.state['cur_message'] = ''
    // this.socket = this.state.socket
    this.socket = io.connect('http://127.0.0.1:8000')
    this.socket.on('connect', () => {
      console.log('connect success')
      console.log(this.state.username)
      this.socket.emit('join', {
        room: this.state.room,
        username: this.state.username,
        cid: this.state.CID,
        is_individual: true
      })
    })
    this.socket.on('message', msg => {
      this.addMessage(msg)
    })
    this.socket.on('join', username => {
      this.handleJoin(username)
    })

    this.socket.on('leave', username => {
      // this.handleJoin(username)
    })
    //  this.handleJoin = this.handleJoin.bind(this)
  }
  componentDidMount() {}
  handleSend = e => {}

  handleJoin = data => {
    if (data['username'] === this.state.username) {
      this.setState({
        messages: data['history']
      })
    } else {
      let messages = this.state.messages
      messages.push(data['username'] + ' joined chat.')
      this.setState({
        messages: messages
      })
    }
  }

  handleLeave = data => {
    if (data['username'] !== this.state.username) {
      let messages = this.state.messages
      messages.push(data['username'] + ' left chat.')
      this.setState({
        messages: messages
      })
    }
  }

  addMessage = msg => {
    let messages = this.state.messages
    messages.push(msg)
    console.log(messages)
    this.setState({
      messages: messages
    })
  }

  textChangeHandler = e => {
    let val = e.target.value
    this.setState({ cur_message: val })
    console.log(this.state)
  }

  handleSend = e => {
    e.preventDefault()
    console.log('source')
    console.log(this.state.source)
    this.socket.emit('individual_message', {
      source: this.state.source,
      target: this.state.target,
      message: this.state.cur_message,
      room: this.state.room,
      cid: this.state.CID
    })
    this.setState({
      cur_message: ''
    })
  }
  render() {
    // console.log(this.state)
    console.log(this.state.messages)
    const messages = this.state.messages.map((message, i) => {
      return <li key={i}>{message}</li>
    })

    return (
      <div className="container">
        <h1> Chatroom</h1>
        <div className="message-list">
          <ul>{messages}</ul>
        </div>
        <Form className="chat-input" onSubmit={this.handleSend.bind(this)}>
          <Form.Input
            type="text"
            onChange={this.textChangeHandler}
            value={this.state.cur_message}
            rows={1}
            placeholder="Write a message..."
          />
        </Form>
      </div>
    )
  }
}

export default Chatroom