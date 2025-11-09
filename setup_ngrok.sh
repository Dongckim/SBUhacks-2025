#!/bin/bash
# ngrok 설치 및 설정 스크립트

echo "🚀 ngrok 설치 및 설정"
echo "===================="
echo ""

# Homebrew 확인
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew가 설치되어 있지 않습니다."
    echo "   먼저 Homebrew를 설치하세요: https://brew.sh"
    exit 1
fi

# ngrok 설치
echo "📦 ngrok 설치 중..."
brew install ngrok

echo ""
echo "✅ ngrok 설치 완료!"
echo ""
echo "📝 다음 단계:"
echo "1. https://ngrok.com/signup 에서 무료 계정 생성"
echo "2. 대시보드에서 authtoken 복사"
echo "3. 다음 명령어 실행:"
echo "   ngrok config add-authtoken YOUR_AUTH_TOKEN"
echo ""
echo "4. 서버 실행 후 다른 터미널에서:"
echo "   ngrok http 3001"
echo ""

