pipeline {
    agent any

    tools {
        jdk "JDK-17.0"
        maven "MAVEN-3.9"
        nodejs "NODEJS-23.11"
    }

    parameters {
        string(name: 'frontend_tag', defaultValue: 'latest', description: 'Three Tier Frontend Image Tag')
        string(name: 'backend_tag', defaultValue: 'latest', description: 'Three Tier Backend Image Tag')
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Github Checkout') {
            steps {
                echo 'Github Checkout'
                git branch: 'main',
                    changelog: false,
                    credentialsId: 'github-cred',
                    poll: false,
                    url: 'https://github.com/17J/Three-Tier-Todo-App-CI.git'
            }
        }

        stage('Gitleaks Scan') {
            steps {
                echo 'Gitleaks Scanning for Secrets'
                sh 'gitleaks detect --no-git -v --redact'
            }
        }

        stage('Trivy Repository Scan') {
            steps {
                echo 'Trivy Scanning Repository for Vulnerabilities'
                sh 'trivy repo --format table -o repo-report.html .'
                // Consider publishing the report as an artifact
            }
        }

        stage('Npm Install Frontend') {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/frontend/') {
                    echo "Installing Frontend Dependencies (npm install)"
                    sh 'npm install'
                }
            }
        }

        stage('Compile Backend') {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/backend/') {
                    echo "Compiling Backend (mvn compile)"
                    sh 'mvn compile'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/backend/') {
                    echo "Running Backend Tests (mvn test)"
                    sh 'mvn test'
                }
            }
        }

        stage('Build Backend Package') {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/backend/') {
                    echo "Packaging Backend (mvn package -DskipTests=true)"
                    sh 'mvn package -DskipTests=true'
                }
            }
        }

        stage("Publish to Nexus Artifact") {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/backend/') {
                    echo "Publishing Backend Artifact to Nexus"
                    withMaven(globalMavenSettingsConfig: 'bbd23a3f-74af-4672-aa48-fbfa00f673ec', jdk: 'JDK-17.0', maven: 'MAVEN-3.9') {
                        sh 'mvn deploy'
                    }
                }
            }
        }

        stage("Docker Build Frontend Image") {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/frontend/') {
                    echo "Building Frontend Docker Image (17rj/three-tier-todo-frontend:${params.frontend_tag})"
                    script {
                        withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                            sh "docker build -t 17rj/three-tier-todo-frontend:${params.frontend_tag} ."
                        }
                    }
                }
            }
        }

        stage("Docker Build Backend Image") {
            steps {
                dir('/var/lib/jenkins/workspace/three-tier-ci/backend/') {
                    echo "Building Backend Docker Image (17rj/three-tier-todo-backend:${params.backend_tag})"
                    script {
                        withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                            sh "docker build -t 17rj/three-tier-todo-backend:${params.backend_tag} ."
                        }
                    }
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                echo 'Scanning Docker Images for Vulnerabilities'
                sh """
                    trivy image --format table -o frontend-report.html 17rj/three-tier-todo-frontend:${params.frontend_tag}
                    trivy image --format table -o backend-report.html 17rj/three-tier-todo-backend:${params.backend_tag}
                """
                // Consider failing the build based on severity of vulnerabilities
                // and publishing the reports as artifacts
            }
        }

        stage("Docker Push Images") {
            steps {
                echo "Pushing Docker Images to Registry"
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        sh """
                            docker push 17rj/three-tier-todo-frontend:${params.frontend_tag}
                            docker push 17rj/three-tier-todo-backend:${params.backend_tag}
                        """
                    }
                }
            }
        }

        stage('Update YAML in GitOps Repo') {
            steps {
                echo "Updating Deployment YAML in GitOps Repository"
                script {
                    withCredentials([usernamePassword(credentialsId: 'github-cred', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        sh """
                            git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/17J/Three-Tier-Todo-App-CD.git
                            cd Three-Tier-Todo-App-CD/K8s

                            echo "Updating image tag in frontend-ds-service.yml and backend-ds-service.yml"

                            sed -i 's|image: 17rj/three-tier-todo-frontend:.*|image: 17rj/three-tier-todo-frontend:${params.frontend_tag}|' frontend-ds-service.yml
                            sed -i 's|image: 17rj/three-tier-todo-backend:.*|image: 17rj/three-tier-todo-backend:${params.backend_tag}|' backend-ds-service.yml

                            git config user.email "jenkins@example.com"
                            git config user.name "jenkins"

                            git add frontend-ds-service.yml backend-ds-service.yml
                            git commit -m "Update frontend image tag to ${params.frontend_tag} and backend tag to ${params.backend_tag}"
                            git push origin main
                        """
                    }
                }
            }
        }
    }
}
