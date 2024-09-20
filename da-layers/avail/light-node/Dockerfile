FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

ARG CHAIN_ID
ARG DAEMON_HOME
ARG DAEMON_NAME
ARG DAEMON_VERSION
ARG DEFAULT_RPC_PORT

WORKDIR /root

RUN apt update && \
    apt install -y curl jq git build-essential wget pkg-config libssl-dev make gcc && \
    rm -rf /var/lib/apt/lists/*

ENV CHAIN_ID=${CHAIN_ID}
ENV DAEMON_HOME=${DAEMON_HOME}
ENV DAEMON_NAME=${DAEMON_NAME}
ENV DAEMON_VERSION=${DAEMON_VERSION}
ENV DEFAULT_RPC_PORT=${DEFAULT_RPC_PORT}
ENV CONFIG_FILE=${DAEMON_HOME}/${CHAIN_ID}/config/config.toml
ENV IDENTITY_FILE=${DAEMON_HOME}/${CHAIN_ID}/identity/identity.toml

RUN echo "export CHAIN_ID=${CHAIN_ID}" >> $HOME/.bash_profile && \
    echo "export DAEMON_HOME=${DAEMON_HOME}" >> $HOME/.bash_profile && \
    echo "export DAEMON_NAME=${DAEMON_NAME}" >> $HOME/.bash_profile && \
    echo "export DAEMON_VERSION=${DAEMON_VERSION}" >> $HOME/.bash_profile && \
    echo "export DEFAULT_RPC_PORT=${DEFAULT_RPC_PORT}" >> $HOME/.bash_profile && \
    echo "export CONFIG_FILE=${CONFIG_FILE}" >> $HOME/.bash_profile && \
    echo "export IDENTITY_FILE=${IDENTITY_FILE}" >> $HOME/.bash_profile

RUN mkdir -p ${DAEMON_HOME}/${CHAIN_ID}/bin
RUN mkdir -p ${DAEMON_HOME}/${CHAIN_ID}/config
RUN mkdir -p ${DAEMON_HOME}/${CHAIN_ID}/data
RUN mkdir -p ${DAEMON_HOME}/${CHAIN_ID}/identity

RUN echo "bootstraps = ['/dns/bootnode.1.lightclient.turing.avail.so/tcp/37000/p2p/12D3KooWBkLsNGaD3SpMaRWtAmWVuiZg1afdNSPbtJ8M8r9ArGRT']" > ${CONFIG_FILE} && \
    echo "full_node_ws = ['wss://turing-testnet.avail-rpc.com','wss://avail-turing.public.blastapi.io', 'wss://avail-turing-rpc.publicnode.com', 'wss://turing.public.curie.radiumblock.co/ws', 'wss://avail-turing.bountyblok.io']" >> ${CONFIG_FILE} && \
    echo "confidence = 80.0" >> ${CONFIG_FILE} && \
    echo "avail_path = '$DAEMON_HOME/turing/data'" >> ${CONFIG_FILE} && \
    echo "kad_record_ttl = 43200" >> ${CONFIG_FILE} && \
    echo "ot_collector_endpoint = 'http://otel.lightclient.turing.avail.so:4317'" >> ${CONFIG_FILE} && \
    echo "genesis_hash = 'd3d2f3a3495dc597434a99d7d449ebad6616db45e4e4f178f31cc6fa14378b70'" >> ${CONFIG_FILE} && \
    echo "http_server_host = '0.0.0.0'" >> ${CONFIG_FILE} && \
    echo "http_server_port = ${DEFAULT_RPC_PORT}" >> ${CONFIG_FILE} && \
    echo "sync_start_block = 755200" >> ${CONFIG_FILE} && \
    echo "sync_finality_enable = true" >> ${CONFIG_FILE} && \
    echo "app_id = 101" >> ${CONFIG_FILE}

RUN wget -q https://github.com/availproject/avail-light/releases/download/${DAEMON_VERSION}/avail-light-linux-amd64.tar.gz
RUN tar -xzf avail-light-linux-amd64.tar.gz
RUN chmod +x ./avail-light-linux-amd64
RUN cp ./avail-light-linux-amd64 ${DAEMON_HOME}/${CHAIN_ID}/bin/${DAEMON_NAME}
RUN rm -rf ./avail-light-linux-amd64*

WORKDIR /root

CMD ${DAEMON_HOME}/${CHAIN_ID}/bin/${DAEMON_NAME} \
    --config ${CONFIG_FILE} \
    --identity ${IDENTITY_FILE}