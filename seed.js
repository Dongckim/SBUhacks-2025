// 예시 데이터를 MySQL에 삽입하는 Node.js 스크립트
// 사용법: node seed.js

require('dotenv').config();
const mysql = require('mysql2/promise');

// 사용자 데이터 (먼저 삽입해야 함)
const sampleUsers = [
    {
        user_id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        password_hash: '$2b$10$dummy.hash.for.testing.purposes.only', // 테스트용 더미 해시
        // 필요한 다른 필드들도 추가 가능
    }
];

const sampleData = [
    {
        ticket_id: 'SBU-84391',
        issue_type: 'Suspicious Individual',
        title: 'Suspicious person near library entrance',
        description: 'Observed an individual acting suspiciously near the main library entrance around 2 PM. Person was loitering and attempting to access restricted areas.',
        status: 'Resolved',
        submitted_by_user_id: 1,
        created_at: '2023-10-26 14:00:00'
    },
    {
        ticket_id: 'SBU-84390',
        issue_type: 'Unsecured Access Point',
        title: 'Unlocked door in Engineering building',
        description: 'Found an unlocked side door in the Engineering building that should have been secured. Door was left open overnight.',
        status: 'In Progress',
        submitted_by_user_id: 1,
        created_at: '2023-10-25 18:30:00'
    },
    {
        ticket_id: 'SBU-84389',
        issue_type: 'Lost ID Badge',
        title: 'Missing security badge',
        description: 'Lost my security badge somewhere on campus. Last seen in the Student Center. Need replacement.',
        status: 'Pending Review',
        submitted_by_user_id: 1,
        created_at: '2023-10-24 13:15:00'
    },
    {
        ticket_id: 'SBU-84388',
        issue_type: 'IT Security Concern',
        title: 'Suspicious email activity',
        description: 'Received multiple suspicious emails asking for login credentials. Suspecting phishing attempt.',
        status: 'Resolved',
        submitted_by_user_id: 1,
        created_at: '2023-10-23 15:05:00'
    },
    {
        ticket_id: 'SBU-84387',
        issue_type: 'Suspicious Individual',
        title: 'Unknown person in restricted area',
        description: 'Saw an unknown person attempting to access the server room without proper authorization.',
        status: 'Pending Review',
        submitted_by_user_id: 1,
        created_at: '2023-10-22 10:20:00'
    },
    {
        ticket_id: 'SBU-84386',
        issue_type: 'Unsecured Access Point',
        title: 'Broken lock on side entrance',
        description: 'The lock on the side entrance of the Science building appears to be broken and not securing properly.',
        status: 'In Progress',
        submitted_by_user_id: 1,
        created_at: '2023-10-21 16:45:00'
    },
    {
        ticket_id: 'SBU-84385',
        issue_type: 'Lost ID Badge',
        title: 'Stolen badge report',
        description: 'My security badge was stolen from my backpack. Immediately reported to campus security.',
        status: 'Resolved',
        submitted_by_user_id: 1,
        created_at: '2023-10-20 09:30:00'
    },
    {
        ticket_id: 'SBU-84384',
        issue_type: 'IT Security Concern',
        title: 'Unauthorized access attempt',
        description: 'Detected multiple failed login attempts on my account from unknown IP address.',
        status: 'Resolved',
        submitted_by_user_id: 1,
        created_at: '2023-10-19 11:15:00'
    }
];

async function seedDatabase() {
    let connection;
    
    try {
        // DB 연결
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ DB 연결 성공!');

        // 1. users 테이블 구조 확인
        console.log('\n📋 users 테이블 구조 확인 중...');
        let usersColumns = [];
        try {
            [usersColumns] = await connection.execute('DESCRIBE users');
            console.log('✅ users 테이블 구조 확인 완료');
        } catch (error) {
            console.error('❌ users 테이블을 찾을 수 없습니다:', error.message);
            throw error;
        }

        // 2. 사용자 데이터 먼저 삽입
        console.log('\n📝 사용자 데이터 삽입 중...');
        let userInserted = false;
        
        for (const user of sampleUsers) {
            // users 테이블에 user_id가 이미 있는지 확인
            const [existingUsers] = await connection.execute(
                'SELECT user_id FROM users WHERE user_id = ?',
                [user.user_id]
            );
            
            if (existingUsers.length > 0) {
                console.log(`✅ 사용자 ${user.user_id}는 이미 존재합니다.`);
                userInserted = true;
                continue;
            }

            // 테이블 구조에 맞게 필드 목록 생성
            const columnNames = usersColumns.map(col => col.Field);
            const availableFields = [];
            const values = [];
            const placeholders = [];

            // user_id는 필수
            if (columnNames.includes('user_id')) {
                availableFields.push('user_id');
                values.push(user.user_id);
                placeholders.push('?');
            }

            // 다른 필드들도 추가 (있는 경우)
            if (columnNames.includes('username') && user.username) {
                availableFields.push('username');
                values.push(user.username);
                placeholders.push('?');
            }
            if (columnNames.includes('email') && user.email) {
                availableFields.push('email');
                values.push(user.email);
                placeholders.push('?');
            }
            // password_hash 필드 처리 (필수 필드인 경우)
            if (columnNames.includes('password_hash')) {
                const colInfo = usersColumns.find(col => col.Field === 'password_hash');
                // NULL을 허용하지 않고 기본값도 없으면 더미 값 삽입
                if (colInfo && colInfo.Null === 'NO' && !colInfo.Default) {
                    availableFields.push('password_hash');
                    values.push(user.password_hash || '$2b$10$dummy.hash.for.testing.purposes.only');
                    placeholders.push('?');
                }
            }

            try {
                const sql = `INSERT INTO users (${availableFields.join(', ')}) VALUES (${placeholders.join(', ')})`;
                await connection.execute(sql, values);
                console.log(`✅ 사용자 ${user.user_id} 삽입 완료`);
                userInserted = true;
            } catch (error) {
                console.error(`❌ 사용자 ${user.user_id} 삽입 실패:`, error.message);
                console.error('   SQL:', `INSERT INTO users (${availableFields.join(', ')}) VALUES (${placeholders.join(', ')})`);
                throw error;
            }
        }

        // 3. 사용자 삽입 확인
        if (!userInserted) {
            throw new Error('사용자 데이터 삽입에 실패했습니다. 리포트 삽입을 중단합니다.');
        }

        // 최종 확인: user_id=1이 존재하는지 확인
        const [finalCheck] = await connection.execute(
            'SELECT user_id FROM users WHERE user_id = 1'
        );
        if (finalCheck.length === 0) {
            throw new Error('user_id=1이 users 테이블에 없습니다. 리포트 삽입을 중단합니다.');
        }
        console.log('✅ 사용자 확인 완료: user_id=1이 존재합니다.\n');

        // 4. 기존 리포트 데이터 확인
        const [existingRows] = await connection.execute('SELECT COUNT(*) as count FROM reports');
        const existingCount = existingRows[0].count;
        console.log(`현재 reports 테이블에 ${existingCount}개의 데이터가 있습니다.`);

        // 5. 리포트 데이터 삽입
        console.log('\n📝 리포트 데이터 삽입 중...');
        
        for (const data of sampleData) {
            try {
                await connection.execute(
                    `INSERT INTO reports (
                        ticket_id, 
                        issue_type, 
                        title,
                        description,
                        status, 
                        submitted_by_user_id, 
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        data.ticket_id,
                        data.issue_type,
                        data.title,
                        data.description,
                        data.status,
                        data.submitted_by_user_id,
                        data.created_at
                    ]
                );
                console.log(`✅ ${data.ticket_id} 삽입 완료`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  ${data.ticket_id}는 이미 존재합니다. 건너뜁니다.`);
                } else {
                    throw error;
                }
            }
        }

        // 최종 확인
        const [finalRows] = await connection.execute('SELECT COUNT(*) as count FROM reports');
        const finalCount = finalRows[0].count;
        console.log(`\n✅ 완료! 현재 reports 테이블에 총 ${finalCount}개의 데이터가 있습니다.`);

    } catch (error) {
        console.error('\n❌ 오류 발생:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('DB 접근 권한 오류: .env 파일의 DB_PASSWORD를 확인하세요.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('데이터베이스를 찾을 수 없습니다: CREATE DATABASE secure_sbu;를 실행하세요.');
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error('테이블을 찾을 수 없습니다: CREATE TABLE reports...를 실행하세요.');
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            console.error('외래 키 제약 오류: users 테이블에 해당 user_id가 없습니다.');
            console.error('해결: users 테이블에 먼저 사용자 데이터를 삽입하세요.');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 스크립트 실행
seedDatabase();

