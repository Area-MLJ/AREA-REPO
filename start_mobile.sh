#!/bin/bash

# AREA Mobile - Development Script
# Runs the Flutter app in development mode

set -e

echo "📱 AREA Mobile - Development Mode"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend/mobile" ]; then
    echo -e "${RED}❌ Error: 'frontend/mobile' directory not found${NC}"
    echo -e "${YELLOW}💡 Run this script from the AREA project root${NC}"
    exit 1
fi

# Navigate to mobile directory
cd frontend/mobile

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}❌ Error: Flutter is not installed${NC}"
    echo "Please install Flutter from https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Get dependencies if needed
if [ ! -d ".dart_tool" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    flutter pub get
fi

# Check for connected devices
echo -e "\n${BLUE}🔍 Checking for connected devices...${NC}"
DEVICES=$(flutter devices 2>&1)

if echo "$DEVICES" | grep -q "No devices detected"; then
    echo -e "${YELLOW}⚠️  No devices detected.${NC}"
    echo -e "${YELLOW}Please connect a device or start an emulator.${NC}"
    echo ""
    echo "Options:"
    echo "  - Connect an Android device via USB"
    echo "  - Start an Android emulator"
    echo "  - Run on Chrome: ./start_mobile.sh web"
    exit 1
fi

echo "$DEVICES"

# Run based on platform
PLATFORM=${1:-}

case $PLATFORM in
  web)
    echo -e "\n${GREEN}🚀 Starting Flutter web development server...${NC}"
    echo -e "${BLUE}📝 Logs:${NC}"
    echo "========================"
    flutter run -d chrome --web-port=8082
    ;;
    
  android)
    echo -e "\n${GREEN}🚀 Starting Flutter on Android...${NC}"
    echo -e "${BLUE}📝 Logs:${NC}"
    echo "========================"
    flutter run -d android
    ;;
    
  ios)
    if [[ "$OSTYPE" != "darwin"* ]]; then
      echo -e "${RED}❌ Error: iOS development is only supported on macOS${NC}"
      exit 1
    fi
    echo -e "\n${GREEN}🚀 Starting Flutter on iOS...${NC}"
    echo -e "${BLUE}📝 Logs:${NC}"
    echo "========================"
    flutter run -d ios
    ;;
    
  *)
    echo -e "\n${GREEN}🚀 Starting Flutter on default device...${NC}"
    echo -e "${BLUE}📝 Logs:${NC}"
    echo "========================"
    flutter run
    ;;
esac

echo ""
echo -e "${YELLOW}🛑 Mobile app stopped${NC}"
