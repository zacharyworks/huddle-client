import React, { Component } from 'react';
import './PersonalCard.scss'

class PersonalCard extends Component {

    render() {
      return(
        <div className="PersonalCard">
            <div className="PersonalCard-user-name">
                Zachary Briggs
            </div>


            <button className="PersonalCard-button">Personal Board</button>

        </div>
      );
    }
}

export default PersonalCard;