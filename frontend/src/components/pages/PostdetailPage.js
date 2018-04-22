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
      user_loc: props.location.state.user_loc,
      accompanies: props.location.state.accompanies,
      accompanies_name: props.location.state.accompanies_name,
      time: props.location.state.time,
      title: props.location.state.title,
      username: props.location.state.username,
      selected: false,
      creatername: props.location.state.creater_name,
      result: {}
    }
    console.log('come to post detail')
    //this.state = props.location.state
  }

  handleJoin = index => {
    console.log('handlejoin')
    const self = this
    var data = {}
    data.UID = this.state.CurrUID
    data.PID = this.state.PID
    // data.socket = this.state.socket
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
    data.user_loc = this.state.user_loc
    this.props.history.push({
      pathname: 'chatroom',
      state: data
    })
  }
  showCommon = e => {
    console.log('showcommon started')
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
      let self = this
      axios
        .get('http://127.0.0.1:8000/user', { params: data })
        .then(function(response) {
          console.log(response)
          let result = response.data.result
          result['my_loc'] = self.state.user_loc
          result['target_uid'] = data.clicked_uid
          result['RID'] = self.state.RID
          self.setState({ clicked_user_info: result })
          self.setState({ selected: true })
        })
        .catch(function(error) {
          console.log(error)
        })
    } else {
      alert('You have clicked yourself')
    }
  }

  findRouteHandler = (my_loc, target_uid, RID) => {
    let data = { my_loc: my_loc, target_uid: target_uid, RID: RID }
    console.log(data)
    this.props.history.push({
      pathname: 'navigate',
      state: data
    })
  }
  handleGoback = e => {
    this.props.history.goBack()
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
    const userInfo = this.state.selected ? (
      <UserInfo
        user_info={this.state.clicked_user_info}
        findRouteHandler={this.findRouteHandler}
      />
    ) : (
      <p>You can select the user id to see their information</p>
    )

    return (
      <div>
        <Button onClick={this.handleGoback}>Goback</Button>
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
        <div>{userInfo}</div>
      </div>
    )
  }
}

export default PostdetailPage
