import React from 'react'
//import './../../styles/detail.css'
import axios from 'axios'

const UserInfo = ({ result }) => {
  console.log(result)
  return (
    <div>
      <h2>Profile for the User {result.name}</h2>

      <ul>
        <li>gender: {result.gender}</li>
        <li>phonenumber: {result.phonenumber}</li>
        <li>interest: {result.interest}</li>

        <li>common restaurants have been: {result.common_restraurant}</li>
      </ul>
    </div>
  )
}

export default UserInfo
