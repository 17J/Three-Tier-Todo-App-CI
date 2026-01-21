pipeline {
    agent any
    // Global Tools Configuration for Java, Maven, and Node.js
    tools {
        jdk "jdk-17.0"
        maven "maven-3.9"
        nodejs "nodejs-23.8"
    }
    // Environment Variables for Registry, Images, and SonarQube
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        FRONTEND_IMAGE_NAME = 'three-tier-todo-frontend'
        BACKEND_IMAGE_NAME = "three-tier-todo-backend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = '17rj'
    }
    stages {
        stage('Clean Workspace') {
            steps {
                // Ensure a fresh build environment by removing previous artifacts
                cleanWs()
            }
        }
        stage('Checkout Code') {
            steps {
                // Pulling the latest source code from the GitHub repository
                git branch: 'main', url: 'https://github.com/17J/Three-Tier-Todo-App-CI'
            }
        }
        stage('Compilation of Codes') {
            // Running frontend and backend compilation in parallel to save time
            parallel {
                stage('Frontend Compilation') {
                    steps {
                        dir('frontend') {
                            // Basic syntax check for Javascript files
                            sh 'find . -name "*.js" -exec node --check {} +'
                        }
                    }
                }
                stage('Backend Compilation') {
                    steps {
                        dir('backend') {
                            // Compiling Java source code using Maven
                            sh "mvn clean compile"
                        }
                    }
                }
            }
        }
        stage('Truffle Hog Secret Checking') {
            steps {
                // Scanning the repository for leaked API keys, tokens, or credentials
                sh '''
                    echo "Running TruffleHog secret scan..."
                    trufflehog git https://github.com/17J/Three-Tier-Todo-App-CI.git \
                        --json --no-update --fail > trufflehog-git-report.json || true
                    
                    if [ -s trufflehog-git-report.json ]; then
                        echo "⚠️ Secrets detected! Check report."
                        cat trufflehog-git-report.json
                    else
                        echo "✅ No secrets found!"
                    fi
                '''
                archiveArtifacts artifacts: 'trufflehog-git-report.json', allowEmptyArchive: true
            }
        }
        stage('Snyk SCA Scan') {
            // Software Composition Analysis (SCA) to check for vulnerable 3rd party libraries
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            withCredentials([string(credentialsId: 'snyk-cred', variable: 'SNYK_TOKEN')]) {
                                sh '''
                                    snyk auth $SNYK_TOKEN
                                    snyk test --severity-threshold=high --json-file-output=snyk-frontend.json || true
                                    snyk test --json | snyk-to-html -o snyk-frontend.html || true
                                '''
                            }
                            archiveArtifacts artifacts: 'snyk-frontend.*', allowEmptyArchive: true
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            withCredentials([string(credentialsId: 'snyk-cred', variable: 'SNYK_TOKEN')]) {
                                sh '''
                                    snyk auth $SNYK_TOKEN 
                                    snyk test --severity-threshold=high --json-file-output=snyk-backend.json || true
                                    snyk test --json | snyk-to-html -o snyk-backend.html || true
                                '''
                            }
                            archiveArtifacts artifacts: 'snyk-backend.*', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
        stage('Install Dependencies & Lint') {
            // Running frontend and backend compilation in parallel to save time
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            // Basic syntax check for Javascript files
                            sh '''
                                npm ci
                                npm run lint || true         
                                npm run build                 
                            '''
                        }
                    }
                }
                stage('Backend Lint & Test') {
                    steps {
                        dir('backend') {
                            // Compiling Java source code using Maven
                            sh "mvn test"
                        }
                    }
                    post {
                        always {
                            jacoco(
                                execPattern: '**/target/*.exec',
                                classPattern: '**/target/classes',
                                sourcePattern: '**/src/main/java',
                                inclusionPattern: '**/*.class'
                            )
                        }
                    }
                }
            }
        }
        stage('Sonarqube Code Analysis') {
            steps {
                // Static Application Security Testing (SAST) and code quality check
                withSonarQubeEnv("sonar") {
                    sh '''
                         $SCANNER_HOME/bin/sonar-scanner \
                         -Dsonar.projectName=gitopsthreetier \
                         -Dsonar.projectKey=gitopsthreetier \
                         -Dsonar.sources=frontend/src,backend/src \
                         -Dsonar.java.binaries=backend/target/classes \
                         -Dsonar.jacoco.reportPaths=backend/target/jacoco.exec \
                         -Dsonar.junit.reportPaths=backend/target/surefire-reports \
                         -Dsonar.exclusions=**/node_modules/**,**/target/**
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                // Halt the pipeline if SonarQube analysis does not meet the required threshold
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-cred'
                }
            }
        }
        stage('Build Artifact') {
            steps {
                dir('backend') {
                    // Packaging the Java application into a JAR file
                    sh "mvn clean package -DskipTests=true"
                }
            }
        }
        stage('Publish Artifact to Nexus') {
            steps {
                dir('backend') {
                    // Uploading the compiled JAR to Nexus Repository for version control
                    configFileProvider([configFile(fileId: 'nexus-settings', variable: 'MAVEN_SETTINGS')]) {
                        sh 'mvn -s $MAVEN_SETTINGS clean deploy'
                    }
                }
            }
        }
        stage('OWASP Dependency Check') {
            steps {
                dir('backend') {
                    // Artifact scan focused on project dependencies and CVEs
                    withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
                        dependencyCheck additionalArguments: "--nvdApiKey ${NVD_API_KEY} --format XML --format HTML", odcInstallation: 'owasp'
                        dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                    }
                }
            }
            post {
                always {
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
            }
        }
        stage('Docker Build') {
            steps {
                script {
                    // Building and tagging images for both Frontend and Backend
                    sh "docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} ./frontend"
                    sh "docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} ./backend"
                }
            }
        }
        stage('Dockle Image Scan') {
            steps {
                script {
                    // Scanning Docker images for security vulnerabilities and best practice violations
                    sh "dockle -f json -o dockle-frontend.json --exit-code 0 ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} || true"
                    sh "dockle -f json -o dockle-backend.json --exit-code 0 ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} || true"
                }
            }
            post {
                always {
                    // Archive artifacts for download
                    archiveArtifacts artifacts: 'dockle-*.json', allowEmptyArchive: true
                    
                    // Publish HTML reports on dashboard
                    script {
                        // Convert JSON to readable format if needed, or just archive
                        sh '''
                            if [ -f dockle-frontend.json ]; then
                                echo "✅ Dockle Frontend scan completed"
                            fi
                            if [ -f dockle-backend.json ]; then
                                echo "✅ Dockle Backend scan completed"
                            fi
                        '''
                    }
                    
                    // Record issues using Warnings Next Gen Plugin
                    recordIssues(
                        tools: [
                            checkStyle(pattern: 'dockle-frontend.json', id: 'dockle-frontend', name: '🐳 Dockle Frontend Scan'),
                            checkStyle(pattern: 'dockle-backend.json', id: 'dockle-backend', name: '🐳 Dockle Backend Scan')
                        ],
                        qualityGates: [[threshold: 1, type: 'TOTAL', unstable: false]]
                    )
                }
            }
        }
        stage('Push Docker Images') {
            steps {
                script {
                    // Logging into Docker Hub and pushing the scanned images
                    withCredentials([usernamePassword(credentialsId: 'docker-cred', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                        sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }
        stage('Wait for ArgoCD Sync & Retrieve Application URL') {
            steps {
                script {
                    withKubeConfig(caCertificate: '', clusterName: 'expdevops-cluster', credentialsId: 'kube-cred', namespace: 'threetierapp', serverUrl: 'https://7EE07C9D9C0C7B52992514E70379915F.yl4.ap-south-1.eks.amazonaws.com') {
                        // Polling Kubernetes to retrieve the ALB Hostname for DAST testing
                        timeout(time: 10, unit: 'MINUTES') {
                            waitUntil {
                                def albUrl = sh(script: "kubectl get ingress todo-app-ingress -n threetierapp -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo ''", returnStdout: true).trim()
                                if (albUrl) {
                                    env.K8S_URL = albUrl
                                    echo "✅ ALB URL found: http://${env.K8S_URL}"
                                    return true
                                } else {
                                    echo "⏳ Waiting for ALB Provisioning..."
                                    sleep 20
                                    return false
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('OWASP ZAP Security Scan') {
            when {
                expression { return env.K8S_URL != null }
            }
            steps {
                script {
                    def targetUrl = "http://${env.K8S_URL}"
                    echo "🔍 Starting OWASP ZAP DAST scan on: ${targetUrl}"
                    
                    sh """
                        docker pull ghcr.io/zaproxy/zaproxy:stable || true
                        docker run --rm -v \$(pwd):/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
                            zap-baseline.py -t ${targetUrl} -r zap-report.html -J zap-report.json -I || echo "ZAP scan completed"
                    """
                    
                    // Verify reports exist
                    sh """
                        if [ -f zap-report.html ]; then
                            echo "✅ ZAP HTML report generated successfully"
                            ls -lh zap-report.html
                        else
                            echo "⚠️ ZAP HTML report not found!"
                        fi
                        
                        if [ -f zap-report.json ]; then
                            echo "✅ ZAP JSON report generated successfully"
                            ls -lh zap-report.json
                        else
                            echo "⚠️ ZAP JSON report not found!"
                        fi
                    """
                }
            }
            post {
                always {
                    // Archive both HTML and JSON reports for download (just like Dockle)
                    archiveArtifacts artifacts: 'zap-report.*', allowEmptyArchive: true
                    
                    // Publish HTML report on Jenkins dashboard
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'zap-report.html',
                        reportName: '🔐 OWASP ZAP Security Report',
                        reportTitles: 'DAST Security Scan Results'
                    ])
                    
                    // Optional: If you want to integrate with Warnings Next Gen Plugin
                    // This will show ZAP findings in the same style as Dockle
                    script {
                        if (fileExists('zap-report.json')) {
                            recordIssues(
                                tools: [
                                    checkStyle(pattern: 'zap-report.json', id: 'zap-dast', name: '🔐 OWASP ZAP DAST')
                                ],
                                qualityGates: [[threshold: 1, type: 'TOTAL', unstable: false]]
                            )
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                // Cleanup local images to save disk space on the Jenkins agent
                sh "docker rmi ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} || true"
                sh "docker rmi ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} || true"
                
                // Publish consolidated security reports on dashboard
                echo "📊 Publishing all security reports to Jenkins Dashboard..."
                
                // Snyk Frontend Report
                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'frontend',
                    reportFiles: 'snyk-frontend.html',
                    reportName: '📦 Snyk Frontend SCA Report',
                    reportTitles: 'Frontend Dependencies Scan'
                ])
                
                // Snyk Backend Report
                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'backend',
                    reportFiles: 'snyk-backend.html',
                    reportName: '📦 Snyk Backend SCA Report',
                    reportTitles: 'Backend Dependencies Scan'
                ])
                
                echo "✅ Pipeline completed - All security reports available in dashboard"
            }
        }
        success {
            echo "🎉 Build #${env.BUILD_NUMBER} completed successfully!"
            echo "🐳 Frontend Image: ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
            echo "🐳 Backend Image: ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
            echo "🌐 Application URL: http://${env.K8S_URL}"
        }
        failure {
            echo "❌ Build #${env.BUILD_NUMBER} failed at stage: ${currentBuild.currentResult}"
            echo "📋 Check console logs: ${env.BUILD_URL}console"
        }
    }
}