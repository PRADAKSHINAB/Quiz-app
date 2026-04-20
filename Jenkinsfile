pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    stages {
        stage('Setup Environment') {
            steps {
                writeFile file: 'backend/.env', text: '''PORT=5000
MONGODB_URI=mongodb://db:27017/quizdb
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
'''
                writeFile file: 'frontend/.env.local', text: '''NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
'''
            }
        }

        stage('Stop Old Containers') {
            steps {
                bat 'docker rm -f quiz-backend quiz-frontend quiz-db quiz-prometheus quiz-grafana || exit 0'
                bat 'docker compose down || exit 0'
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