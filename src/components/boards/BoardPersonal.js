import React, { Component } from 'react';
import './BoardPersonal.scss';

class BoardPersonal extends Component {
  logout() {
    localStorage.clear();
    window.location.reload();
  }

  selectBoard() {
    this.props.conn.send(
      `{
        "subset":"Session",
        "type":"OpenBoard",
        "payload":
          ${JSON.stringify(this.props.board)}
      }`,
    );
    this.props.toggleDash();
    this.props.setBoardName(this.props.board.name);
  }

  render() {
    if (!this.props.user) {
      return null;
    }
    return (
      <div className="PersonalCard">
        <div className="PersonalCard-left">
          {this.props.user.name}
        </div>
        <div className="PersonalCard-right">

          <button
            className="PersonalCard-button"
            onClick={(e) => this.logout()}
          >
            Logout
          </button>
          <button
            className="PersonalCard-button"
            onClick={(e) => this.selectBoard()}
          >
            My Todos
          </button>
        </div>
      </div>
    );
  }
}

export default BoardPersonal;
