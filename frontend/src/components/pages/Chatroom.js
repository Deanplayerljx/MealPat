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
    console.log(this.state)
    // this.socket = this.state.socket
    this.socket = io.connect('http://127.0.0.1:8000')
    this.socket.on('connect', () => {
      console.log('connect success')
      // console.log(this.state)
      // console.log(this.socket)
      console.log(this.state.username)
      this.socket.emit('join', {
        cid: this.state.CID,
        room: this.state.CID,
        username: this.state.username,
        is_individual: false
      })
    })
    this.socket.on('message', msg => {
      console.log(msg)
      console.log('***')
      this.addMessage(msg)
    })
    this.socket.on('join', response => {
      this.handleJoin(response)
    })

    this.socket.on('leave', response => {
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
    this.socket.send({
      message: this.state.cur_message,
      room: this.state.CID,
      cid: this.state.CID,
      is_individual: false
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
