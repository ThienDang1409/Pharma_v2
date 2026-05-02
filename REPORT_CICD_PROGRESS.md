# CI/CD Progress Report

## Nhanh gon

- Nhanh moi da duoc tao: `chore/cicd-bootstrap`
- Da them bo khung `CI` va `Docker`
- Da sua cac loi `lint` va `type-check` de pipeline khong do ngay
- Da xac minh `npm run build` thanh cong
- Da xac minh duoc `docker build` va `docker run` local
- Da cau hinh Docker Hub cho buoc build/push image tu GitHub Actions

## Da hoan thanh

- Them script `npm run type-check`
- Cau hinh `Next.js` output `standalone` de phu hop Docker runtime nhe hon
- Tao `.dockerignore`
- Tao `Dockerfile` multi-stage
- Tao endpoint health: `/api/health`
- Tao workflow GitHub Actions:
  - `npm ci`
  - `npm run lint`
  - `npm run type-check`
  - `npm run build`
  - `docker build` trong pipeline
  - `docker push` len Docker Hub khi co `push`
- Loai bo phu thuoc build vao Google Fonts de tranh fail trong moi truong khong co internet
- Sua cac loi typing/lint trong editor components
- Dong bo lockfile va bo sung `@swc/helpers` de `npm ci` chay duoc trong Docker

## Da kiem tra

- `npm run lint`: pass
- `npm run type-check`: pass
- `npm run build`: pass
- `docker build -t pharma-v2:test .`: pass
- `docker run -d --name pharma-v2-smoke -p 3000:3000 pharma-v2:test`: pass
- `GET /api/health`: pass, tra ve `{"status":"ok",...}`

Luu y:
- `npm run build` chi pass khi chay ngoai sandbox. Trong sandbox, Next.js bi loi quyen ghi `EPERM` trong thu muc `.next`.
- Day la van de moi truong chay lenh, khong phai loi code hien tai.
- Buoc push Docker Hub can them GitHub secrets:
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`

## Chua hoan thanh

- `docker build` local
- `docker run` local
- push image len registry
- deploy staging
- deploy production
- image scanning
- rollback flow

## Goi y buoc tiep theo

1. Them GitHub secrets cho Docker Hub
2. Test push image tu workflow tren branch nay
3. Cau hinh deploy staging
4. Them smoke test sau deploy voi `/api/health`
5. Them image scanning va rollback flow
