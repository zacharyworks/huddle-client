import React from 'react';
import './TodoToolbar.scss';
import PropTypes from 'prop-types';
import TodoToolbarOnline from './TodoToolbarOnline';

class TodoToolbar extends React.Component {
  render() {
    const { peers } = this.props;
    return (
      <div className="TodoToolbar">
        <TodoToolbarOnline peers={peers} />
      </div>
    );
  }
}

TodoToolbar.propTypes = {
  peers: PropTypes.instanceOf(Map).isRequired,
};

export default TodoToolbar;
