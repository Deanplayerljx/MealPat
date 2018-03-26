import React from 'react'
import { Search, Grid, Header } from 'semantic-ui-react'
import axios from 'axios'

class SearchPage extends React.Component {
  state = {
    usrname: '',
    UID: 0,
    isLoading: false,
    results: [],
    value: '',
    rid: 0,
    name_address_rid: []
  }
  constructor(props) {
    super(props)
    this.state.UID = props.location.state.UID
    this.state.usrname = props.location.state.usrname
    var self = this
    axios
      .get('http://127.0.0.1:8000/search')
      .then(function(response) {
        console.log(response)
        self.state.name_address_rid = response.data.result.name_address_rid
        //  self.state.results = response.data.result.name_address_rid
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  submit = data => {
    var self = this
    axios
      .get('http://127.0.0.1:8000/restaurant/' + data)
      .then(function(response) {
        response.data.result.UID = self.state.UID
        response.data.result.name = self.state.name
        console.log(response.data.result)
        self.props.history.push({
          pathname: '/detail',
          state: response.data.result
        })
        //  self.state.results = response.data.result.name_address_rid
      })
      .catch(function(error) {
        console.log(error)
      })
  }
  componentWillMount() {
    this.resetComponent()
  }

  resetComponent = () => {
    this.setState({ isLoading: false, results: [], value: '', rid: '0' })
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title, rid: result.price })
    this.submit(result.price)
  }

  handleSearchChange = (e, { value }) => {
    console.log(this.state)
    this.setState({ isLoading: true, value })
    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()
      this.setState({
        isLoading: false,
        results: this.filter(value)
      })
    }, 500)
  }
  filter = value => {
    var filtered = []
    var restaurantInfo = this.state.name_address_rid
    var length = restaurantInfo.length
    for (var i = 0; i < length; i++) {
      if (restaurantInfo[i][0].search(new RegExp(value, 'i')) >= 0) {
        filtered.push({
          title: restaurantInfo[i][0] + restaurantInfo[i][2],
          description: restaurantInfo[i][1],
          price: restaurantInfo[i][2]
        })
      }
    }
    return filtered
  }

  render() {
    const { isLoading, value, results } = this.state
    return (
      <div>
        <h1> Start search now!</h1>
        <Grid>
          <Search
            size="small"
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
