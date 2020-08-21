import React, { Component } from 'react';
import './Todo.scss';
import Action from '../../objects/Action';

class Todo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      edit: false
    };
  }

  componentDidMount () {
    this.setState({value: this.props.todo.value})
  }

  updateTodo(todo) {
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
  }

  onDragOver = (ev) => {
    ev.preventDefault();
    this.props.updateSelectedTodo(this.props.todo.todoID)
  }

  onDragStart = (ev, todoID) => {
    ev.dataTransfer.setData("todoID", todoID);
  }

  isParent = (todoID, newParentID) => {
    if (newParentID === todoID) {
      alert('You cannot make a todo a subtask of its own subtask')
      return true;
    }
    if (newParentID === 0) {
      return false;
    }
    let newParent = this.props.todosIdMap.get(newParentID);
    return this.isParent(todoID, newParent.parentFK)
  }

  onDrop = (ev, id) => {
    let todoID = parseInt(ev.dataTransfer.getData("todoID"));
    // check that to-do is not a child of this to-do

    if (todoID !== id && !this.isParent(todoID, id)) {
      let todo = Object.assign({}, this.props.todosIdMap.get(todoID));
      const oldParentFK = todo.parentFK;
      todo.parentFK = id;
      const updateAction = new Action(
        "Todo",
        "Update",
        todo,
      );
      this.props.conn.send(JSON.stringify(updateAction));
      this.props.updateSelectedTodo(oldParentFK);
    }
  }

  editTodo = (e) => {
    this.setState({edit: true});
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  updateTodoValue = (e, todo) => {
    todo.value = this.state.value;
    const updateAction = new Action(
      "Todo",
      "Update",
      todo,
    );
    this.props.conn.send(JSON.stringify(updateAction));
    this.setState({edit: false});
  }

  render() {
    if (this.props.highlightedTodos.has(this.props.todo.todoID)) {
      this.highlighted = true;
    } else {
      this.highlighted = false;
    }

    return (
      <div
        tabIndex="-1"
        className={(this.highlighted ? 'Todo Todo-selected' : 'Todo')}
        onClick={(e) => this.props.updateSelectedTodo(this.props.todo.todoID)}
        draggable
        onDragOver={(e) => this.onDragOver(e)}
        onDragStart={(e) => this.onDragStart(e, this.props.todo.todoID)}
        onDropCapture={(e) => this.onDrop(e, this.props.todo.todoID)}
      >
        <div className="Todo-checkbox checkbox">
          <input
            type="checkbox"
            checked={this.props.todo.status}
            onClick={(e) => {
              e.stopPropagation();
              this.updateTodo(this.props.todo);
            }}
          />
          <span />
        </div>
        { this.state.edit ?
          <input
            type="text"
            value={this.state.value}
            onChange={(e) => this.handleChange(e)}
            onBlur={(e) => this.updateTodoValue(e, this.props.todo)}
          />
        :
          <div className="Todo-value"
             onDoubleClick={(e) => this.editTodo(e)}>
            {this.props.todo.value}
          </div>
        }
        {
          Array.from(this.props.todo.selectedBy).map((user) => {
            return(
              <span className="UserDot" style={{border: `2px solid ${user.colour}`}}/>
            )
          })
        }
        <div className="Todo-count">
          {(this.props.todo.children.length === 0 ? '' : (this.props.todo.children.length))}
        </div>
      </div>
    );
  }
}

export default Todo;
