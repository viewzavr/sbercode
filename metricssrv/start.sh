#!/bin/sh

chown -R metricssrv:metricssrv data
chmod o-w data

export PYTHONUNBUFFERED=1

exec su -c "python3 metrics_api_server.py" metricssrv
