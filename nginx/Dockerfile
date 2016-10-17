FROM debian:jessie

ENV NGINX_VERSION 1.6.2-5+deb8u2+b1

RUN apt-get update \
	&& apt-get install -y --no-install-recommends --no-install-suggests nginx-full=${NGINX_VERSION} \
	&& rm -rf /var/lib/apt/lists/*

COPY dav.conf /etc/nginx/sites-available
RUN rm -rf /etc/nginx/sites-enabled/* && \
	ln -s /etc/nginx/sites-available/dav.conf /etc/nginx/sites-enabled/dav.conf

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log
	
EXPOSE 80 443

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["-g", "daemon off;"]
