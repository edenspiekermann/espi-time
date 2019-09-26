import _ from 'lodash';
import yargs from 'yargs';
import tl from './src/teamleader';
import ta from './src/timing';

const syncProjects = async () => {
  const tlProjects = await tl.getProjects();
  // console.log(tlProjects);

  _.each(tlProjects, async tlProject => {
    const parent = await ta.upsertProject(tlProject);
    const tlMilestones = await tl.getMilestones(tlProject.id);
    // console.log(tlMilestones);

    _.each(tlMilestones, async tlMilestone => {
      // console.log(parent);
      console.log({
        parent: parent && parent.self,
        title: tlMilestone.name,
      });
      // if (parent) {
      const child = await ta.upsertProject({
        parent: parent && parent.self,
        title: tlMilestone.name,
      });

      //   console.log({ child });
      // }
    });
  });
};

const syncTimesheets = () => {
  console.log(ta);
};

const { initializeTL, authorizeTL, refreshTL, projects, timesheets } = yargs
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

if (projects) {
  syncProjects();
}

if (timesheets) {
  syncTimesheets();
}
