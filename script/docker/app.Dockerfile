FROM eclipse-temurin:21-jre
WORKDIR /app
ARG JAR_PATH
COPY ${JAR_PATH} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
