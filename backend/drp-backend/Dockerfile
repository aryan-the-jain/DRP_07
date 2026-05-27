FROM sbtscala/scala-sbt:eclipse-temurin-21.0.2_13_1.10.1_2.13.14 AS builder

WORKDIR /app

COPY . .

RUN sbt clean stage

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/universal/stage ./stage

ENV PLAY_HTTP_SECRET_KEY=${PLAY_HTTP_SECRET_KEY}

CMD ./stage/bin/drp-backend -Dhttp.port=${PORT} -Dplay.http.secret.key=${PLAY_HTTP_SECRET_KEY}