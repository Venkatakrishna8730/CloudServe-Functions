pipeline {
  agent {
    kubernetes {
      defaultContainer 'kaniko'
      yaml '''
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins

  containers:
  - name: kubectl
    image: lachlanevenson/k8s-kubectl:latest
    command: ["cat"]
    tty: true

  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ["/busybox/sh", "-c", "sleep infinity"]
    volumeMounts:
    - name: kaniko-docker-config
      mountPath: /kaniko/.docker

  volumes:
  - name: kaniko-docker-config
    emptyDir: {}
'''
    }
  }

  environment {
    REGISTRY = "ghcr.io/venkatakrishna8730"
    NAMESPACE = "cloudserve"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build API Image') {
      steps {
        container('kaniko') {
          withCredentials([
            usernamePassword(
              credentialsId: 'ghcr-creds',
              usernameVariable: 'GHCR_USER',
              passwordVariable: 'GHCR_TOKEN'
            )
          ]) {
            sh '''
            mkdir -p /kaniko/.docker

            AUTH=$(echo -n "${GHCR_USER}:${GHCR_TOKEN}" | base64 | tr -d '\\n')
            
            cat <<EOF > /kaniko/.docker/config.json
            {
              "auths": {
                "ghcr.io": {
                  "auth": "${AUTH}"
                }
              }
            }
            EOF

            /kaniko/executor \
              --dockerfile=backend/api/Dockerfile \
              --context=dir://$(pwd)/backend \
              --destination=ghcr.io/$(echo ${GHCR_USER} | tr '[:upper:]' '[:lower:]')/cloudserve-api:latest
            '''
          }
        }
      }
    }

    stage('Build Gateway Image') {
      steps {
        container('kaniko') {
          withCredentials([
            usernamePassword(
              credentialsId: 'ghcr-creds',
              usernameVariable: 'GHCR_USER',
              passwordVariable: 'GHCR_TOKEN'
            )
          ]) {
            sh '''
            mkdir -p /kaniko/.docker

            AUTH=$(echo -n "${GHCR_USER}:${GHCR_TOKEN}" | base64 | tr -d '\\n')
            
            cat <<EOF > /kaniko/.docker/config.json
            {
              "auths": {
                "ghcr.io": {
                  "auth": "${AUTH}"
                }
              }
            }
            EOF

            /kaniko/executor \
              --dockerfile=backend/gateway/Dockerfile \
              --context=dir://$(pwd)/backend \
              --destination=ghcr.io/$(echo ${GHCR_USER} | tr '[:upper:]' '[:lower:]')/cloudserve-gateway:latest
            '''
          }
        }
      }
    }

    stage('Build Sandbox Image') {
      steps {
        container('kaniko') {
          withCredentials([
            usernamePassword(
              credentialsId: 'ghcr-creds',
              usernameVariable: 'GHCR_USER',
              passwordVariable: 'GHCR_TOKEN'
            )
          ]) {
            sh '''
            mkdir -p /kaniko/.docker

            AUTH=$(echo -n "${GHCR_USER}:${GHCR_TOKEN}" | base64 | tr -d '\\n')
            
            cat <<EOF > /kaniko/.docker/config.json
            {
              "auths": {
                "ghcr.io": {
                  "auth": "${AUTH}"
                }
              }
            }
            EOF

            /kaniko/executor \
              --dockerfile=backend/sandbox/Dockerfile \
              --context=dir://$(pwd)/backend \
              --destination=ghcr.io/$(echo ${GHCR_USER} | tr '[:upper:]' '[:lower:]')/cloudserve-sandbox:latest
            '''
          }
        }
      }
    }

    stage('Build Frontend Image') {
      steps {
        container('kaniko') {
          withCredentials([
            usernamePassword(
              credentialsId: 'ghcr-creds',
              usernameVariable: 'GHCR_USER',
              passwordVariable: 'GHCR_TOKEN'
            )
          ]) {
            sh '''
            mkdir -p /kaniko/.docker

            AUTH=$(echo -n "${GHCR_USER}:${GHCR_TOKEN}" | base64 | tr -d '\\n')
            
            cat <<EOF > /kaniko/.docker/config.json
            {
              "auths": {
                "ghcr.io": {
                  "auth": "${AUTH}"
                }
              }
            }
            EOF

            /kaniko/executor \
              --dockerfile=frontend/Dockerfile \
              --context=dir://$(pwd)/frontend \
              --destination=ghcr.io/$(echo ${GHCR_USER} | tr '[:upper:]' '[:lower:]')/cloudserve-frontend:latest
            '''
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        container('kubectl') {
          withCredentials([
            usernamePassword(
              credentialsId: 'ghcr-creds',
              usernameVariable: 'GHCR_USER',
              passwordVariable: 'GHCR_TOKEN'
            )
          ]) {
            sh '''
            # Define registry with lowercase username
            REGISTRY="ghcr.io/$(echo ${GHCR_USER} | tr '[:upper:]' '[:lower:]')"
            
            sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-api:latest|g" k8s/api.yaml
            sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-gateway:latest|g" k8s/gateway.yaml
            sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-sandbox:latest|g" k8s/sandbox.yaml
            sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-frontend:latest|g" k8s/frontend.yaml

            kubectl apply -n ${NAMESPACE} -f k8s/

            kubectl scale deployment api-deployment -n ${NAMESPACE} --replicas=1
            kubectl scale deployment gateway-deployment -n ${NAMESPACE} --replicas=1
            kubectl scale deployment sandbox-deployment -n ${NAMESPACE} --replicas=1
            kubectl scale deployment frontend-deployment -n ${NAMESPACE} --replicas=1

            kubectl rollout restart deployment/api-deployment -n ${NAMESPACE}
            kubectl rollout restart deployment/gateway-deployment -n ${NAMESPACE}
            kubectl rollout restart deployment/sandbox-deployment -n ${NAMESPACE}
            kubectl rollout restart deployment/frontend-deployment -n ${NAMESPACE}

            kubectl rollout status deployment/api-deployment -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/gateway-deployment -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/sandbox-deployment -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/frontend-deployment -n ${NAMESPACE} --timeout=120s
            '''
          }
        }
      }
    }
  }

  post {
    failure {
      container('kubectl') {
        sh '''
        echo "Deployment failed — rolling back..."

        kubectl rollout undo deployment/api-deployment -n cloudserve || true
        kubectl rollout undo deployment/gateway-deployment -n cloudserve || true
        kubectl rollout undo deployment/sandbox-deployment -n cloudserve || true
        kubectl rollout undo deployment/frontend-deployment -n cloudserve || true
        '''
      }
    }
  }
}
