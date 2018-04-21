import React from 'react'
//import './../../styles/detail.css'
import axios from 'axios'
import { Button } from 'semantic-ui-react'
class UserInfo extends React.Component {
  constructor(props) {
    super(props)
  }

  find_route = e => {
    this.props.findRouteHandler(
      this.props.my_loc,
      this.props.target,
      this.props.RID
    )
  }

  render() {
    let user_info = this.props.user_info
    console.log('hi')
    console.log(user_info)
    return (
      <div>
        <h2>Profile for the User {user_info.name}</h2>
        <ul>
          <li>gender: {user_info.gender}</li>
          <li>phonenumber: {user_info.phonenumber}</li>
          <li>interest: {user_info.interest}</li>
          <li>common restaurants have been: {user_info.common_restraurant}</li>
        </ul>
        <Button primary onClick={this.find_route}>
          {' '}
          plan route!
        </Button>
      </div>
    )
  }
}

export default UserInfo
