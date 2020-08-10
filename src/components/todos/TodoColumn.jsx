import React, { Component } from 'react';
import './TodoColumn.scss';
import Todo from './Todo';
import TodoNew from './TodoNew';

class TodoColumn extends Component {
  render() {
    const {
      todos,
      highlightedTodos,
      todosIdMap,
      updateSelectedTodo,
      conn,
      parentFK,
      boardFK,
    } = this.props;
    if (todos && highlightedTodos.size > 0) {
      return (
        <div className="ColumnWrapper">
          <div className="Column">
            {todos.map((todoID) => {
              const todo = todosIdMap.get(todoID);
              return (
                <Todo
                  key={todo.todoId}
                  todo={todo}
                  todosIdMap={todosIdMap}
                  highlightedTodos={highlightedTodos}
                  updateSelectedTodo={updateSelectedTodo}
                  conn={conn}
                />
              );
            })}
            <TodoNew
              placeholder="new todo"
              parentFK={parentFK}
              boardFK={boardFK}
              conn={conn}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}

export default TodoColumn;
