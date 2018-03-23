import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'
import { Search, Grid, Header } from 'semantic-ui-react'

class SearchPage extends React.Component {
  state = {
    isLoading: false,
    results: [],
    value: ''
  }
  submit = data => {
    console.log(data)
  }
  componentWillMount() {
    this.resetComponent()
  }

  resetComponent = () => {
    this.setState({ isLoading: false, results: [], value: '' })
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title })
  }
  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
  }

  render() {
    const { isLoading, value, results } = this.state
    return (
      <div>
        <h1> Start search now!</h1>
        <Grid>
          <Grid.Column width={8}>
            <Search
              loading={isLoading}
              onResultSelect={this.handleResultSelect}
              onSearchChange={this.handleSearchChange}
              results={results}
              value={value}
              {...this.props}
            />
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default SearchPage
