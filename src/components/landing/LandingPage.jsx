import React, { Component } from 'react';
import './LandingPage.scss';
import glogo from './g-logo.png';
import huddle from './huddle.png';
class LandingPage extends Component {

  login = () => {
    this.props.conn.send(`{
                "subset":"Session",
                "type":"RequestNew"
              }`);
  }

  render() {
    return (
      <div className="LandingPage">
        <div className="LandingPage-Content">
          <h1>Huddle.</h1>
          <h2>Get started with task management, created for teams.</h2>
          <button class="LandingPage-Button" onClick={(e) => this.login()}>
            <img src={glogo} /> Sign in with Google
          </button>
        </div>
        <img src={huddle} />
      </div>
    );
  }
}

export default LandingPage;
