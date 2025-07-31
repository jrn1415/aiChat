#!/bin/bash

# Scripts สำหรับการรัน Code Coverage

echo "🧪 รันการทดสอบพร้อม Code Coverage..."
echo "================================================"

# ลบ coverage เก่า (ถ้ามี)
rm -rf coverage

# รัน tests พร้อม coverage
npm run test:coverage

echo ""
echo "📊 สรุปผล Code Coverage:"
echo "================================================"

# แสดงสรุป coverage จากไฟล์ text
if [ -f "coverage/coverage-summary.json" ]; then
    echo "✅ Coverage reports สร้างเสร็จแล้ว!"
    echo "📁 ดูรายงานแบบ HTML: coverage/lcov-report/index.html"
    echo "📄 ดูรายงานแบบ JSON: coverage/coverage-summary.json"
    echo ""
    
    # แสดง summary ง่ายๆ
    echo "📈 Coverage Summary:"
    node -e "
        const fs = require('fs');
        const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        const total = summary.total;
        console.log('┌─────────────┬──────────┬──────────┬──────────┬──────────┐');
        console.log('│    Type     │   Total  │ Covered  │ Skipped  │    %     │');
        console.log('├─────────────┼──────────┼──────────┼──────────┼──────────┤');
        console.log(\`│ Statements  │ \${total.statements.total.toString().padStart(8)} │ \${total.statements.covered.toString().padStart(8)} │ \${total.statements.skipped.toString().padStart(8)} │ \${total.statements.pct.toString().padStart(7)}% │\`);
        console.log(\`│ Branches    │ \${total.branches.total.toString().padStart(8)} │ \${total.branches.covered.toString().padStart(8)} │ \${total.branches.skipped.toString().padStart(8)} │ \${total.branches.pct.toString().padStart(7)}% │\`);
        console.log(\`│ Functions   │ \${total.functions.total.toString().padStart(8)} │ \${total.functions.covered.toString().padStart(8)} │ \${total.functions.skipped.toString().padStart(8)} │ \${total.functions.pct.toString().padStart(7)}% │\`);
        console.log(\`│ Lines       │ \${total.lines.total.toString().padStart(8)} │ \${total.lines.covered.toString().padStart(8)} │ \${total.lines.skipped.toString().padStart(8)} │ \${total.lines.pct.toString().padStart(7)}% │\`);
        console.log('└─────────────┴──────────┴──────────┴──────────┴──────────┘');
    "
else
    echo "❌ ไม่พบไฟล์ coverage summary"
fi

echo ""
echo "🔧 คำสั่งที่เป็นประโยชน์:"
echo "  npm run test:coverage           - รัน tests พร้อม coverage"
echo "  npm run test:coverage:watch     - รัน coverage แบบ watch mode"
echo "  npm run test:coverage:open      - รัน และเปิดรายงาน HTML (macOS)"
echo "  docker build -f Dockerfile.coverage -t chat-coverage . && docker run --rm chat-coverage"
echo "                                   - รัน coverage ใน Docker"
