docker run --rm -v `pwd`:/codes -i node:16.13.0 sh /codes/build-web.sh
docker run --rm -v `pwd`:/codes -v /home/data/maven/:/root/.m2 -i maven:3.6.3-openjdk-8 sh /codes/build-server.sh
cd ./docker
docker build -t registry-svc:25000/datainsight .
docker push registry-svc:25000/datainsight
#docker-compose down
#docker-compose up -d
