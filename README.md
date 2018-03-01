# EKG

EKG is a library for implementing Kubernetes [liveness and readiness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/) probe handlers in a sidecar or in your application.

NOTE: This project was heavily influenced from [Heptio Healthcheck](https://github.com/heptiolabs/healthcheck). However EKG takes it a step further by providing a configurable sidecar. This means that for the most common healthcheck scenarios you don't need to instrument you application with code -- you can write the healthcheck configurations in YAML.

## Quickstart - Kubernetes

The fastest way to get up an running with EKG is to add a it as a sidecar in the Kubernetes deployment file.

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: my-application
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: my-application
    spec:
      containers:
      - name: my-application
        image: my-org/my-application
        ports:
        - containerPort: 3000
      # add the sidecar
      - name: healthcheck
        image: bufferapp/ekg:0.1.0
        env:
        - name: EKG_CONFIG
          value: >
            {
              "port": 8086,
              "livenessChecks": [
                {
                  "name": "httpget-check-service",
                  "type": "httpGetCheck",
                  "url": "http://localhost:3000"
                }
              ],
              "readinessChecks": [
                {
                  "name": "dns-check-upstream",
                  "type": "dnsResolveCheck",
                  "host": "upstream.example.com"
                },
                {
                  "name": "mongodb-check-buffer",
                  "type": "mongoDBCheck",
                  "url": "mongodb://mongo:27017",
                  "dbName": "buffer"
                }
              ]
            }
         # define a liveness probe that checks every 5 seconds, starting after 5 seconds
        livenessProbe:
          httpGet:
            path: /live
            port: 8086
          initialDelaySeconds: 5
          periodSeconds: 5
        # define a readiness probe that checks every 5 seconds
        readinessProbe:
          httpGet:
            path: /ready
            port: 8086
          periodSeconds: 5
```

## Sidecar Config API

EKG sidecar is passed it's configuration as JSON through the EKG_CONFIG environment variable. It has the following configuration options:

```json
{
  "port": 8086,
  "livenessChecks": [
    {
      "name": "httpget-check-service",
      "type": "httpGetCheck",
      "url": "http://localhost:3000",
      "timeout": 5000
    },
    {
      "name": "dns-check-upstream",
      "type": "dnsResolveCheck",
      "host": "upstream.example.com",
      "timeout": 5000
    },
    {
      "name": "tcp-check-buffer",
      "type": "tcpDialCheck",
      "host": "buffer.com",
      "port": 80,
      "timeout": 5000
    },
    {
      "name": "mongodb-check-buffer",
      "type": "mongoDBCheck",
      "url": "mongodb://mongo:27017",
      "dbName": "buffer",
      "timeout": 5000
    }
  ],
  "readinessChecks": [
    {
      "name": "httpget-check-service",
      "type": "httpGetCheck",
      "url": "http://localhost:3000",
      "timeout": 5000
    },
    {
      "name": "dns-check-upstream",
      "type": "dnsResolveCheck",
      "host": "upstream.example.com",
      "timeout": 5000
    },
    {
      "name": "tcp-check-buffer",
      "type": "tcpDialCheck",
      "host": "buffer.com",
      "port": 80,
      "timeout": 5000
    },
    {
      "name": "mongodb-check-buffer",
      "type": "mongoDBCheck",
      "url": "mongodb://mongo:27017",
      "dbName": "buffer",
      "timeout": 5000
    }
  ]
}
```

### port

An integer specifying the port to serve the liveness and readiness probes.

### livenessChecks

A list of checks to perform when the `/live` endpoint is requested.

### readinessChecks

A list of checks to perform when the `/ready` endpoint is requested.

There are several types of checks that can be configured:

### Check Types

There are several different types of checks that can be configured. Each check is performed serially and in order. Both livenessChecks and readinessChecks can handle all configurable checks:

**httpGetCheck**

perform an HTTP get request against a url

```js
{
  "name": "httpget-check-service", //
  "type": "httpGetCheck",
  "url": "http://localhost:3000",
  "timeout": 5000
}
```

**dnsResolveCheck**

Do a DNS lookup on a host

```js
{
  "name": "dns-check-upstream",
  "type": "dnsResolveCheck",
  "host": "upstream.example.com",
  "timeout": 5000
}
```

**tcpDialCheck**

Attempt to establish a TCP socket connection

```js
{
  "name": "tcp-check-buffer",
  "type": "tcpDialCheck",
  "host": "buffer.com",
  "port": 80,
  "timeout": 5000
}
```

**mongoDBCheck**

Ping a mongodb database

```js
{
  "name": "mongodb-check-buffer",
  "type": "mongoDBCheck",
  "url": "mongodb://mongo:27017",
  "dbName": "buffer",
  "timeout": 5000
}
```

## Quickstart - Manual

If you don't want to use a sidecar or have some custom liveness checks you'd like to perform, this is the better option. The easiest way to get going is to add some checks and listen on a port the main application is not using.

EKG is an NPM package for Node applications. Add it as a dependency to your package.json:

```bash
npm i -S @bufferapp/ekg
```

Instrument EKG into your app.

```js
const micro = require('micro')
const EKG = require('@bufferapp/ekg')

const mainServer = micro(() => 'OK')
mainServer.listen(3000, () => console.log('main - listening on port 3000'))

const ekg = new EKG()
// Liveness
ekg.addLivenessCheck({
  name: 'passing-live-check',
  check: async () => 'OK',
})

// Readiness
ekg.addReadinessCheck({
  name: 'passing-ready-check',
  check: async () => 'OK',
})

const ekgServer = micro(ekg.handler)
ekgServer.listen(3002, () => console.log('listening on port 3002'))
// go to http://localhost:3002/live or http://localhost:3002/ready
```

## API

```js
const EKG = require('@bufferapp/ekg')
// or with all the checks
const {
  default: EKG,
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
  timeoutCheck,
} = require('@bufferapp/ekg')
// or ES6
import EKG, {
  httpGetCheck,
  dnsResolveCheck,
  tcpDialCheck,
  mongoDBCheck,
  timeoutCheck,
} from '@bufferapp/ekg'
```

### EKG

Construct an EKG instance

```js
const ekg = new EKG()
```

The ekg instance exposes a few methods:

**addLivenessCheck**

Add a check to perform when the `/live` endpoint is called

```js
// with a custom check
ekg.addLivenessCheck({
  name: 'my-new-check',
  check: async () => 'OK',
})
// or with a pre-configured check
ekg.addLivenessCheck({
  name: 'my-new-check',
  check: httpGetCheck({
    url: 'http://localhost:3000',
    timeout: 5000,
  }),
})
```

**addReadinessCheck**

Add a check to perform when the `/ready` endpoint is called

```js
// with a custom check
ekg.addLivenessCheck({
  name: 'my-new-check',
  check: async () => 'OK',
})
// or with a pre-configured check
ekg.addLivenessCheck({
  name: 'my-new-check',
  check: httpGetCheck({
    url: 'http://localhost:3000',
    timeout: 5000,
  }),
})
```

**handler**

A function that handles requests and performs readiness and liveness checks

```js
// with micro
micro(ekg.handler)
// or express
app.get('*', async (req, res, next) => {
  try {
    await ekg.handler(req, res)
  } catch (err) {
    next(err)
  }
})
```

### httpGetCheck

Returns a function that does an HTTP get request on a URL

```js
const doCheck = httpGetCheck({
  url: 'http://localhost:3000',
  timeout: 5000,
})

doCheck()
```

### dnsResolveCheck

Returns a function does a DNS lookup on a host

```js
const doCheck = dnsResolveCheck({
  host: 'buffer.com',
  timeout: 5000,
})

doCheck()
```

### tcpDialCheck

Returns a function that creates and connects to a TCP socket

```js
const doCheck = tcpDialCheck({
  host: 'buffer.com',
  port: 80,
  timeout: 5000,
})

doCheck()
```

### mongoDBCheck

Returns a function that pings a mongodb database

```js
const doCheck = mongoDBCheck({
  url: 'mongodb://mongo:27017',
  dbName: 'default',
  timeout: 5000,
})

doCheck()
```

### timeoutCheck

Returns a function that runs a function and throws an exception if the function times out

```js
const doCheck = timeoutCheck({
  check: () =>
    new Promise(resolve => {
      // should always fail due to timeout
      setTimeout(resolve, 6000)
    }),
  timeout: 5000,
})

doCheck()
```
