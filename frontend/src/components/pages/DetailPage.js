import React from 'react'
import './../../styles/detail.css'
import { Form, Button } from 'semantic-ui-react'
import axios from 'axios'

class DetailPage extends React.Component {
  state = {
    RID: 0,
    UID: 0,
    usrname: 'dean',
    address: '',
    categories: [],
    imageURL: '',
    name: 'hamburge',
    phonenumber: '',
    posts: [
      [1, 'have fun', 'Sun, 25 Mar 2018 20:04:18 GMT'],
      [3, 'have fun', 'Sun, 25 Mar 2018 20:04:18 GMT'],
      [2, 'have fun', 'Sun, 25 Mar 2018 20:04:18 GMT']
    ],
    price: '',
    rating: '',
    errors: ''
  }
  //  <img src={this.state.imageURL} />
  constructor(props) {
    console.log(props)
    super(props)
    this.state = props.location.state
    this.state.posttitle = 'helloworld'
    this.state.posttime = '2017-05-30 05:12'
    console.log(this.state)
    //  this.handleJoin = this.handleJoin.bind(this)
  }
  handleJoin = index => {
    console.log('handlejoin')
    const self = this
    var data = {}
    data.UID = this.state.UID
    data.PID = this.state.posts[index][0]
    console.log(data)
    axios
      .put(`http://127.0.0.1:8000/join_post`, data)
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error.response)
        // const errors = {}
        // errors.name = error.response.data.message
        // self.setState({
        //   errors
        //   //  loading: false
        // })
      })
  }

  handleDelete = index => {
    console.log('handleDelete')
    const self = this
    var data = {}
    data.UID = this.state.UID
    data.PID = this.state.posts[index][0]
    console.log(data)
    axios
      .delete(`http://127.0.0.1:8000/delete_post`, { data })
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error.response)
        // const errors = {}
        // errors.name = error.response.data.message
        // self.setState({
        //   errors
        //   //  loading: false
        // })
      })
  }

  handleCreate = e => {
    console.log('handleCreate')
    const self = this
    var data = {}
    data.UID = this.state.UID
    data.RID = this.state.RID
    data.title = this.state.posttitle
    data.time = this.state.posttime
    console.log(data)
    axios
      .post(`http://127.0.0.1:8000/new_post`, data)
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error.response)
      })
  }
  render() {
    console.log(this.state)
    var postlist = this.state.posts
    return (
      <div>
        <h1>{this.state.name}</h1>
        <ul>
          {postlist.map((postlist, index) => {
            return (
              <li key={index}>
                Title:{postlist[1]}, &nbsp; Time: {postlist[2]} &nbsp;
                <Button
                  positive
                  size="tiny"
                  onClick={this.handleJoin.bind(this, index)}
                >
                  Join!
                </Button>
                <Button
                  negative
                  size="tiny"
                  onClick={this.handleDelete.bind(this, index)}
                >
                  Quit!
                </Button>
              </li>
            )
          })}
        </ul>
        <Button secondary onClick={this.handleCreate}>
          Add New One
        </Button>
      </div>
    )
  }
}

export default DetailPage
