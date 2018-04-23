import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => (
  <html>
    <head />
    <body>
      <link rel="stylesheet" href="style.css" />
    </body>
    <h1>
      Welcome to the MealPat app, sign in to enjoy a wonderful meal experience.
    </h1>
    <div className="log">
      <a href="login" className="nav">
        <button type="button">Login</button>
      </a>
    </div>
    <div className="sign">
      <a href="signup" className="nav">
        <button type="button">Signup</button>
      </a>
    </div>
  </html>
)
export default HomePage
