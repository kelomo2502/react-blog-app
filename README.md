# VITE-BLOG-APP

## Setting up the docker image

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

```

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
