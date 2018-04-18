import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'

class Map extends Component {
  constructor(props) {
    super(props)
    this.curr_mark = []
  }
  onGoogleApiLoaded = ({ map, maps }) => {
    this.map = map
    this.maps = maps
    this.infowindow = new maps.InfoWindow({ maxWidth: 100 })
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
    console.log(place['lati'])
    marker.addListener('click', () => {
      this.infowindow.setContent(
        'Name: ' +
          place['name'] +
          '\n' +
          'Gender:' +
          place['gender'] +
          '\n' +
          'Interest:' +
          place['interest'] +
          '\n'
      )
      this.infowindow.open(this.map, marker)
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
    marker.addListener('click', () => {
      this.infowindow.setContent(
        'Name: ' +
          place['name'] +
          '\n' +
          'Address:' +
          place['address'] +
          '\n' +
          'Rating:' +
          place['rating'] +
          '\n' +
          'Category:' +
          place['categories']
      )
      this.infowindow.open(this.map, marker)
    })
  }

  clearCurrMarker = mar => {
    for (var i = 0; i < mar.length; i++) {
      mar[i].setMap(null)
    }
  }

  render() {
    let defaultCenter = this.props.defaultCenter
    var results = this.props.nearList
    this.clearCurrMarker(this.curr_mark)
    if (this.props.isNearUser) {
      for (var i = 0; i < results.length; i++) {
        console.log('hi')
        this.renderMarkers_user(results[i])
      }
    } else {
      for (var i = 0; i < results.length; i++) {
        console.log('hi')
        this.renderMarkers_rest(results[i])
      }
    }
    return (
      <div style={{ height: '100vh' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyCW_Aehw77ilibw2sOKbLiO3YapjKLzIf8',
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
