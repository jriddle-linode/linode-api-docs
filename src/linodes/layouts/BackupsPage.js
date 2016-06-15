import React, { Component, PropTypes } from 'react';
import { updateLinode, fetchLinodes } from '~/actions/api/linodes';
import { selectBackup } from '~/linodes/actions/detail/backups';
import { connect } from 'react-redux';
import HelpButton from '~/components/HelpButton';
import _ from 'lodash';
import moment, { ISO_8601 } from 'moment';

const backups = [
  {
    type: 'manual',
    id: 'backup_24',
    created: '2016-06-09T15:05:55',
    finished: '2016-06-09T15:06:55',
    status: 'successful',
    datacenter: {
      label: 'Newark, NJ',
      id: 'datacenter_6',
    },
  },
  {
    type: 'daily',
    id: 'backup_25',
    created: '2016-06-09T15:05:55',
    finished: '2016-06-09T15:06:55',
    status: 'successful',
    datacenter: {
      label: 'Newark, NJ',
      id: 'datacenter_6',
    },
  },
  {
    type: 'weekly',
    id: 'backup_26',
    created: '2016-06-08T15:05:55',
    finished: '2016-06-08T15:06:55',
    status: 'successful',
    datacenter: {
      label: 'Newark, NJ',
      id: 'datacenter_6',
    },
  },
  {
    type: 'weekly',
    id: 'backup_27',
    created: '2016-06-01T15:05:55',
    finished: '2016-06-01T15:06:55',
    status: 'successful',
    datacenter: {
      label: 'Newark, NJ',
      id: 'datacenter_6',
    },
  },
];

export class BackupsPage extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getLinode = this.getLinode.bind(this);
    this.renderNotEnabled = this.renderNotEnabled.bind(this);
    this.renderEnabled = this.renderEnabled.bind(this);
    this.renderSchedule = this.renderSchedule.bind(this);
    this.renderBackup = this.renderBackup.bind(this);
    this.renderBackups = this.renderBackups.bind(this);
    this.renderLastManualBackup = this.renderLastManualBackup.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
    }
    dispatch(fetchLinodes());
  }

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes[linodeId];
  }

  renderBackup(backup, title = null) {
    const calendar = {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: 'Yesterday',
      lastWeek: 'dddd',
      sameElse: ISO_8601,
    };
    const { dispatch } = this.props;
    const { selectedBackup } = this.props.backups;
    const cardTitle = title || backup.created.calendar(null, calendar);
    return (
      <div
        className={`backup ${selectedBackup === backup.id ? 'selected' : ''}`}
        onClick={() => dispatch(selectBackup(backup.id))}
      >
        <h3>{cardTitle}</h3>
        <dl className="dl-horizontal row">
          <dt className="col-sm-2">Date</dt>
          <dd className="col-sm-10">{backup.created.format('dddd, MMMM D YYYY')}</dd>
          <dt className="col-sm-2">Time</dt>
          <dd className="col-sm-10">{backup.created.format('LT')}</dd>
        </dl>
      </div>
    );
  }

  renderBackups() {
    if (backups.length === 0) {
      return (
        <p>
          No backups yet.
          First automated backup is scheduled for {'8 hours'/* TODO */} from now.
        </p>
      );
    }
    const { selectedBackup } = this.props.backups;
    const { linodes } = this.props;
    const datedBackups = _.map(backups, b => _.reduce(b, (a, v, k) =>
      ({ ...a, [k]: k === 'created' || k === 'finished' ? moment(v) : v }), { }));
    const daily = datedBackups.find(b => b.type === 'daily');
    const thisweek = _.sortBy(datedBackups, b => b.date).find(b => b.type === 'weekly');
    const lastweek = _.reverse(_.sortBy(datedBackups, b => b.date)).find(b => b.type === 'weekly');
    const manual = datedBackups.find(b => b.type === 'manual');
    return (
      <div>
        <div className="row backups">
          <div className="col-md-3">
            {this.renderBackup(daily)}
          </div>
          <div className="col-md-3">
            {this.renderBackup(thisweek, 'This week')}
          </div>
          <div className="col-md-3">
            {this.renderBackup(lastweek, 'Last week')}
          </div>
          <div className="col-md-3">
            {this.renderBackup(manual, 'Manual')}
          </div>
        </div>
        <div className="row restore">
          <div className="col-md-1">
            Restore to:
          </div>
          <div className="col-md-4">
            <div className="radio">
              <label>
                <input type="radio" name="restore-target" checked />
                New Linode
              </label>
            </div>
            <div className="radio">
              <label>
                <input type="radio" name="restore-target" />
                Existing Linode
              </label>
              <select className="form-control">
                {Object.values(linodes.linodes).filter(l => l.id !== this.getLinode().id)
                  .map(l => <option value={l.id} key={l.id}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={selectedBackup === null}
        >Restore backup</button>
      </div>
    );
  }

  renderSchedule() {
    return (
      <div className="backup-schedule">
        <div className="form-group row">
          <label htmlFor="schedule" className="col-md-4 form-control-label">
            {/* TODO: Use user time settings */}
            Time of Day (EST):
          </label>
          <div className="col-md-4">
            <select className="form-control" id="schedule">
              <option>12-2 AM</option>
              <option>2-4 AM</option>
              <option>4-6 AM</option>
              <option>6-8 AM</option>
              <option>8-10 AM</option>
              <option>10 AM-12 PM</option>
              <option>12-2 PM</option>
              <option>2-4 PM</option>
              <option>4-6 PM</option>
              <option>6-8 PM</option>
              <option>8-10 PM</option>
              <option>10 PM-12 AM</option>
            </select>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="dow" className="col-md-4 form-control-label">
            Day of week:
          </label>
          <div className="col-md-4">
            <select className="form-control" id="dow">
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <p className="text-muted">
              The weekly and bi-weekly backups store the one
              and two week old backup created this day, respectively.
            </p>
            <button
              className="btn btn-primary"
            >Save</button>
            <button
              className="btn btn-danger-outline"
            >Cancel backups</button>
          </div>
        </div>
      </div>
    );
  }

  renderLastManualBackup() {
    const lastManualBackup = null; // TODO
    if (lastManualBackup) {
      return (
        <p>TODO</p>
      );
    }
    return <p>No manual backups have been taken yet.</p>;
  }

  renderEnabled() {
    return (
      <div>
        <h2>Details and restore</h2>
        {this.renderBackups()}
        <hr />
        <div className="row">
          <div className="col-md-6">
            <h2>
              Schedule
              <HelpButton to="http://example.org" />
            </h2>
            {this.renderSchedule()}
          </div>
          <div className="col-md-6">
            <h2>Manual Backup</h2>
            {this.renderLastManualBackup()}
            <button
              className="btn btn-primary"
            >Take backup</button>
          </div>
        </div>
      </div>
    );
  }

  renderNotEnabled() {
    return (
      <div>
        <p>Backups are not enabled for this Linode.</p>
        <button
          className="btn btn-primary"
        >Enable backups</button>
        <HelpButton to="http://example.org" />
      </div>
    );
  }

  render() {
    return this.renderEnabled();
  }
}

BackupsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  backups: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    backups: state.linodes.detail.backups,
  };
}

export default connect(select)(BackupsPage);
