docker run --rm -v `pwd`:/codes -i node:16.13.0 sh /codes/build-web.sh
docker run --rm -v `pwd`:/codes -v /home/data/maven/:/root/.m2 -i maven:3.6.3-openjdk-8 sh /codes/build-server.sh
cd ./docker
docker build -t ccr.ccs.tencentyun.com/megalab/datainsight .
docker push ccr.ccs.tencentyun.com/megalab/datainsight
#docker-compose down
#docker-compose up -d
