import React from 'react'
import './../../styles/detail.css'
import { Form, Button } from 'semantic-ui-react'
import axios from 'axios'
import io from 'socket.io-client'
class PostdetailPage extends React.Component {
  state = {
    CID: 0,
    CurrUID: 0,
    PID: 13,
    RID: 1,
    UID: 1,
    accompanies: [],
    time: '',
    title: '',
    usrname: ''
  }

  constructor(props) {
    super(props)
    console.log(this.state)
    this.state = props.location.state
  }

  handleJoin = index => {
    console.log('handlejoin')
    const self = this
    var data = {}
    data.UID = this.state.CurrUID
    data.PID = this.state.PID
    console.log(data)
    axios
      .put(`http://127.0.0.1:8000/join_post`, data)
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error.response)
        if (error.response) {
          alert(error.response.data.message)
          console.log(error.response.data.message)
        }
      })
  }

  handleChat = index => {
    console.log('handleDelete')
    const self = this
    var data = {}
    data.UID = this.state.UID
    data.PID = this.state.CID
    data.usrname = this.state.usrname

    this.props.history.push({
      pathname: 'chatroom',
      state: data
    })
  }

  render() {
    console.log('render is called')
    console.log(this.state)
    const self = this.state
    return (
      <div>
        <h1> Title: {this.state.title}</h1>
        <span>Time:&nbsp; {self.time}</span>
        <br />
        <span>CreaterId:&nbsp; {this.state.CID}</span>
        <br />
        <span>Accompanies:&nbsp; {this.state.accompanies}</span>
        <br />
        <Button positive size="tiny" onClick={this.handleJoin.bind(this)}>
          Join!
        </Button>
        <Button positive size="tiny" onClick={this.handleChat.bind(this)}>
          Start Chat!
        </Button>
      </div>
    )
  }
}

export default PostdetailPage
