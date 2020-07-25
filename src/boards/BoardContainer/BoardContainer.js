import React, { Component } from 'react';
import './BoardContainer.scss'
import PersonalCard from '../PersonalCard/PersonalCard';
import BoardCard from '../BoardCard/BoardCard';
import Board from '../../objects/Board';
import NewBoard from "../NewBoard/NewBoard";
import JoinBoard from "../JoinBoard/JoinBoard";

class BoardContainer extends Component {
    constructor(props) {
      super(props)
      this.state = {
        personalBoard: null,
        boardCodeMap: new Map(),
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
        });
        break;
      case 'Create':
        let newBoard = new Board(
          action.ActionPayload.boardID,
          action.ActionPayload.name,
          action.ActionPayload.boardType
        )
        let updateBoards = this.state.boards
        updateBoards.push(newBoard)
        this.setState({boards: updateBoards});
        break;
      case 'JoinCode':
        // copy to clipboard

        // paste over button
        let codeMap = this.state.boardCodeMap;
        codeMap.set(action.ActionPayload.boardFK, action.ActionPayload.code)
        this.setState({boardCodeMap: codeMap})
        console.log(this.state.boardCodeMap)
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

                <div className="BoardContainer-Heading">{(this.state.boards.length > 0 ? 'Your Boards' : '')}</div>
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
                      boardCode = {this.state.boardCodeMap.get(board.boardID)}
                    />
                  )
                })}
                </div>

            </div>
            <div className="card">
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
              <div className="card">
                <div className="row">
                  <div className="half-card">
                    <div className="BoardContainer-Heading">Create Board</div>
                    <NewBoard
                      conn={this.props.conn}
                      user={this.props.user}
                    />
                  </div>
                  <div className="half-card">
                    <div className="BoardContainer-Heading">Join Board</div>
                    <JoinBoard
                      conn={this.props.conn}
                      user={this.props.user}
                    />
                  </div>
                </div>
              </div>
            </div>
        </div>
      );
    } else {
        return null;
    }
}
}

export default BoardContainer;
