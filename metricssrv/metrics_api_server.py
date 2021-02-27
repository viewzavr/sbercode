import json
import sys
import time
import asyncio
import os

import httpx
from aiohttp import web
from aiohttp_session import setup, get_session, new_session
from aiohttp_session.cookie_storage import EncryptedCookieStorage

from secret import SECRET_COOKIE_KEY, DEMO_USER_PARAMS

DATA_DIR = "data"
MAX_USER_PARAM_LEN = 100000

IAM_API_URL = "https://iam.ru-moscow-1.hc.sbercloud.ru"
METRICS_API_URL = "https://ces.ru-moscow-1.hc.sbercloud.ru"
ECS_API_URL = "https://ecs.ru-moscow-1.hc.sbercloud.ru"

routes = web.RouteTableDef()

class CallError(Exception):
    def __init__(self, code, msg):
        self.code = code
        self.msg = msg


def ensure_user_dir(user_id):
    try:
        os.mkdir(DATA_DIR)
    except FileExistsError:
        pass

    user_dir = os.path.join(DATA_DIR, user_id.replace("/", "_").replace(".", "_"))

    try:
        os.mkdir(user_dir)
    except FileExistsError:
        pass
    return user_dir


async def call_api(endpoint, method="GET", params={}, token="", endpoint_srv=IAM_API_URL):
    async with httpx.AsyncClient() as client:
        if method == "GET":
            resp = await client.request(method, endpoint_srv + endpoint, params=params,
                                        headers={"x-auth-token": token})
        else:
            resp = await client.request(method, endpoint_srv + endpoint, json=params,
                                        headers={"x-auth-token": token})

        ans = resp.json()
        if "error_code" in ans and "error_msg" in ans:
            raise CallError(ans["error_code"], ans["error_msg"])
        if "code" in ans and "message" in ans:
            raise CallError(ans["code"], ans["message"])
        if "error" in ans and "message" in ans["error"] and "code" in ans["error"]:
            raise CallError(ans["error"]["code"], ans["error"]["message"])
        return {"headers": resp.headers, "ans": ans}




async def auth(login, password, domain, project):
    AUTH_REQ = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "name": login,
                        "password": password,
                        "domain": {
                            "name": domain
                        }
                    }
                }
            },
            "scope": {
                "project": {
                    "name": project
                }
            }
        }
    }

    resp = await call_api("/v3/auth/tokens", method="POST", params=AUTH_REQ)

    return resp["ans"]["token"]["user"]["id"], resp["headers"]["X-Subject-Token"]


async def get_projects(token):
    projects = (await call_api("/v3/projects", token=token))["ans"]["projects"]
    return [project["id"] for project in projects]


async def get_servers(token):
    projects = await get_projects(token)

    for project in projects:
        try:
            servers = (await call_api(f"/v1/{project}/cloudservers/detail", token=token, endpoint_srv=ECS_API_URL))["ans"]["servers"]
            return {server["id"]: server["name"] for server in servers}
        except CallError as E:
            print(f"API Call Error: {E}", file=sys.stderr)
        return {}


async def get_metrics(token):
    servers = {}
    try:
        servers = await get_servers(token)
    except Exception as E:
        print(f"Get server names error: {E}", file=sys.stderr)

    projects = await get_projects(token)

    ret = []
    for project in projects:
        try:
            metrics = (await call_api(f"/V1.0/{project}/metrics", token=token, endpoint_srv=METRICS_API_URL))["ans"]["metrics"]

            for metric in metrics:
                namespace = metric.get("namespace", "CES")
                unit = metric.get("unit", "")
                metric_name = metric.get("metric_name", "")
                for dimension in metric.get("dimensions", []):
                    if "name" not in dimension or "value" not in dimension:
                        continue


                    subject_type = dimension["name"]
                    subject_uuid = dimension["value"]

                    subject_name = subject_uuid
                    if subject_uuid in servers:
                        subject_name = servers[subject_uuid]

                    obj = {
                        "namespace": namespace,
                        "project": project,
                        "unit": unit,
                        "metric": metric_name,
                        "subject_type": subject_type,
                        "subject_name": subject_name,
                        "subject_uuid": subject_uuid
                    }

                    ret.append(obj)

        #             print(metric)
        #             print("BAY", obj)
        except CallError as E:
            print(f"API Call Error: {E}", file=sys.stderr)
    return ret


async def get_metrics_data(token, project, namespace, name, time_from, time_to, period,
                     subject_type, subject_uuid, data_filter="average"):
    params = {
        "namespace": namespace,
        "metric_name": name,
        "from": int(time_from) * 1000,
        "to": int(time_to) * 1000,
        "period": period,
        "filter": data_filter,
        "dim.0": f"{subject_type},{subject_uuid}"
    }
    # print(params)

    metrics_data = (await call_api(f"/V1.0/{project}/metric-data", params=params, token=token, endpoint_srv=METRICS_API_URL))["ans"]

    formatted_metrics_data = []

    for datapoint in metrics_data["datapoints"]:
        formatted_metrics_data.append({"timestamp": datapoint["timestamp"] // 1000, "value": datapoint["average"]})

    return formatted_metrics_data


async def check_and_get_params(request, checked_params):
    if request.method == "GET":
        params = request.query
    else:
        params = await request.json()

    params_ret = {}

    for param in checked_params:
        if param not in params:
            return {"error": f"missing param: {param}"}
        params_ret[param] = params[param]

    return params_ret


@routes.get('/')
async def index_endpoint(request):
    session = await get_session(request)
    if "user_id" not in session:
        return web.json_response({"status": "error", "msg": "not authorized, use /auth to authorize"})

    ans = session["user_id"]

    return web.json_response(ans)


@routes.get('/auth')
@routes.post('/auth')
async def auth_endpoint(request):
    session = await new_session(request)

    params = await check_and_get_params(request, ["user", "password", "domain", "project"])
    if "error" in params:
        return web.json_response({"status": "error", "msg": params["error"]})

    if params["user"] == "demo":
        params = DEMO_USER_PARAMS

    user = params["user"]
    password = params["password"]
    domain = params["domain"]
    project = params["project"]

    try:
        user_id, token = await auth(user, password, domain, project)
    except CallError as e:
        return web.json_response({"status": "error", "msg": {"code": e.code, "msg": e.msg}})

    user_dir = ensure_user_dir(user_id)

    session["user_id"] = user_id
    session["token"] = token

    return web.json_response({"status": "ok", "msg": "you are logged in"})


@routes.get("/metrics")
async def metrics_endpoint(request):
    session = await get_session(request)
    if "user_id" not in session or "token" not in session:
        return web.json_response({"status": "error", "msg": "not authorized, use /auth to authorize"})

    token = session["token"]
    metrics = await get_metrics(token)
    return web.json_response({"status": "ok", "msg": metrics})


@routes.get("/metric-data")
@routes.get("/metrics-data")
async def metric_data_endpoint(request):
    session = await get_session(request)
    if "user_id" not in session or "token" not in session:
        return web.json_response({"status": "error", "msg": "not authorized, use /auth to authorize"})

    token = session["token"]

    params = await check_and_get_params(request, ["namespace", "project", "metric", "subject_type", "subject_uuid", "time_from", "time_to", "period"])
    if "error" in params:
        return web.json_response({"status": "error", "msg": params["error"]})

    metrics_data = await get_metrics_data(token=token, project=params["project"], namespace=params["namespace"],
                                          name=params["metric"], time_from=params["time_from"], time_to=params["time_to"],
                                          period=params["period"], subject_type=params["subject_type"],
                                          subject_uuid=params["subject_uuid"])


    return web.json_response({"status": "ok", "msg": metrics_data})


@routes.get("/put-user-data")
@routes.post("/put-user-data")
@routes.put("/put-user-data")
async def put_user_data_endpoint(request):
    params = await check_and_get_params(request, ["key", "value"])
    if "error" in params:
        return web.json_response({"status": "error", "msg": params["error"]})

    key = params["key"]
    value = params["value"]

    session = await get_session(request)
    if "user_id" not in session:
        return web.json_response({"status": "error", "msg": "not authorized, use /auth to authorize"})

    try:
        user_dir = ensure_user_dir(session["user_id"])

        with open(os.path.join(user_dir, "user-data.json"), "a") as user_data_file:
            data = json.dumps({"key": key, "value": value}, ensure_ascii=False)
            if len(data) > MAX_USER_PARAM_LEN:
                return web.json_response({"status": "error", "msg": "len is too big"})
            user_data_file.write(data + "\n")

        return web.json_response({"status": "ok"})
    except Exception as E:
        print(f"Error: {E}", file=sys.stderr)
        return web.json_response({"status": "error"})


@routes.get("/get-user-data")
@routes.post("/get-user-data")
@routes.put("/get-user-data")
async def get_user_data_endpoint(request):
    params = await check_and_get_params(request, ["key"])
    if "error" in params:
        return web.json_response({"status": "error", "msg": params["error"]})

    key = params["key"]

    session = await get_session(request)
    if "user_id" not in session:
        return web.json_response({"status": "error", "msg": "not authorized, use /auth to authorize"})

    user_data = {}

    try:
        user_dir = ensure_user_dir(session["user_id"])

        with open(os.path.join(user_dir, "user-data.json"), "r") as user_data_file:
            for line in user_data_file:
                obj = json.loads(line)
                user_data[obj["key"]] = obj["value"]

        if key in user_data:
            return web.json_response({"status": f"ok", "msg": user_data[key]})
        else:
            return web.json_response({"status": f"error", "msg": "no such key"})

    except Exception as E:
        print(f"Error: {E}", file=sys.stderr)
        return web.json_response({"status": "error"})


app = web.Application()
setup(app, EncryptedCookieStorage(SECRET_COOKIE_KEY))
app.add_routes(routes)
web.run_app(app, port=80)


# asyncio main

# print(session)
