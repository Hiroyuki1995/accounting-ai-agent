#!/bin/sh

# このスクリプトの目的は、MinIOサーバーを起動する前に、
# MinIO Client (mc) を使ってバケットの準備やポリシー設定を行うことです。
# スクリプトの最後にexec /usr/bin/docker-entrypoint.sh "$@" を実行することで、
# Dockerコンテナ本来のエントリポイントスクリプトに制御を戻し、
# コンテナ本来のコマンド（MinIOサーバー起動）を実行させます。

# 0️⃣ MinIOサーバーがmcコマンドを受け付けられるまで待機
# 環境によっては、MinIOサーバーが起動してもAPIがすぐに利用可能にならない場合があります。
sleep 20 # 初期化完了を待つため、長めに待機

# 1️⃣ MinIO Client (mc) のエイリアス設定
# mcコマンドを実行するために、MinIO Clientを事前にインストールしておく必要があります。
# （minioイメージにはmcが含まれています）
mc alias set myminio http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# 2️⃣ バケット 'invoices' が無ければ作成
# エラーが出てもスクリプトが中断しないように || true を追加
mc mb myminio/invoices || true

# 3️⃣ MinIOが完全に起動するまで待機（ポリシー設定のデッドロック回避のため）
# 環境によってはさらに長い時間が必要かもしれません。
sleep 15 # 念のためさらに少し長く待つ (デッドロック回避)

# 4️⃣ バケット 'invoices' をpublicに設定
# エラーが出てもスクリプトが中断しないように || true を追加
mc policy set public myminio/invoices || true

# 5️⃣ Dockerコンテナ本来のエントリポイントスクリプトに制御を戻し、
# Docker Composeで定義された本来のコマンド（MinIOサーバー起動）を実行
# これがコンテナのメインプロセスとなり、フォアグラウンドで実行されます。
exec /usr/bin/docker-entrypoint.sh "$@"
