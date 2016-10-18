FROM logstash:5

# Proxy for ruby-maven
COPY settings.xml /root/.m2/settings.xml

# Add your logstash plugins setup here
# Copy source files
COPY logstash-filter-base64/ /usr/share/logstash-filter-base64/
COPY logstash-output-httpraw/ /usr/share/logstash-output-httpraw/

# Install dependencies
RUN PATH=${PATH}:/usr/share/logstash/vendor/jruby/bin gem install bundle && \
	cd /usr/share/logstash-filter-base64 && \
	PATH=${PATH}:/usr/share/logstash/vendor/jruby/bin bundle install && \
	cd /usr/share/logstash-output-httpraw/ && \
	PATH=${PATH}:/usr/share/logstash/vendor/jruby/bin bundle install

# Install to logstash
RUN cd /usr/share/logstash && \
	echo 'gem "logstash-filter-base64", :path => "/usr/share/logstash-filter-base64"' >> Gemfile && \
	echo 'gem "logstash-output-httpraw", :path => "/usr/share/logstash-output-httpraw"' >> Gemfile && \
	logstash-plugin install --no-verify

RUN rm /etc/logstash/log4j2.properties

EXPOSE 5044
CMD ["-f", "/etc/logstash/conf.d"]
