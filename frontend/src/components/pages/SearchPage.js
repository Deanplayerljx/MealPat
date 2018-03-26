import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../forms/LoginForm'
import { Search, Grid, Header } from 'semantic-ui-react'
import axios from 'axios'

class SearchPage extends React.Component {
  state = {
    UID: '',
    isLoading: false,
    results: [],
    value: '',
    rid: '',
    name_address_rid: []
  }
  constructor(props) {
    super(props)
    this.state.UID = props.location.state.UID
    var self = this
    axios
      .get('http://127.0.0.1:8000/search')
      .then(function(response) {
        console.log(response)
        self.state.name_address_rid = response.data.result.name_address_rid
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  submit = data => {
    console.log(data)
  }
  componentWillMount() {
    //  this.setState({ UID: this.props.location.state.UID })
    this.resetComponent()
  }

  resetComponent = () => {
    this.setState({ isLoading: false, results: [], value: '' })
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title })
  }
  handleSearchChange = (e, { value }) => {
    console.log(this.state)
    this.setState({ isLoading: true, value })
  }

  render() {
    const { isLoading, value, results } = this.state
    return (
      <div>
        <h1> Start search now!</h1>
        <Grid columns={16}>
          <Search
            fluid
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={this.handleSearchChange}
            results={results}
            value={value}
            {...this.props}
          />
        </Grid>
      </div>
    )
  }
}

export default SearchPage
