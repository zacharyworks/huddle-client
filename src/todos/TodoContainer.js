import React, { Component } from 'react';
import './TodoContainer.scss'
import Column from './Column'
import Todo from "../objects/Todo";
import NewTodo from "./NewTodo";

class TodoContainer extends Component {

  constructor(props) {
    super(props)
    this.state = {

      todosIdMap: new Map(),
      selectedTodo: '',
      highlightedTodos: new Set(),
      renderQueue: [],
    };
    this.updateSelectedTodo = this.updateSelectedTodo.bind(this);
    this.handleTodoAction = this.handleTodoAction.bind(this);
  }

  componentDidUpdate(prevState) {
    if (this.props.action !== prevState.action && this.props.action.ActionSubset != null) {
      if(this.props.action.ActionSubset === 'Todo') {
        if(this.props.action.ActionPayload === null) {
          this.setState({empty: true})
        }
        this.handleTodoAction(this.props.action);
      }
    }
  }

  handleTodoAction(action) {
    switch (action.ActionType) {
      case 'Init':

        //Clear state
        this.setState({
          todosIdMap: new Map(),
          selectedTodo: null,
          highlightedTodos: new Set(),
          renderQueue: [],
        });

        let topLevelTodo = new Todo(0, 0, 'invisible', null, this.props.board.boardID);
        this.setState({selectedTodo: this.state.todosIdMap.get(0)});
        this.setState({todosIdMap: this.state.todosIdMap.set(0, topLevelTodo)});

        if(!action.ActionPayload) {
          break;
        }

        for (let i = 0; i < action.ActionPayload.length; i++) {
          let todo = new Todo(
            action.ActionPayload[i].todoID,
            action.ActionPayload[i].status,
            action.ActionPayload[i].value,
            action.ActionPayload[i].parentFK,
            action.ActionPayload[i].boardFK,
          )

          this.setState({todosIdMap: this.state.todosIdMap.set(todo.todoID, todo)})
          // Where there is a parent FK, also add the todo as a child of the parent
          if (this.state.todosIdMap.has(todo.parentFK)) {
            this.state.todosIdMap.get(todo.parentFK).children.push(todo.todoID);
          }
        }

        this.updateSelectedTodo(this.state.todosIdMap.get(0).children[0]);
        break;

      case 'Update':
        let updateTodo = this.state.todosIdMap.get(action.ActionPayload.todoID);

        updateTodo.status = action.ActionPayload.status
        updateTodo.value = action.ActionPayload.value
        updateTodo.parentFK = action.ActionPayload.parentFK

        let newIdMap = this.state.todosIdMap;
        newIdMap.set(updateTodo.todoID, updateTodo);
        this.setState({todoIDMap: newIdMap}, () => {

        });

        this.updateSelectedTodo(this.state.selectedTodo.todoID)
        break;
      case 'Create':
        let newTodo = new Todo(
          action.ActionPayload.todoID,
          action.ActionPayload.status,
          action.ActionPayload.value,
          action.ActionPayload.parentFK,
          action.ActionPayload.boardFK,
        )
        this.setState({todosIdMap: this.state.todosIdMap.set(newTodo.todoID, newTodo)})
        if (this.state.todosIdMap.has(newTodo.parentFK)) {
          this.state.todosIdMap.get(newTodo.parentFK).addChild(newTodo.todoID);
        }
        this.state.selectedTodo == null ?
          this.updateSelectedTodo(newTodo.todoID) :
          this.updateSelectedTodo(this.state.selectedTodo.todoID)
        break;

      case 'Delete':
        // Get deleted to-do & it's parent
        let deleteTodo = this.state.todosIdMap.get(action.ActionPayload.todoID);
        let deletedParent = this.state.todosIdMap.get(deleteTodo.parentFK)

        let todoIDMap = this.state.todosIdMap;
        let selectedTodo = this.state.selectedTodo;

        // Filter out deleted to-do from its parents children
        deletedParent.children = deletedParent.children.filter(todoID => todoID !== deleteTodo.todoID);
        console.log(selectedTodo + ' ' + deleteTodo);
        while(selectedTodo.parentFK !== null) {
          if(selectedTodo.todoID === deleteTodo.todoID) {
            this.updateSelectedTodo(deletedParent.todoID)
          }
          //recurse into selected todos parent until we hit null
          selectedTodo = this.state.todosIdMap.get(selectedTodo.parentFK)
        }

        todoIDMap.delete(deleteTodo.todoID);
        todoIDMap.set(deletedParent.todoID, deletedParent)
        this.setState({todosIdMap: todoIDMap})
        break;

      default:
        break;
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    if(
      event.keyCode === 8 &&
      document.activeElement.nodeName !== "INPUT" &&
      document.activeElement.nodeName !== "TEXTAREA"
    ) {
      this.props.conn.send(
        `{
          "ActionSubset":"Todo",
          "ActionType":"Delete",
          "ActionPayload":${JSON.stringify(this.state.selectedTodo, (key, value) =>
          key === "children" ? undefined : value)}
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

    // Update the state
    this.setState({renderQueue: renderQueue});
    this.setState({highlightedTodos: highlightedTodoSet});
  }

  render() {
    if(!this.props.board || !this.props.show) {
      return null
    } else if (this.state.renderQueue.length === 0) {
      // If there are no todos, show a newTodo to add 1st one
      return(
        <div className="Todos">
          <NewTodo
            placeholder = {'your first todo'}
            parentFK = {0}
            boardFK = {this.props.board.boardID}
            conn = {this.props.conn}
          />
        </div>
      )
    } else {
      return(
        <div className="Todos">
          {
            this.state.renderQueue.map((todo) => {
              return (
                <Column
                  key = {todo.todoID}
                  parentFK = {todo.todoID}
                  boardFK = {todo.boardFK}
                  todosIdMap = {this.state.todosIdMap}
                  todos = {todo.children}
                  highlightedTodos = {this.state.highlightedTodos}
                  updateSelectedTodo = {this.updateSelectedTodo}
                  conn = {this.props.conn}
                />
              )
            })}
        </div>
      );
    }

  }
}

export default TodoContainer;
