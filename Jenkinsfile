pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/PRADAKSHINAB/Quiz-app.git'
            }
        }

        stage('Stop Old Containers') {
            steps {
                bat 'docker compose down'
            }
        }

        stage('Build & Start') {
            steps {
                bat 'docker compose up -d --build'
            }
        }

        stage('Verify') {
            steps {
                bat 'docker ps'
            }
        }
    }
}