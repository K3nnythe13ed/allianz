FROM logstash:5

# Install dependencies
COPY *.sh /
RUN /install-plugins.sh

COPY log4j2.properties /etc/logstash/log4j2.properties

EXPOSE 5044

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["-f", "/etc/logstash/conf.d"]
