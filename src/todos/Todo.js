import React, { Component } from 'react';
import './Todo.scss';

class Todo extends Component {
  updateTodo() {
    if(this.props.todo.status === 1) {
      this.props.todo.status = 0;
    } else {
      this.props.todo.status = 1;
    }
    this.props.conn.send(
      `{
        "ActionSubset":"Todo",
        "ActionType":"Update",
        "ActionPayload":
          ${JSON.stringify(this.props.todo, (key, value) =>
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

      if(this.props.todo.status === 1) {
        this.complete = true;
      } else {
        this.complete = false;
      }

      return (
        <div tabIndex="1" className={(this.highlighted ? 'Todo Todo-selected' : 'Todo')}>
            <div  className="Todo-checkbox checkbox">
                <input
                  type="checkbox"
                  defaultChecked={this.complete}
                  onClick={e => this.updateTodo()}/>
                <span></span>
            </div>
            <div className="Todo-value" onClick={e => this.props.updateSelectedTodo(this.props.todo.todoID)}>
                {this.props.todo.value}
            </div>
            <div className="Todo-count" onClick={e => this.props.updateSelectedTodo(this.props.todo.todoID)}>
                {'[' + this.hasNotesString + ']'}
                {'[' + this.props.todo.children.length +']'}
            </div>
        </div>
      );
    }

}

export default Todo;