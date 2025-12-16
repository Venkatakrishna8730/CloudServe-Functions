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
  - name: kaniko
    image: gcr.io/kaniko-project/executor:latest
    args:
      - "--help"
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker

  - name: kubectl
    image: lachlanevenson/k8s-kubectl:latest
    command: ["cat"]
    tty: true

  volumes:
  - name: docker-config
    secret:
      secretName: ghcr-docker-config
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

    stage('Build API') {
      steps {
        sh '''
        /kaniko/executor \
          --dockerfile=backend/api/Dockerfile \
          --context=dir://$(pwd)/backend \
          --destination=${REGISTRY}/cloudserve-api:latest
        '''
      }
    }

    stage('Build Gateway') {
      steps {
        sh '''
        /kaniko/executor \
          --dockerfile=backend/gateway/Dockerfile \
          --context=dir://$(pwd)/backend \
          --destination=${REGISTRY}/cloudserve-gateway:latest
        '''
      }
    }

    stage('Build Sandbox') {
      steps {
        sh '''
        /kaniko/executor \
          --dockerfile=backend/sandbox/Dockerfile \
          --context=dir://$(pwd)/backend \
          --destination=${REGISTRY}/cloudserve-sandbox:latest
        '''
      }
    }

    stage('Build Frontend') {
      steps {
        sh '''
        /kaniko/executor \
          --dockerfile=frontend/Dockerfile \
          --context=dir://$(pwd)/frontend \
          --destination=${REGISTRY}/cloudserve-frontend:latest
        '''
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
        sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-api:latest|g" k8s/api.yaml
        sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-gateway:latest|g" k8s/gateway.yaml
        sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-sandbox:latest|g" k8s/sandbox.yaml
        sed -i "s|IMAGE_PLACEHOLDER|${REGISTRY}/cloudserve-frontend:latest|g" k8s/frontend.yaml

        kubectl apply -n ${NAMESPACE} -f k8s/

        kubectl rollout status deployment/cloudserve-api -n ${NAMESPACE} --timeout=120s
        kubectl rollout status deployment/cloudserve-gateway -n ${NAMESPACE} --timeout=120s
        kubectl rollout status deployment/cloudserve-sandbox -n ${NAMESPACE} --timeout=120s
        kubectl rollout status deployment/cloudserve-frontend -n ${NAMESPACE} --timeout=120s
        '''
      }
    }
  }

  post {
    failure {
      sh '''
      echo "Deployment failed — rolling back..."

      kubectl rollout undo deployment/cloudserve-api -n cloudserve || true
      kubectl rollout undo deployment/cloudserve-gateway -n cloudserve || true
      kubectl rollout undo deployment/cloudserve-sandbox -n cloudserve || true
      kubectl rollout undo deployment/cloudserve-frontend -n cloudserve || true
      '''
    }
  }
}
