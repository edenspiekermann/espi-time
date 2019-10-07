import axios from 'axios';
import qs from 'qs';
import _ from 'lodash';
import chalk from 'chalk';
import dotenvM from 'dotenv-manipulator';
import self from './teamleader';
require('dotenv').config();

const {
  TEAMLEADER_CLIENT_ID,
  TEAMLEADER_CLIENT_SECRET,
  TEAMLEADER_API_TOKEN,
  TEAMLEADER_API_REFRESH,
  TEAMLEADER_USER_ID,
  TEAMLEADER_WORK_TYPE_ID,
} = process.env;

const log = console.log;
const api = axios.create({
  headers: {
    Authorization: `Bearer ${TEAMLEADER_API_TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default {
  initialize: () => {
    const query = JSON.stringify({
      client_id: TEAMLEADER_CLIENT_ID,
      response_type: 'code',
      redirect_uri: 'https://github.com/edenspiekermann/espi-time',
    });

    log(`${chalk.yellow('Starting:')} Visit the following link...`);

    console.log(
      chalk.magenta(`https://app.teamleader.eu/oauth2/authorize?${query}`)
    );

    log(`Then copy the URL that you are redirected to. After that run...`);

    log(`${chalk.gray(`yarn authorizeTL ${chalk.bold('REPLACE_WITH_URL')}`)}`);
  },

  authorize: async redirect_uri => {
    try {
      const { code } = JSON.parse(redirect_uri.split('?')[1]);

      const success = await axios.post(
        'https://app.teamleader.eu/oauth2/access_token',
        {
          client_id: TEAMLEADER_CLIENT_ID,
          client_secret: TEAMLEADER_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'https://github.com/edenspiekermann/espi-time',
        }
      );

      const { access_token, refresh_token } = success.data;

      dotenvM.bulkUpdate(
        {
          TEAMLEADER_API_TOKEN: access_token,
          TEAMLEADER_API_REFRESH: refresh_token,
        },
        () => log(chalk.green('Application authorized!'))
      );

      return;
    } catch (error) {
      self._logError(endpoint, 'POST', params, error);
    }

    return false;
  },

  me: async () => {
    const me = await self.request(self.endpoint('users', 'me'), 'GET');
    const workTypes = await self.request(
      self.endpoint('workTypes', 'list'),
      'GET'
    );
    const workType = _.head(_.filter(workTypes, { name: me.function }));

    dotenvM.bulkUpdate(
      {
        TEAMLEADER_USER_ID: me.id,
        TEAMLEADER_WORK_TYPE_ID: workType.id,
      },
      () => log(chalk.green('User details saved!'))
    );

    return;
  },

  refresh: async () => {
    const endpoint = 'https://app.teamleader.eu/oauth2/access_token';

    try {
      const success = await axios.post(endpoint, {
        client_id: TEAMLEADER_CLIENT_ID,
        client_secret: TEAMLEADER_CLIENT_SECRET,
        refresh_token: TEAMLEADER_API_REFRESH,
        grant_type: 'refresh_token',
      });

      const { access_token, refresh_token } = success.data;

      dotenvM.bulkUpdate(
        {
          TEAMLEADER_API_TOKEN: access_token,
          TEAMLEADER_API_REFRESH: refresh_token,
        },
        () => log(chalk.green('Authorization refreshed!'))
      );

      return;
    } catch (error) {
      self._logError(endpoint, 'POST', {}, error);
    }

    return false;
  },

  request: async (endpoint, method, params = {}) => {
    try {
      const success = await api({
        url: endpoint,
        method,
        data: params,
        paramsSerializer: params => JSON.stringify(params),
      });

      return success.data.data;
    } catch (error) {
      self._logError(endpoint, method, params, error);
    }

    return false;
  },

  endpoint: (resource, action) =>
    resource && action && `https://api.teamleader.eu/${resource}.${action}`,

  getProjects: async () =>
    self.request(self.endpoint('projects', 'list'), 'GET', {
      filter: { status: 'active' },
    }),

  getMilestones: async (projectId = null) => {
    let milestones = await self.request(
      self.endpoint('milestones', 'list'),
      'GET',
      {
        filter: { status: 'open' },
        page: { size: 100 },
      }
    );

    if (projectId) {
      milestones = _.filter(milestones, { project: { id: projectId } });
    }

    return milestones;
  },

  getTimesheets: async () =>
    self.request(self.endpoint('timeTracking', 'list'), 'GET', {
      filter: { user_id: TEAMLEADER_USER_ID },
    }),

  getLastTimesheet: async () => {
    const lastTimesheets = await self.request(
      self.endpoint('timeTracking', 'list'),
      'GET',
      {
        filter: { user_id: TEAMLEADER_USER_ID },
        page: { size: 1 },
      }
    );
    const lastTimesheet = _.head(lastTimesheets);
    const date = new Date(lastTimesheet.started_on);

    date.setHours(0, 0, 0);
    dotenvM.bulkUpdate(
      {
        TEAMLEADER_LAST_SYNC: date.toISOString(),
      },
      () => log(chalk.green('Last timesheet recorded'))
    );

    return lastTimesheet;
  },

  getProject: async projectTitle =>
    _.head(
      _.filter(
        await self.getProjects(),
        obj => !obj.title.includes(projectTitle)
      )
    ),

  getMilestone: async milestoneId =>
    _.filter(self.getMilestones(), { id: milestoneId }),

  getTimesheet: async timesheetId =>
    _.filter(self.getTimesheets(), { id: timesheetId }),

  insertTimesheet: async timesheet => {
    const inserted = await self.request(
      self.endpoint('timeTracking', 'add'),
      'POST',
      {
        work_type_id: TEAMLEADER_WORK_TYPE_ID,
        ...timesheet,
      }
    );

    log(`${chalk.green('Added timesheet:')} ${timesheet.description}`);

    return inserted;
  },

  _logError: (endpoint, method, params, error) => {
    log(
      `${chalk.red(
        error.response.statusText
      )}: ${endpoint} ${method} ${JSON.stringify(params)}`
    );
  },
};
