FROM debian:jessie

ENV JQ_VERSION jq-1.5
ENV JQ_BIN jq-linux64

# Add jq
ADD https://github.com/stedolan/jq/releases/download/$JQ_VERSION/$JQ_BIN /usr/local/bin
RUN chmod +x /usr/local/bin/$JQ_BIN && \ 
    ln -s /usr/local/bin/$JQ_BIN /usr/local/bin/jq

# Add curl
RUN apt-get update && apt-get install -y --no-install-suggests --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY ais2json.sh /
COPY filter.jq /

CMD ["/ais2json.sh"]
