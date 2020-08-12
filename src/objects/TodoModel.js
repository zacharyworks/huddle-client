class TodoModel {
  constructor(id, status, value, parentFK, boardFK) {
    this.todoID = id;
    this.status = status;
    this.value = value;
    this.parentFK = parentFK;
    this.boardFK = boardFK;
    this.children = [];
    this.selectedBy = new Set();
  }

  addChild(todo) {
    this.children.push(todo);
  }
}

export default TodoModel;
