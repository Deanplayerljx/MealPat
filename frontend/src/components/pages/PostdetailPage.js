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
    usrname: '',
    selected_id: '',
    selected: false
  }

  constructor(props) {
    super(props)
    console.log(this.state)
    this.state = props.location.state
    this.state.selected = false
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
  showCommon = e => {
    if (this.state.selected) {
      return <Button> fdsuii </Button>
    } else {
      return (
        <p>You can select the user id to see common restaurants have been</p>
      )
    }
  }

  handleFindC = e => {
    console.log(e)
    this.setState({ selected: true })
  }
  render() {
    console.log('render is called')
    console.log(this.state)
    const self = this.state
    const accompanylist = self.accompanies.map(person => {
      return (
        <li key={person}>
          <a onClick={this.handleFindC.bind(this, person)}>{person}</a>
        </li>
      )
    })
    return (
      <div>
        <h1> Title: {this.state.title}</h1>
        <span>Time:&nbsp; {self.time}</span>
        <br />
        <span>
          CreaterId:&nbsp;
          <a onClick={this.handleFindC.bind(this, this.state.CID)}>
            {this.state.CID}
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
