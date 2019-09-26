import Axios from 'axios';
import _ from 'lodash';
import qs from 'qs';
import dotenvM from 'dotenv-manipulator';
import self from './teamleader';
require('dotenv').config();

const {
  TEAMLEADER_CLIENT_ID,
  TEAMLEADER_CLIENT_SECRET,
  TEAMLEADER_API_TOKEN,
  TEAMLEADER_API_REFRESH,
} = process.env;

export default {
  initialize: () => {
    const query = qs.stringify({
      client_id: TEAMLEADER_CLIENT_ID,
      response_type: 'code',
      redirect_uri: 'https://github.com/edenspiekermann/espi-time',
    });

    console.log(
      'Visit the following link and copy the URL that you are redirected to. Then run '
    );

    console.log(
      'Then run the task again like this: babel-node . --auth REPLACE_WITH_URL'
    );

    console.log(`https://app.teamleader.eu/oauth2/authorize?${query}`);
  },

  authorize: async redirect_uri => {
    try {
      const { code } = qs.parse(redirect_uri.split('?')[1]);

      const params = {
        client_id: TEAMLEADER_CLIENT_ID,
        client_secret: TEAMLEADER_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://github.com/edenspiekermann/espi-time',
      };

      const success = await Axios.post(
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
        () => console.log('Application authorized!')
      );

      return;
    } catch (error) {
      self._logError(endpoint, params, error);
    }

    return false;
  },

  refresh: async () => {
    const endpoint = 'https://app.teamleader.eu/oauth2/access_token';

    try {
      const success = await Axios.post(endpoint, {
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
        () => console.log({ access_token, refresh_token })
      );

      return;
    } catch (error) {
      self._logError(endpoint, {}, error);
    }

    return false;
  },

  request: async (endpoint, params) => {
    try {
      // await self.refresh();

      const success = await Axios.get(endpoint, {
        params: params,
        paramsSerializer: params =>
          qs.stringify(params, { arrayFormat: 'brackets' }),
        headers: {
          Authorization: `Bearer ${TEAMLEADER_API_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return success.data.data;
    } catch (error) {
      self._logError(endpoint, params, error);
    }

    return false;
  },

  endpoint: (resource, action) =>
    resource && action && `https://api.teamleader.eu/${resource}.${action}`,

  getProjects: async () =>
    await self.request(self.endpoint('projects', 'list'), {
      filter: { status: 'active' },
      page: { size: 100 },
    }),

  getMilestones: async projectId => {
    let params = { filter: { status: 'open' }, page: { size: 100 } };

    if (projectId) {
      params['filter']['project_id'] = projectId;
    }

    return await self.request(self.endpoint('milestones', 'list'), params);
  },

  getTimesheets: () => {},

  getProject: projectTitle =>
    _.head(_.filter(self.getProjects(), { title: projectTitle })),

  getMilestone: milestoneId =>
    _.filter(self.getMilestones(), { id: milestoneId }),

  getTimesheet: timesheetId =>
    _.filter(self.getTimesheets(), { id: timesheetId }),

  upsertTimesheet: timesheet => {},

  _logError: (endpoint, params, error) => {
    const { status, statusText } = error.response;
    console.log({ endpoint, params, status, statusText });
  },
};
