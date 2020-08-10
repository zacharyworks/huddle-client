import React, { Component } from 'react';
import './BoardCard.scss';

class BoardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.toggleOpen = this.toggleOpen.bind(this);
  }

  selectBoard() {
    const {
      conn,
      toggleDash,
      setBoardName,
      board,
    } = this.props;
    conn.send(
      `{
        "subset":"Session",
        "type":"OpenBoard",
        "payload":
          ${JSON.stringify(board)}
      }`,
    );
    toggleDash();
    setBoardName(board.name);
  }

  getBoardCode() {
    this.props.conn.send(
      `{
        "subset":"Board",
        "type":"GetJoinCode",
        "payload":
          ${JSON.stringify(this.props.board)}
      }`,
    );
  }

  toggleOpen() {
    let { isOpen } = this.state;
    isOpen = !isOpen;
    this.setState({ isOpen });
  }

  leaveBoard = (e) => {
    this.props.conn.send(
      `{
        "subset":"Board",
        "type":"Leave",
        "payload":
          ${JSON.stringify(this.props.board)}
      }`,
    );
  }

  render() {
    const {
      index,
      board,
      lastIndex,
      boardCode,
    } = this.props;
    const { isOpen } = this.state;
    if (board) {
      return (
        <div className={`BoardCard ${
          index % 2 === 0 ? 'BoardCard-white ' : 'BoardCard-offWhite '}
          ${index === 0 ? 'BoardCard-first ' : ' '}
          ${index === lastIndex ? 'BoardCard-last ' : ' '}
          ${index === 0 && index === lastIndex ? 'BoardCard-only' : ''}
          ${isOpen === true ? 'BoardCard-open ' : ' '}`}
        >
          <div className="BoardCard-info">
            <div className="BoardCard-left">
              {board.name}
            </div>
            <div className="BoardCard-right">
              <button
                className="BoardCard-button"
                onClick={(e) => this.selectBoard()}
              >
                Open
              </button>
              <button
                className="BoardCard-button-options"
                onClick={(e) => this.toggleOpen()}
              >
                <i className={`arrow ${isOpen === true ? 'down' : 'right'}`}></i>
              </button>
            </div>
          </div>
          <div className={`BoardCard-options 
          ${isOpen === true ? 'BoardCard-options-open' : ' '}
          ${index === lastIndex ? 'BoardCard-last ' : ' '}
          `}
          >
            {(boardCode == null
              ? (
                <button
                  className="BoardCard-button"
                  onClick={(e) => this.getBoardCode()}
                >
                  Get Join Code
                </button>
              )
              : (
                <div className="BoardCard-code">
                  {boardCode}
                </div>
              ))}

            <button
              className="BoardCard-button"
              onClick={(e) => this.leaveBoard()}
            >
              Leave Group
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="BoardCard BoardCard-first BoardCard-left BoardCard-white">
        <div className="BoardCard-left">
          Add your first board to get started
        </div>

        <div className="BoardCard-right" />
      </div>
    );
  }
}

export default BoardCard;
