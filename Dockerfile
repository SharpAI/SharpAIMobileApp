FROM ubuntu:18.04
RUN apt-get update && apt-get install -y curl python2.7 python-pip build-essential locales git \
    && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

ENV LANG en_US.utf8
ENV LC_ALL en_US.UTF-8
ENV NODE_TLS_REJECT_UNAUTHORIZED 0
ENV VERSION CE_3.4.3

RUN curl https://install.meteor.com/?release=1.4.1.2 | sh
ADD ./ /root/SharpAIMobileApp
WORKDIR /root
WORKDIR /root/SharpAIMobileApp

RUN meteor npm install
CMD meteor run
