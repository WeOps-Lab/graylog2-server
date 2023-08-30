FROM openjdk:8
WORKDIR /products
ADD ./datainsight.tar.gz .
ADD ./GeoLite/GeoLite2-ASN.mmdb /etc/datainsight/server/GeoLite2-ASN.mmdb
ADD ./GeoLite/GeoLite2-City.mmdb /etc/datainsight/server/GeoLite2-City.mmdb
CMD java -jar /products/graylog.jar server -f /products/graylog.conf
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone
