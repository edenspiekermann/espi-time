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

const { sync: syncTask } = yargs.usage('Usage: -n <name>').option('s', {
  alias: 'sync',
  describe:
    'The types of items synchronise.\r\n: Can either be "projects" or "timesheets"',
  type: 'string',
  demandOption: true,
}).argv;

if (syncTask === 'projects') {
  syncProjects();
} else if (syncTask === 'timesheets') {
  syncTimesheets();
}
