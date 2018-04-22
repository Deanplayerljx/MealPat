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
    <div class="log">
      <a href="login" class="nav">
        login
      </a>
    </div>
    <div class="sign">
      <a href="signup" class="nav">
        Signup
      </a>
    </div>
  </html>
)
export default HomePage
