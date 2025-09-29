# BookCRUD

Book Library App คือแอปพลิเคชันจัดการหนังสือส่วนตัว (Personal Book Manager) พัฒนาด้วย React Native CLI โดยเน้นการใช้งานง่าย ปลอดภัย และสามารถทำงานได้แบบออฟไลน์

✨ คุณสมบัติหลัก

🔐 ระบบความปลอดภัย (Custom Local Authentication)

ผู้ใช้ต้องตั้ง Passcode ครั้งแรกที่เข้าแอป

ใช้ Passcode นี้ในการเข้าสู่ระบบครั้งถัดไป

สามารถกด Reset Passcode เพื่อเปลี่ยนรหัสใหม่ได้

📖 จัดการหนังสือ (CRUD Book Management)

เพิ่มหนังสือใหม่

ดูหนังสือทั้งหมด

ดูรายละเอียดหนังสือรายเล่ม

แก้ไขข้อมูลหนังสือ

ลบหนังสือ

💾 เก็บข้อมูลแบบ Local

ใช้ AsyncStorage สำหรับจัดเก็บข้อมูลหนังสือและ Passcode ภายในเครื่อง

🎨 UI/UX ทันสมัย

ใช้ React Native StyleSheet

ปรับแต่งหน้าจอ Passcode ให้ฟีลเหมือนระบบล็อกหน้าจอ

⚙️ Requirements

Node.js >= 16.0

React Native CLI

Android Studio (สำหรับ Emulator และ Android SDK)

Java JDK (แนะนำ JDK 17)

🚀 การติดตั้งและรันแอป
1. Clone โปรเจกต์
   git clone <repository-url>
   
   cd BookCRUD

2. ติดตั้ง dependencies
   
   npm install

4. รันแอพพลิเคชันบน Android Emulator
   
   npx react-native run-android

6. หรือรัน Metro Bundler
   
   npx react-native start

📱 การใช้งาน

ครั้งแรก: ผู้ใช้ต้องตั้ง Passcode (ระบบจะบังคับเพราะ AsyncStorage ยังไม่มีค่า)

ล็อกอิน: กรอก Passcode ที่ตั้งไว้เพื่อเข้าสู่ระบบ

เพิ่มหนังสือ: กดปุ่ม ➕ เพิ่มหนังสือใหม่ กรอกข้อมูลแล้วบันทึก

ดูรายการหนังสือ: ไปที่หน้ารายการเพื่อดูหนังสือทั้งหมด

แก้ไขหนังสือ: เลือกหนังสือ → กด "แก้ไข"

ลบหนังสือ: เลือกหนังสือ → กด "ลบ"

Reset Passcode: กดปุ่ม Reset (หลังจากเข้าสู่ระบบแล้ว)

🛠️ เทคโนโลยีที่ใช้

Frontend: React Native CLI

Navigation: In-file State Navigation (ไม่ใช้ react-navigation เพื่อความง่าย)

Authentication: Custom Local Passcode Authentication (AsyncStorage)

Storage: AsyncStorage

UI: React Native StyleSheet, TouchableOpacity, FlatList

Icons: ใช้ Text/Emoji (แทน icon library เพื่อความเบา)
