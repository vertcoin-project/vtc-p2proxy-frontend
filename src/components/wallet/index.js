import { h, Component } from 'preact'
import callAll from 'call-all-fns'
import PropTypes from 'prop-types'
import api from '../../api'
import poll from '../../util/poll'

export default class WalletStats extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired
  }

  state = {
    stats: {},
    hashrate: '',
    balance: '',
    paid: ''
  }

  componentDidMount() {
    const { address } = this.props
    this.stop = callAll([
      poll(
        () => api.walletStats({ address }),
        (err, result) => this.setState({ stats: result })
      ),
      poll(
        () => api.walletHashrate({ address }),
        (err, result) => this.setState({ hashrate: result })
      ),
      poll(
        () => api.walletBalance({ address }),
        (err, result) => this.setState({ balance: result })
      ),
      poll(
        () => api.walletPaid({ address }),
        (err, result) => this.setState({ paid: result })
      )
    ])
  }

  componentWillUnmount() {
    this.stop()
  }

  render(props, state) {
    return (
      <div>
        <h4 class="text-md">Hash Rate</h4>
        {state.hashrate && ((parseFloat(state.hashrate[0].split(',')[0]))/(5*60)*2**32)*10**(-6)} MH/s
        <h4 class="text-md">Balance</h4>
        {state.balance} VTC
        <h4 class="text-md">Paid</h4>
        {state.paid}
        <h4 class="text-md">Stats</h4>
        {state.stats && this.renderStats()}
      </div>
    )
  }

  renderStats() {
    const { stats } = this.state
    const startDate = new Date(Math.round(stats.start_time * 1000))
    return (
      <dl>
        <dt>Started At</dt>
        <dd>
          {startDate.toLocaleDateString()}, {startDate.toLocaleTimeString()}
        </dd>
        <dt>Shares</dt>
        <dd>{stats.shares}</dd>
        <dt>Total Shares</dt>
        <dd>{Math.round(stats.total_shares * 1e8) / 1e8}</dd>
        <dt>Average Valid</dt>
        <dd>{Math.round(stats.average_valid * 1e8) / 1e8}</dd>
        <dt>Average Invalid</dt>
        <dd>{Math.round(stats.average_invalid * 1e8) / 1e8}</dd>
        <dt>Total Invalid Shares</dt>
        <dd>{Math.round(stats.total_invalid_shares * 1e8) / 1e8}</dd>
      </dl>
    )
  }

  renderHashrate() {}
}
