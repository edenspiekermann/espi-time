import _ from 'lodash';
import yargs from 'yargs';
import tl from './src/teamleader';
import ta from './src/timing';

const syncProjects = async () => {
  const tlProjects = await tl.getProjects();

  _.each(tlProjects, tlProject => {
    const tlMilestones = tl.getMilestones(tlProject.id);
    // ta.upsertProject(tlProject);
    console.log(tlProject);

    _.each(tlMilestones, tlMilestone => {
      // ta.upsertProject(tlMilestone);
      console.log(tlMilestone);
    });
  });
};

const syncTimesheets = () => {
  console.log(ta);
};

const { initialize, authorize, execute } = yargs
  .usage('Usage: -n <name>')
  .option('init', {
    alias: 'initialize',
    describe: 'Generate authentication details for Teamleader access',
    type: 'string',
  })
  .option('auth', {
    alias: 'authorize',
    describe:
      'Redirect URI generated from init. Will authenticate the app and store details in .env',
    type: 'string',
    requiresArg: true,
  })
  .option('e', {
    alias: 'execute',
    describe:
      'The task you want to execute.\r\n: Options are "projects" or "timesheets"',
    type: 'string',
    choices: ['projects', 'timesheets'],
  }).argv;

if (initialize) {
  tl.initialize();
}

if (authorize) {
  tl.authorize(authorize);
}

if (execute === 'projects') {
  syncProjects();
} else if (execute === 'timesheets') {
  syncTimesheets();
}
