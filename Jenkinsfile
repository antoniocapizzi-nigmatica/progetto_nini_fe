pipeline {
    agent any
    environment {
        CI = 'true'
        port = 3006
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Deliver') {
            steps {
                sh 'npm run build'
                sh 'npm start &'
                input message: 'Finished using the web site? (Click "Proceed" to continue)'
            }
        }
    }
}