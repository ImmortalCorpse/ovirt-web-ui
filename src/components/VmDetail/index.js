import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import style from './style.css'
import sharedStyle from '../sharedStyle.css'

import {
  downloadConsole,
  getConsoleOptions,
  saveConsoleOptions,
  getRDP,
} from '../../actions/index'

import { isWindows, templateNameRenderer } from '../../helpers'

import Time from '../Time'
import FieldHelp from '../FieldHelp/index'
import DetailContainer from '../DetailContainer'
import ConsoleOptions from '../ConsoleOptions/index'
import { canConsole, userFormatOfBytes, VmIcon, VmDisks, VmStatusIcon } from 'ovirt-ui-components'
import Selectors from '../../selectors'

const LastMessage = ({ vmId, userMessages }) => {
  const vmMessages = userMessages.get('records')
    .filter(msg => (msg.failedAction && msg.failedAction.payload && msg.failedAction.payload.vmId === vmId))
    .sort((msg1, msg2) => (msg1.time - msg2.time))

  const lastMessage = vmMessages.last()

  if (!lastMessage) {
    return null
  }

  return (
    <span>
      <Time time={lastMessage.time} />
      <pre>
        {lastMessage.message}
      </pre>
    </span>
  )
}
LastMessage.propTypes = {
  vmId: PropTypes.string.isRequired,
  userMessages: PropTypes.object.isRequired,
}

const VmConsoles = ({ vm, onConsole, onRDP }) => {
  return (
    <dd>
      {canConsole(vm.get('status')) ? vm.get('consoles').map(c => (
        <a
          href='#'
          data-toggle='tooltip'
          data-placement='left'
          title={`Open ${c.get('protocol').toUpperCase()} console`}
          key={c.get('id')}
          onClick={() => onConsole({ vmId: vm.get('id'), consoleId: c.get('id') })}
          className={style['left-delimiter']}
          >
          {c.get('protocol').toUpperCase()}
        </a>
      )) : ''}
      {
        canConsole(vm.get('status')) && isWindows(vm.getIn(['os', 'type']))
        ? (<a href='#' key={vm.get('id')} onClick={onRDP} className={style['left-delimiter']}>
          RDP
        </a>)
        : ''
      }
    </dd>
  )
}
VmConsoles.propTypes = {
  vm: PropTypes.object.isRequired,
  onConsole: PropTypes.func.isRequired,
  onRDP: PropTypes.func.isRequired,
}

class VmDetail extends Component {
  constructor (props) {
    super(props)
    this.state = { renderDisks: true }
    this.consoleSettings = this.consoleSettings.bind(this)
  }

  consoleSettings () {
    this.props.onConsoleOptionsOpen()
    this.setState({
      openConsoleSettings: !this.state.openConsoleSettings,
    })
  }

  render () {
    const {
      vm,
      icons,
      userMessages,
      onConsole,
      isPool,
      onConsoleOptionsSave,
      options,
      pool,
      onRDP,
    } = this.props

    const name = isPool ? pool.get('name') : vm.get('name')
    const iconId = vm.getIn(['icons', 'small', 'id'])
    const icon = icons.get(iconId)
    const disks = vm.get('disks')
    const os = Selectors.getOperatingSystemByName(vm.getIn(['os', 'type']))
    const cluster = Selectors.getClusterById(vm.getIn(['cluster', 'id']))
    const template = Selectors.getTemplateById(vm.getIn(['template', 'id']))

    const onToggleRenderDisks = () => { this.setState({ renderDisks: !this.state.renderDisks }) }
    // const disksElement = this.state.renderDisks ? (<VmDisks disks={disks} />) : ''
    const hasDisks = disks.size > 0

    let optionsJS = options.hasIn(['options', 'consoleOptions', vm.get('id')]) ? options.getIn(['options', 'consoleOptions', vm.get('id')]).toJS() : {}

    const consoleOptionsIconClass = this.state.openConsoleSettings ? 'glyphicon-menu-up' : 'glyphicon-menu-down'
    const consoleOptionsShowHide = (
      <small>
        (<a href='#' onClick={this.consoleSettings}>
          <i className={`glyphicon ${consoleOptionsIconClass}`} />&nbsp;
          {this.state.openConsoleSettings ? 'hide' : 'show'}
        </a>)
      </small>)

    const disksIconClass = this.state.renderDisks ? 'glyphicon-menu-up' : 'glyphicon-menu-down'
    const disksShowHide = (
      <small>
        ({hasDisks
        ? (<a href='#' onClick={onToggleRenderDisks}>
          <i className={`glyphicon ${disksIconClass}`} />&nbsp;
          {this.state.renderDisks ? 'hide' : 'show'}
        </a>)
        : 'no disks'
      })
      </small>
    )

    return (
      <DetailContainer>
        <h1 className={style['header']}>
          <VmIcon icon={icon} missingIconClassName='pficon pficon-virtual-machine' className={sharedStyle['vm-detail-icon']} />
          &nbsp;{name}
        </h1>
        <LastMessage vmId={vm.get('id')} userMessages={userMessages} />
        <div className={style['vm-detail-container']}>
          <dl className={sharedStyle['vm-properties']}>
            <dt>State
              <FieldHelp title='State' content='The actual state the virtual machine is in.' />
            </dt>
            <dd><VmStatusIcon state={vm.get('status')} />&nbsp;{vm.get('status')}
            </dd>

            <dt>Description
              <FieldHelp title='Description' content='Optional user description of the virtual machine.' />
            </dt>
            <dd>{vm.get('description')}</dd>

            <dt>Cluster
              <FieldHelp title='Cluster' content='Group of hosts the virtual machine can be running on.' />
            </dt>
            <dd>{cluster ? cluster.get('name') : ''}</dd>

            <dt>Template
              <FieldHelp title='Template' content='Contains the configuration and disks which will be used to create this virtual machine. Please customize as needed.' />
            </dt>
            <dd>{template ? templateNameRenderer(template) : ''}</dd>

            <dt>Operating System
              <FieldHelp title='Operating System' content='Operating system installed on the virtual machine.' />
            </dt>
            <dd>{os ? os.get('description') : vm.getIn(['os', 'type'])}</dd>

            <dt><span className='pficon pficon-memory' />&nbsp;Defined Memory
              <FieldHelp title='Memory' content='Total memory the virtual machine will be equipped with. In megabytes.' />
            </dt>
            <dd>{userFormatOfBytes(vm.getIn(['memory', 'total'])).str}</dd>

            <dt><span className='pficon pficon-cpu' />&nbsp;CPUs
              <FieldHelp title='Number of CPUs' content='Total count of virtual processors the virtual machine will be equipped with.' />
            </dt>
            <dd>{vm.getIn(['cpu', 'vCPUs'])}</dd>

            <dt><span className='pficon pficon-network' />&nbsp;Address
              <FieldHelp title='FQDN' content='Fully Qualified Domain Name of the virtual machine. Please not, guest agent must be installed within the virtual machine to collect this value.' />
            </dt>
            <dd>{vm.get('fqdn')}</dd>
          </dl>

          <dl className={sharedStyle['vm-properties']}>
            <dt><span className='pficon pficon-screen' /> Console&nbsp;{consoleOptionsShowHide}</dt>
            <VmConsoles vm={vm} onConsole={onConsole} onRDP={onRDP} />
            <ConsoleOptions options={optionsJS} onSave={onConsoleOptionsSave} open={this.state.openConsoleSettings} />
            <dt><span className='fa fa-database' /> Disks&nbsp;{disksShowHide}</dt>
            <dd><VmDisks disks={disks} open={this.state.renderDisks} /></dd>
          </dl>
        </div>
      </DetailContainer>
    )
  }
}
VmDetail.propTypes = {
  vm: PropTypes.object,
  pool: PropTypes.object,
  icons: PropTypes.object.isRequired,
  userMessages: PropTypes.object.isRequired,
  onConsole: PropTypes.func.isRequired,
  onConsoleOptionsSave: PropTypes.func.isRequired,
  onConsoleOptionsOpen: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  isPool: PropTypes.bool,
  config: PropTypes.object.isRequired,
  onRDP: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    icons: state.icons,
    userMessages: state.userMessages,
    options: state.options,
  }),

  (dispatch, { vm, config }) => ({
    onConsole: ({ vmId, consoleId }) => dispatch(downloadConsole({ vmId, consoleId })),
    onConsoleOptionsSave: ({ options }) => dispatch(saveConsoleOptions({ vmId: vm.get('id'), options })),
    onConsoleOptionsOpen: () => dispatch(getConsoleOptions({ vmId: vm.get('id') })),
    onRDP: () => dispatch(getRDP({ vmName: vm.get('name'), username: config.getIn([ 'user', 'name' ]), domain: config.get('domain'), fqdn: vm.get('fqdn') })),
  })
)(VmDetail)
