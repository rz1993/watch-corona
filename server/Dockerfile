FROM python:3.6-alpine

WORKDIR /home/app

COPY app.py run.sh requirements.txt ./

RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev \
  && apk add --no-cache openssl-dev libffi-dev \
  && python3 -m pip install -r requirements.txt

COPY src src

RUN chmod +x run.sh
RUN chmod -R src:src ./

EXPOSE 5000
ENTRYPOINT ["./run.sh"]
