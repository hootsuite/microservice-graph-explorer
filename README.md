![Microservice Graph Explorer](/img/logo-color.png?raw=true "Microservice Graph Explorer")

- [Introduction](#introduction)
- [Build and Run the App](#build-and-run-the-app)
- [Demo](#demo)
- [Configuration](#configuration)

# Introduction
The "Microservice Graph Explorer" (aka MGE) is a web application that lets users browse a microservice graph in real time. It is a 
debugging/visualization tool for microservices that implement the [Health Checks API](https://github.com/hootsuite/health-checks-api).

Navigate to all of the microservices in your application in real time using the real application connections. 
The Microservice Graph Explorer gives you the ability to monitor the health of your microservices, and provides 
a dashboard with debugging information that can help you discover the source of outages in no time. It also works as a great 
learning / exploration tool so that the devops peeps in your organization can understand all the different dependencies of your application. 
[![Microservice Graph Explorer demo video](/img/microservice-graph-explorer.png?raw=true "Microservice Graph Explorer Dashboard")](https://youtu.be/JAoSkddOIC8?t=25m29s)
[Watch demo video](https://youtu.be/JAoSkddOIC8?t=25m29s)

# Build and Run the App

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

### Install Javascript Dependencies
Install all the necessary node modules by running

```sh
npm install
```

### Build Javascript Bundles
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
See [Demo](#demo) section below.

#### Run the app in Docker
Build the docker container locally
```sh
sbt docker:publishLocal
....
[info] Successfully tagged microservice-graph-explorer:0.0.1-SNAPSHOT
[info] Built image microservice-graph-explorer:0.0.1-SNAPSHOT
```

Run the container using the image from the previous step (Ex. microservice-graph-explorer:0.0.1-SNAPSHOT) mapping your 
the 9000 port with the same port in the container. This will use the default configuration that is shipped with the code. 
TODO: Have a default config that points at a Minikube instance of a server? Any other ideas?
```ssh
docker run -p 9000:9000 microservice-graph-explorer:0.0.1-SNAPSHOT
```

Lastly, open http://localhost:9000

# Demo

### Use our Pre-made Service Graph
To test the Microservice Graph Explorer with a pre-made service graph: 
- Clone the repo at [https://github.com/hootsuite/microservice-graph-explorer-test](https://github.com/hootsuite/microservice-graph-explorer-test) and follow the 
instructions to [Run the Services](https://github.com/hootsuite/microservice-graph-explorer-test#running-the-services).
- Run the Microservice Graph App locally  using `sbt run`
- Open http://localhost:9000

### Watch the Demo Video
[Watch demo video](https://youtu.be/JAoSkddOIC8?t=25m29s)

# Configuration
You can overwrite the default config in docker by mounting a configuration file into the container using the docker run -v flag. Ex.
```ssh
docker run -v [absolute path to local application.conf file]:/opt/docker/conf/application.conf -p 9000:9000 microservice-graph-explorer:0.0.1-SNAPSHOT
```
TEST