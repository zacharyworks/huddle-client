import React, {Component} from 'react';
import './Header.scss';
import './hamburgers/hamburgers.scss'

class Header extends Component {
  render() {
    return (
      <header>
        <div id='head-left'>
          Huddle

        </div>

        <div id='head-right'>
          <div>
            {this.props.openBoardName}
          </div>
          <div>
            <button className={"hamburger hamburger--collapse " +
              (this.props.dashOpen ? 'is-active' : ' ')}
                    type="button"
                    onClick={e => this.props.toggleDash()}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
