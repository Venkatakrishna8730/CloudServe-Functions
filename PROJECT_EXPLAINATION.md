# CloudServe: Serverless Function Platform

## 1. Project Overview: CloudServe

CloudServe is a robust, scalable, and secure serverless function platform (FaaS - Function as a Service) designed to allow developers to deploy and execute code without managing the underlying infrastructure. It mimics the core capabilities of industry giants like AWS Lambda and Google Cloud Functions, providing a seamless "code-to-cloud" experience.

### Comparison with Real-World Cloud Providers

| Feature                     | CloudServe                                                                                          | AWS Lambda / Google Cloud Functions                                                |
| :-------------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Execution Model**         | Event-driven, ephemeral containers (Sandbox service)                                                | Event-driven, ephemeral MicroVMs (Firecracker/gVisor)                              |
| **Cold Start Optimization** | **Package Hashing & Dependency Caching**: Reuses pre-built `node_modules` based on dependency hash. | **SnapStart / Provisioned Concurrency**: Snapshots memory or keeps instances warm. |
| **Isolation**               | **Process-level isolation** within Docker containers (`child_process.fork` in Sandbox).             | **MicroVM isolation** (Firecracker) for hardware-level security.                   |
| **Storage**                 | **MinIO** (S3-compatible object storage) for code and artifacts.                                    | **Amazon S3 / Google Cloud Storage** for code and artifacts.                       |
| **Orchestration**           | **Kubernetes (K8s)**: Manages microservices and scaling.                                            | Proprietary control plane (Borg/EC2 control plane).                                |
| **Build System**            | **In-cluster Building**: Node.js bundler (`esbuild`) runs within the backend.                       | **Cloud Build / CodeBuild**: Managed build services.                               |

---

## 2. Technical Architecture & Microservices

CloudServe is built using a **Microservices Architecture**, ensuring modularity, scalability, and fault tolerance.

### Core Microservices

1.  **API Service (`backend/api`)**:
    - **Role**: The control plane. Handles user authentication, function management (CRUD), and deployment triggers.
    - **Tech**: Node.js, Express.
2.  **Gateway Service (`backend/gateway`)**:
    - **Role**: The data plane (Router). Receives function invocation requests, authenticates them, and routes them to the execution engine.
    - **Tech**: Node.js, Express, Reverse Proxy logic.
3.  **Sandbox Service (`backend/sandbox`)**:
    - **Role**: The execution engine. Provides an isolated environment to run user code safely.
    - **Tech**: Node.js, `child_process`, Docker.

### Databases & Storage

1.  **MongoDB**: Primary transactional database.
    - Stores User profiles, Function metadata (configuration, stats), Logs, and Usage metrics.
2.  **MinIO**: High-performance, S3-compatible object storage.
    - Stores **Source Code**, **Bundled Code**, **Package.json**, and **Dependency Caches (`node_modules.tar.gz`)**.

---

## 3. API Routes & Data Models

### Implemented Routes

The **API Service** exposes the following RESTful endpoints:

- **Auth Routes** (`/api/auth`):
  - `POST /register`: User registration.
  - `POST /login`: User authentication (JWT).
  - `GET /me`: Get current user details.
- **Function Routes** (`/api/function`):
  - `POST /deploy`: Deploy a new function.
  - `GET /`: List all functions.
  - `GET /:id`: Get function details.
  - `PUT /:id`: Update function code or configuration.
  - `DELETE /:id`: Delete a function.
  - `POST /redeploy/:id`: Trigger a redeployment.
- **Invocation Routes** (Gateway):
  - `GET/POST /run/:username/:functionName`: Execute a deployed function.

### Data Models (Mongoose Schemas)

1.  **User Model**:
    - `fullName`, `userName`, `email`, `password` (hashed).
    - `apiKey`: For programmatic access.
    - `usage`: Aggregated usage stats.
2.  **Function Model**:
    - `user`: Reference to User.
    - `name`: Function name.
    - `status`: `pending` | `deploying` | `active` | `failed`.
    - `sourcePath`, `bundlePath`: MinIO paths.
    - `sourceHash`, `bundleHash`, `depHash`: Integrity hashes.
    - `endpoint`: Public invocation URL.
    - `stats`: `executed`, `errors`, `avgLatency`, `avgMemory`.
3.  **Usage Model**:
    - `functionId`, `userId`: References to Function and User.
    - `executionId`: Unique identifier for the specific run.
    - `duration`: Execution time in milliseconds.
    - `memoryUsed`: Memory consumed in MB.
    - `status`: `success` | `error`.
    - `timestamp`: Date and time of execution.
4.  **Log Model**:
    - `functionId`, `executionId`: References.
    - `logs`: Array of stdout/stderr messages.
    - `duration`, `memoryUsed`, `status`: Redundant snapshot for quick access.

### Why Separate Log and Usage Models?

We intentionally separated **Logs** (heavy text data) from **Usage** (lightweight metrics).

1.  **Performance**: Querying `Usage` for analytics (e.g., "Total execution time today") is extremely fast because it doesn't involve loading megabytes of log text.
2.  **Rate Limiting Integration**:
    - To implement **Rate Limiting** (e.g., "Max 1000 runs/day" or "Max 1GB compute-seconds/month"), we only need to count or sum records in the `Usage` collection.
    - This separation makes real-time checks efficient and scalable. If we had to scan the heavy `Log` collection to count requests, it would be too slow and resource-intensive, potentially slowing down the entire gateway.

---

## 4. Code Storage & Execution Strategy

### Storing User Code

When a user deploys code:

1.  **Upload**: The raw source code is uploaded to **MinIO** under `${functionId}/src/`.
2.  **Bundling**: We use **esbuild** to bundle the code into a single efficient file (`bundle.js`).
3.  **Hashing**: We generate a SHA-256 hash of the bundle (`bundleHash`) to ensure integrity and detect changes.
4.  **Storage**: The bundle is stored in MinIO under `${functionId}/bundle/`.

### Evolution of Execution: From Cold Starts to Package Hashing

#### Phase 1: The "Cold Start" Problem (Naive Approach)

Initially, for every function invocation, we might have run `npm install` to set up dependencies.

- **Problem**: `npm install` is slow (network I/O, disk I/O). This caused massive **Cold Starts** (latency of 5-10 seconds) for the first request.

#### Phase 2: Package Hashing & Dependency Caching (Current Optimization)

To solve cold starts, we implemented **Package Hashing**:

1.  **Dependency Hash (`depHash`)**: We parse the `package.json` dependencies and compute a unique hash based on the dependency names and versions.
2.  **Global Cache**: We check MinIO for a pre-built `node_modules.tar.gz` stored under `deps/${depHash}/`.
3.  **Reuse**:
    - **Scenario A (Cache Hit)**: If _User A_ and _User B_ both use `axios@1.0.0` and `lodash@4.0.0`, they generate the **same `depHash`**. The system builds the dependencies ONCE, stores them, and both users share the same cached artifact.
    - **Scenario B (Cache Miss)**: If the hash is new, the Sandbox runs `npm install`, compresses `node_modules`, and uploads it to MinIO for future use.
4.  **Result**: Cold starts are drastically reduced from seconds to milliseconds by simply downloading and extracting a tarball.

### Handling Code Updates

When a user updates their code:

1.  The API calculates the new `sourceHash`.
2.  If the code changed, it triggers a **Re-bundle**.
3.  If dependencies changed, it calculates a new `depHash` and fetches/builds the new dependency set.
4.  The `Function` status moves to `deploying` -> `active`.
5.  **Atomic Update**: The Gateway continues serving the _old_ version until the new version is fully active and the database record is updated.

---

## 5. Isolated Execution Environment

To ensure robustness and safety, we do not run user code directly in the main API process.

1.  **Sandbox Service**: A dedicated microservice responsible solely for execution.
2.  **Temporary Directories**: For each execution, a unique temporary directory (`/tmp/sandbox-xyz`) is created.
3.  **Process Isolation**:
    - We use Node.js `child_process.fork()` to spawn a **separate worker process** for the user's code.
    - This ensures that if the user's code crashes (e.g., infinite loop, memory leak, unhandled exception), it **only kills the child process**, not the main Sandbox service.
4.  **Resource Limits & Timeouts**:
    - The worker is wrapped with a **timeout** (e.g., 5 seconds). If the code runs too long, the parent process kills it (`SIGKILL`).
    - Memory usage is monitored and logged.
5.  **Docker Container**: The entire Sandbox service runs inside a Docker container, providing filesystem and network isolation from the host node.

This architecture ensures that **one user's bad code cannot bring down the entire platform**.

---

## 6. Security Model

In CloudServe, security is a first-class feature, ensuring robust protection for both the platform and user data.

### Authentication vs. Authorization

We strictly separate identity verification from access rights:

- **Authentication**: Verifying _who_ the user is.

  - **Dashboard Access**: Uses **JWT (JSON Web Tokens)** generated upon login.
  - **Programmatic Access**: Uses **API Keys** for external tools or CI/CD integration.

- **Authorization**: Verifying _what_ the user can do.
  - **Deployment**: Only authenticated users can deploy.
  - **Invocation**: The API Gateway enforces strict ownership rules.

### Access Control Flow

1.  **API Gateway Validation**:

    - The Gateway acts as the security enforcement point.
    - It validates the **JWT** or **API Key** before routing any request.
    - **Function Ownership Enforcement**: The Gateway checks the database to ensure the requester owns the target function. **User A cannot invoke User B's private function.**

2.  **Secret Handling Strategy**:
    - **No Secrets in Code Bundles**: We enforce best practices by discouraging hardcoded secrets.
    - **Environment Injection**: Secrets should be stored in the user's configuration and injected into the Sandbox environment at runtime, ensuring they are never written to disk in the code bundle.

# CloudServe: DevOps & Microservices Evolution

## 1. DevOps & Microservices Strategy

CloudServe adopts a **Cloud-Native** approach, leveraging Microservices and DevOps best practices to ensure agility, scalability, and reliability.

### Why Microservices?

Instead of a monolithic application, we split CloudServe into distinct services (`api`, `gateway`, `sandbox`, `frontend`).

- **Scalability**: We can scale the `sandbox` service (execution engine) independently of the `api` service.
- **Fault Isolation**: A crash in the `sandbox` doesn't affect the `gateway` or `api`.
- **Technology Independence**: Each service can have its own dependencies and runtime environment.

---

## 2. Step-by-Step Evolution of Infrastructure

Our infrastructure didn't start perfect. It evolved through several stages to reach its current robust state.

### Step I: Applied Docker (Containerization)

**Goal**: Solve "It works on my machine" problem.

- **Action**: We created `Dockerfile`s for each service (`api`, `gateway`, `sandbox`, `frontend`).
- **Outcome**: Each service runs in its own isolated container with its specific dependencies (Node.js version, libraries).
- **Benefit**: Consistent environment across development and production.

### Step II: Applied Kubernetes with Local Images

**Goal**: Orchestrate containers and manage scaling.

- **Action**:
  - We set up **Minikube** (local Kubernetes cluster).
  - We wrote K8s manifests (`deployment.yaml`, `service.yaml`) for each microservice.
  - **Challenge**: Kubernetes couldn't pull images from our local Docker daemon by default.
  - **Solution**: We pointed K8s to the local Docker daemon (`eval $(minikube docker-env)`) and used `imagePullPolicy: Never` or `IfNotPresent`.
- **Outcome**: We could run the entire cluster locally, simulating a production environment.

### Step III: Applied GitHub Container Registry (GHCR)

**Goal**: Enable remote deployment and sharing.

- **Action**:
  - We tagged our Docker images with `ghcr.io/username/image-name`.
  - We pushed these images to **GitHub Container Registry**.
  - We created `imagePullSecrets` in Kubernetes to allow it to pull private images from GHCR.
- **Outcome**: Our cluster could now pull the "Single Source of Truth" images from the internet, enabling deployment on any cloud provider, not just the local machine.

### Step IV: Applied Jenkins on Host OS (CI/CD v1)

**Goal**: Automate the Build & Deploy process.

- **Action**:
  - We installed **Jenkins** directly on the host server (or VM).
  - Jenkins had access to the host's Docker daemon (`/var/run/docker.sock`).
  - **Pipeline**: Jenkins would checkout code -> Build Docker images -> Push to GHCR -> Run `kubectl apply`.
- **Limitation**: Jenkins was "outside" the cluster. Managing dependencies (Docker, Kubectl versions) on the host OS was messy and not scalable.

### Step V: Migrated to Jenkins Running Within K8s (Current State)

**Goal**: Full "GitOps" and "Everything as Code".

- **Action**:
  - We deployed **Jenkins as a Pod** inside our Kubernetes cluster.
  - **Challenge**: Building Docker images _inside_ a Docker container (Jenkins pod) is difficult (Docker-in-Docker security risks).
  - **Solution: Kaniko**: We adopted **Kaniko**, a tool by Google that builds container images inside a container **without needing a Docker daemon**.
  - **Pipeline**:
    1.  **Kaniko Pod**: Builds images for `api`, `gateway`, `sandbox`, `frontend` and pushes them to GHCR.
    2.  **Kubectl Pod**: A separate container with `kubectl` installed applies the manifests to the cluster.
- **Outcome**:
  - **Self-Contained**: Our CI/CD system lives inside the cluster it manages.
  - **Secure**: No privileged access to host Docker daemon required.
  - **Scalable**: Jenkins agents are spun up dynamically as Kubernetes pods (Pod Agents).

---

## 3. Advanced Jenkins Configuration

### Helm Chart Implementation

Instead of writing raw Kubernetes manifests for Jenkins, we used the **Official Jenkins Helm Chart**.

- **Why Helm?**: Helm is the "Package Manager" for Kubernetes. It simplifies installing complex applications like Jenkins.
- **Custom Values (`jenkins-values.yaml`)**: We created a custom configuration file to override defaults:
  - **Plugins**: Pre-installed `kubernetes`, `git`, `workflow-aggregator`.
  - **ServiceAccount**: Auto-created a service account named `jenkins`.
  - **Persistence**: Enabled Persistent Volume Claims (PVC) to save build history even if the pod restarts.

### Solving RBAC Issues (Role-Based Access Control)

**Problem**: Jenkins runs in the `jenkins` namespace, but it needs to deploy applications to the `cloudserve` namespace. By default, it has no permission to touch other namespaces.
**Solution**:

- We defined a **ClusterRole** in `jenkins-rbac.yaml`.
- **Permissions**: We gave it `create`, `update`, `delete` permissions on `deployments`, `deployments/scale`, `services`, `pods`, and `ingresses` across **all namespaces** (`apiGroups: ["apps", "networking.k8s.io"]`).
- **Binding**: We bound this role to the `jenkins` ServiceAccount using a `ClusterRoleBinding`.
- **Result**: The Jenkins pod can now execute `kubectl apply -n cloudserve ...` without "Permission Denied" errors.

### Namespace Isolation

We separated concerns using Kubernetes Namespaces:

1.  **`jenkins` Namespace**: Contains the CI/CD infrastructure (Jenkins Controller, Agents).
2.  **`cloudserve` Namespace**: Contains the actual application (API, Gateway, Sandbox, Frontend).
    **Benefit**:

- **Security**: If the application is compromised, the CI/CD server is isolated.
- **Resource Quotas**: We can limit how much CPU/RAM Jenkins uses vs. the application.
- **Clarity**: `kubectl get pods -n jenkins` shows only build tools; `kubectl get pods -n cloudserve` shows only the app.

---

## 4. Alternative Approaches & Trade-offs

### Docker-per-Function (The "Heavy" Approach)

Instead of our current approach (Node.js `child_process.fork` inside a shared Sandbox container), we could have spun up a **new Docker container for every single function invocation**.

- **Pros**: Perfect isolation. One user's crash cannot affect anyone else.
- **Cons**:
  - **High Latency**: Starting a Docker container takes seconds (even with optimizations), whereas forking a process takes milliseconds.
  - **High Infrastructure Cost**: Running thousands of containers requires massive CPU/RAM overhead compared to thousands of lightweight processes.
  - **Complexity**: We would need to manage Docker sockets or use Kubernetes Jobs for every request, which is complex to scale for high-throughput APIs.
