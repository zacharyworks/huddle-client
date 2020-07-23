import React, { Component } from 'react';
import './Todo.scss';

class Todo extends Component {
  updateTodo(todo) {

    if(todo.status === 1) {
      todo.status = 0;
    } else {
      todo.status = 1;
    }
    this.props.conn.send(
      `{
        "ActionSubset":"Todo",
        "ActionType":"Update",
        "ActionPayload":
          ${JSON.stringify(todo, (key, value) =>
            key === "children" ? undefined : value)}
      }`
    )
  }

  render()  {
      this.hasNotesString = 'n';

      if(this.props.highlightedTodos.has(this.props.todo.todoID)) {
        this.highlighted = true;
      } else {
        this.highlighted = false;
      }

      return (
        <div tabIndex="1" className={(this.highlighted ? 'Todo Todo-selected' : 'Todo')}
             onClick={e => this.props.updateSelectedTodo(this.props.todo.todoID)}>
            <div  className="Todo-checkbox checkbox">
                <input
                  type="checkbox"
                  checked={this.props.todo.status}
                  onClick={e => {
                    e.stopPropagation();
                    this.updateTodo(this.props.todo)
                  }}/>
                <span></span>
            </div>
            <div className="Todo-value">
                {this.props.todo.value}
            </div>
            <div className="Todo-count">
              {(this.props.todo.children.length === 0 ? '' : (this.props.todo.children.length))}
            </div>
        </div>
      );
    }

}

export default Todo;
