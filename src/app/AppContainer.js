import React, { Component } from 'react';
import Header from '../Header'
import TodoContainer from '../todos/TodoContainer'
import BoardContainer from '../boards/BoardContainer/BoardContainer';
import User from '../objects/User';
import Board from '../objects/Board';
import './AppContainer.scss';
class AppContainer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      conn: '',
      user: null,
      openBoardName: '',
      showDash: true,
    };

    this.toggleDash = this.toggleDash.bind(this);
    this.connectWebSocket = this.connectWebSocket.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleSessionAction = this.handleSessionAction.bind(this);
    this.setOpenBoardName = this.setOpenBoardName.bind(this);
  }

  toggleDash() {
    this.setState({showDash: !this.state.showDash});
  }

  setOpenBoardName(name) {
    this.setState({openBoardName: name});
  }

  componentDidMount() {
    this.connectWebSocket();
  }

  connectWebSocket() {
    //try to connect with token
    if (typeof(Storage) !== "undefined") {
      // Code for localStorage/sessionStorage.
    } else {
      // Sorry! No Web Storage support..
    }
    if (window.WebSocket) {
      // conn = new WebSocket('ws://' + document.location.host + '/ws');
      let conn = new WebSocket('ws://localhost:8080/ws');
      this.setState({conn: conn})
      // Reader for incoming messages
      conn.onmessage = this.handleMessage;
    } else {
      console.log("browser does not support web sockets");
    }
  }

    handleMessage(evt) {
      this.setState({evt: evt});
      const messages = evt.data.split('\n');
      for (let i = 0; i < messages.length; i++) {
        const action = JSON.parse(messages[i]);
        this.setState({action: action});
        // Determine what type of action has been received
        switch (action.ActionSubset) {
          case 'Session':
            this.handleSessionAction(action);
            break;
          default:
              break;
        }
      }
    }

  handleSessionAction(action) {
    switch (action.ActionType) {

      case 'Connected':
        // Check if we have a session with the server
        if(localStorage.getItem("SessionID") == null) {
          this.state.conn.send(`{
                "ActionSubset":"Session",
                "ActionType":"RequestNew"
              }`)
        } else {
          this.state.conn.send(`{
                "ActionSubset":"Session",
                "ActionType":"Exists",
                "ActionPayload":"${localStorage.getItem("SessionID")}"
              }`)
        }
        break;

      case 'SessionID':
        // Upon a new session ID from the server
        // we need to store and get the client to
        // authorise the session as themselves.
        localStorage.setItem("SessionID", action.ActionPayload)

        // Create a hidden form to submit with post data
        // will redirect the user to authorise
        let form = document.createElement('form');
        document.body.appendChild(form);
        form.method = 'post';
        form.action = 'http://localhost:8080/login'
        let sessionInput = document.createElement('input');
        sessionInput.type = 'hidden';
        sessionInput.name = 'session';
        sessionInput.value = localStorage.getItem("SessionID");
        form.appendChild(sessionInput)
        form.submit();
        break;

      case 'User':
        let user = new User(
          action.ActionPayload.oauthID,
          action.ActionPayload.email,
          action.ActionPayload.name,
          action.ActionPayload.givenName,
          action.ActionPayload.familyName,
          action.ActionPayload.picture,
        )
        this.setState({
          user: user
        })
        break;
      case 'Board':
        let board = new Board(
          action.ActionPayload.boardID,
          action.ActionPayload.name,
          action.ActionPayload.type
        )
        this.setState({
          board: board
        })
        break
      default:
        break;
    }
  }

    render() {
      return(
        <div className="AppContainer">
          <Header
            openBoardName = {this.state.openBoardName}
            toggleDash = {this.toggleDash}
            dashOpen = {this.state.showDash}
          />
          <BoardContainer
            toggleDash = {this.toggleDash}
            setBoardName = {this.setOpenBoardName}
            show = {this.state.showDash}
            action = {this.state.action}
            conn = {this.state.conn}
            user = {this.state.user}
          />
          <TodoContainer
            show = {!this.state.showDash}
            action = {this.state.action}
            conn = {this.state.conn}
            user = {this.state.user}
            board = {this.state.board}
          />

        </div>
      );
    }
}

export default AppContainer;
