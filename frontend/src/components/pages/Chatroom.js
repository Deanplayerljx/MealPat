import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'

class Chatroom extends React.Component {
  state = {}
  constructor(props) {
    console.log(props)
    super(props)
    this.state = props.location.state
    //  this.handleJoin = this.handleJoin.bind(this)
  }

  render() {
    console.log(this.state)
    return (
      <div>
        <h1> Chatroom</h1>
      </div>
    )
  }
}

export default Chatroom
