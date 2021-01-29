FROM ubuntu:18.04
RUN apt-get update && apt-get install -y curl python2.7 python-pip build-essential locales git \
    && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

ENV LANG en_US.utf8
ENV LC_ALL en_US.UTF-8

RUN curl https://install.meteor.com/?release=1.4.1.2 | sh
ADD ./ /root/SharpAIMobileApp
WORKDIR /root
RUN git clone https://github.com/SharpAI/ApiServer.git
RUN git clone https://github.com/SharpAI/SharpAIPlugins.git
WORKDIR /root/SharpAIMobileApp

RUN meteor npm install --save jquery wolfy87-eventemitter eventie
#RUN meteor build --server http://165.232.62.29:3000 ../ && rm ../SharpAIMobileApp.tar.gz
CMD meteor run --production --mobile-server=165.232.62.29:3000
