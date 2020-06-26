import React, { Component } from 'react';
import './Column.scss'
import Todo from './Todo';
import NewTodo from './NewTodo';

class Column extends Component {
  render() {
    if(this.props.todos && this.props.highlightedTodos.size > 0) {
      return(
        <div className="ColumnWrapper">
          <div className="Column">
            {this.props.todos.map((todo) => {
              return (
                <Todo
                  todo = {todo}
                  highlightedTodos = {this.props.highlightedTodos}
                  updateSelectedTodo = {this.props.updateSelectedTodo}
                  conn = {this.props.conn}/>
              )
            })}
            <NewTodo
              parentFK = {this.props.parentFK}
              conn = {this.props.conn}/>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Column;