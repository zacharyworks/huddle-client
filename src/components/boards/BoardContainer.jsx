import React, { Component } from 'react';
import './BoardContainer.scss';
import BoardPersonal from './BoardPersonal';
import BoardCard from './BoardCard';
import Board from '../../objects/Board';
import NewBoard from './BoardNew';
import BoardJoin from './BoardJoin';

class BoardContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      personalBoard: null,
      boardCodeMap: new Map(),
      boards: [],
    };
    this.handleBoardAction = this.handleBoardAction.bind(this);
  }

  componentDidUpdate(prevState) {
    if (this.props.action !== prevState.action && this.props.action.subset != null) {
      if (this.props.action.subset === 'Board') {
        this.handleBoardAction(this.props.action);
      }
    }
  }

  handleBoardAction(action) {
    switch (action.type) {
      case 'Init': {
        const boards = action.payload.map(
          (board) => new Board(board.boardID, board.name, board.boardType),
        );
        this.setState({
          personalBoard: boards.filter((board) => board.boardType === 0)[0],
          boards: boards.filter((board) => board.boardType !== 0),
        });
        break;
      }
      case 'Create': {
        const newBoard = new Board(
          action.payload.boardID,
          action.payload.name,
          action.payload.boardType,
        );
        const updateBoards = this.state.boards;
        updateBoards.push(newBoard);
        this.setState({ boards: updateBoards });
        break;
      }
      case 'JoinCode': {
        // copy to clipboard

        // paste over button
        const codeMap = this.state.boardCodeMap;
        codeMap.set(action.payload.boardFK, action.payload.code);
        this.setState({ boardCodeMap: codeMap });
        break;
      }
      case 'Remove': {
        const removeBoard = action.payload.boardID;
        const { boards } = this.state;
        const updateBoards = boards.filter((board) => board.boardID !== removeBoard);
        this.setState({ boards: updateBoards });
        break;
      }
      default:
        break;
    }
  }

  render() {
    if (this.props.show) {
      return (
        <div className="BoardContainer">
          {(this.state.boards.length > 0
            ? (
              <div className="card">
                <div className="BoardContainer-Heading">Your Boards</div>
                <div className="BoardCards">
                  {
                      this.state.boards.map((board, index) => (
                        <BoardCard
                          index={index}
                          toggleDash={this.props.toggleDash}
                          setBoardName={this.props.setBoardName}
                          lastIndex={this.state.boards.length - 1}
                          conn={this.props.conn}
                          key={board.boardID}
                          board={board}
                          boardCode={this.state.boardCodeMap.get(board.boardID)}
                        />
                      ))
                  }
                </div>
              </div>
            ) : '')}
          <div className="card">
            <div className="card">
              <div className="BoardContainer-Heading">Profile</div>
              <BoardPersonal
                toggleDash={this.props.toggleDash}
                setBoardName={this.props.setBoardName}
                conn={this.props.conn}
                user={this.props.user}
                board={this.state.personalBoard}
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
                  <BoardJoin
                    conn={this.props.conn}
                    user={this.props.user}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

export default BoardContainer;
