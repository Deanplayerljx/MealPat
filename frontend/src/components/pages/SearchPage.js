import React from 'react'
import { Search, Grid, Header, Button, Dropdown } from 'semantic-ui-react'
import axios from 'axios'
import Map from './Maps'
import '../../styles/searchPage.css'

class SearchPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: props.location.state.username,
      UID: props.location.state.UID,
      isLoading: false,
      results: [],
      value: '',
      rid: 0,
      name_address_rid_lati_longi: [],
      isUserResult: true,
      isSpecific: false,
      defaultCenter: [props.location.state.lati, props.location.state.longi],
      nearList: [],
      userDistance: 0,
      restaurantDistance: 0
    }
    console.log('hiiii')
    console.log(this.state)
    var self = this
    axios
      .get('http://127.0.0.1:8000/search')
      .then(function(response) {
        console.log(response)
        self.state.name_address_rid_lati_longi =
          response.data.result.name_address_rid_lati_longi
        console.log(self)
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
        response.data.result.username = self.state.username

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
    var self = this
    axios
      .get('http://127.0.0.1:8000/restaurant/' + result.price)
      .then(function(response) {
        console.log(response.data.result)
        self.setState({
          isSpecific: true,
          isUserResult: true,
          isNearUser: false,
          nearList: [response.data.result]
        })
      })
      .catch(function(error) {
        console.log(error)
      })

    // this.setState({ value: result.title, rid: result.price })
    // this.submit(result.price)
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()
      this.setState({
        isLoading: false,
        results: this.filter(value)
      })
      console.log('hiiii')
      console.log(this.state.results)
    }, 500)
  }

  handleSelectUserDist = (e, data) => {
    console.log(data.value)
    this.setState({ userDistance: data.value })
  }

  handleSelectRestaurantDist = (e, data) => {
    console.log(data.value)
    this.setState({ restaurantDistance: data.value })
  }

  discoverUser = (e, data) => {
    let self = this
    let params = { UID: this.state.UID, distance: this.state.userDistance }
    axios
      .get('http://127.0.0.1:8000/findnearuser', (params = { params }))
      .then(function(response) {
        console.log(response)
        self.setState({
          nearList: response.data.result,
          isNearUser: true,
          isSpecific: false
        })
        // self.state.name_address_rid_lati_longi = response.data.result.name_address_rid_lati_longi
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  discoverRestaurant = (e, data) => {
    let self = this
    let params = {
      UID: this.state.UID,
      distance: this.state.restaurantDistance
    }
    axios
      .get('http://127.0.0.1:8000/findnearrest', (params = { params }))
      .then(function(response) {
        console.log(response)
        self.setState({
          nearList: response.data.result,
          isNearUser: false,
          isSpecific: false
        })
        // self.state.name_address_rid_lati_longi = response.data.result.name_address_rid_lati_longi
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  filter = value => {
    var filtered = []
    var restaurantInfo = this.state.name_address_rid_lati_longi
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
    // console.log(filtered)
    return filtered
  }

  render() {
    const {
      isLoading,
      value,
      results,
      nearList,
      defaultCenter,
      isNearUser
    } = this.state

    console.log(defaultCenter)
    const dropdown_options = [
      { value: '100', text: 'in 100 m' },
      { value: '500', text: 'in 500 m' },
      { value: '1000', text: 'in 1000 m' },
      { value: '2000', text: 'in 2000 m' },
      { value: '5000', text: 'in 5000 m' }
    ]
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
            placeholder="direct search"
            {...this.props}
          />

          <Dropdown
            options={dropdown_options}
            placeholder="find nearby users..."
            onChange={this.handleSelectUserDist}
            selection
          />
          <Button primary onClick={this.discoverUser}>
            {' '}
            Discover User
          </Button>

          <Dropdown
            options={dropdown_options}
            placeholder="find nearby restaurants..."
            onChange={this.handleSelectRestaurantDist}
            selection
          />
          <Button primary onClick={this.discoverRestaurant}>
            {' '}
            Discover Restaurants
          </Button>
          <Link to="/login">Signout</Link>
        </Grid>
        <div className="map">
          <Map
            nearList={nearList}
            defaultCenter={defaultCenter}
            isNearUser={isNearUser}
            userDistance={this.state.userDistance}
            restaurantDistance={this.state.restaurantDistance}
          />
        </div>
      </div>
    )
  }
}

export default SearchPage
