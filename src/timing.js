// const env = require('dotenv');
import Axios from 'axios';
import _ from 'lodash';
import self from './timing';

const env = { TIMING_API_KEY: 'blah' };

export default {
  request: async (endpoint, params) => {
    try {
      const success = await Axios.get(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${env.TEAMLEADER_API_KEY}`,
        },
      });

      console.log(success.data);
    } catch (error) {
      console.log(error);
    }
  },

  endpoint: action => action && `https://web.timingapp.com/api/v1/${action}`,

  getProjects: () => {},

  getProject: projectTitle =>
    _.head(_.filter(self.getProjects(), { title: projectTitle })),

  updateProject: project => {
    self.request(self.endpoint(project.id, 'PUT'), project);
  },

  insertProject: project => {
    self.request(self.endpoint(project.id, 'POST'), project);
  },

  upsertProject: project => {},

  getTasks: (start, end) => {},
};
