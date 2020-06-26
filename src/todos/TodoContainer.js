import React, { Component } from 'react';
import './TodoContainer.scss'
import Column from './Column'


class TodoContainer extends Component {


    render() {
      return(
        <div className="Todos">

          {this.props.renderQueue.map((todo) => {
            return (
              <Column
                parentFK = {todo.todoID}
                todos = {todo.children}
                highlightedTodos = {this.props.highlightedTodos}
                updateSelectedTodo = {this.props.updateSelectedTodo}
                conn = {this.props.conn}
              />
            )
          })}
        </div>
      );
    }
}

export default TodoContainer;