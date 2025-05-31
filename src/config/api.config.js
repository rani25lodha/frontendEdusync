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
            UPLOAD: '/api/CourseTables/upload',
            UPLOAD_URL: '/api/File/upload-url',
            INSTRUCTOR: '/api/CourseTables/by-instructor'
        },
        ASSESSMENTS: {
            BASE: '/api/AssessmentTables',
            BY_INSTRUCTOR: '/api/AssessmentTables/by-instructor',
            RESULTS: '/api/ResultTables',
            INSTRUCTOR_RESULTS: '/api/ResultTables/by-instructor'
        },
        FILE: {
            UPLOAD: '/api/File/upload',
            UPLOAD_URL: '/api/File/upload-url',
            DELETE: '/api/File/delete',
            EXISTS: '/api/File/exists',
            GET_ORIGINAL_URL: '/api/File/get-original-url'
        },
        USERS: {
            BASE: '/api/UserTables'
        }
    }
}; 