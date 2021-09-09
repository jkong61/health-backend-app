FROM python:3.7-slim

WORKDIR /usr/src/app

# Install required dependencies for compiling application python dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    # Used to remove the cache apt-get cache
    && rm -rf /var/lib/apt/lists/*

# Copy production requirements to working directory
COPY requirements.txt ./

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 9000 of container to sttached network
EXPOSE 9000

COPY . .
ENTRYPOINT []
CMD [ "bash" ,"start.sh" ]