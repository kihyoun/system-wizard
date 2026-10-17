# System Wizard

A graphical User Interface for the [System-Bootstrapper](https://github.com/kihyoun/system)

This project was created using create-react-app. It is a web application written in React. Additionally [MobX](https://mobx.js.org/README.html) is used for state Management. The UI is made with help of [Material UI](https://material-ui.com/).

## Fetch and first-setup suggestions

After connecting to a Bootstrapper, choose **Synchronize → Fetch**. Saved server
configuration is loaded normally. If no main configuration exists, the Wizard
asks the updated Sync API for derived suggestions instead. Existing NGINX routes
take precedence over hostname-based suggestions. The matching System update
must provide `GET /config/suggestions`; an older server does not support this
fallback.

Suggested fields carry an asterisk with a tooltip: "These values were derived
automatically. Please verify that they are correct and usable before pushing
the configuration." A visible message repeats the warning. Unknown values,
passwords and runner tokens are left blank; supply these manually. No values
are pushed automatically. Reading a saved configuration clears the derived
markers; a local JSON backup preserves them until the user loads saved settings.

This change does not alter the existing Seed/Harvest workflow or deployment
pipeline. Follow-up: add a repository-specific `AGENTS.md` for code conventions.

## Requirement

This application is developed and tested with Node v13.12.0

## Start
Install the Project

```
npm install
```

Run the Project

```
npm start
```

