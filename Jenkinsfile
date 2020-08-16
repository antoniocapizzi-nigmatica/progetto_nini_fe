pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Deliver') {
            steps {
                sh 'npm run build'
                //sh 'npm start'
                sh 'serve -s build -l 3006'
                //input message: 'Finished using the web site? (Click "Proceed" to continue)'
            }
        }
    }
}