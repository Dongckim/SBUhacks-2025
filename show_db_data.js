// 데이터베이스의 실제 데이터를 테이블 형식으로 보여주는 스크립트
// 사용법: node show_db_data.js

require('dotenv').config();
const mysql = require('mysql2/promise');

// 테이블 형식으로 데이터 출력하는 함수
function printTable(headers, rows) {
    if (rows.length === 0) {
        console.log('  (데이터 없음)');
        return;
    }

    // 각 컬럼의 최대 너비 계산 (최대 너비 제한)
    const columnWidths = headers.map((header, index) => {
        const headerWidth = String(header).length;
        const dataWidth = Math.max(
            ...rows.map(row => String(row[index] || '').length)
        );
        // 최소 10자, 최대 30자로 제한 (긴 텍스트는 잘라서 표시)
        return Math.min(Math.max(headerWidth, dataWidth, 10), 30);
    });

    // 헤더 라인 생성
    const headerLine = '┌' + columnWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐';
    const headerRow = '│' + headers.map((h, i) => 
        ` ${String(h).padEnd(columnWidths[i])} `
    ).join('│') + '│';
    const separatorLine = '├' + columnWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤';
    const footerLine = '└' + columnWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

    // 테이블 출력
    console.log(headerLine);
    console.log(headerRow);
    console.log(separatorLine);

    // 데이터 행 출력
    rows.forEach(row => {
        const dataRow = '│' + row.map((cell, i) => {
            let value = cell === null ? 'NULL' : String(cell);
            
            // 날짜 형식 간소화
            if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.includes('GMT')) {
                try {
                    const date = new Date(value);
                    value = date.toISOString().slice(0, 19).replace('T', ' ');
                } catch (e) {
                    // 날짜 파싱 실패 시 원본 유지
                }
            }
            
            // 너무 긴 값은 잘라서 표시
            const displayValue = value.length > columnWidths[i] 
                ? value.substring(0, columnWidths[i] - 3) + '...' 
                : value;
            return ` ${displayValue.padEnd(columnWidths[i])} `;
        }).join('│') + '│';
        console.log(dataRow);
    });

    console.log(footerLine);
}

async function showDatabaseData() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('\n' + '='.repeat(100));
        console.log('📊 데이터베이스 데이터 조회');
        console.log('='.repeat(100));
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

        // 2. 각 테이블의 데이터 출력
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            
            console.log('\n' + '─'.repeat(100));
            console.log(`📋 테이블: ${tableName}`);
            console.log('─'.repeat(100));

            // 데이터 개수 확인
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            const dataCount = count[0].count;

            if (dataCount === 0) {
                console.log('\n  (데이터 없음)\n');
                continue;
            }

            console.log(`\n총 ${dataCount}개의 레코드\n`);

            // 테이블 구조 가져오기 (컬럼명 확인)
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            const columnNames = columns.map(col => col.Field);

            // 데이터 가져오기 (최대 50개)
            // 긴 텍스트 필드는 일부만 가져오기 위해 SUBSTRING 사용
            const limit = 50;
            const selectColumns = columnNames.map(col => {
                // text 타입 컬럼은 처음 50자만
                const colInfo = columns.find(c => c.Field === col);
                if (colInfo && colInfo.Type.includes('text')) {
                    return `SUBSTRING(${col}, 1, 50) as ${col}`;
                }
                return col;
            }).join(', ');
            
            const [rows] = await connection.execute(
                `SELECT ${selectColumns} FROM ${tableName} ORDER BY ${columnNames[0]} DESC LIMIT ${limit}`
            );

            if (rows.length > 0) {
                // 데이터를 배열로 변환
                const dataRows = rows.map(row => 
                    columnNames.map(col => row[col])
                );

                // 테이블 출력
                printTable(columnNames, dataRows);

                if (dataCount > limit) {
                    console.log(`\n⚠️  처음 ${limit}개만 표시됩니다. (전체: ${dataCount}개)`);
                }
            }
        }

        // 3. 요약 정보
        console.log('\n' + '='.repeat(100));
        console.log('📈 테이블별 데이터 요약');
        console.log('='.repeat(100));

        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`  ${tableName.padEnd(30)} : ${count[0].count}개`);
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
showDatabaseData();

