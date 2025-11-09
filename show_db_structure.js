// 데이터베이스 구조를 시각화하는 스크립트
// 사용법: node show_db_structure.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function showDatabaseStructure() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('\n' + '='.repeat(80));
        console.log('📊 데이터베이스 구조 시각화');
        console.log('='.repeat(80));
        console.log(`데이터베이스: ${process.env.DB_NAME}\n`);

        // 1. 모든 테이블 목록 가져오기
        const [tables] = await connection.execute(
            `SELECT TABLE_NAME 
             FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = ? 
             ORDER BY TABLE_NAME`,
            [process.env.DB_NAME]
        );

        if (tables.length === 0) {
            console.log('❌ 테이블이 없습니다.');
            return;
        }

        // 2. 각 테이블의 구조와 관계 확인
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            
            console.log('\n' + '─'.repeat(80));
            console.log(`📋 테이블: ${tableName}`);
            console.log('─'.repeat(80));

            // 테이블 구조
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            
            console.log('\n컬럼 구조:');
            console.log('┌' + '─'.repeat(78) + '┐');
            console.log(`│ ${'컬럼명'.padEnd(20)} │ ${'타입'.padEnd(20)} │ NULL │ 키 │ 기본값'.padEnd(15)} │`);
            console.log('├' + '─'.repeat(78) + '┤');
            
            columns.forEach(col => {
                const nullStr = col.Null === 'YES' ? 'YES' : 'NO ';
                const keyStr = col.Key || '   ';
                const defaultStr = col.Default !== null ? String(col.Default) : 'NULL';
                console.log(`│ ${col.Field.padEnd(20)} │ ${col.Type.padEnd(20)} │ ${nullStr.padEnd(4)} │ ${keyStr.padEnd(3)} │ ${defaultStr.padEnd(15)} │`);
            });
            
            console.log('└' + '─'.repeat(78) + '┘');

            // 인덱스 정보
            const [indexes] = await connection.execute(
                `SHOW INDEX FROM ${tableName}`
            );
            
            if (indexes.length > 0) {
                console.log('\n인덱스:');
                const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];
                uniqueIndexes.forEach(idxName => {
                    const idxInfo = indexes.filter(idx => idx.Key_name === idxName)[0];
                    const isUnique = idxInfo.Non_unique === 0 ? 'UNIQUE' : 'INDEX';
                    const columns = indexes
                        .filter(idx => idx.Key_name === idxName)
                        .map(idx => idx.Column_name)
                        .join(', ');
                    console.log(`  ${isUnique.padEnd(6)} ${idxName.padEnd(30)} (${columns})`);
                });
            }

            // 외래 키 관계
            const [foreignKeys] = await connection.execute(
                `SELECT 
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = ?
                  AND TABLE_NAME = ?
                  AND REFERENCED_TABLE_NAME IS NOT NULL`,
                [process.env.DB_NAME, tableName]
            );

            if (foreignKeys.length > 0) {
                console.log('\n외래 키 관계:');
                foreignKeys.forEach(fk => {
                    console.log(`  ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
                });
            }

            // 데이터 개수
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`\n데이터 개수: ${count[0].count}개`);
        }

        // 3. 전체 관계도
        console.log('\n' + '='.repeat(80));
        console.log('🔗 테이블 관계도');
        console.log('='.repeat(80));

        const [allForeignKeys] = await connection.execute(
            `SELECT 
                kcu.TABLE_NAME,
                kcu.COLUMN_NAME,
                kcu.REFERENCED_TABLE_NAME,
                kcu.REFERENCED_COLUMN_NAME,
                kcu.CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE kcu
            WHERE kcu.TABLE_SCHEMA = ?
              AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY kcu.TABLE_NAME`,
            [process.env.DB_NAME]
        );

        if (allForeignKeys.length > 0) {
            allForeignKeys.forEach(fk => {
                console.log(`\n${fk.TABLE_NAME}`);
                console.log(`  └─ ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
            });
        } else {
            console.log('\n외래 키 관계가 없습니다.');
        }

        // 4. CREATE TABLE 문 출력 (선택사항)
        console.log('\n' + '='.repeat(80));
        console.log('📝 CREATE TABLE 문');
        console.log('='.repeat(80));

        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            const [createTable] = await connection.execute(
                `SHOW CREATE TABLE ${tableName}`
            );
            console.log(`\n-- ${tableName}`);
            console.log(createTable[0]['Create Table']);
            console.log(';');
        }

    } catch (error) {
        console.error('\n❌ 오류 발생:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('DB 접근 권한 오류: .env 파일의 DB_PASSWORD를 확인하세요.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('데이터베이스를 찾을 수 없습니다.');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 스크립트 실행
showDatabaseStructure();

