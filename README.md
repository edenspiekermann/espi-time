# ESPI Time

Sync your tasks in Timing to Teamleader seemlessly.

### Installation

Clone the repo.

Install with yarn.

```
yarn install
```

### Set-up

Go to your [Timing app](LINK) and generate your API key. Also go to [Teamleader](LINK) and create one there too.

Store these in your `.env` file. There is an `.env.example` file in this repo that shows the correct values you will need to store. Add them there.

### Usage

There are two features to the tool.

#### Syncing projects

In the app directory type `yarn run projects` to pull all your enabled projects and milestones into Timing. Projects will be created at the top level, with milestones as sub projects.

#### Syncing timing entries

In the app type `yarn run timesheets` Tasks you have configured in Timing will be synced to your Teamleader account.

##### Dedications

To A, you know who you are :)
