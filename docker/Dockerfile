FROM openjdk:8
WORKDIR /products
ADD ./datainsight.tar.gz .
CMD java -jar /products/graylog.jar server -f /products/graylog.conf
