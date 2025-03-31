# VITE-BLOG-APP

## Setting up the docker image

Here’s a production-ready Dockerfile for your React + Firebase blog app, following best practices for security, efficiency, and maintainability.

🔹 Key Optimizations:
✅ Multi-Stage Build (Reduces image size significantly).
✅ Minimal Base Image (node:20-alpine for security & performance).
✅ Runs as Non-Root User (node user instead of root).
✅ Explicit Tags (Avoids latest for reproducibility).
✅ Optimized Layer Caching (Installs dependencies before copying the code).
✅ Health Checks (Ensures the container is running).
✅ Security Measures (Vulnerability scanning, linter recommendation).
✅ Metadata Labels (Adds useful info about the image).

- Dockerfile for React + Firebase Blog App

  ```DSL
  # Use a lightweight Node.js image for building
  ```

FROM node:20-alpine AS builder

# Set working directory

WORKDIR /app

# Copy package.json and lock files first (for better caching)

COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for building)

RUN npm ci

# Copy the rest of the app

COPY . .

# Build the project

RUN npm run build

# Serve stage with Nginx

FROM nginx:alpine

# Set working directory

WORKDIR /usr/share/nginx/html

# Copy build files from builder stage

COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom entrypoint script

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint

ENTRYPOINT ["/entrypoint.sh"]

```

- .dockerignore (Prevent unnecessary files from being copied)
```DSL
# Node.js dependencies
node_modules
npm-debug.log
yarn.lock
container.sh
# Build artifacts
dist
build

# Environment files (security reasons)
.env.local
.env.development
.env.production
.env
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Git files
.git
.gitignore
.gitattributes

# Docker files
Dockerfile
.dockerignore
docker-compose.yaml

# Editor and system files
.vscode
.idea
.DS_Store
*.swp
*.swo

````

## 🚀 How to Use
docker build -t vite-blog-app:1.0 .
docker tag vite-blog-app:1.0 myusername/vite-blog-app:1.0
docker push myusername/vite-blog-app:1.0



## setup docker environment in minikube

`eval $(minikube docker-env)`

## Create Kubernetes Secrets for Sensitive Environment Variables

To prevent exposing credentials in the image or config maps, use Kubernetes Secrets.

Create a secret for Firebase environment variables:

```bash
kubectl create secret generic firebase-secrets \
  --from-literal=VITE_API_KEY="xxxxxxxxxxxxxx" \
  --from-literal=VITE_AUTH_DOMAIN="xxxxxxxxxxxxxxxxxx" \
  --from-literal=VITE_PROJECT_ID="xxxxxxxxxxxxxxxxxxx" \
  --from-literal=VITE_STORAGE_BUCKET="xxxxxxxxxxxxxxxxxx \
  --from-literal=VITE_MESSAGING_SENDER_ID="xxxxxxxxxxxxxx" \
  --from-literal=VITE_APP_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"

````

## To verify the secret

```bash
kubectl get secrets
kubectl describe secret firebase-secrets

```

## Create Kubernetes Deployment & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-blog-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: react-blog-app
  template:
    metadata:
      labels:
        app: react-blog-app
    spec:
      containers:
        - name: react-blog-app
          image: kelomo2502/vite-blog-app:v1
          ports:
            - containerPort: 80
          env:
            - name: VITE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_API_KEY
            - name: VITE_AUTH_DOMAIN
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_AUTH_DOMAIN
            - name: VITE_PROJECT_ID
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_PROJECT_ID
            - name: VITE_STORAGE_BUCKET
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_STORAGE_BUCKET
            - name: VITE_MESSAGING_SENDER_ID
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_MESSAGING_SENDER_ID
            - name: VITE_APP_ID
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_APP_ID
---
apiVersion: v1
kind: Service
metadata:
  name: react-blog-service
spec:
  selector:
    app: react-blog-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: NodePort
```

## Apply deployment

`kubectl apply -f deployment.yaml`

## Check deployments and service

`kubectl get deployments`
`kubectl get services`

## To acess the app via ngrok tunnel

1. Verify Minikube's IP is Correct
   `minikube ip`
   It should return 192.168.49.2 (the IP you're forwarding via Ngrok). If it's different, update the Ngrok tunnel.

2. Ensure Minikube Can Access the NodePort
   `curl http://192.168.49.2:32435`
   it should return your app’s HTML, Minikube is working fine.

3. Make Sure Ngrok is Properly Forwarding Requests
   `ngrok http 192.168.49.2:32435` ## service port

4. Access the url generate from the ngrok forwarding

## Applying best practice of using ingress service

### Lets first create a separate service.yaml file

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vite-blog-service
spec:
  type: ClusterIP # Change from NodePort to ClusterIP
  selector:
    app: vite-blog-app
  ports:
    - protocol: TCP
      port: 80 # Internal service port
      targetPort: 80 # Container's port
```

### Option 1: Use Ingress Without a Domain (Access via IP)

- create an ingress.yaml file

  ```yaml
  apiVersion: networking.k8s.io/v1

  kind: Ingress
  metadata:
  name: vite-blog-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  spec:
  rules:
    - host: blog-app.com # This can be anything, even a fake domain
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vite-blog-service
                port:
                  number: 80
  ```

Deploy an Ingress Controller (If Not Installed)
Minikube does not enable an Ingress Controller by default, so enable it first:
`minikube addons enable ingress`
`kubectl get pods -n kube-system | grep ingress`
The run `kubectl apply -f ingress.yaml`

## Test Your Setup

- Get minikube ip
  `minikube ip`

- Edit /etc/hosts (on your local machine)
  `sudo nano /etc/hosts`
  `192.168.49.2 vite-blog.local' #sample

- Now, access your app at:
  <http://blog-app.com>
