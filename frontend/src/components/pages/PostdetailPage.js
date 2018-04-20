import React from 'react'
import './../../styles/detail.css'
import { Form, Button } from 'semantic-ui-react'
import axios from 'axios'
import io from 'socket.io-client'
import UserInfo from './UserInfo'

class PostdetailPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      CID: props.location.state.CID,
      CurrUID: props.location.state.CurrUID,
      PID: props.location.state.PID,
      RID: props.location.state.RID,
      UID: props.location.state.UID,
      accompanies: props.location.state.accompanies,
      accompanies_name: props.location.state.accompanies_name,
      time: props.location.state.time,
      title: props.location.state.title,
      username: props.location.state.username,
      selected: false,
      creatername: props.location.state.creater_name,
      result: {}
    }
    console.log(this.state)
    //this.state = props.location.state
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
    data.CID = this.state.CID
    data.username = this.state.username

    this.props.history.push({
      pathname: 'chatroom',
      state: data
    })
  }
  showCommon = e => {
    console.log('showcommon started')
    if (this.state.selected) {
      return <UserInfo result={this.state.result} />
    } else {
      return <p>You can select the user id to see their information</p>
    }
  }

  handleFindC = e => {
    console.log('handlefindc begin')
    console.log(e)
    var self = this
    var data = {}
    data.cur_uid = self.state.CurrUID
    if (self.state.creatername == e[1]) {
      data.clicked_uid = self.state.UID
    } else {
      data.clicked_uid = self.state.accompanies[e[0]]
    }
    console.log(data)
    if (data.cur_uid != data.clicked_uid) {
      axios
        .get('http://127.0.0.1:8000/user', { params: data })
        .then(function(response) {
          console.log(response)
          self.setState({ result: response.data.result })
          self.setState({ selected: true })
        })
        .catch(function(error) {
          console.log(error)
        })
    } else {
      alert('You have clicked yourself')
    }
  }
  render() {
    console.log('render is called')
    console.log(this.state)
    const self = this.state
    const accompanylist = self.accompanies_name.map((person, index) => {
      return (
        <li key={index}>
          <a onClick={this.handleFindC.bind(this, [index, person])}>{person}</a>
        </li>
      )
    })
    return (
      <div>
        <h1> Title: {this.state.title}</h1>
        <span>Time:&nbsp; {self.time}</span>
        <br />
        <span>
          CreaterName:&nbsp;
          <a
            onClick={this.handleFindC.bind(this, [
              this.state.UID,
              this.state.creatername
            ])}
          >
            {this.state.creatername}
          </a>
        </span>
        <br />
        <span>
          Accompanies:&nbsp;<ul>{accompanylist}</ul>
        </span>
        <br />
        <Button positive size="tiny" onClick={this.handleJoin.bind(this)}>
          Join!
        </Button>
        <Button positive size="tiny" onClick={this.handleChat.bind(this)}>
          Start Chat!
        </Button>
        <div>{this.showCommon()}</div>
      </div>
    )
  }
}

export default PostdetailPage
