import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import style from './style.css'

import Time from '../Time'

import { clearUserMessages } from '../../actions/vm'
import { hrefWithoutHistory } from '../../helpers'
import { msg } from '../../intl'

const UserMessage = ({ record, id }) => {
  // TODO: render record.type
  return (
    <li className={`list-group-item ${style.crop}`} title={record.message} data-toggle='tooltip'>
      <span>
        <pre className={style['message-box']} id={id}>
          <Time time={record.time} cssClass={style['usermsg-time']} />
          {record.message}
        </pre>
      </span>
    </li>
  )
}
UserMessage.propTypes = {
  record: PropTypes.object.isRequired,
  id: PropTypes.string,
}

const ContactAdminInfo = ({ userMessages, id }) => {
  if (userMessages.get('records').size === 0) {
    return null
  }

  return (
    <div className={style['contact-admin']} id={id}>
      Contact your administrator in case of issues
    </div>
  )
}
ContactAdminInfo.propTypes = {
  userMessages: PropTypes.object.isRequired,
  id: PropTypes.string,
}

class VmUserMessages extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
    }
  }

  render () {
    const { userMessages, onClearMessages } = this.props

    const idPrefix = `usermsgs`
    const onToggle = () => {
      this.setState({ show: !this.state.show })
    }

    let show = ''
    if (this.state.show) {
      show = 'show'
    }

    let idCounter = 0
    return (
      <li className='dropdown'>
        <a className='dropdown-toggle nav-item-iconic' href='#' title={msg.messages()} onClick={hrefWithoutHistory(onToggle)} id={`${idPrefix}-toggle`}>
          <i className='fa fa-bell' />
          <span className='badge' id={`${idPrefix}-size`}>{userMessages.get('records').size}</span>
          <span className='caret' id={`${idPrefix}-caret`} />
        </a>

        <div className={`dropdown-menu dropdown-menu-right infotip bottom-right ${show}`}>
          <div className={`arrow ${style['fix-arrow-position']}`} />

          <ul className={`list-group ${style['messages-list']}`}>
            {userMessages.get('records').map(r => (<UserMessage key={r.time} record={r} id={`${idPrefix}-msg-${idCounter++}`} />))}
          </ul>
          <ContactAdminInfo userMessages={userMessages} id={`${idPrefix}-contact`} />

          <div className='footer'>
            <a href='#' onClick={hrefWithoutHistory(onClearMessages)} id={`${idPrefix}-clear`}>{msg.clearMessages()}</a>
            <a href='#' onClick={hrefWithoutHistory(onToggle)} className={style['close-button']} id={`${idPrefix}-close`}>{msg.close()}</a>
          </div>
        </div>
      </li>
    )
  }
}
VmUserMessages.propTypes = {
  userMessages: PropTypes.object.isRequired,
  onClearMessages: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userMessages: state.userMessages,
  }),
  (dispatch) => ({
    onClearMessages: () => dispatch(clearUserMessages()),
  })
)(VmUserMessages)
