pipeline {
    agent {
        kubernetes {
            defaultContainer 'docker'
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:24.0.7-cli
    command:
    - cat
    tty: true
    volumeMounts:
    - name: dockersock
      mountPath: /var/run/docker.sock

  - name: kubectl
    image: lachlanevenson/k8s-kubectl:latest
    command:
    - cat
    tty: true

  volumes:
  - name: dockersock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }

    environment {
        REGISTRY_CREDENTIALS_ID = 'github-container-registry'
        REGISTRY = 'ghcr.io'
        GITHUB_USER = 'venkatakrishna8730'

        API_IMAGE = "${REGISTRY}/${GITHUB_USER}/cloudserve-api"
        GATEWAY_IMAGE = "${REGISTRY}/${GITHUB_USER}/cloudserve-gateway"
        SANDBOX_IMAGE = "${REGISTRY}/${GITHUB_USER}/cloudserve-sandbox"
        FRONTEND_IMAGE = "${REGISTRY}/${GITHUB_USER}/cloudserve-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to GHCR') {
            steps {
                container('docker') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: REGISTRY_CREDENTIALS_ID,
                            usernameVariable: 'USER',
                            passwordVariable: 'PAT'
                        )
                    ]) {
                        sh 'echo $PAT | docker login ghcr.io -u $USER --password-stdin'
                    }
                }
            }
        }

        stage('Build & Push Backend Images') {
            steps {
                container('docker') {
                    dir('backend') {
                        sh """
                          docker build -t ${API_IMAGE}:latest -f api/Dockerfile .
                          docker push ${API_IMAGE}:latest

                          docker build -t ${GATEWAY_IMAGE}:latest -f gateway/Dockerfile .
                          docker push ${GATEWAY_IMAGE}:latest

                          docker build -t ${SANDBOX_IMAGE}:latest -f sandbox/Dockerfile .
                          docker push ${SANDBOX_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Build & Push Frontend Image') {
            steps {
                container('docker') {
                    dir('frontend') {
                        sh """
                          docker build -t ${FRONTEND_IMAGE}:latest .
                          docker push ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            agent {
                kubernetes {
                    namespace 'cloudserve'
                    serviceAccount 'jenkins-agent'
                    defaultContainer 'kubectl'
                    containerTemplate(name: 'docker', image: 'docker:24.0.7-cli', ttyEnabled: true)
                    containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:latest', ttyEnabled: true)
                }
            }
            steps {
                container('kubectl') {
                    checkout scm
                    script {
                        try {
                            sh 'kubectl apply -f k8s/ -n cloudserve'

                            sh 'kubectl rollout status deployment/api-deployment -n cloudserve --timeout=120s'
                            sh 'kubectl rollout status deployment/gateway-deployment -n cloudserve --timeout=120s'
                            sh 'kubectl rollout status deployment/sandbox-deployment -n cloudserve --timeout=120s'
                            sh 'kubectl rollout status deployment/frontend-deployment -n cloudserve --timeout=120s'

                        } catch (err) {
                            sh 'kubectl rollout undo deployment/api-deployment -n cloudserve || true'
                            sh 'kubectl rollout undo deployment/gateway-deployment -n cloudserve || true'
                            sh 'kubectl rollout undo deployment/sandbox-deployment -n cloudserve || true'
                            sh 'kubectl rollout undo deployment/frontend-deployment -n cloudserve || true'
                            throw err
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            container('docker') {
                sh 'docker logout ghcr.io || true'
            }
        }
    }
}
