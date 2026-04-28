FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	python3 \
	python3-pip \
	libglib2.0-0 \
	libgl1 \
	libgomp1 \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN pip3 install --no-cache-dir numpy opencv-python-headless rapidocr_onnxruntime
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ENV PYTHON_PATH=/usr/bin/python3

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
