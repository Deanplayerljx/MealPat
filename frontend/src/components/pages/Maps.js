import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'

const AnyReactComponent = ({ text }) => <div>{text}</div>
const MARKER_SIZE = 40
const greatPlaceStyle = {
  lat: 40.1138326,
  lng: -88.2216972
}

class Map extends Component {
  onGoogleApiLoaded = ({ map, maps }) => {
    this.map = map
    this.maps = maps
    this.infowindow = new maps.InfoWindow()
    var address = { lat: 40.1138326, lng: -88.2216972 }
    var service = new maps.places.PlacesService(map)
    service.nearbySearch(
      {
        location: address,
        radius: 2000,
        types: ['school']
      },
      this.callback
    )
  }

  // constructor(props) {
  //   super(props)
  // }

  callback = (results, status) => {
    for (var i = 0; i < results.length; i++) {
      this.renderMarkers(results[i])
    }
  }

  renderMarkers = place => {
    let marker = new this.maps.Marker({
      position: {
        lat: parseFloat(place.geometry.location.lat()),
        lng: parseFloat(place.geometry.location.lng())
      },
      map: this.map,
      title: 'Hello World!'
    })

    marker.addListener('click', () => {
      this.infowindow.setContent('test')
      this.infowindow.open(this.map, marker)
    })
  }

  render() {
    let defaultCenter = this.props.defaultCenter
    return (
      <div style={{ height: '100vh' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyB1KLfyE7CWowUxNFhGaHdR496U9RwX_ek',
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
