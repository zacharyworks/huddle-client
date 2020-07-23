import React, { Component } from 'react';
import './NewTodo.scss'

class NewTodo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            todoText: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.conn.send(
        `{
            "ActionSubset":"Todo",
            "ActionType":"Create",
            "ActionPayload":{
                "value":"${this.state.value}",
                "parentFK":${this.props.parentFK},
                "boardFK":${this.props.boardFK}
                }
         }
        `);
        // Empty the text field
        this.setState({value:''});
        event.preventDefault();
    }

     render() {
        return(
            <div className="AddTodo">
                <form className="AddTodo-Form" onSubmit={this.handleSubmit}>
                    <input tabIndex="1" type="text" placeholder={this.props.placeholder} value={this.state.value} onChange={this.handleChange}/>
                    <input type="submit" value="+" />
                </form>
            </div>
        );
    }
}

export default NewTodo;
