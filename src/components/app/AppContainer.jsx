// React
import React, { Component } from 'react';

// Components
import AppHeader from './AppHeader';
import TodoContainer from '../todos/TodoContainer';
import BoardContainer from '../boards/BoardContainer';

// Objects
import User from '../../objects/User';
import Board from '../../objects/Board';

// Css
import './AppContainer.scss';
import Action from '../../objects/Action';

class AppContainer extends Component {

  constructor(props) {
    super(props);
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

  componentDidMount() {
    this.connectWebSocket();
  }

  setOpenBoardName(name) {
    this.setState({ openBoardName: name });
  }

  // prevent server timing out connection
  poll = () => {
    this.state.conn.send('ping');
  }

  toggleDash() {
    const { showDash } = this.state;
    this.setState({ showDash: !showDash });
  }

  connectWebSocket() {
    if (window.WebSocket) {
      const conn = new WebSocket('ws://ec2-3-10-221-71.eu-west-2.compute.amazonaws.com:8080/ws');
      this.setState({ conn });
      setInterval(this.poll, 50000);
      // Reader for incoming messages
      conn.onmessage = this.handleMessage;
    } else {
      // eslint-disable-next-line no-console
      console.log('browser does not support web sockets');
    }
  }

  handleMessage(evt) {
    const messages = evt.data.split('\n');
    for (let i = 0; i < messages.length; i++) {
      const actionParsed = JSON.parse(messages[i]);
      const action = new Action(
        actionParsed.subset,
        actionParsed.type,
        actionParsed.payload,
      );
      this.setState({ action });
      // Determine what type of action has been received
      switch (action.subset) {
        case 'Session':
          this.handleSessionAction(action);
          break;
        default:
          break;
      }
    }
  }

  handleSessionAction(action) {
    switch (action.type) {
      case 'Connected': {
        // Check if we have a session with the server
        if (localStorage.getItem('SessionID') == null) {
          this.state.conn.send(`{
                "subset":"Session",
                "type":"RequestNew"
              }`);
        } else {
          this.state.conn.send(`{
                "subset":"Session",
                "type":"Exists",
                "payload":"${localStorage.getItem('SessionID')}"
              }`);
        }
        break;
      }
      case 'SessionID': {
        // Upon a new session ID from the server
        // we need to store and get the client to
        // authorise the session as themselves.
        localStorage.setItem('SessionID', action.payload);

        // Create a hidden form to submit with post data
        // will redirect the user to authorise
        const form = document.createElement('form');
        document.body.appendChild(form);
        form.method = 'post';
        form.action = 'http://ec2-3-10-221-71.eu-west-2.compute.amazonaws.com:8080/login';
        const sessionInput = document.createElement('input');
        sessionInput.type = 'hidden';
        sessionInput.name = 'session';
        sessionInput.value = localStorage.getItem('SessionID');
        form.appendChild(sessionInput);
        form.submit();
        break;
      }
      case 'User': {
        const user = new User(
          action.payload.oauthID,
          action.payload.email,
          action.payload.name,
          action.payload.givenName,
          action.payload.familyName,
          action.payload.picture,
        );
        this.setState({
          user,
        });
        break;
      }
      case 'Board': {
        const board = new Board(
          action.payload.boardID,
          action.payload.name,
          action.payload.type,
        );
        this.setState({
          board,
        });
        break;
      }
      default:
        break;
    }
  }

  render() {
    const {
      openBoardName,
      showDash,
      action,
      conn,
      user,
      board,
    } = this.state;

    return (
      <div className="AppContainer">
        <AppHeader
          openBoardName={openBoardName}
          toggleDash={this.toggleDash}
          dashOpen={showDash}
        />
        <BoardContainer
          toggleDash={this.toggleDash}
          setBoardName={this.setOpenBoardName}
          show={showDash}
          action={action}
          conn={conn}
          user={user}
        />
        <TodoContainer
          show={!showDash}
          action={action}
          conn={conn}
          user={user}
          board={board}
        />

      </div>
    );
  }
}

export default AppContainer;
