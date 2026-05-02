FROM python:3.12-slim

WORKDIR /app

# 依存ライブラリのインストール
# requirements.txt だけを先にコピーする理由：
# ソースコードが変わっても依存関係が変わっていなければ
# このレイヤーはキャッシュが使われてビルドが速くなる
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]