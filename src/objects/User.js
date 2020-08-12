class User {
  constructor(id, email, name, givenName, familyName, pictureURL) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.givenName = givenName;
    this.familyName = familyName;
    this.pictureURL = pictureURL;
    this.colour = this.getColour();
    this.selectedTodo = null;
  }

  // eslint-disable-next-line class-methods-use-this
  getColour() {
    return 'hsla(' + (Math.random() * 360) + ', 100%, 80%, 1)';
  }
}

export default User;
