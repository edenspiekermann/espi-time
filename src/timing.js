// const env = require('dotenv');
import Axios from 'axios';
import _ from 'lodash';
import self from './timing';

const { TIMING_API_KEY, TIMING_NAMESPACE } = process.env;

export default {
  request: async (endpoint, method, params = {}) => {
    try {
      const success = await Axios({
        url: endpoint,
        method,
        data: params,
        headers: {
          Authorization: `Bearer ${TIMING_API_KEY}`,
        },
      });

      return success.data;
    } catch (error) {
      console.log(error);
    }
  },

  endpoint: action => action && `https://web.timingapp.com/api/v1${action}`,

  getRoot: async () => {
    const root = await self.upsertProject({
      title: TIMING_NAMESPACE,
      parent: null,
    });

    console.log({ root });

    return root.data.self;
  },

  getProjects: async () => self.request(self.endpoint('/projects'), 'GET'),

  getProject: async projectTitle => {
    const search = await self.request(self.endpoint('/projects'), 'GET', {
      title: projectTitle,
    });

    return (search.data && search.data[0]) || null;
  },

  updateProject: async project =>
    await self.request(self.endpoint(project.self), 'PUT', project),

  insertProject: async project => {
    const normalizeProject = {
      title: project.title || project.name,
      parent:
        project.parent ||
        (project.parent === undefined && (await self.getRoot())) ||
        null,
    };

    return await self.request(
      self.endpoint('/projects'),
      'POST',
      normalizeProject
    );
  },

  upsertProject: async project => {
    const exists = await self.getProject(project.title || project.name);
    console.log({ exists });

    if (exists) {
      return self.updateProject(exists);
    }

    return self.insertProject(project);
  },

  getTasks: (start, end) => {},
};
