import Axios from 'axios';
import _ from 'lodash';
import qs from 'query-string';
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
    } catch (error) {
      console.log(error);
    }
  },

  refresh: async () => {
    try {
      const success = await Axios.post(
        'https://app.teamleader.eu/oauth2/access_token',
        {
          client_id: TEAMLEADER_CLIENT_ID,
          client_secret: TEAMLEADER_CLIENT_SECRET,
          refresh_token: TEAMLEADER_API_REFRESH,
          grant_type: 'refresh_token',
        }
      );

      const { access_token, refresh_token } = success.data;

      dotenvM.bulkUpdate(
        {
          TEAMLEADER_API_TOKEN: access_token,
          TEAMLEADER_API_REFRESH: refresh_token,
        },
        () => null
      );
    } catch (error) {
      console.log(error);
    }
  },

  request: async (endpoint, params) => {
    try {
      await self.refresh();

      const success = await Axios.get(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${TEAMLEADER_API_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return success.data;
    } catch (error) {
      console.log(error);
    }
  },

  endpoint: (resource, action) =>
    resource && action && `https://api.teamleader.eu/${resource}.${action}`,

  getProjects: async () =>
    await self.request(self.endpoint('projects', 'list'), {
      page: { size: 999 },
    }),

  getMilestones: async projectId => {
    let params = { page: { size: 999 } };

    if (projectId) {
      params['filter'] = { project_id: projectId };
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
};
