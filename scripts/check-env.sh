#!/bin/bash

# สคริปต์นี้สร้างโดย Antigravity Skill เพื่อตรวจสอบว่าไฟล์ .env มีการระบุตัวแปรที่จำเป็นครบถ้วนหรือไม่

REQUIRED_VARS=(
  "VITE_GOOGLE_CLIENT_ID"
  "VITE_GOOGLE_API_KEY"
  "VITE_CALENDAR_ID"
  "VITE_HOLIDAY_CALENDAR_ID"
  "VITE_DRIVE_PARENT_FOLDER_ID"
)

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: ไม่พบไฟล์ $ENV_FILE กรุณาสร้างไฟล์และกำหนดค่าที่จำเป็น"
    exit 1
fi

missing_vars=0

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
        echo "❌ Missing: ไม่พบตัวแปร $var ใน $ENV_FILE"
        missing_vars=$((missing_vars + 1))
    fi
done

if [ $missing_vars -eq 0 ]; then
    echo "✅ ตรวจสอบ Environment Variables สำเร็จ! พร้อมใช้งาน RIO7RoomBook"
    exit 0
else
    echo "⚠️ กรุณาเติมค่าตัวแปรที่ขาดหายไปใน $ENV_FILE ให้ครบถ้วน"
    exit 1
fi
