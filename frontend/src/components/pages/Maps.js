import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'

class Map extends Component {
  constructor(props) {
    super(props)
    this.curr_mark = []
    this.circle = null
  }
  onGoogleApiLoaded = ({ map, maps }) => {
    this.map = map
    this.maps = maps
    this.infowindow = new maps.InfoWindow({ maxWidth: 200 })
  }
  renderMarkers_user = place => {
    let marker = new this.maps.Marker({
      position: {
        lat: parseFloat(place['lati']),
        lng: parseFloat(place['longi'])
      },
      map: this.map,
      title: 'Hello World!'
    })
    this.curr_mark.push(marker)
    var content = document.createElement('div'),
      button
    content.innerHTML =
      '<p>Name: ' +
      place['name'] +
      '</p>' +
      '<p>Gender: ' +
      place['gender'] +
      '</p>' +
      '<p>Interest: ' +
      place['interest'] +
      '</p>' +
      '<p>Common restaurants: ' +
      place['common_restaurant'] +
      '</p>'

    this.maps.event.addListener(marker, 'click', () => {
      this.infowindow.setOptions({
        content: content,
        map: this.map,
        position: marker.position
      })
    })
  }

  renderMarkers_rest = place => {
    let marker = new this.maps.Marker({
      position: {
        lat: parseFloat(place['lati']),
        lng: parseFloat(place['longi'])
      },
      map: this.map,
      title: 'Hello World!'
    })
    this.curr_mark.push(marker)
    var content = document.createElement('div'),
      button
    content.innerHTML =
      '<p>Name: ' +
      place['name'] +
      '</p>' +
      '<p>Address: ' +
      place['address'] +
      '</p>' +
      '<p>Rating: ' +
      place['rating'] +
      '</p>'
    button = content.appendChild(document.createElement('input'))
    button.type = 'button'
    button.value = 'see detail!'
    this.maps.event.addDomListener(button, 'click', () => {
      this.myfunction(place['RID'])
    })

    this.maps.event.addListener(marker, 'click', () => {
      this.infowindow.setOptions({
        content: content,
        map: this.map,
        position: marker.position
      })
    })
  }

  myfunction = data => {
    console.log('myfucntion called')
    console.log(data)
    console.log(this)
    this.props.infoWindowClickHandler(data)
  }
  clearCurrMarker = mar => {
    for (var i = 0; i < mar.length; i++) {
      mar[i].setMap(null)
    }
  }

  render() {
    let defaultCenter = this.props.defaultCenter
    var results = this.props.nearList
    var distance = 0
    this.clearCurrMarker(this.curr_mark)
    if (this.props.isNearUser) {
      for (var i = 0; i < results.length; i++) {
        console.log('hi')
        console.log(results[i])
        this.renderMarkers_user(results[i])
      }
      distance = this.props.userDistance
    } else {
      for (var i = 0; i < results.length; i++) {
        console.log('hi')
        this.renderMarkers_rest(results[i])
      }
      distance = this.props.restaurantDistance
    }
    if (this.circle != null) {
      this.circle.setMap(null)
    }
    if (results.length > 0) {
      var cityCircle = new this.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: this.map,
        center: {
          lat: this.props.defaultCenter[0],
          lng: this.props.defaultCenter[1]
        },
        radius: parseInt(distance) * 0.8
      })
      this.circle = cityCircle
    }
    return (
      <div style={{ height: '100vh' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyA3W8W5I-E69cN5yZSUAbfA0ibHTfLJ2L0',
            libraries: 'places'
          }}
          onGoogleApiLoaded={this.onGoogleApiLoaded}
          defaultCenter={defaultCenter}
          defaultZoom={17}
        />
      </div>
    )
  }
}

export default Map
