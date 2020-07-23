import React, { Component } from 'react';
import './JoinBoard.scss'

class JoinBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoText: ''
    };
    this.handleChange = this.handleChange.bind(this);

  }


  handleSubmit(event) {
    this.props.conn.send(
      `{
            "ActionSubset":"Board",
            "ActionType":"Create",
            "ActionPayload":{
                "name":"${this.state.value}",
                "boardType":1,
                }
         }
        `);
    // Empty the text field
    this.setState({value:''});
    event.preventDefault();
  }

  render() {
    return(
      <div className="JoinBoard">
        <form className="AddTodo-Form" onSubmit={this.handleSubmit}>
          <input tabIndex="1" type="text" placeholder={this.props.placeholder} value={this.state.value} onChange={this.handleChange}/>
          <input type="submit" value="+" />
        </form>
      </div>
    );
  }
}

export default JoinBoard;
