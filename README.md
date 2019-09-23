# ESPI Time

Sync your tasks in Timing to Teamleader seemlessly.

### Installation

Clone the repo.

Install with yarn.

```
yarn install
```

### Set-up

Go to your [Timing app web interface](https://web.timingapp.com/integrations/tokens) and generate an API key. Paste it into your `.env` file.

Also go to [Teamleader](LINK) and create one there too.

Store these in your `.env` file. There is an `.env.example` file in this repo that shows the correct values you will need to store. Add them there.

### Usage

There are two features to the tool.

#### Syncing projects

In the app directory type `babel-node . -s projects` to pull all your enabled projects and milestones into Timing. Projects will be created at the top level, with milestones as sub projects.

#### Syncing timing entries

In the app type `babel-node . -s timesheets` Tasks you have configured in Timing will be synced to your Teamleader account.

#### References

- [Timing App API docs](https://web.timingapp.com/docs/)
- [Teamleader API docs](https://developer.teamleader.eu/)

---

Dedicated to AD :)
