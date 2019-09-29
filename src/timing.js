import axios from 'axios';
import qs from 'qs';
import _ from 'lodash';
import chalk from 'chalk';
import self from './timing';

const { TIMING_API_KEY, TIMING_NAMESPACE, TEAMLEADER_LAST_SYNC } = process.env;
const log = console.log;
const api = axios.create({
  headers: {
    Authorization: `Bearer ${TIMING_API_KEY}`,
  },
});

export default {
  request: async (endpoint, method, params = {}) => {
    try {
      const success = await api({
        url: endpoint,
        method,
        params,
        paramsSerializer: params =>
          qs.stringify(params, { arrayFormat: 'brackets' }),
      });

      return success.data.data;
    } catch (error) {
      log(
        `${chalk.red(
          error.response.statusText
        )}: ${method} ${endpoint} ${JSON.stringify(params)}`
      );
    }

    return false;
  },

  endpoint: action => action && `https://web.timingapp.com/api/v1${action}`,

  getRootPath: async () => {
    const root = await self.getProject(TIMING_NAMESPACE, true);

    return (root && root.self) || null;
  },

  getProjects: async () => self.request(self.endpoint('/projects'), 'GET', {}),

  getProject: async (projectTitle, exact = false) => {
    const projects = await self.getProjects();

    if (!projects) {
      return false;
    }

    if (exact) {
      return _.head(_.filter(projects, { title: projectTitle }));
    }

    return _.head(_.filter(projects, obj => obj.title.includes(projectTitle)));
  },

  insertProject: async project => {
    const rootPath = await self.getRootPath();

    if (rootPath) {
      const type = project.title ? 'co' : 'ms';
      const normalizeProject = {
        title: `${project.title || project.name} — ${type}|${project.id}`,
        parent: project.parent || (project.parent === undefined && rootPath),
      };

      const added = await self.request(
        self.endpoint('/projects'),
        'POST',
        normalizeProject
      );

      if (added && added.self) {
        log(`${chalk.green('Added:')} ${added.title}`);

        return added;
      }
    }

    return false;
  },

  upsertProject: async project => {
    const exists = await self.getProject(project.id);

    if (exists && exists.self) {
      log(`${chalk.yellow('Exists:')} ${exists.title}`);
      return exists;
    }

    if (exists === undefined) {
      return self.insertProject(project);
    }

    log(`${chalk.magenta('Existence error:')} ${project.title}`);

    return false;
  },

  getTasks: async () => self.request(self.endpoint('/time-entries')),

  updateTask: async task => {
    const updated = await self.request(self.endpoint(task.self), 'PUT', task);
    log(`${chalk.green('Updated task:')} ${updated.title}`);

    return updated;
  },

  getTasksSince: async (since = TEAMLEADER_LAST_SYNC) => {
    const rootPath = await self.getRootPath();

    if (rootPath) {
      return self.request(self.endpoint('/time-entries'), 'GET', {
        start_date_min: since,
        projects: [rootPath],
        include_project_data: true,
        include_child_projects: true,
      });
    }

    return false;
  },
};
