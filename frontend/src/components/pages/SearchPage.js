import React from 'react'
import {
  Search,
  Grid,
  Header,
  Button,
  Dropdown,
  TextArea,
  Form,
  Rail,
  Sticky
} from 'semantic-ui-react'
import axios from 'axios'
import Map from './Maps'
import { Link } from 'react-router-dom'
import '../../styles/searchPage.css'
import io from 'socket.io-client'

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
      restaurantDistance: 0,
      cur_start: '',
      chatroom_list: []
    }
    console.log('enter search page')
    console.log(this.state)
    let self = this
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
    this.socket = io.connect('http://127.0.0.1:8000')
    this.socket.on('connect', () => {
      console.log('connect success')
      console.log(this.state.username)
    })
    this.socket.on('individual_message', data => {
      let room = data['room']
      let cid = data['CID']
      let target = data['target']
      let source = data['source']
      let source_name = data['source_name']
      if (target === this.state.UID) {
        let chatroom = {
          source: this.state.UID,
          target: source,
          CID: cid,
          room: room,
          username: this.state.username,
          source_name: source_name
        }
        let chatroom_list = this.state.chatroom_list
        chatroom_list.push(chatroom)
        this.setState(chatroom_list)
        console.log('new message!!!')
        console.log(this.state.chatroom_list)
      }
    })
  }

  submit = data => {
    var self = this
    axios
      .get('http://127.0.0.1:8000/restaurant/' + data)
      .then(function(response) {
        response.data.result.UID = self.state.UID
        response.data.result.username = self.state.username
        response.data.result.user_loc = self.state.defaultCenter
        console.log(response.data.result)
        self.socket.disconnect()
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
  }

  handleChat = uid => {
    // create a chat room
    let params = {
      source: this.state.UID,
      target: uid
    }
    let self = this
    axios
      .post('http://127.0.0.1:8000/individual_chat', params)
      .then(function(response) {
        let cid = response.data.result.CID
        let room = response.data.result.owners
        console.log(room)
        self.socket.disconnect()
        // jump to chat room
        let data = {}
        data.target = uid
        data.source = self.state.UID
        data.CID = cid
        data.room = room
        data.username = self.state.username
        self.props.history.push({
          pathname: 'individual_chat',
          state: data
        })
      })
      .catch(function(error) {
        console.log(error)
      })
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
    let params = {
      UID: this.state.UID,
      distance: this.state.userDistance,
      lati: this.state.defaultCenter[0],
      longi: this.state.defaultCenter[1]
    }
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
      distance: this.state.restaurantDistance,
      lati: this.state.defaultCenter[0],
      longi: this.state.defaultCenter[1]
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

  textChangeHandler = e => {
    // console.log(e.target.value)
    this.setState({ cur_start: e.target.value })
  }

  handleSetStart = e => {
    let self = this
    console.log(this.state)
    let params = { start_point: this.state.cur_start }
    console.log(params)
    axios
      .get('http://127.0.0.1:8000/get_location', (params = { params }))
      .then(function(response) {
        console.log(response)
        self.setState({
          defaultCenter: [
            response.data.result['lati'],
            response.data.result['longi']
          ]
        })
      })
      .catch(function(error) {
        console.log(error)
      })
  }
  handleSelectPChat = e => {
    console.log('handprivate chate select')
    console.log(e)
    this.socket.disconnect()
    let data = {}
    data.target = e.target
    data.source = e.source
    data.CID = e.CID
    data.room = e.room
    data.username = e.username
    this.props.history.push({
      pathname: 'individual_chat',
      state: data
    })
  }
  handleSignout = e => {
    this.props.history.replace('/')
  }
  render() {
    const {
      isLoading,
      value,
      results,
      nearList,
      defaultCenter,
      isNearUser,
      cur_start,
      chatroom_list
    } = this.state

    console.log(defaultCenter)
    const dropdown_options = [
      { value: '500', text: 'in 500 m' },
      { value: '1000', text: 'in 1000 m' },
      { value: '1500', text: 'in 1500 m' },
      { value: '2000', text: 'in 2000 m' },
      { value: '5000', text: 'in 5000 m' }
    ]

    const privateList = chatroom_list.map((info, index) => {
      return (
        <li key={index}>
          <a onClick={this.handleSelectPChat.bind(this, info)}>
            From {info.source_name}
          </a>
        </li>
      )
    })

    return (
      <div className="page-container">
        <div className="input-map-container">
          <div className="input-area">
            <h1 className="headerS">Start search now!</h1>
            <Button onClick={this.handleSignout} className="signout">
              Sign Out
            </Button>
            <div>
              <Search
                className="semantic-component"
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
              <Form
                className="semantic-component"
                onSubmit={this.handleSetStart.bind(this)}
              >
                <Form.Input
                  className="semantic-component"
                  type="text"
                  onChange={this.textChangeHandler}
                  value={cur_start}
                  rows={1}
                  placeholder="your start location..."
                />
              </Form>
            </div>
            <div>
              <Dropdown
                className="semantic-component"
                options={dropdown_options}
                placeholder="find nearby users..."
                onChange={this.handleSelectUserDist}
                selection
              />
              <Button primary onClick={this.discoverUser}>
                Discover User
              </Button>

              <Dropdown
                className="semantic-component"
                options={dropdown_options}
                placeholder="find nearby restaurants..."
                onChange={this.handleSelectRestaurantDist}
                selection
              />
              <Button primary onClick={this.discoverRestaurant}>
                Discover Restaurants
              </Button>
            </div>
          </div>
          <div className="map">
            <Map
              nearList={nearList}
              defaultCenter={this.state.defaultCenter}
              isNearUser={isNearUser}
              userDistance={this.state.userDistance}
              restaurantDistance={this.state.restaurantDistance}
              detailWindowClickHandler={this.submit}
              isSpecific={this.state.isSpecific}
              chatWindowClickHandler={this.handleChat}
            />
          </div>
        </div>
        <div className="chatroom-list-container">
          <h3 className="title">Private Chats:</h3>
          <ul className="chatroom-list">{privateList}</ul>
        </div>
      </div>
    )
  }
}

export default SearchPage
