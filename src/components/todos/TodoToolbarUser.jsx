import React, { Component } from 'react';
import './TodoToolbarUser.scss';
import PropTypes from 'prop-types';
import User from '../../objects/User';

class TodoToolbarUser extends Component {
  render() {
    const { user } = this.props;

    const style = {
      border: `2px solid ${user.colour}`,
    };
    return (
      <div className="TodoToolbarUser">
        <img src={user.pictureURL} alt={user.name} referrerPolicy="no-referrer" style={style} />
      </div>
    );
  }
}

TodoToolbarUser.propTypes = {
  user: PropTypes.instanceOf(User).isRequired,
};

export default TodoToolbarUser;
