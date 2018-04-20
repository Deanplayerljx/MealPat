import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => (
  <html>
    <head>
    </head>
    <body>
      <link rel="stylesheet" href="style.css"></link>
    </body>
    <h1>Welcome to the MealPat app, sign in to enjoy a wonderful meal experience.
    <div>
    <a href="login" class="nav">login</a>
    </div>
    <div>

    <a href="signup" class="nav">Signup</a>
    </div>
    </h1>

  </html>
)
export default HomePage
