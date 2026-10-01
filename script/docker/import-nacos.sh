#!/usr/bin/env bash
# 将 script/docker/nacos-config/ 下的配置推送到 Nacos (localhost:18848)
# 文件名即 dataId (seata-server.properties 例外 -> seataServer.properties)
set -e
NACOS="http://localhost:18848/nacos"
USER="nacos"
PASS="nacos"
DIR="/Users/meidanlong/workspace/home/ruoyi-cloud-plus-uniapp/script/docker/nacos-config"

echo "=== 登录 Nacos 获取 token ==="
LOGIN=$(curl -s -X POST "$NACOS/v1/auth/login" --data-urlencode "username=$USER" --data-urlencode "password=$PASS")
TOKEN=$(echo "$LOGIN" | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')
if [ -z "$TOKEN" ]; then
  echo "!! 登录未返回 token (可能 Nacos 已关闭鉴权), 改用匿名推送"
else
  echo "token 获取成功 (len=${#TOKEN})"
fi

echo "=== 推送配置 ==="
for f in "$DIR"/*.yml "$DIR"/*.properties; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  # 核心链路不导入 seata
  [ "$name" = "seata-server.properties" ] && { echo "  (skip) $name"; continue; }
  if [ "$name" = "seata-server.properties" ]; then
    dataId="seataServer.properties"
  else
    dataId="$name"
  fi
  content=$(cat "$f")
  TOKEN_ARG=""
  [ -n "$TOKEN" ] && TOKEN_ARG="--data-urlencode accessToken=$TOKEN"
  resp=$(curl -s -X POST "$NACOS/v1/cs/configs" \
    --data-urlencode "dataId=$dataId" \
    --data-urlencode "group=DEFAULT_GROUP" \
    --data-urlencode "tenant=public" \
    --data-urlencode "content=$content" \
    $TOKEN_ARG)
  echo "  [$resp] $dataId"
done

echo "=== 校验已存在配置 (dataId 列表) ==="
curl -s "$NACOS/v1/cs/configs?dataId=&group=DEFAULT_GROUP&tenant=public&pageNo=1&pageSize=200&accessToken=$TOKEN" \
  | sed -E 's/.*"pageItems":\[//; s/\].*//' \
  | grep -oE '"dataId":"[^"]+"' | sed 's/"dataId":"//; s/"//' | sort
