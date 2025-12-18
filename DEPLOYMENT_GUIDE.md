# CloudServe: Testing & Deployment Guide

This guide provides step-by-step instructions for testing and deploying the CloudServe platform in different environments.

---

## 1. Testing as a Local Website (Docker + Node.js)

This method is best for rapid development and testing the core logic without the complexity of Kubernetes.

### Prerequisites

- **Node.js** (v18+)
- **Docker Desktop** (for running MinIO)
- **Git**

### Steps

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/Venkatakrishna8730/CloudServe-Functions.git
    cd CloudServe-Functions
    ```

2.  **Start Dependencies (MinIO & MongoDB)**:
    We need MinIO (S3). You can use Docker Compose or run them manually.

    We already have a bash file for configuring minio
    If any permission errors araises, run the following command

    ```bash
    sudo chmod +x backend/scripts/start-minio.sh
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in `backend`

    ```env
        MONGO_URI = "<mongodb-atlas-link>"

        API_PORT=5000
        GATEWAY_PORT=5001
        SANDBOX_PORT=5002

        JWT_SECRET

        NODE_ENV
        FAAS_URL = "http://localhost:5001"

        STORAGE_PATH
        ENCRYPTION_KEY

        GOOGLE_CLIENT_ID

        MINIO_ENDPOINT="127.0.0.1"
        MINIO_PORT=9000
        MINIO_USE_SSL=false
        MINIO_ACCESS_KEY=admin
        MINIO_SECRET_KEY=password123
        MINIO_BUCKET_NAME="functions"

        #For mail service
        EMAIL_USER
        EMAIL_PASS
    ```

4.  **Start Services**:
    Open 3 terminal tabs and run:

    ```bash
    cd backend && npm start
    ```

5.  **Start Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

---

## 2. Testing in Local Kubernetes (Minikube)

This simulates a production-like environment on your local machine.

### Prerequisites

- **Minikube**
- **Kubectl**
- **Docker**

### Steps

1.  **Start Minikube**:

    ```bash
    minikube start --driver=docker
    ```

2.  **Point Docker to Minikube && Enable Ingress**:
    Important! This allows Minikube to "see" the images you build locally.

    ```bash
    eval $(minikube docker-env)
    minikube addons enable ingress
    ```

3.  **Build Docker Images**:
    Build images for all services.

    ```bash
    cd backend
    docker build -t cloudserve-api -f api/Dockerfile .
    docker build -t cloudserve-gateway -f gateway/Dockerfile .
    docker build -t cloudserve-sandbox -f sandbox/Dockerfile .

    cd ../frontend
    docker build -t cloudserve-frontend .
    ```

    Verify the images are built.

    ```bash
    docker images
    ```

4.  **Create Secrets Manifest**:
    Before applying the manifests, you must create a `secrets.yaml` file in the `k8s/` directory. This file should contain sensitive environment variables like `JWT_SECRET`, and MinIO credentials.

    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: secrets
      namespace: cloudserve
    type: Opaque
    stringData:
      JWT_SECRET: ""
      ENCRYPTION_KEY: ""
      VITE_GOOGLE_CLIENT_ID: ""
      MINIO_ACCESS_KEY: "admin"
      MINIO_SECRET_KEY: "password123"
      EMAIL_USER: ""
      EMAIL_PASS: ""
    ```

5.  **Deploy Manifests and Verify Pods**:
    Since Docker images are built **locally inside Minikube**, ensure your Kubernetes deployments use:

    `imagePullPolicy: IfNotPresent` or
    `imagePullPolicy: Never`

    This prevents Kubernetes from attempting to pull images from a remote container registry.

    Apply all Kubernetes manifests:

    ```bash
    kubectl apply -f k8s/
    ```

    Verify that all containers are running successfully in the `cloudserve` namespace:

    ```bash
    kubectl get pods -n cloudserve
    ```

    All pods should eventually reach the Running state.

    If any pod is stuck in `ImagePullBackOff` or `CrashLoopBackOff` debug using:

    ```bash
    kubectl logs <pod-name> -n cloudserve
    kubectl describe pod <pod-name> -n cloudserve
    ```

6.  **Access the Application**:
    You can access the application without manual port-forwarding. The Ingress controller typically listens on **Port 80** (standard HTTP).

    **Using Minikube IP**
    If you are not using a tunnel, find your Minikube IP:

    ```bash
    minikube ip
    ```

    Access at: **http://<-----minikube-ip--->** (Default Port 80)

---

## 3. Deploying using Jenkins as a Pod

This is the advanced **GitOps-style deployment** where Jenkins runs **inside the Kubernetes cluster** and manages builds and deployments using Kubernetes agents.

### Prerequisites

- **Helm** (Kubernetes Package Manager)
- **Existing Kubernetes Cluster** (Minikube or Cloud)
- **kubectl** configured to access the cluster

---

### Steps

#### 1. Install Jenkins using Helm

Install Jenkins using the official Helm chart and a custom values file.

```bash
helm repo add jenkins https://charts.jenkins.io
helm repo update
helm install jenkins jenkins/jenkins \
  -n jenkins \
  --create-namespace \
  -f jenkins/jenkins-values.yaml
```

Wait for Jenkins to be ready:

```bash
kubectl get pods -n jenkins
```

#### 2. Apply RBAC Permissions

Grant Jenkins permission to deploy resources into the `cloudserve` namespace.

```bash
kubectl apply -f jenkins/jenkins-rbac.yaml
```

#### 3. Retrieve Jenkins Admin Password

```bash
kubectl exec -n jenkins -it svc/jenkins -c jenkins \
  -- /bin/cat /run/secrets/additional/chart-admin-password && echo
```

#### 4. Access Jenkins UI

Forward the Jenkins service to your local machine:

```bash
kubectl port-forward svc/jenkins 8080:8080 -n jenkins
```

Access Jenkins at: `http://localhost:8080`

#### 5. Configure Kubernetes Cloud in Jenkins

Navigate to: **Manage Jenkins → System → Clouds → Add a new cloud → Kubernetes**

Configure the Kubernetes Cloud:

- **Kubernetes URL**: `https://kubernetes.default.svc`
- **Kubernetes Namespace**: `jenkins`
- **Credentials**: `Kubernetes Service Account`
- **Jenkins URL**: `http://jenkins.jenkins.svc.cluster.local:8080`
- **Jenkins Tunnel**: `jenkins-agent.jenkins.svc.cluster.local:50000`

Click **Test Connection** and **Save** the configuration.

#### 6. Create Jenkins Pipeline

1.  **Jenkins Dashboard → New Item → Pipeline**
2.  Select **Pipeline script from SCM**
3.  **SCM**: Git
4.  **Repository URL**: `https://github.com/Venkatakrishna8730/CloudServe-Functions.git`
5.  **Script Path**: `Jenkinsfile`
6.  **Save** the pipeline.

#### 7. Run the Pipeline

Click **Build Now**.

---

## 4. Deployment Strategies & Trade-offs

### Storage Alternatives: MinIO vs. AWS S3

- **Current Choice**: We use **MinIO** (self-hosted S3-compatible storage) running as a container.
- **Alternative**: We could easily switch to **AWS S3** or **Google Cloud Storage** by updating the environment variables (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`).
- **Reason for MinIO**: **Zero Cost**. Using AWS S3 would incur monthly costs for storage and egress bandwidth, which is not ideal for a student/demo project.

### Deployment Options

#### 1. PaaS Deployment (e.g., Render, Heroku)

- **Method**: Deploy the `api`, `gateway`, and `frontend` services directly to a Platform-as-a-Service provider.
- **Pros**: Extremely simple setup. No need to manage Kubernetes clusters or nodes.
- **Cons**:
  - **Ephemeral File Systems**: PaaS instances usually wipe the disk on restart. We cannot run MinIO locally. We would need a separate persistent storage solution (e.g., a managed MinIO instance or actual AWS S3).
  - **Sandbox Limitations**: The `sandbox` service requires a specific environment (Node.js). While it works on PaaS, advanced isolation (like Docker-in-Docker) is usually not possible.

#### 2. Full Kubernetes Cluster (Current Approach)

- **Method**: Deploy to a managed Kubernetes service (EKS, GKE, AKS) or a self-hosted cluster.
- **Pros**:
  - **Full Control**: We control networking, persistent volumes (PVCs) for MinIO/Jenkins, and resource quotas.
  - **Scalability**: We can auto-scale pods based on CPU/Memory usage.
- **Cons**:
  - **Complexity**: Requires managing `kubectl`, manifests, and potentially cluster upgrades.
  - **Access Limitations**: In some managed environments (like "Autopilot" clusters), we might not have access to the underlying nodes or the control plane, limiting some advanced debugging capabilities.
