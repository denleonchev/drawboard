import React, { Component } from 'react'
import { subscribeToConnectionEvent } from './api'

class Connection extends Component {
  state = {
    connectionState: 'connecting'
  }

  constructor(props) {
    super(props)
    subscribeToConnectionEvent(({
      state: connectionState,
      port
    }) => {
      this.setState({
        connectionState,
        port
      })
    })
  }

  render() {
    let content = null

    if(this.state.connectionState === 'disconnected') {
      content = (
        <div className="Connection-error">
          We've lost connection...
        </div>
      )
    }
    if(this.state.connectionState === 'connecting') {
      content = (
        <div>
          connecting
        </div>
      )
    }

    return (
      <div className="Connection">
        <div className="Connection-port">
          Socket port: {this.state.port}
        </div>
        {content}
      </div>
    )
  }
}

export default Connection