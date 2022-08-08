cd /codes/
mvn clean  install -Dskip.web.build=true -Dmaven.test.skip=true -Dit.es.skip=true
mv ./target/assembly/*.tar.gz ./docker/datainsight.tar.gz
