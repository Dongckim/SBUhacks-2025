// users 테이블 구조를 확인하는 스크립트
// 사용법: node check_tables.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTables() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ DB 연결 성공!\n');

        // users 테이블 구조 확인
        console.log('📋 users 테이블 구조:');
        const [usersColumns] = await connection.execute('DESCRIBE users');
        console.table(usersColumns);

        // users 테이블 데이터 확인
        const [usersData] = await connection.execute('SELECT * FROM users LIMIT 5');
        console.log('\n📊 users 테이블 데이터 (최대 5개):');
        if (usersData.length > 0) {
            console.table(usersData);
        } else {
            console.log('⚠️  users 테이블에 데이터가 없습니다.');
        }

        // reports 테이블 구조 확인
        console.log('\n📋 reports 테이블 구조:');
        const [reportsColumns] = await connection.execute('DESCRIBE reports');
        console.table(reportsColumns);

        // reports 테이블 데이터 개수 확인
        const [reportsCount] = await connection.execute('SELECT COUNT(*) as count FROM reports');
        console.log(`\n📊 reports 테이블 데이터 개수: ${reportsCount[0].count}`);

    } catch (error) {
        console.error('\n❌ 오류 발생:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('DB 접근 권한 오류: .env 파일의 DB_PASSWORD를 확인하세요.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('데이터베이스를 찾을 수 없습니다: CREATE DATABASE secure_sbu;를 실행하세요.');
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error('테이블을 찾을 수 없습니다.');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkTables();

