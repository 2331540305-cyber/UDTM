#!/bin/bash
# Test Admin Logs API

BASE_URL="http://localhost:5000/api"
ADMIN_TOKEN="your_admin_token_here"  # Thay bằng token admin thực tế

echo "===== TESTING ADMIN LOGS API ====="

# 1. Lấy danh sách logs
echo -e "\n1️⃣ GET All Logs (with pagination)"
curl -X GET "$BASE_URL/admin-logs?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 2. Lấy logs với lọc action
echo -e "\n\n2️⃣ GET Logs Filtered by Action"
curl -X GET "$BASE_URL/admin-logs?action=create_product&page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 3. Lấy logs trong khoảng thời gian
echo -e "\n\n3️⃣ GET Logs by Date Range"
curl -X GET "$BASE_URL/admin-logs?start_date=2025-01-01&end_date=2025-01-31&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 4. Tìm kiếm logs
echo -e "\n\n4️⃣ Search Logs"
curl -X GET "$BASE_URL/admin-logs?search=product&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 5. Lấy thống kê
echo -e "\n\n5️⃣ GET Statistics"
curl -X GET "$BASE_URL/admin-logs/statistics/overview?days=30" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 6. Export logs as JSON
echo -e "\n\n6️⃣ Export Logs (JSON)"
curl -X GET "$BASE_URL/admin-logs/export?format=json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 7. Export logs as CSV
echo -e "\n\n7️⃣ Export Logs (CSV)"
curl -X GET "$BASE_URL/admin-logs/export?format=csv" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 8. Lấy log theo ID
echo -e "\n\n8️⃣ GET Log by ID"
curl -X GET "$BASE_URL/admin-logs/LG1234567890abc" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 9. Xóa logs cũ
echo -e "\n\n9️⃣ Delete Old Logs (90 days)"
curl -X DELETE "$BASE_URL/admin-logs/batch/old" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 90}'

# 10. Xóa log theo ID
echo -e "\n\n🔟 Delete Log by ID"
curl -X DELETE "$BASE_URL/admin-logs/LG1234567890abc" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n===== END OF TESTS ====="
