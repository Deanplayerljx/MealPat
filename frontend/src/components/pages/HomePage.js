import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => (
  <div>
    <h1>
      Welcome to the MealPat app, sign in to enjoy a wonderful meal experience.
    </h1>
    <Link to="/login">login</Link>
    <Link to="/signup">SignUp</Link>
  </div>
)
export default HomePage
