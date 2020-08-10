import React, { Component } from 'react';
import './BoardJoin.scss';

class BoardJoin extends Component {
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
            "type":"BoardJoin",
            "payload":{
                "userFK":"${this.props.user.id}",
                "code":"${this.state.value}"
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
      <div className="JoinBoard">
        <form className="JoinBoard-Form" onSubmit={this.handleSubmit}>
          <input tabIndex="1" type="text" size="10" placeholder="Join" value={this.state.value} onChange={this.handleChange} />
          <input type="submit" value="Join" />
        </form>
      </div>
    );
  }
}

export default BoardJoin;
