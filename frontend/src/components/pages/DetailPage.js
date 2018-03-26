import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'
import './../../styles/app.css'

class DetailPage extends React.Component {
  state = {
    RID: 0,
    UID: 0,
    usrname: '',
    address: '',
    categories: [],
    imageURL: '',
    name: '',
    phonenumber: '',
    posts: [
      [1, 'have fun', 'Sun, 25 Mar 2018 20:04:18 GMT'],
      [3, 'have fun', 'Sun, 25 Mar 2018 20:04:18 GMT'],
      [2, 'have fun', 'Sun, 25 Mar 2018 20:04:18 GMT']
    ],
    price: '',
    rating: ''
  }
  //  <img src={this.state.imageURL} />
  constructor(props) {
    console.log(props)
    super(props)
    this.state = props.location.state
  }
  render() {
    console.log(this.state)
    const postlist = this.state.posts
    //   <div>
    //     <h3> {this.state.address}</h3>
    //   </div>

    //  <ul>{this.state.posts}</ul>
    //   <ul>{this.state.posts.map(function(this.state.posts, index) {
    // return <li key={index}>{this.state.posts}</li>
    //  })} </ul
    return (
      <div>
        <h1>{this.state.name}</h1>
        <ul>
          {postlist.map(function(postlist, index) {
            return <li key={index}>{postlist}</li>
          })}
        </ul>
      </div>
    )
  }
}

export default DetailPage
