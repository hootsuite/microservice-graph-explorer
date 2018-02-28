name := "microservice-graph-explorer"

version := Versions.application + "-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, JavaAppPackaging, DockerPlugin)

scalaVersion := Versions.scala

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  specs2 % Test
)

// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator

// setting a maintainer which is used for all packaging types
maintainer := "Adam Arsenault"

// exposing the play ports
dockerExposedPorts in Docker := Seq(9000, 9443)
