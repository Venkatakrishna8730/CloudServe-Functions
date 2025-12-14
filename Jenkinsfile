pipeline {
    agent any

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

        stage('Build & Push Backend Images') {
            steps {
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

        stage('Build & Push Frontend Image') {
            steps {
                dir('frontend') {
                    sh """
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        docker push ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl apply -f k8s/
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout ghcr.io'
        }
    }
}
