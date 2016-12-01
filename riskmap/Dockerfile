FROM node:onbuild

RUN npm install -g bower http-server && bower install --allow-root

EXPOSE 8080

CMD [ "http-server" ]