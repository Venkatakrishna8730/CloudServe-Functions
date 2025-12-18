# CloudServe: Serverless Function Platform

CloudServe is a robust, scalable, and secure serverless function platform (FaaS - Function as a Service) designed to allow developers to deploy and execute code without managing the underlying infrastructure. It mimics the core capabilities of industry giants like AWS Lambda and Google Cloud Functions, providing a seamless "code-to-cloud" experience.

## 📚 Documentation

For a deep dive into the project's architecture, technical details, and deployment instructions, please refer to the following guides:

- **[Project Explanation & Architecture](PROJECT_EXPLAINATION.md)**:

  - Detailed overview of the Microservices Architecture (API, Gateway, Sandbox).
  - Explanation of the Execution Model and Cold Start Optimization (Package Hashing).
  - Security Model and Isolation strategies.
  - Database schemas (MongoDB) and Storage (MinIO).

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**:
  - **Local Development**: Run the platform locally using Docker and Node.js.
  - **Kubernetes Deployment**: Deploy to a local Minikube cluster or a cloud provider.
  - **CI/CD**: Setup Jenkins for automated building and deployment.

## 🚀 Key Features

- **Execution Model**: Event-driven, ephemeral containers managed by the Sandbox service.
- **Cold Start Optimization**: Uses **Package Hashing & Dependency Caching** to reuse pre-built `node_modules`, significantly reducing latency.
- **Isolation**: Ensures safety through **Process-level isolation** within Docker containers.
- **Storage**: Utilizes **MinIO** (S3-compatible object storage) for secure code and artifact management.
- **Orchestration**: Built on **Kubernetes (K8s)** for robust microservices management and scaling.
- **Build System**: In-cluster building capabilities using `esbuild`.

## 📂 Project Structure

- **`backend/`**: Contains the Node.js microservices:
  - `api`: Control plane for user and function management.
  - `gateway`: Data plane for routing invocations.
  - `sandbox`: Execution engine for running user code.
- **`frontend/`**: React-based dashboard for users to manage and monitor their functions.
- **`k8s/`**: Kubernetes manifests for deploying the entire platform.
- **`jenkins/`**: Configuration files for the CI/CD pipeline.

## 🏁 Getting Started

To get started with CloudServe, check out the [Deployment Guide](DEPLOYMENT_GUIDE.md).

### Quick Start (Local Docker)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Venkatakrishna8730/CloudServe-Functions.git
    cd CloudServe-Functions
    ```
2.  **Follow the [Local Testing Guide](DEPLOYMENT_GUIDE.md#1-testing-as-a-local-website-docker--nodejs)** to set up dependencies and run the services.
