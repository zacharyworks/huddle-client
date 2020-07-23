import React, { Component } from 'react';
import './BoardContainer.scss'
import PersonalCard from './PersonalCard';
import BoardCard from './BoardCard';
import Board from '../objects/Board';

class BoardContainer extends Component {
    constructor(props) {
      super(props)
      this.state = {
        personalBoard: null,
        boards: []
      };
      this.handleBoardAction = this.handleBoardAction.bind(this)
    }

  componentDidUpdate(prevState) {
    if (this.props.action !== prevState.action && this.props.action.ActionSubset != null) {
      if(this.props.action.ActionSubset === 'Board') {
        this.handleBoardAction(this.props.action);
      }
    }
  }

  handleBoardAction(action) {
    switch (action.ActionType) {
      case 'Init':
        let boards = action.ActionPayload.map((board) => {
          return new Board(board.boardID, board.name, board.boardType);
        })
        this.setState({
          personalBoard: boards.filter(board => board.boardType === 0)[0],
          boards: boards.filter(board => board.boardType !== 0)
        }, () => console.log(this.state));
        break;
      default:
        break;
    }
  }

    render() {
      if(this.props.show) {
      return(
        <div className="BoardContainer">

            <div className="card">
              <div className="BoardContainer-Heading">Your Boards</div>
              <div className="BoardCards">
                {
                this.state.boards.map((board, index) => {
                return(
                  <BoardCard
                    index = {index}
                    toggleDash = {this.props.toggleDash}
                    setBoardName = {this.props.setBoardName}
                    lastIndex = {this.state.boards.length - 1}
                    conn = {this.props.conn}
                    key = {board.boardID}
                    board = {board}
                  />
                )
              })}
              </div>
            </div>
            <div className="card">
              <div className="BoardContainer-Heading">Profile</div>
              <PersonalCard
                toggleDash = {this.props.toggleDash}
                setBoardName = {this.props.setBoardName}
                conn = {this.props.conn}
                user = {this.props.user}
                board = {this.state.personalBoard}
              />
            </div>

        </div>
      );
    } else {
        return null;
    }
}
}

export default BoardContainer;
