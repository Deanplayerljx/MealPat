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
      this.props.user_info['my_loc'],
      this.props.user_info['target_uid'],
      this.props.user_info['RID']
    )
  }

  render() {
    let user_info = this.props.user_info
    console.log('hi')
    console.log(user_info)
    const common_list = user_info.common_restaurant.map((value, idx) => {
      return <li key={idx}>{value}</li>
    })
    return (
      <div>
        <h2>Profile for the User {user_info.name}</h2>
        <ul>
          <li>gender: {user_info.gender}</li>
          <li>phonenumber: {user_info.phonenumber}</li>
          <li>interest: {user_info.interest}</li>
          <li>
            common restaurants have been: <ul>{common_list}</ul>
          </li>
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
