FROM node:14.19 as web-builder
RUN yarn config set registry https://registry.npmmirror.com -g && \
    yarn config set disturl https://npmmirror.com/dist -g && \
    yarn config set electron_mirror https://npmmirror.com/mirrors/electron/ -g && \
    yarn config set sass_binary_site https://npmmirror.com/mirrors/node-sass/ -g && \
    yarn config set phantomjs_cdnurl https://npmmirror.com/mirrors/phantomjs/ -g && \
    yarn config set chromedriver_cdnurl https://cdn.npmmirror.com/dist/chromedriver -g && \
    yarn config set operadriver_cdnurl https://cdn.npmmirror.com/dist/operadriver -g && \
    yarn config set fse_binary_host_mirror https://npmmirror.com/mirrors/fsevents -g

WORKDIR /workspaces
ADD ./graylog2-web-interface ./graylog2-web-interface
WORKDIR /workspaces/graylog2-web-interface
RUN yarn
RUN yarn run build

FROM maven:3.6.3-openjdk-8 as server
WORKDIR /workspaces
ADD ./bin ./bin
ADD ./config ./config
ADD ./distribution ./distribution
ADD ./docs ./docs
ADD ./full-backend-tests ./full-backend-tests
ADD ./graylog2-server ./graylog2-server
ADD ./graylog2-web-interface ./graylog2-web-interface
COPY --from=web-builder /workspaces/graylog2-web-interface/target  /workspaces/graylog2-web-interface/target
ADD ./graylog-plugin-archetype ./graylog-plugin-archetype
ADD ./graylog-plugin-parent ./graylog-plugin-parent
ADD ./graylog-project-parent ./graylog-project-parent
ADD ./graylog-storage-elasticsearch6 ./graylog-storage-elasticsearch6
ADD ./graylog-storage-elasticsearch7 ./graylog-storage-elasticsearch7
ADD ./misc ./misc
ADD ./pom.xml ./pom.xml
ADD ./manifest.mf ./manifest.mf
RUN mvn -T4 clean  install -Dskip.web.build=true -Dmaven.test.skip=true -Dit.es.skip=true
RUN mv ./target/assembly/*.tar.gz ./datainsight.tar.gz

FROM openjdk:8u342-jre
COPY --from=server /workspaces/datainsight.tar.gz  .
RUN tar -xvf ./datainsight.tar.gz
RUN rm -Rf datainsight.tar.gz

