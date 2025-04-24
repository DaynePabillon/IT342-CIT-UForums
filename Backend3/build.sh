#!/bin/bash
export JAVA_HOME=/opt/java/openjdk
chmod +x ./mvnw
./mvnw clean package -DskipTests
