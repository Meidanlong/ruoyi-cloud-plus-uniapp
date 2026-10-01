# 本地自建 MinIO 镜像（绕过 daocloud 对 minio/minio 仓库的 403 封禁）
# 方案：Alpine 官方社区仓库 pre-built 二进制（走 dl-cdn.alpinelinux.org，VM 内可达），
# 非 docker.io/minio/minio（被镜像源封禁），非 dl.min.io（410 不可达）。
# 实装为 MinIO 官方 server 二进制（RELEASE.2024-05-27T19-17-46Z, AGPLv3）。
FROM alpine:3.20

RUN apk add --no-cache minio curl \
    && mkdir -p /data

EXPOSE 9000 9001
VOLUME ["/data"]

# compose 中通过 environment 注入 MINIO_ROOT_USER / MINIO_ROOT_PASSWORD
# compose 中 command 提供: server --address ':9000' --console-address ':9001' /data
ENTRYPOINT ["minio"]
