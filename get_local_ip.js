// 로컬 IP 주소를 찾는 스크립트
// 사용법: node get_local_ip.js

const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // IPv4이고 내부 주소만 (127.0.0.1 제외)
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({
                    interface: name,
                    address: iface.address
                });
            }
        }
    }

    return addresses;
}

console.log('🔍 로컬 IP 주소 찾기\n');
console.log('='.repeat(50));

const ips = getLocalIP();

if (ips.length === 0) {
    console.log('❌ 로컬 IP 주소를 찾을 수 없습니다.');
    console.log('   Wi-Fi나 이더넷에 연결되어 있는지 확인하세요.');
} else {
    console.log('✅ 찾은 IP 주소:\n');
    ips.forEach((ip, index) => {
        console.log(`   ${index + 1}. ${ip.address} (${ip.interface})`);
    });
    
    // 가장 일반적인 Wi-Fi 인터페이스 우선
    const wifiIP = ips.find(ip => 
        ip.interface.toLowerCase().includes('en0') || 
        ip.interface.toLowerCase().includes('wifi') ||
        ip.interface.toLowerCase().includes('wireless')
    ) || ips[0];
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📌 추천 IP 주소: ${wifiIP.address}`);
    console.log(`\n🌐 프론트엔드에서 사용할 Base URL:`);
    console.log(`   http://${wifiIP.address}:3001`);
    console.log(`\n💡 다른 컴퓨터에서 접속하려면:`);
    console.log(`   1. 같은 Wi-Fi/네트워크에 연결되어 있어야 합니다`);
    console.log(`   2. 백엔드 서버가 실행 중이어야 합니다`);
    console.log(`   3. 프론트엔드 코드의 Base URL을 위 주소로 변경하세요`);
}

