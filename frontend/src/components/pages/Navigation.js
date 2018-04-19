import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'

class Navigation extends Component {
  constructor(props) {
    super(props)
    this.curr_mark = []
    this.routes = []
    this.lati = []
    this.longi = []
    this.index = 0
  }
  renderDirections = result => {
    var directionsRenderer = new this.maps.DirectionsRenderer()
    directionsRenderer.setMap(this.map)
    directionsRenderer.setDirections(result)
  }
  requestDirections = (start, end) => {
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
            console.log(this.lati)
            if (temp_index > -1 && this.longi[temp_index] == path[j].lng()) {
              not_find = false
              var position = { lati: path[j].lat(), longi: path[j].lng() }
              this.renderMarkers(position)
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
    this.infowindow = new maps.InfoWindow({ maxWidth: 100 })
    this.directionsService = new this.maps.DirectionsService()
    // var directionsDisplay_1 = new this.maps.DirectionsRenderer();
    // directionsDisplay_1.setMap(this.map);
    // var directionsDisplay_2 = new this.maps.DirectionsRenderer();
    // directionsDisplay_2.setMap(this.map);

    var start = [
      { lat: 40.110933, lng: -88.228256 },
      { lat: 40.1092101, lng: -88.2272225 }
    ]
    var end = { lat: 40.115557, lng: -88.2337529 }
    this.requestDirections(start[0], end)
    this.requestDirections(start[1], end)
    // for(var i = 0; i < start.length; i++){
    //   var temp = new this.maps.DirectionsRenderer();
    //   temp.setMap(this.map);
    //   display.push(temp)
    // }
    // //for(var i = 0; i < start.length; i++){
    //   var request = {
    //     origin: start[0],
    //     destination: end,
    //     travelMode: 'WALKING'
    //   };
    //   //var temp_display = display[i]
    //   this.directionsService.route(request, function(result, status) {
    //     if (status == 'OK') {
    //       directionsDisplay_1.setDirections(result);
    //     }
    //   });
    //   var request = {
    //     origin: start[1],
    //     destination: end,
    //     travelMode: 'DRIVING'
    //   };
    //   //var temp_display = display[i]
    //   this.directionsService.route(request, function(result, status) {
    //     if (status == 'OK') {
    //       directionsDisplay_2.setDirections(result);
    //     }
    //   });
    //}
  }
  renderMarkers = place => {
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
      this.infowindow.setContent('We suggest you meet here')
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
