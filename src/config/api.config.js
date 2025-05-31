// API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://webappedusync-b6d0axeqeeg0gsfg.centralindia-01.azurewebsites.net',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/Auth/login',
            REGISTER: '/api/Auth/register',
            FORGOT_PASSWORD: '/api/Auth/forgot-password',
            RESET_PASSWORD: '/api/Auth/reset-password'
        },
        COURSES: {
            BASE: '/api/CourseTables',
            UPLOAD: '/api/File/upload'
        },
        ASSESSMENTS: {
            BASE: '/api/AssessmentTables',
            RESULTS: '/api/ResultTables'
        }
    }
}; 