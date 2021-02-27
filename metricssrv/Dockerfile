FROM ubuntu:20.04

RUN apt-get update && apt-get install --no-install-recommends -y python3 python3-cryptography ca-certificates python3-aiohttp python3-aiohttp python3-aiohttp-session python3-pip libcap2-bin && rm -rf /var/lib/apt/lists/*
RUN pip3 install httpx
RUN setcap cap_net_bind_service=+ep /usr/bin/python3.8

RUN useradd metricssrv -u 10000

WORKDIR /home/metricssrv/

CMD ["./start.sh"]
