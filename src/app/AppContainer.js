import React, { Component } from 'react';
import Todo from '../objects/Todo'
import Header from '../Header'
import TodoContainer from '../todos/TodoContainer'
import BoardContainer from '../boards/BoardContainer';

class AppContainer extends Component {

    constructor(props) {
        super()
        this.state = {
            todosIdMap: new Map(),
            selectedTodo: '',
            highlightedTodos: new Set(),
            renderQueue: [],
            conn: '',
            ...this.props

        };

        this.connectWebSocket = this.connectWebSocket.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.updateSelectedTodo = this.updateSelectedTodo.bind(this)

    }

    componentDidMount() {
        this.connectWebSocket();
        document.addEventListener("keydown", this.handleKeyDown);
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
      const messages = evt.data.split('\n');
      for (let i = 0; i < messages.length; i++) {
        const action = JSON.parse(messages[i]);
        switch (action.ActionSubset) {
          case 'Todo':
            switch (action.ActionType) {
              case 'Init':
                this.setState({todosIdMap: new Map()});
                let topLevelTodo = new Todo(0, 0, 'invisible');
                this.setState({todosIdMap: this.state.todosIdMap.set(0, topLevelTodo)});

                for (let i = 0; i < action.ActionPayload.length; i++) {
                  let todo = new Todo(
                    action.ActionPayload[i].todoID,
                    action.ActionPayload[i].status,
                    action.ActionPayload[i].value,
                    action.ActionPayload[i].parentFK
                  )

                  this.setState({todosIdMap: this.state.todosIdMap.set(todo.todoID, todo)})
                  // Where there is a parent FK, also add the todo as a child of the parent
                  if(this.state.todosIdMap.has(todo.parentFK)) {
                    this.state.todosIdMap.get(todo.parentFK).addChild(todo);
                  }
                }
                this.updateSelectedTodo(this.state.todosIdMap.get(0).children[0].todoID);
                break;

              case 'Update':
                let todo = this.state.todosIdMap.get(parseInt(action.ActionPayload.todoID))
                todo.status = action.ActionPayload.status
                todo.value = action.ActionPayload.value
                todo.parentFK = action.ActionPayload.parentFK
                this.setState({todoIdMap: this.state.todosIdMap.set(todo.todoID, todo)})
                this.updateSelectedTodo(this.state.selectedTodo.todoID)
                break;

              case 'Create':
                let newTodo = new Todo(
                  action.ActionPayload.todoID,
                  action.ActionPayload.status,
                  action.ActionPayload.value,
                  action.ActionPayload.parentFK
                )
                this.setState({todosIdMap: this.state.todosIdMap.set(newTodo.todoID, newTodo)})
                if(this.state.todosIdMap.has(newTodo.parentFK)) {
                  this.state.todosIdMap.get(newTodo.parentFK).addChild(newTodo);
                }
                this.updateSelectedTodo(this.state.selectedTodo.todoID)
                break;

              case 'Delete':
                let deleteTodo = this.state.todosIdMap.get(action.ActionPayload.todoID);
                let selectedTodo = this.state.selectedTodo;

                // Determine what todo will be 'selected' upon deletion
                if(selectedTodo.todoID === deleteTodo.todoID) {
                  // If the parent Todo has other children, select the next child
                  // or else select the parent todo itself
                  let parentTodo = this.state.todosIdMap.get(selectedTodo.parentFK)
                  if (parentTodo.children.length > 1) {
                    this.updateSelectedTodo(parentTodo.children[parentTodo.children.length-2].todoID)
                  } else {
                    this.updateSelectedTodo(parentTodo.todoID)
                  }
                } else {
                  // Recursively work way back up linked list of parent todos
                  while(selectedTodo.parentFK != null) {
                    // If one of the parents has been deleted
                    // then select its parent as the closest related
                    // todo to what was selected on this client
                    if (selectedTodo.parentFK === deleteTodo.todoID) {
                      selectedTodo = this.state.todosIdMap.get(selectedTodo.parentFK)
                      this.updateSelectedTodo(this.state.todosIdMap.get(selectedTodo.parentFK).todoID)
                      break;
                    }
                    selectedTodo = this.state.todosIdMap.get(selectedTodo.parentFK)
                  }
                }

                // Delete the todo
                let todoIDMap = this.state.todosIdMap;
                todoIDMap.delete(deleteTodo.todoID);
                // Filter out deleted todo from children of its parent
                todoIDMap.get(deleteTodo.parentFK).children = todoIDMap.get(deleteTodo.parentFK).children.filter(todo => todo.todoID !== deleteTodo.todoID);
                this.setState({todosIdMap: todoIDMap})
                break;

              default:
                break;
              }
            break;
          case 'Session':
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
                var form = document.createElement('form');
                document.body.appendChild(form);
                form.method = 'post';
                form.action = 'http://localhost:8080/login'
                var sessionInput = document.createElement('input');
                sessionInput.type = 'hidden';
                sessionInput.name = 'session';
                sessionInput.value = localStorage.getItem("SessionID");
                form.appendChild(sessionInput)
                form.submit();
                break;

              default:
                break;
              }
            break;

            default:
                break;
        }
      }
    }

    handleKeyDown = (event) => {
        if(
          event.keyCode === 8 &&
          document.activeElement.nodeName !== "INPUT" &&
          document.activeElement.nodeName !== "TEXTAREA"
        ) {
          this.state.conn.send(
            `{
              "ActionSubset":"Todo",
              "ActionType":"Delete",
              "ActionPayload":{"todoID":${this.state.selectedTodo.todoID}}
            }`
          )
        }
      }

      updateSelectedTodo(todoID) {
        let renderQueue = [];
        let highlightedTodoSet = new Set();
        let todo = this.state.todosIdMap.get(todoID);
        this.setState({selectedTodo: todo})

        // Add parents of now selected todo
        while(todo.parentFK != null) {
            renderQueue.unshift(todo);
            highlightedTodoSet.add(todo.todoID)
            todo = this.state.todosIdMap.get(todo.parentFK);
        }

        // Add top level todo
        let topTodo = this.state.todosIdMap.get(0);
        renderQueue.unshift(topTodo);
        this.setState({renderQueue: renderQueue});
        this.setState({highlightedTodos: highlightedTodoSet});
    }

    render() {
      return(
        <div className="App">
          <Header />
          <BoardContainer

          />
            {/* <TodoContainer
                todosIdMap = {this.state.todosIdMap}
                selectedTodo = {this.state.selectedTodo}
                highlightedTodos = {this.state.highlightedTodos}
                renderQueue = {this.state.renderQueue}
                updateSelectedTodo = {this.updateSelectedTodo}
                conn = {this.state.conn }
            /> */}
        </div>
      );
    }
}

export default AppContainer;