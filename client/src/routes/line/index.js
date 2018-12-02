//import React from 'react';
import React, {Component} from 'react';
import { Card, Heading } from '@8base/boost';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const PROPERTIES_LIST_QUERY = gql`
  query HealthRecord {
      healthDataList {
          items {
              lon
              lat
              stepCount
              heartRate
              speed
          }
      }
  }`;

const elevationScale = {min: 0, max: 5000};

export class line extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  constructor(props) {
    super(props);
    this.state = {
      viewState: {
        longitude: -80.27898336026118,
        latitude: 25.720129200013538,
        zoom: 17.5,
        minZoom: 15,
        maxZoom: 20,
        pitch: 40,
        bearing: 0
      },
      cursor: {x: 0, y: 0, present: false},
      hoveredObject: null,
      elevationScale: elevationScale.min,
      radius: 1,
      coverage: 0.9,
      opacity: 1,
      scale: 0.3,
      data: null,
      clickedValue: 0
    };

    this.startAnimationTimer = null;
    this.intervalTimer = null;

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);

    this._onViewStateChange = this._onViewStateChange.bind(this);

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && this.props.data && nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _animate() {
    this._stopAnimate();
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
        [name]: value
    });
  }

  _renderLayers(data) {

    //console.log(data)

    var lineData = []

    for (var i in data) {
      if (i > 1) {
        var heartRate = Number(data[i][2]);
        var color = [0, 0, 255];

        if (heartRate > 80) {
          color = [100, 0, 255];
        }

        if (heartRate > 90) {
          color = [160, 0, 255];
        }

        if (heartRate > 100) {
          color = [255, 0, 180];
        }

        if (heartRate > 105) {
          color = [255, 0, 80];
        }

        if (heartRate > 115) {
          color = [255, 0, 0];
        }

        lineData.push({
          start: [data[i-1][0], data[i-1][1]],
          end: [data[i][0], data[i][1]],
          color: color
        })
      }
    }

    //console.log(lineData)

    return [
      new ScatterplotLayer({
        id: 'points',
        data: data,
        radiusScale: .5,
        getPosition: d => [d[0], d[1]],
        getColor: d => [0, 0, 255],
        getRadius: d => {return 1},
        //pickable: Boolean(this.props.onHover),
        onHover: {

        }
      }),
      new LineLayer({
        id: 'lines',
        data: lineData,
        strokeWidth: d => {return 3},
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor: d => d.color,
        //pickable: Boolean(this.props.onHover),
        onHover: {

        }
      })
    ];
  }

  renderTooltip() {

    var tooltipStyle = {
      left: Number(this.state.cursor.x + 5) + 'px',
      top: Number(this.state.cursor.y + 5) + 'px',
      width: '230px',
      height: '58px',
      background: 'white',
      zIndex: '999',
      position: 'absolute'
    }

    if (this.state.hoveredObject != null && this.state.cursor.x != 0 && this.state.cursor.y != 0) {
      return(
        <div id="tooltip" style={tooltipStyle}>
          Heart Rate: {this.state.hoveredObject.heartRate}<br/>
          Step Count: {this.state.hoveredObject.stepCount}<br/>
          Longitude: {this.state.hoveredObject.lon}<br/>
          Latitude: {this.state.hoveredObject.lat}<br/>
        </div>
      )
    } else {
      return (null)
    }
  }

  render() {
    const {controller = true, baseMap = true} = this.props;
    const {viewState} = this.state;

    return (
      <Card.Plate padding="md" stretch>
        <Card.Body padding="none" stretch>
          {this.renderTooltip()}
          <Query query={PROPERTIES_LIST_QUERY}>
            {({ loading, error, data }) => {
              if (loading) return "Loading...";
              if (error) return `Error! ${error.message}`;
              var healthData = data.healthDataList.items.map(d => [Number(d.lon), Number(d.lat), Number(d.heartRate), Number(d.speed)]);
              return (
                <DeckGL
                  layers={this._renderLayers(healthData)}
                  initialViewState={viewState}
                  viewState={viewState}
                  onViewStateChange={this._onViewStateChange}
                  controller={controller}
                >
                  {baseMap && (
                    <StaticMap
                      reuseMaps
                      mapStyle="mapbox://styles/mapbox/satellite-v9"
                      preventStyleDiffing={true}
                      mapboxApiAccessToken={"pk.eyJ1IjoiY2hyaXNjY2MiLCJhIjoiY2pwNGRsdXIzMHJtZjNsczBiamZ2ZDIwdyJ9.qSRa1-ue-6IQyNxIgMlh1A"}
                    />
                  )}
                </DeckGL>
              );
            }}
            
          </Query>
        </Card.Body>
      </Card.Plate>
    );
  }
}