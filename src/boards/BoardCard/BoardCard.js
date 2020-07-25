import React, { Component } from 'react';
import './BoardCard.scss'

class BoardCard extends Component {

  selectBoard() {
    this.props.conn.send(
      `{
        "ActionSubset":"Session",
        "ActionType":"OpenBoard",
        "ActionPayload":
          ${JSON.stringify(this.props.board)}
      }`
    )
    this.props.toggleDash();
    this.props.setBoardName(this.props.board.name);
  }

  getBoardCode() {
    this.props.conn.send(
      `{
        "ActionSubset":"Board",
        "ActionType":"GetJoinCode",
        "ActionPayload":
          ${JSON.stringify(this.props.board)}
      }`
    )
  }

  render() {
    if (this.props.board) {
      return (
        <div className={"BoardCard " +
          (this.props.index % 2 === 0 ? 'BoardCard-white ' : 'BoardCard-offWhite ') +
          (this.props.index === 0 ? 'BoardCard-first ' : ' ') +
          (this.props.index === this.props.lastIndex ? 'BoardCard-last ' : ' ') +
          (this.props.index === 0 && this.props.index === this.props.lastIndex ? 'BoardCard-only' : '')}>
          <div className="BoardCard-left">
            {this.props.board.name}
          </div>

          <div className="BoardCard-right">
            {(this.props.boardCode == null ?
              <button
                className="BoardCard-button"
                onClick={e => this.getBoardCode()}>
                Get Code
              </button> :
              <div
                className="BoardCard-code">
                {this.props.boardCode}
              </div>)}
          <button
            className="BoardCard-button"
            onClick={e => this.selectBoard()}>
            Open
          </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="BoardCard BoardCard-first BoardCard-left BoardCard-white">
          <div className="BoardCard-left">
            Add your first board to get started
          </div>

          <div className="BoardCard-right">

          </div>
        </div>
      )
    }
  }
}

export default BoardCard;
