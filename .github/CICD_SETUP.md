# 🚀 CI/CD Setup Guide

## GitHub Secrets cần thiết

Vào **Settings → Secrets and variables → Actions**, thêm các secrets sau:

### Required Secrets

| Secret Name | Mô tả | Cách lấy |
|------------|-------|----------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key có quyền push ECR | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | AWS IAM Console |
| `GITOPS_TOKEN` | GitHub Personal Access Token | GitHub Settings → Developer settings → Personal access tokens |

### Tạo AWS IAM User cho CI/CD

```bash
# 1. Tạo IAM User
aws iam create-user --user-name github-actions-crexy-backend

# 2. Attach policy cho phép push ECR
aws iam attach-user-policy \
  --user-name github-actions-crexy-backend \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# 3. Tạo access key
aws iam create-access-key --user-name github-actions-crexy-backend
# Lưu lại Access Key ID và Secret Access Key
```

### Tạo GitHub Personal Access Token

1. Vào GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Chọn scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Copy token và lưu vào Secret `GITOPS_TOKEN`

## Workflow Files

### `.github/workflows/cicd.yml`
Pipeline chính cho CI/CD:
- **Trigger:** Push to `dev` branch hoặc tạo Release
- **Jobs:**
  1. `prepare` - Xác định environment và image tag
  2. `test` - Run tests và linting
  3. `build-and-push` - Build Docker image và push lên ECR
  4. `update-gitops` - Update image tag trong infrastructure repo

## Cấu hình cần thay đổi

### Trong `.github/workflows/cicd.yml`

```yaml
env:
  AWS_REGION: ap-southeast-1              # ⚠️ Thay bằng region của bạn
  AWS_ACCOUNT_ID: 123456789012            # ⚠️ Thay bằng AWS Account ID
  ECR_REPOSITORY: crexy-backend           # Tên ECR repo
  INFRA_REPO: your-username/crexy-infrastructure  # ⚠️ Thay bằng infra repo
```

## Cách sử dụng

### Development Deployment

```bash
# 1. Develop tính năng mới trên branch feature
git checkout -b feature/new-feature

# 2. Commit và push code
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. Tạo Pull Request merge vào dev
# Sau khi merge, GitHub Actions tự động:
# - Build image với tag dev-<sha>
# - Push lên ECR
# - Update infrastructure repo
# - ArgoCD tự động deploy lên K8s dev namespace
```

### Production Deployment

```bash
# 1. Đảm bảo code trên dev đã stable
# 2. Merge dev vào main
git checkout main
git merge dev
git push origin main

# 3. Tạo Release trên GitHub
# - Vào Releases → Create new release
# - Tag version: v1.0.0 (semantic versioning)
# - Release title: v1.0.0 - Feature X
# - Describe what's new
# - Click "Publish release"

# GitHub Actions tự động:
# - Build image với tag v1.0.0
# - Push lên ECR
# - Update infrastructure repo production overlay
# - ArgoCD deploy lên production (có thể cần manual approve)
```

## Troubleshooting

### Lỗi: "denied: User doesn't have permissions"

```bash
# Kiểm tra ECR repository tồn tại
aws ecr describe-repositories --repository-names crexy-backend

# Nếu chưa có, tạo repository
aws ecr create-repository --repository-name crexy-backend

# Kiểm tra IAM permissions
aws iam list-attached-user-policies --user-name github-actions-crexy-backend
```

### Lỗi: "remote: Permission to ... denied"

- Đảm bảo `GITOPS_TOKEN` có quyền `repo` và `workflow`
- Token phải là của user có quyền write vào infrastructure repo

### Image mới không được deploy

```bash
# 1. Kiểm tra GitHub Actions log
# 2. Kiểm tra infrastructure repo có commit mới không
# 3. Kiểm tra ArgoCD sync status
kubectl get applications -n argocd
argocd app get crexy-dev
```

## Monitoring

### GitHub Actions

- Vào tab **Actions** để xem workflow runs
- Mỗi job có detailed logs
- Failed jobs có thể retry

### ArgoCD

```bash
# Login ArgoCD
argocd login <argocd-server>

# Check app status
argocd app get crexy-dev

# View sync history
argocd app history crexy-dev

# Manual sync nếu cần
argocd app sync crexy-dev
```

## Best Practices

1. **Branch Strategy**
   - `main` - Production code
   - `dev` - Development/staging
   - `feature/*` - Feature branches

2. **Commit Messages**
   - Sử dụng conventional commits: `feat:`, `fix:`, `chore:`
   - Ví dụ: `feat: add user authentication`

3. **Release Tags**
   - Semantic Versioning: v1.0.0, v1.0.1, v1.1.0
   - Major.Minor.Patch
   - Breaking changes → bump major version

4. **Rollback**
   ```bash
   # Nếu deploy bị lỗi, rollback trong ArgoCD
   argocd app rollback crexy-prod <revision>
   ```

## Advanced: Manual Trigger

Có thể trigger workflow manually từ GitHub UI:

1. Vào tab **Actions**
2. Chọn workflow **Frontend CI/CD** hoặc **Backend CI/CD**
3. Click **Run workflow**
4. Chọn:
   - Environment: `dev` hoặc `production`
   - Custom tag (optional): `hotfix-123`
5. Click **Run workflow**

Pipeline sẽ chạy với parameters đã chọn.
