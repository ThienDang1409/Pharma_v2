# CI/CD + Docker Checklist

Checklist nay dung de theo doi cac buoc thiet lap `CI/CD` cho app `Next.js` trong `Pharma_v2`.

## 1. Chuan bi flow

- [x] Xac dinh flow branch
  - `main`: production branch
  - `develop`: staging/integration branch
  - `feature/*`: tinh nang moi, tach tu `develop`, merge ve `develop`
  - `fix/*`: sua loi thuong, tach tu `develop`, merge ve `develop`
  - `release/*`: chot ban phat hanh, tach tu `develop`, merge vao `main` va merge nguoc lai `develop`
  - `hotfix/*`: sua loi khan cap production, tach tu `main`, merge vao `main` va merge nguoc lai `develop`
- [x] Xac dinh quy uoc merge
  - PR `feature/*` va `fix/*` vao `develop`
  - PR `release/*` tu `develop` vao `main`
  - merge nguoc `main` hoac `release/*` tro lai `develop` sau moi release
  - PR `hotfix/*` vao `main`, sau do merge nguoc lai `develop`
- [x] Chon noi luu image
  - Docker Hub
  - GHCR
  - GitLab Registry
  - AWS ECR

## 2. Chuan hoa project

- [x] Kiem tra `package.json` da co script can thiet
  - `npm run lint`
  - `npm run build`
- [x] Neu can, them type check
  - `tsc --noEmit`
- [x] Chay local cho xanh truoc khi dua vao CI
  - `npm ci`
  - `npm run lint`
  - `npm run build`

## 3. Docker hoa ung dung

- [x] Tao `.dockerignore`
  - bo `node_modules`
  - bo `.next`
  - bo `.git`
  - bo file env khong can dua vao image
- [x] Tao `Dockerfile`
  - su dung multi-stage build
  - stage cai dependency
  - stage build app
  - stage runtime de chay production
- [x] Test Docker local
  - `docker build`
  - `docker run`
  - kiem tra app chay dung port

## 4. Thiet lap CI

- [x] Tao workflow CI co ban
  - checkout code
  - setup Node.js
  - `npm ci`
- [x] Them stage lint
  - `npm run lint`
- [x] Them stage build
  - `npm run build`
- [x] Them type-check neu da co script
  - `npm run type-check`
- [x] Cau hinh branch kich hoat workflow
  - PR
  - `develop`
  - `main`
  - `feature/*`
  - `fix/*`
  - `release/*`
  - `hotfix/*`

## 5. Build va quan ly Docker image

- [x] Them buoc build image trong pipeline
  - tag theo `commit SHA`
  - tag theo branch neu can
- [ ] Them buoc scan image
  - `trivy` hoac cong cu tuong tu
- [x] Push image len registry
  - chi push khi lint va build pass

## 6. Chuan bi deploy

- [ ] Chuan bi server hoac moi truong staging
  - cai Docker
  - mo port can thiet
  - co IP hoac domain de test
- [ ] Chon cach deploy
  - `docker run`
  - hoac `docker compose`
- [ ] Tao file deploy neu can
  - `docker-compose.yml`
  - file env rieng cho tung moi truong

## 7. CD cho staging

- [ ] Tu dong deploy khi merge vao `develop`
- [ ] Server keo image moi ve
- [ ] Restart container sau khi pull image
- [ ] Chay smoke test sau deploy
  - kiem tra homepage
  - kiem tra route quan trong
  - kiem tra health endpoint neu co (`/api/health` da san sang)

## 8. CD cho production

- [ ] Cau hinh deploy khi merge `main` hoac tao tag release
- [ ] Them buoc approve manual luc dau
- [ ] Push image production tag
- [ ] Deploy len production
- [ ] Kiem tra sau deploy

## 9. Secrets va bien moi truong

- [ ] Tao secrets trong CI
  - registry username
  - registry token
  - server host
  - server user
  - SSH private key
- [ ] Tach bien build-time va runtime
- [ ] Khong dua secret truc tiep vao Docker image
- [ ] Quan ly file env cho `staging` va `production`

## 10. Van hanh on dinh hon

- [ ] Co rollback co ban
  - giu lai image tag cu
  - co cach redeploy ban truoc
- [x] Dinh danh image ro rang
  - `commit-sha`
  - `staging`
  - `production`
  - `latest` neu can
- [x] Chot mapping branch -> image tag
  - `develop` -> `develop`, `staging`, `sha-*`
  - `main` -> `latest`, `production`, `sha-*`
  - `release/*` -> tag theo ten release
  - `feature/*`, `fix/*`, `hotfix/*`, `chore/*` -> tag theo ten branch
- [ ] Viet huong dan ngan trong README
  - workflow chay khi nao
  - image duoc push di dau
  - deploy bang cach nao
  - rollback nhu the nao

## 11. Thu tu uu tien nen lam

- [x] Buoc 1: Chay `lint + build` local on dinh
- [x] Buoc 2: Tao `Dockerfile` va `.dockerignore`
- [x] Buoc 3: Build va run Docker local thanh cong
- [x] Buoc 4: Tao workflow CI cho `lint + build + build-image`
- [x] Buoc 5: Push image len registry
- [ ] Buoc 6: Deploy staging
- [ ] Buoc 7: Them production deploy
- [ ] Buoc 8: Them scan, smoke test va rollback

## 12. Muc tieu toi thieu cho ban dau

- [x] `npm ci`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `docker build`
- [x] Build image trong GitHub Actions
- [x] Push image len registry
- [ ] Deploy len staging
