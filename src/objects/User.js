
class User {
  constructor(id, email, name, givenName, familyName, pictureURL) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.givenName = givenName;
    this.familyName = familyName;
    this.pictureURL = pictureURL;
  }
}

export default User;
