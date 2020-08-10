import React, { Component } from 'react';
import './BoardNew.scss';

class BoardNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    this.props.conn.send(
      `{
            "subset":"Board",
            "type":"BoardNew",
            "payload":{
                "userFK":"${this.props.user.id}",
                "board": {
                    "name": "${this.state.value}",
                    "boardType": 1
                }
            }
         }
        `,
    );

    // Empty the text field
    this.setState({ value: '' });
    event.preventDefault();
  }

  render() {
    return (
      <div className="NewBoard">
        <form className="NewBoard-Form" onSubmit={this.handleSubmit}>
          <input tabIndex="1" type="text" size="10" placeholder="Name" value={this.state.value} onChange={this.handleChange} />
          <input type="submit" value="Create" />
        </form>
      </div>
    );
  }
}

export default BoardNew;
