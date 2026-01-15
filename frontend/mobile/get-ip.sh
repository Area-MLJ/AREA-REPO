#!/bin/bash
# Script to get the local IP address for mobile development

echo "🔍 Detecting your local IP address..."
echo ""

# Try to get the main network interface IP
IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -1)

if [ -z "$IP" ]; then
    echo "❌ Could not detect IP address automatically"
    echo "Please run: ip -4 addr show | grep inet"
    exit 1
fi

echo "✅ Detected IP: $IP"
echo ""
echo "📝 Update lib/config/api_config.dart with:"
echo ""
echo "  static const String host = '$IP';"
echo ""
echo "📱 Device Configuration:"
echo "  - Android Emulator: use '10.0.2.2'"
echo "  - iOS Simulator: use 'localhost'"
echo "  - Physical Device: use '$IP'"
