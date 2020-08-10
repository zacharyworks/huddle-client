import React, { Component } from 'react';
import './TodoToolbarOnline.scss';
import PropTypes from 'prop-types';
import TodoToolbarUser from './TodoToolbarUser';

class TodoToolbarOnline extends Component {
  render() {
    const { peers } = this.props;
    const listOfPeers = (Array.from(peers.values()));
    return (
      <div className="TodoToolbarOnline">
        online
        {
          listOfPeers.map((user) => (
            <TodoToolbarUser
              key={user.id}
              user={user}
            />
          ))
        }
      </div>
    );
  }
}

TodoToolbarOnline.propTypes = {
  peers: PropTypes.instanceOf(Map).isRequired,
};

export default TodoToolbarOnline;
