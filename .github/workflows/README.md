# GitHub Actions Workflows

## 📁 Workflow Files

### Development
- **`cicd-dev.yml`** - Deploy to Dev environment
  - **Trigger:** Push to `dev` branch
  - **Image tag:** `dev-<commit-sha>`
  - **Namespace:** `crexy-dev`

### Production  
- **`cicd-prod.yml`** - Deploy to Production
  - **Trigger:** Create Release (v1.0.0, v1.0.1, etc.)
  - **Image tag:** Version tag (v1.0.0)
  - **Namespace:** `crexy-prod`
  - **Protection:** Requires `production` environment approval

## 🎯 Tại sao tách riêng?

### ✅ Ưu điểm:

1. **Rõ ràng hơn**
   - Mỗi workflow có mục đích riêng biệt
   - Dễ đọc và hiểu flow

2. **Dễ maintain**
   - Sửa dev không ảnh hưởng production
   - Điều kiện trigger đơn giản hơn

3. **Security tốt hơn**
   - Production có environment protection riêng
   - Có thể require approval trước khi deploy

4. **Testing khác nhau**
   - Dev: Có thể skip tests (fast iteration)
   - Production: Tests bắt buộc phải pass

5. **Review dễ hơn**
   - PR chỉ cần review workflow liên quan
   - Changes rõ ràng hơn

### ❌ So với file gộp:

**File gộp (cicd.yml):**
```yaml
# ❌ Phức tạp
if: github.ref == 'refs/heads/dev' || github.event_name == 'release'
# ❌ Logic rối
environment: ${{ github.ref == 'refs/heads/dev' && 'dev' || 'production' }}
# ❌ Khó maintain
```

**Files tách (cicd-dev.yml + cicd-prod.yml):**
```yaml
# ✅ Đơn giản, rõ ràng
on:
  push:
    branches:
      - dev
```

## 🔄 Workflow Flow

### Development
```
Push to dev branch
  ↓
cicd-dev.yml triggers
  ↓
Test (can fail)
  ↓
Build image dev-abc1234
  ↓
Push to ECR
  ↓
Update overlays/dev/kustomization.yaml
  ↓
ArgoCD auto-sync
```

### Production
```
Create Release v1.0.0
  ↓
cicd-prod.yml triggers
  ↓
Validate version format
  ↓
Test (must pass)
  ↓
Build image v1.0.0
  ↓
Push to ECR
  ↓
[Optional: Wait for approval]
  ↓
Update overlays/production/kustomization.yaml
  ↓
ArgoCD sync
```

## 🔒 GitHub Environment Protection

Để setup approval cho production:

1. Vào **Settings → Environments**
2. Tạo environment `production`
3. Enable **Required reviewers**
4. Chọn người cần approve (team lead, DevOps, etc.)

Khi có deployment, workflow sẽ pause và chờ approval:
```
⏸️ Waiting for approval from @reviewer
```

## 📝 Usage

### Deploy to Dev
```bash
# Just push to dev branch
git checkout dev
git merge feature/new-feature
git push origin dev
# → Automatically triggers cicd-dev.yml
```

### Deploy to Production
```bash
# Create release on GitHub
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Or via GitHub UI:
# Releases → Create new release → v1.0.0
# → Triggers cicd-prod.yml
```

## 🐛 Troubleshooting

### Dev deployment failed
- Check **Actions** tab → `Deploy Backend to Dev`
- Usually safe to retry immediately

### Production deployment stuck
- Check if waiting for approval
- Environment settings → Required reviewers

### Image not updated
- Check if workflow completed successfully
- Check infrastructure repo for new commit
- Check ArgoCD sync status

## 📊 Comparison with Single File

| Aspect | Single File | Separate Files |
|--------|-------------|----------------|
| Clarity | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Maintainability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Security | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Flexibility | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Lines of code | Less | More |

**Kết luận:** Separate files tốt hơn cho production systems! ✅
