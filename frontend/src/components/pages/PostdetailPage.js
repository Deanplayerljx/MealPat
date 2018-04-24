import React from 'react'
import './../../styles/postdetail.css'
import { Form, Button } from 'semantic-ui-react'
import axios from 'axios'
import io from 'socket.io-client'
import UserInfo from './UserInfo'

class PostdetailPage extends React.Component {
  constructor(props) {
    super(props)
    console.log('hiiii')
    console.log(this.props.location.state)
    this.state = this.props.location.state
    this.state['selected'] = false
    this.state['result'] = {}
    this.state['accompanies_name'] = []
    console.log(this.state)
    //this.state = props.location.state
  }

  componentDidMount() {
    let self = this
    axios
      .get('http://127.0.0.1:8000/post/' + this.state.PID)
      .then(function(response) {
        var data = {}
        data = response.data.result
        console.log('****')
        console.log(data)
        self.setState(data)
      })
      .catch(function(error) {
        console.log(error)
      })
  }
  handleJoin = index => {
    console.log('handlejoin')
    const self = this
    var data = {}
    data.UID = this.state.UID
    data.PID = this.state.PID
    // data.socket = this.state.socket
    console.log(data)
    axios
      .put(`http://127.0.0.1:8000/join_post`, data)
      .then(function(response) {
        var newlist = self.state.accompanies_name
        newlist.push(self.state.username)
        self.setState({ accompanies_name: newlist })

        console.log(newlist)
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
    data.cur_uid = self.state.UID
    if (self.state.creater_name == e[1]) {
      data.clicked_uid = self.state.creater_uid
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

    const accompanylist = this.state.accompanies_name.map((person, index) => {
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
      <span>You can select the user id to see their information</span>
    )

    return (
      <div className="pdcontainer">
        <h1 className="headerP"> Title: {this.state.title}</h1>
        <Button onClick={this.handleGoback}>Goback</Button>
        <br />
        <span>Time:&nbsp; {this.state.time}</span>
        <br />
        <span>
          CreaterName:&nbsp;
          <a
            onClick={this.handleFindC.bind(this, [
              this.state.creater_uid,
              this.state.creater_name
            ])}
          >
            {this.state.creater_name}
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
