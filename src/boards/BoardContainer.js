import React, { Component } from 'react';
import './BoardContainer.scss'
import PersonalCard from './PersonalCard';

class BoardContainer extends Component {

    constructor() {
        super()
        this.state = {


        };

    }

    render() {
      return(
        <div className="BoardContainer">
          <PersonalCard/>
        </div>
      );
    }
}

export default BoardContainer;