import _ from 'lodash';
import yargs from 'yargs';
import tl from './src/teamleader';
import ta from './src/timing';

const tempProjects = {
  data: [
    {
      id: '624ca743-8998-4f8c-add1-c427bb022166',
      reference: 'PRO-2',
      title: 'New company website',
      description: '',
      status: 'active',
      customer: {
        type: 'contact',
        id: 'abbf02c0-8ff9-4048-b83f-5195035161e1',
      },
      starts_on: '2016-02-04',
      due_on: '2016-10-14',
      source: {
        type: 'deal',
        id: '5023d7c2-80d7-4d4b-b2bd-0fcaa6a1f069',
      },
    },
  ],
};

const tempMilestones = {
  data: [
    {
      id: 'cfb4146d-06be-41f1-bb39-aa3c929c71dc',
      project: {
        type: 'project',
        id: '944534fb-15f1-4eea-aab1-82a427aa2d0d',
      },
      due_on: '2018-01-01',
      name: 'Initial setup',
      responsible_user: {
        type: 'user',
        id: 'e1240972-6cfc-4549-b49c-edda7568cc48',
      },
      status: 'done',
      invoicing_method: 'time_and_materials',
    },
  ],
};

const syncProjects = async () => {
  // const tlProjects = await tl.getProjects();
  const tlProjects = tempProjects;
  // console.log(tlProjects);

  _.each(tlProjects.data, async tlProject => {
    // const tlMilestones = await tl.getMilestones(tlProject.id);
    const tlMilestones = tempMilestones;
    const parent = await ta.upsertProject(tlProject);
    console.log({ parent });

    _.each(tlMilestones.data, async tlMilestone => {
      const child = await ta.upsertProject({
        parent: parent && parent.data && parent.data.self,
        ...tlMilestone,
      });

      console.log({ child });
    });
  });
};

const syncTimesheets = () => {
  console.log(ta);
};

const { initializeTL, authorizeTL, projects, timesheets } = yargs
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

if (projects) {
  syncProjects();
}

if (timesheets) {
  syncTimesheets();
}
