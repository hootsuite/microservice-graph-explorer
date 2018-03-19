![Microservice Graph Explorer](/img/microservice-graph-explorer-logo-color.png?raw=true "Microservice Graph Explorer")

- [Introduction](#introduction)
- [Demo](#demo)
- [Features](#features)
- [Architecture](#architecture)
- [Docker Hub](#docker-hub)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [How To Contribute](#how-to-contribute)

# Introduction
The "Microservice Graph Explorer" (aka MGE) is a web application that lets users browse a microservice graph in real time. It is a 
debugging/visualization tool for microservices that implement the [Health Checks API](https://github.com/hootsuite/health-checks-api).

The Microservice Graph Explorer gives you the ability to monitor the health of all your microservices in real time, and provides 
a dashboard with debugging information that can help you discover the source of outages quickly. It also works as a great 
learning / exploration tool so that the DevOps peeps in your organization can understand all the different dependencies of your application. 
[![Microservice Graph Explorer demo video](/img/microservice-graph-explorer.png?raw=true "Microservice Graph Explorer Dashboard")](https://youtu.be/JAoSkddOIC8?t=25m29s)
[Watch demo video](https://youtu.be/JAoSkddOIC8?t=25m29s)

# Demo

### Use our Pre-made Service Graph
To test the Microservice Graph Explorer with a pre-made service graph: 
- Clone the repo at [https://github.com/hootsuite/microservice-graph-explorer-test](https://github.com/hootsuite/microservice-graph-explorer-test) and follow the 
instructions to [Run the Services](https://github.com/hootsuite/microservice-graph-explorer-test#running-the-services).

### Watch the Demo Video
[Watch demo video](https://youtu.be/JAoSkddOIC8?t=25m29s)

# Features

### Microservice Dashboards
The Microservice Graph Explorer provides a dashboard for each service in your service graph. These dashboards [have static deep links](src/app-status.js#L25) 
that you can save and link to from your documentation. The dashboards will automatically refresh with the current info / health every 1 minute (configurable). 
All dashboards stay in sync across all viewers because the data is pushed from the host server to the browser using websockets and has an event driven backend.
This is great because it means all users will always have a consistent view of your microservices health. 

### Microservice Graph Health
The root dashboard for each application that is monitored, has the complete service graph health. Because the Health Checks API links services 
together as external dependencies, it means that if you check the health of the top node in a microservices graph, this health check propagates over the whole 
graph giving you a snapshot in time of the overall graphs health. It truly allows you to see your applications health from the perspective of a user. 

### Health Widget
The Microservice Graph Explorer also provides a "Health Widget" that you can embed on other web applications [via an iFrame](src/app-widget.js#L19). 
Embed it in your build pipeline or on a health status page, this ensures that everyone sees the current health of your applications. The widget is also clickable
and opens to the applicable dashboard.

<img src="https://github.com/hootsuite/microservice-graph-explorer/raw/master/img/microservice-graph-explorer-widget.png?raw=true" width="241" height="110" />

Ex. Embed in iFrame monitor `http://demo-app:8080` with:
```html
<iframe src="http://localhost:9000/widget#/status-indicator/http/demo-app:8080" width="20" height="20" frameborder="0"></iframe>
```

# Architecture
![Microservice Graph Explorer Architecture](/img/microservice-graph-explorer-architecture.png?raw=true "Microservice Graph Explorer Architecture")

When a user opens a browser to view the MGE app, a new websocket connection is opened which connects to the backend MGE app. This connection 
is used to push front end app state and receive events from the backend status poller. As a user navigates around the app, the front end sends 
application state to the backend so that the backend can poll the correct services via the [Health Checks API](https://github.com/hootsuite/health-checks-api) and report back with its health status and its dependencies. This allows the UI to synchronize state 
between all users.

# Docker Hub
We have published a blessed 1.0.0 version of The Microservice Graph Explorer to Docker hub at [https://hub.docker.com/r/hootsuite/microservice-graph-explorer/](https://hub.docker.com/r/hootsuite/microservice-graph-explorer/).

To pull and run the blessed image:
```bash
docker pull hootsuite/microservice-graph-explorer:1.0.0
...
docker run -p 9000:9000 hootsuite/microservice-graph-explorer:1.0.0
```
Lastly, open [http://localhost:9000](http://localhost:9000)

# Configuration
```yaml
microservice-graph-explorer {
  traverse {
    applications = [
      # The URLs to monitor by default
      # format: "protocol(http|https),Application URL to check,Friendly Name for homepage"
      # The default config below points at our test service graph that you can run locally. See http://github.com/hootsuite/microservice-graph-explorer-test
      "http,localhost:8080,Test Service Graph"
    ]
  }
  status-poller {
    poll-interval = 60 seconds   # The interval between polling in the Status Polling Actor.
    remove-router-delay = 1 hour # How long the Status Polling Actor will poll a non default application for before unsubscribing it.
  }
}
```
The above settings can be changed in [application.conf](conf/application.conf#L22) or per environment in dev.conf, staging.conf 
and production.conf

### Overwrite Config in Docker
You can overwrite the default config in docker by mounting a configuration file into the container using the docker run -v flag. Ex.
```ssh
docker run -v [absolute path to local application.conf file]:/opt/docker/conf/application.conf -p 9000:9000 hootsuite/microservice-graph-explorer:1.0.0
```

# Development Workflow

### Install Build tools
If you want to make custom changes or want to build the code from scratch you need the following dependencies installed:

#### SBT
The backend server code for MGE is written in Scala, a functional programming language built on top of the JVM. To make changes / build 
the code, you will need to install SBT, the Simple Build Tool for Scala from [https://www.scala-sbt.org/1.0/docs/Setup.html](https://www.scala-sbt.org/1.0/docs/Setup.html). 

#### NPM
The frontend of the MGE is written in JavaScript using React. To build the JavaScript bundles to run the app locally, you need to install NPM, 
the Node Package Manager for JavaScript from [https://www.npmjs.com/get-npm](https://www.npmjs.com/get-npm).

#### Docker
If you want to run/deploy the MGE using Docker, install Docker from [https://docs.docker.com/install/](https://docs.docker.com/install/). 
The MGE project uses an SBT plugin called [SBT Native Packager](https://www.scala-sbt.org/sbt-native-packager/formats/docker.html) to package 
the app using docker to make running/deployment easier.

### Install JavaScript Dependencies
Install all the necessary node modules by running

```sh
npm install
```

### Build JavaScript Bundles
Run

```sh
npm run build
```

to build the JavaScript bundles

### Running The App

#### Run the app locally
```sh
sbt run
```

to run the dev web server on port 9000. Lastly, open http://localhost:9000

#### Test with a Microservice Graph
See [Demo](#demo) section.

#### Build the app in Docker
Build the docker container locally
```sh
sbt docker:publishLocal
....
[info] Successfully tagged microservice-graph-explorer:1.0.1-SNAPSHOT
[info] Built image microservice-graph-explorer:1.0.1-SNAPSHOT
```

Run the container using the image from the previous step (Ex. microservice-graph-explorer:1.0.1-SNAPSHOT) mapping your 
the 9000 port with the same port in the container. This will use the default configuration that is shipped with the code. 
```ssh
docker run -p 9000:9000 microservice-graph-explorer:1.0.1-SNAPSHOT
```

Lastly, open [http://localhost:9000](http://localhost:9000)

# How To Contribute
Contribute by submitting a PR and a bug report in GitHub.

# Maintainers
- :octocat: [Adam Arsenault](https://github.com/HootAdam) - [@Adam_Arsenault](https://twitter.com/Adam_Arsenault)
- :octocat: [Steve Song](https://github.com/ssong-van) - [@ssongvan](https://twitter.com/ssongvan)
- :octocat: [Eric Puchmayr](https://github.com/erichoot) - [@ltkilroy](https://twitter.com/ltkilroy)
