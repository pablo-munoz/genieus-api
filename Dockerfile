FROM ubuntu:xenial

ENV APP_DIR=/genieus-api

RUN apt-get update && \
    apt-get install -y \
    software-properties-common \
    apt-transport-https \
    curl

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get install -y --no-install-recommends \
    nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g swagger

COPY package.json ${APP_DIR}/package.json

WORKDIR ${APP_DIR}
RUN npm install

COPY . ${APP_DIR}

EXPOSE 5000 5000

CMD ["swagger", "project", "start"]