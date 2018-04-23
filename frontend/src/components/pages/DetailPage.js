import React from 'react'
import './../../styles/detail.css'
import { Form, Button } from 'semantic-ui-react'
import axios from 'axios'

class DetailPage extends React.Component {
  state = {
    RID: 0,
    UID: 0,
    username: 'dean',
    address: '',
    categories: [],
    imageURL: '',
    name: 'hamburge',
    phonenumber: '',
    posts: [],
    price: '',
    rating: '',
    errors: '',
    posttitle: '',
    posttime: ''
  }
  //  <img src={this.state.imageURL} />
  constructor(props) {
    console.log(props)
    super(props)
    this.state = props.location.state
    this.state.posttitle = ''
    this.state.posttime = ''
    console.log(this.state)
    console.log(this.props)
    //  this.handleJoin = this.handleJoin.bind(this)
  }
  handleDetail = index => {
    console.log('handledetail')
    const self = this
    axios
      .get('http://127.0.0.1:8000/post/' + self.state.posts[index][0])
      .then(function(response) {
        var data = {}
        data = response.data.result
        data.CurrUID = self.state.UID
        data.username = self.state.username
        data.user_loc = self.state.user_loc
        console.log(data)
        self.props.history.push({
          pathname: 'postdetail',
          state: data
        })
      })
      .catch(function(error) {
        console.log(error)
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
        var newpost = []
        for (var i = 0; i < self.state.posts.length; i++) {
          if (i !== index) {
            newpost.push(self.state.posts[i])
          }
        }
        self.setState({ posts: newpost })
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

  onChange = e => {
    this.setState({
      ...this.state.data,
      [e.target.name]: e.target.value
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
        var newpost = self.state.posts
        let pid = response.data.result.PID
        newpost.push([pid, data.title, data.time])
        self.setState({ posts: newpost })
        // newpost.push(1000)
        // newpost.push(data.title)
        // newpost.push(data.time)

        console.log(response)
      })
      .catch(function(error) {
        if (error.response) {
          alert(error.response.data.message)
          console.log(error.response.data.message)
        }
        console.log(error)
      })
  }
  handleGoback = e => {
    this.props.history.goBack()
  }
  render() {
    console.log(this.state)
    var postlist = this.state.posts
    return (
      <div>
        <h1 className="headerD">{this.state.name}</h1>
        <Button onClick={this.handleGoback}>Goback</Button>
        <br />
        <img src={this.state.imageURL} width="500" height="400" />
        <br />
        <span>Address:&nbsp; {this.state.address}</span>
        <br />
        <span>Categories:&nbsp; {this.state.categories}</span>
        <br />
        <span>Phonenumber:&nbsp; {this.state.phonenumber}</span>
        <br />
        <span>Price:&nbsp; {this.state.price}</span>
        <br />
        <span>Rating:&nbsp; {this.state.rating}</span>
        <ul>
          {postlist.map((postlist, index) => {
            return (
              <li key={index}>
                Title:{postlist[1]}, &nbsp; Time: {postlist[2]} &nbsp;
                <Button
                  positive
                  size="tiny"
                  onClick={this.handleDetail.bind(this, index)}
                >
                  Get Detail
                </Button>
                <Button
                  negative
                  size="tiny"
                  onClick={this.handleDelete.bind(this, index)}
                >
                  Delete!
                </Button>
              </li>
            )
          })}
        </ul>
        <Form className="addpost" onSubmit={this.handleCreate}>
          <Form.Group widths="equal">
            <Form.Input
              placeholder="TITLE"
              name="posttitle"
              value={this.state.posttitle}
              onChange={this.onChange}
            />
            <Form.Input
              placeholder="TimeInFormat: YYYY-MM-DD HH:MM"
              name="posttime"
              value={this.state.posttime}
              onChange={this.onChange}
            />
            <Button>AddNew</Button>
          </Form.Group>
        </Form>
      </div>
    )
  }
}

export default DetailPage
