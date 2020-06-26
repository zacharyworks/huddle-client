
class Todo {
  constructor(id, status, value, parentFK) {
    this.todoID = id;
    this.status = status;
    this.value = value;
    this.parentFK = parentFK;
    this.children = [];
  }

  addChild(todo) {
    this.children.push(todo);
  }

}

export default Todo;