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
            BASE: '/api/Course',
            UPLOAD: '/api/Course/upload',
            UPLOAD_URL: '/api/Course/upload-url',
            INSTRUCTOR: '/api/Course/instructor'
        },
        ASSESSMENTS: {
            BASE: '/api/Assessment',
            RESULTS: '/api/Assessment/results',
            INSTRUCTOR_RESULTS: '/api/Assessment/results/instructor',
            STUDENT_RESULTS: '/api/Assessment/results/student'
        },
        FILE: {
            UPLOAD: '/api/File/upload',
            UPLOAD_URL: '/api/File/upload-url'
        }
    }
}; 