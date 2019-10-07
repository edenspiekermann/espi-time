import _ from 'lodash';
import yargs from 'yargs';
import chalk from 'chalk';
import tl from './src/teamleader';
import ta from './src/timing';

const syncProjects = async () => {
  const tlProjects = await tl.getProjects();

  _.each(tlProjects, async tlProject => {
    const parent = await ta.upsertProject(tlProject);

    if (parent && parent.self) {
      const tlMilestones = await tl.getMilestones(tlProject.id);

      if (tlMilestones) {
        _.each(tlMilestones, async tlMilestone => {
          await ta.upsertProject({
            parent: parent.self,
            ...tlMilestone,
          });
        });
      }
    }
  });
};

const syncTimesheets = async () => {
  const tasksSince = await ta.getTasksSince();

  _.each(tasksSince, async task => {
    const { title, notes, start_date, end_date, project } = task;
    const [entry, prev] = _.split((notes || '').slice(-41), '|');
    const typesMap = { ms: 'milestone', pr: 'company', co: 'company' };
    const [type, id] = _.split(project.title.slice(-39), '|');

    if (entry !== '— te' && type && id) {
      const started = new Date(start_date);
      const ended = new Date(end_date);
      started.setSeconds(0, null);
      ended.setSeconds(0, null);

      const startedTrim = `${started.toISOString().slice(0, -5)}+00:00`;
      const endedTrim = `${ended.toISOString().slice(0, -5)}+00:00`;

      const insert = {
        started_at: startedTrim,
        ended_at: endedTrim,
        description: `${title || ''}: ${notes || ''}`,
        subject: {
          type: typesMap[type],
          id: id,
        },
      };

      const inserted = await tl.insertTimesheet(insert);

      if (inserted && inserted.id) {
        const update = {
          self: task.self,
          notes: `${task.notes || ''} — te|${inserted.id}`,
        };

        await ta.updateTask(update);
      }
    }
  });

  await tl.getLastTimesheet();
};

const {
  initializeTL,
  authorizeTL,
  refreshTL,
  meTL,
  projects,
  timesheets,
} = yargs
  .usage('Usage: -n <name>')
  .option('i', {
    alias: 'initializeTL',
    describe: 'Generate authentication details for Teamleader access',
    type: 'boolean',
  })
  .option('a', {
    alias: 'authorizeTL',
    describe:
      'Redirect URI generated from init. Will authenticate the app and store details in .env',
    type: 'string',
    requiresArg: true,
  })
  .option('r', {
    alias: 'refreshTL',
    describe: 'Refresh authorization',
    type: 'boolean',
  })
  .option('m', {
    alias: 'meTL',
    describe: 'Set user ID',
    type: 'boolean',
  })
  .option('p', {
    alias: 'projects',
    describe: 'Sync projects and milestones from Teamleader to Timing app',
    type: 'boolean',
  })
  .option('t', {
    alias: 'timesheets',
    describe: 'Sync tasks from Timing App to Teamleader',
    type: 'boolean',
  }).argv;

if (initializeTL) {
  tl.initialize();
}

if (authorizeTL) {
  tl.authorize(authorizeTL);
}

if (refreshTL) {
  tl.refresh();
}

if (meTL) {
  tl.me();
}

if (projects) {
  syncProjects();
}

if (timesheets) {
  syncTimesheets();
}
