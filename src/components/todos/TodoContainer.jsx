import React, { Component } from 'react';
import './TodoContainer.scss'
import TodoColumn from './TodoColumn'
import TodoModel from "../../objects/TodoModel";
import TodoNew from "./TodoNew";
import Action from '../../objects/Action'
import User from '../../objects/User'
import TodoToolbar from './TodoToolbar'

class TodoContainer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      todosIdMap: new Map(),
      selectedTodo: null,
      highlightedTodos: new Set(),
      renderQueue: [],
      peers: new Map(),
    };
    this.updateSelectedTodo = this.updateSelectedTodo.bind(this);
    this.handleTodoAction = this.handleTodoAction.bind(this);
  }


  componentDidUpdate(prevState) {
    if (this.props.action !== prevState.action && this.props.action.subset != null) {
      if(this.props.action.subset === 'Todo') {
        if(this.props.action.payload === null) {
          this.setState({empty: true})
        }
        this.handleTodoAction(this.props.action);
      }
    }
  }

  resetBoard() {
    this.setState({
      todosIdMap: new Map(),
      selectedTodo: null,
      highlightedTodos: new Set(),
      renderQueue: [],
    })

    let topLevelTodo = new TodoModel(0, 0, 'invisible', null, this.props.board.boardID)
    this.setState({ todosIdMap: this.state.todosIdMap.set(0, topLevelTodo) })
    this.setState({ selectedTodo: this.state.todosIdMap.get(0) })
  }

  handleTodoAction(action) {
    switch (action.type) {
      case 'Init': {
        //Clear state
        this.resetBoard();
        this.setState({peers: new Map()})

        if (!action.payload) {
          break
        }

        for (let i = 0; i < action.payload.length; i++) {
          let todo = new TodoModel(
            action.payload[i].todoID,
            action.payload[i].status,
            action.payload[i].value,
            action.payload[i].parentFK,
            action.payload[i].boardFK,
          )

          this.setState({ todosIdMap: this.state.todosIdMap.set(todo.todoID, todo) })
          // Where there is a parent FK, also add the todo as a child of the parent
          if (this.state.todosIdMap.has(todo.parentFK)) {
            this.state.todosIdMap.get(todo.parentFK).children.push(todo.todoID)
          }
        }

        // We know map will always have 0 key, because we
        // added the 'invisible' to-do with it.
        this.updateSelectedTodo(this.state.todosIdMap.get(0).children[0])

        // Update session with first selected todo
        const updateTodoAction = new Action(
            "Session", "Select", this.state.todosIdMap.get(this.state.todosIdMap.get(0).children[0]).todoID
        );
        this.props.conn.send(JSON.stringify(updateTodoAction));
        break
      }

      case 'Update': {
        let updateTodo = this.state.todosIdMap.get(action.payload.todoID);
        let oldParent = this.state.todosIdMap.get(updateTodo.parentFK);
        let newParent = this.state.todosIdMap.get(action.payload.parentFK);
        let newIdMap = this.state.todosIdMap

        // update fields
        if (action.payload.parentFK !== updateTodo.parentFK) {
          // remove from existing parent & add to new
          oldParent.children = oldParent.children.filter(
            todoID => todoID !== updateTodo.todoID);

          updateTodo.parentFK = action.payload.parentFK

          newParent.addChild(updateTodo.todoID)
          newIdMap.set(newParent.todoID, newParent);
          newIdMap.set(oldParent.todoID, oldParent);
        }

        updateTodo.status = action.payload.status
        updateTodo.value = action.payload.value
        newIdMap.set(updateTodo.todoID, updateTodo);

        this.setState({ todoIDMap: newIdMap });
        this.updateSelectedTodo(this.state.selectedTodo.todoID)
        break
      }
      case 'Create': {
        let newTodo = new TodoModel(
          action.payload.todoID,
          action.payload.status,
          action.payload.value,
          action.payload.parentFK,
          action.payload.boardFK,
        )
        this.setState({ todosIdMap: this.state.todosIdMap.set(newTodo.todoID, newTodo)})
        if (this.state.todosIdMap.has(newTodo.parentFK)) {
          this.state.todosIdMap.get(newTodo.parentFK).addChild(newTodo.todoID)
        }

        // Should we set the created to-do as selected
        this.state.selectedTodo.todoID === 0 ?
          this.updateSelectedTodo(newTodo.todoID) :
          this.updateSelectedTodo(this.state.selectedTodo.todoID)
        break
      }

      case 'Delete': {
        // Get deleted to-do & it's parent
        let todoIDMap = this.state.todosIdMap

        if(todoIDMap.length === 1) {
          alert('You must have at least 1 todo');
          return;
        }

        let deleteTodo = todoIDMap.get(action.payload.todoID)
        let deletedParent = todoIDMap.get(deleteTodo.parentFK)
        let selectedTodo = this.state.selectedTodo

        // Remove peers to-do selected marks
        Array.from(deleteTodo.selectedBy).map((peer) => {
          this.removePeerSelected(peer.selectedTodo, peer, todoIDMap)
        });

        // Filter out deleted to-do from its parents children
        deletedParent.children = deletedParent.children.filter(todoID => todoID !== deleteTodo.todoID)

        // Check deleted to-do wasn't below selected to-do in tree
        while (selectedTodo.parentFK !== null) {
          if (selectedTodo.todoID === deleteTodo.todoID) {
            this.updateSelectedTodo(deletedParent.todoID)
          }
          //recurse into selected todos parent until we hit null
          selectedTodo = this.state.todosIdMap.get(selectedTodo.parentFK)
        }

        todoIDMap.delete(deleteTodo.todoID);
        todoIDMap.set(deletedParent.todoID, deletedParent);
        this.setState({ todosIdMap: todoIDMap });
        break
      }

      case 'Peer': {
        const peers = this.state.peers;
        const newPeer = new User(
          action.payload.oauthID,
          action.payload.email,
          action.payload.name,
          action.payload.givenName,
          action.payload.familyName,
          action.payload.picture,
        );
        peers.set(newPeer.id, newPeer);
        this.setState({peers: peers});
        break;
      }
      case 'Peers': {
        const peers = this.state.peers;
        for (let i = 0; i < action.payload.length; i++) {
          let newPeer = new User(
            action.payload[i].oauthID,
            action.payload[i].email,
            action.payload[i].name,
            action.payload[i].givenName,
            action.payload[i].familyName,
            action.payload[i].picture,
          );

          peers.set(newPeer.id, newPeer);
        }
        this.setState({peers: peers});
        break;
      }
      case 'PeerLeft': {
        const peers = this.state.peers;
        const peer = this.state.peers.get(action.payload.oauthID);
        const todoIDMap = this.state.todosIdMap;
        this.removePeerSelected(peer.selectedTodo, peer, todoIDMap)
        peers.delete(action.payload.oauthID);
        this.setState({peers: peers, todosIdMap: todoIDMap});

        break;
      }
      case 'PeerSelected': {
        // retrieve copy of maps

        let todoIdMap = this.state.todosIdMap;
        let peerMap = this.state.peers;

        let peer = peerMap.get(action.payload.userID);

        // if they had a to-do selected, remove from that set
        if(peer.selectedTodo != null) {
          this.removePeerSelected(peer.selectedTodo, peer, todoIdMap)
        }
        // add to newly selected to-do, and update peer
        let todo = todoIdMap.get(action.payload.todoID);
        peer.selectedTodo = todo.todoID;
        this.addPeerSelected(action.payload.todoID, peer, todoIdMap);

        peerMap.set(peer.id, peer);
        this.setState({todosIdMap: todoIdMap, peers: peerMap});
        break;
      }
      default:
        break;
    }
  }

  addPeerSelected(todoID, peer, todoIdMap) {
    let todo = todoIdMap.get(todoID);
    todo.selectedBy.add(peer);
    todoIdMap.set(todo.todoID, todo);

    if(todo.parentFK === null) {
      return;
    }
    this.addPeerSelected(todo.parentFK, peer, todoIdMap)
  }

  removePeerSelected(todoID, peer, todoIdMap) {
    if(!todoIdMap.has(todoID)) {
      return;
    }
    let todo = todoIdMap.get(todoID);
    todo.selectedBy.delete(peer);
    todoIdMap.set(todo.todoID, todo);

    if(todo.parentFK === null) {
      return;
    }
    this.removePeerSelected(todo.parentFK, peer, todoIdMap)
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    if(
      document.activeElement.nodeName !== "INPUT" &&
      document.activeElement.nodeName !== "TEXTAREA") {
      switch (event.keyCode) {
        case 8: { // DELETE KEY (Deleted To-do)
          const todo = this.state.selectedTodo;
          const deleteAction = new Action("Todo", "Delete", todo);
          this.props.conn.send(JSON.stringify(deleteAction));
          break;
          }
        case 13: { // ENTER KEY (Set To-do status)
          let todo = this.state.selectedTodo;
          if (todo.status === 1) {
            todo.status = 0;
          } else {
            todo.status = 1;
          }
          const updateAction = new Action(
            "Todo",
            "Update",
            todo,
          );
          this.props.conn.send(JSON.stringify(updateAction));
          break;
        }
        default:
          break;
      }
    }
  }

  updateSelectedTodo(todoID) {
    let todo = this.state.todosIdMap.get(todoID);
    if (todoID === 0) {
      if(todo.children.length > 0) {
        return this.updateSelectedTodo(todo.children[0])
      } else {
        this.resetBoard();
        return;
      }
    }
    // update remote state if there is a change
    if(this.state.selectedTodo && todoID !== this.state.selectedTodo.todoID) {
      const updateTodoAction = new Action(
        "Session", "Select", todoID
      );
      this.props.conn.send(JSON.stringify(updateTodoAction));
    }

    // otherwise just update locally
    let renderQueue = [];
    let highlightedTodoSet = new Set();
    this.setState({selectedTodo: todo})

    // Add parents of now selected to-do
    while(todo.parentFK != null) {
      renderQueue.unshift(todo);
      highlightedTodoSet.add(todo.todoID)
      todo = this.state.todosIdMap.get(todo.parentFK);
    }

    // Add top level to-do
    let topTodo = this.state.todosIdMap.get(0);
    renderQueue.unshift(topTodo);

    // Update the state
    this.setState({renderQueue: renderQueue});
    this.setState({highlightedTodos: highlightedTodoSet});
    console.log(renderQueue)
  }

  render() {
    if(!this.props.board || !this.props.show) {
      return null
    } if (this.state.renderQueue.length === 0) {
      // If there are no todos, show a newTodo to add 1st one
      return(
        <div className="TodoContainer">
          <TodoNew
            placeholder = {`your first todo`}
            parentFK = {0}
            boardFK = {this.props.board.boardID}
            conn = {this.props.conn}
          />
        </div>
      )
    } else {
      return(
        <div className="TodoContainer">
          <TodoToolbar
            peers = {this.state.peers}
          />
          <div className="TodoContainer-Todos">
            {
            this.state.renderQueue.map((todo) => (
                <TodoColumn
                  key = {todo.todoID}
                  parentFK = {todo.todoID}
                  boardFK = {todo.boardFK}
                  todosIdMap = {this.state.todosIdMap}
                  todos = {todo.children}
                  highlightedTodos = {this.state.highlightedTodos}
                  updateSelectedTodo = {this.updateSelectedTodo}
                  conn = {this.props.conn}
                />
              ))
            }
          </div>
        </div>
      );
    }

  }
}


export default TodoContainer;
