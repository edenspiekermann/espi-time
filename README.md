# ESPI Time

Sync your tasks in Timing to Teamleader seemlessly.

## Installation

Clone the repo.

Install with yarn.

```
yarn install
```

## Set-up

### Timing App

Go to your [Timing app web interface](https://web.timingapp.com/integrations/tokens) and generate an API key. Paste it into your `.env` file.

### Teamleader

The authorization process for Teamleader is a bit more complicated.

First, run `yarn initializeTL` to generate an authentication URL, follow the link. You will be prompted to login to Teamleader if you are not already, and then asked to allow the app to have permission to access your account. Confirm this and you will be redirected back to the Repo of the project, however a long query string will be appended to it.

Copy the entirety of this URL and then run `yarn authorizeTL REPLACE_URL` where you are pasting in the long URL as the last parameter instead of `REPLACE_URL`.

This should authenticate the app and automatically write additional credentials to your `.env` file.

## Usage

There are two features to the tool.

### Syncing projects

In the app directory type `yarn projects` to pull all your enabled projects and milestones into Timing. Projects will be created at the top level, with milestones as sub projects.

### Syncing timing entries

In the app type `yarn timesheets` Tasks you have configured in Timing will be synced to your Teamleader account.

## References

- [Timing App API docs](https://web.timingapp.com/docs/)
- [Teamleader API docs](https://developer.teamleader.eu/)

---

Dedicated to AD :)
