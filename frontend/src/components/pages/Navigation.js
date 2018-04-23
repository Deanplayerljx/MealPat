import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'
import axios from 'axios'

class Navigation extends Component {
  constructor(props) {
    super(props)
    this.curr_mark = []
    this.routes = []
    this.lati = []
    this.longi = []
    this.index = 0
    this.state = { start: [], end: {}, midpoint: {} }
  }
  renderDirections = result => {
    var directionsRenderer = new this.maps.DirectionsRenderer({
      suppressMarkers: true
    })
    directionsRenderer.setMap(this.map)
    directionsRenderer.setDirections(result)
  }
  requestDirections = (start, end) => {
    var request = {
      origin: start,
      destination: end,
      travelMode: 'WALKING'
    }
    //var temp_display = display[i]
    this.directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        this.routes.push(result)
        this.renderDirections(result)
        //var position =  {lati : steps[i]['path'][0].lat(), longi : steps[i]['path'][0].lng()}
        //this.renderMarkers(position)
      }
    })
  }
  requestDirections_find_overlap = (start, end) => {
    var request = {
      origin: start,
      destination: end,
      travelMode: 'DRIVING'
    }
    //var temp_display = display[i]
    this.directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        this.routes.push(result)
        this.renderDirections(result)
        console.log(this.index)
        var steps = this.routes[this.index]['routes'][0]['legs'][0]['steps']
        console.log(steps)
        var not_find = true
        var temp_lati = []
        var temp_longi = []
        for (var i = 0; i < steps.length && not_find; i++) {
          var path = steps[i]['path']
          for (var j = 0; j < path.length; j++) {
            var temp_index = this.lati.indexOf(path[j].lat())
            //console.log(this.lati)
            if (temp_index > -1 && this.longi[temp_index] == path[j].lng()) {
              console.log('hi')
              not_find = false
              var position = { lat: path[j].lat(), lng: path[j].lng() }
              this.renderMarkers_end(position)
              break
            } else {
              temp_lati.push(path[j].lat())
              temp_longi.push(path[j].lng())
            }
          }
        }
        this.index += 1
        this.lati = this.lati.concat(temp_lati)
        this.longi = this.longi.concat(temp_longi)
        //var position =  {lati : steps[i]['path'][0].lat(), longi : steps[i]['path'][0].lng()}
        //this.renderMarkers(position)
      }
    })
  }
  onGoogleApiLoaded = ({ map, maps }) => {
    this.map = map
    this.maps = maps
    this.infowindow = new maps.InfoWindow({ maxWidth: 120 })
    this.directionsService = new this.maps.DirectionsService()
    this.geocoder = new this.maps.Geocoder()
    // var directionsDisplay_1 = new this.maps.DirectionsRenderer();
    // directionsDisplay_1.setMap(this.map);
    // var directionsDisplay_2 = new this.maps.DirectionsRenderer();
    // directionsDisplay_2.setMap(this.map);

    this.state.start = [
      {
        lat: this.props.location.state.my_loc[0],
        lng: this.props.location.state.my_loc[1]
      }
    ]
    console.log(this.state)
    let data = {
      cur_uid: this.props.location.state.target_uid,
      clicked_uid: this.props.location.state.target_uid
    }
    let self = this
    let rid = this.props.location.state.RID
    axios
      .get('http://127.0.0.1:8000/user', { params: data })
      .then(function(response) {
        let result = response.data.result
        let another_lati = result['lati']
        let another_longi = result['longi']
        var temp = self.state.start
        temp.push({ lat: another_lati, lng: another_longi })
        self.state.start = temp
        console.log(self.state)
        axios
          .get('http://127.0.0.1:8000/restaurant/' + rid)
          .then(function(response) {
            var end = {
              lat: response.data.result.lati,
              lng: response.data.result.longi
            }
            var start = self.state.start
            var midpoint = {
              lat: (start[0]['lat'] + start[1]['lat']) / 2,
              lng: (start[0]['lng'] + start[1]['lng']) / 2
            }
            self.state.end = end
            self.state.midpoint = midpoint
            console.log(self.state)
            self.next_step(start, end, midpoint)
          })
          .catch(function(error) {
            console.log(error)
          })
      })
      .catch(function(error) {
        console.log(error)
      })
  }
  next_step = (start, end, midpoint) => {
    var absolute_start_1 = [
      start[0]['lat'] - end['lat'],
      start[0]['lng'] - end['lng']
    ]
    var absolute_start_2 = [
      start[1]['lat'] - end['lat'],
      start[1]['lng'] - end['lng']
    ]
    if (
      absolute_start_1[0] * absolute_start_2[0] < 0 &&
      absolute_start_1[1] * absolute_start_2[1] < 0
    ) {
      this.requestDirections(start[0], end)
      this.requestDirections(start[1], end)
      this.renderMarkers_start(start[0])
      this.renderMarkers_start(start[1])
      this.renderMarkers_end(end)
    } else if (
      absolute_start_1[0] * absolute_start_2[0] > 0 &&
      absolute_start_1[1] * absolute_start_2[1] > 0
    ) {
      this.requestDirections_find_overlap(start[0], end)
      this.requestDirections_find_overlap(start[1], end)
      this.renderMarkers_start(start[0])
      this.renderMarkers_start(start[1])
      this.renderMarkers_rest(end)
    } else {
      var service = new this.maps.DistanceMatrixService()
      service.getDistanceMatrix(
        {
          origins: [start[0], start[1], midpoint],
          destinations: [end, start[1]],
          travelMode: 'WALKING'
        },
        this.callback
      )
    }
  }
  callback = (response, status) => {
    console.log(response)
    var start_1_to_end = response['rows'][0]['elements'][0]['distance']['value']
    var start_2_to_end = response['rows'][1]['elements'][0]['distance']['value']
    var mid_to_end = response['rows'][2]['elements'][0]['distance']['value']
    var start_1_to_start_2 =
      response['rows'][0]['elements'][1]['distance']['value']
    console.log(start_1_to_end)
    console.log(start_2_to_end)
    console.log(mid_to_end)
    console.log(start_1_to_start_2)
    let start = this.state.start
    let end = this.state.end
    let midpoint = this.state.midpoint
    if (start_1_to_end < 500 || start_2_to_end < 500) {
      this.requestDirections(start[0], end)
      this.requestDirections(start[1], end)
      this.renderMarkers_start(start[0])
      this.renderMarkers_start(start[1])
      this.renderMarkers_end(end)
    } else if (start_1_to_start_2 < 1000 && mid_to_end > 1000) {
      this.requestDirections(start[0], midpoint)
      this.requestDirections(start[1], midpoint)
      this.requestDirections(midpoint, end)
      this.renderMarkers_start(start[0])
      this.renderMarkers_start(start[1])
      this.renderMarkers_end(midpoint)
      this.renderMarkers_rest(end)
    } else if (
      Math.max(start_2_to_end, start_1_to_end) >
      start_1_to_start_2 * 1.5
    ) {
      this.requestDirections(start[0], midpoint)
      this.requestDirections(start[1], midpoint)
      this.requestDirections(midpoint, end)
      this.renderMarkers_start(start[0])
      this.renderMarkers_start(start[1])
      this.renderMarkers_end(midpoint)
      this.renderMarkers_rest(end)
    } else {
      this.requestDirections_find_overlap(start[0], end)
      this.requestDirections_find_overlap(start[1], end)
      this.renderMarkers_start(start[0])
      this.renderMarkers_start(start[1])
      this.renderMarkers_end(end)
    }
  }
  renderMarkers_end = place => {
    let marker = new this.maps.Marker({
      position: {
        lat: parseFloat(place['lat']),
        lng: parseFloat(place['lng'])
      },
      map: this.map,
      title: 'Hello World!'
    })
    this.curr_mark.push(marker)
    var latlng = {
      lat: parseFloat(place['lat']),
      lng: parseFloat(place['lng'])
    }
    console.log(latlng)
    this.geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        marker.addListener('click', () => {
          this.infowindow.setContent(
            'We suggest you to meet here.' +
              '\n' +
              'Address:' +
              results[1].formatted_address
          )
          this.infowindow.open(this.map, marker)
        })
      }
    })
  }

  renderMarkers_rest = place => {
    let marker = new this.maps.Marker({
      position: {
        lat: parseFloat(place['lat']),
        lng: parseFloat(place['lng'])
      },
      map: this.map,
      title: 'Hello World!'
    })
    this.curr_mark.push(marker)
    var latlng = {
      lat: parseFloat(place['lat']),
      lng: parseFloat(place['lng'])
    }
    marker.addListener('click', () => {
      this.infowindow.setContent('The destination restaurant')
      this.infowindow.open(this.map, marker)
    })
  }

  renderMarkers_start = place => {
    let marker = new this.maps.Marker({
      position: {
        lat: parseFloat(place['lat']),
        lng: parseFloat(place['lng'])
      },
      map: this.map,
      title: 'Hello World!'
    })
    this.curr_mark.push(marker)
    var latlng = {
      lat: parseFloat(place['lat']),
      lng: parseFloat(place['lng'])
    }
    marker.addListener('click', () => {
      this.infowindow.setContent('Start Point')
      this.infowindow.open(this.map, marker)
    })
  }

  clearCurrMarker = mar => {
    for (var i = 0; i < mar.length; i++) {
      mar[i].setMap(null)
    }
  }

  render() {
    //let defaultCenter = this.props.defaultCenter
    var distance = 0
    this.clearCurrMarker(this.curr_mark)
    return (
      <div style={{ height: '100vh' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyA3W8W5I-E69cN5yZSUAbfA0ibHTfLJ2L0',
            libraries: 'places'
          }}
          onGoogleApiLoaded={this.onGoogleApiLoaded}
          defaultCenter={[40.1138028, -88.2249052]}
          defaultZoom={17}
        />
      </div>
    )
  }
}

export default Navigation
