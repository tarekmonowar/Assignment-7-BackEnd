# 🚀 CI/CD Pipeline & EC2 Deployment

A hands-on project focused on learning modern DevOps practices — from automating
deployments with **GitHub Actions** to serving a production Node.js app on **AWS
EC2** behind **Nginx** with **PM2** process management and a **custom domain**.

🔗 **Live:** [https://ec2-ph.tarekmonowar.dev](https://ec2-ph.tarekmonowar.dev)

---

## 📚 What I Learned

### 1. GitHub Actions — CI/CD Pipeline

- Created a **multi-job workflow** (`build` → `deploy`) triggered on every push
  to `main`.
- The **build job** checks out code, installs dependencies, and compiles
  TypeScript to ensure nothing is broken before deployment.
- The **deploy job** SSHs into the EC2 instance, syncs files via `rsync`,
  installs production dependencies, and restarts the app — all fully automated.
- Used **GitHub Secrets** to securely store SSH keys, host addresses, and
  environment variables.
- Added a **health-check step** that curls the running server to verify the
  deployment succeeded.

### 2. AWS EC2 — Cloud Server

- Provisioned an **Ubuntu EC2 instance** on AWS.
- Configured **security groups** to allow HTTP (80), HTTPS (443), and SSH (22)
  traffic.
- Set up SSH key-based authentication for secure, passwordless access from
  GitHub Actions.
- Managed the application directory structure on the server (`~/app`).

### 3. Nginx — Reverse Proxy

- Installed and configured **Nginx** as a reverse proxy to forward incoming
  traffic on port **80/443** to the Node.js app running on an internal port.
- Configured server blocks (virtual hosts) for the custom domain.
- Handled proper proxy headers (`X-Real-IP`, `X-Forwarded-For`,
  `X-Forwarded-Proto`) so the app receives correct client information.

**Example Nginx config:**

```nginx
server {
    listen 80;
    server_name ec2-ph.tarekmonowar.dev;

    location / {
        proxy_pass http://localhost:9092;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. PM2 — Process Manager

- Used **PM2** to run the Node.js application as a background daemon process.
- Configured PM2 to **auto-restart** the app on crashes and server reboots
  (`pm2 startup` + `pm2 save`).
- Managed zero-downtime restarts during deployments with `pm2 delete` →
  `pm2 start`.
- Monitored logs and process status with `pm2 status` and `pm2 logs`.

**Key PM2 commands used:**

```bash
pm2 start dist/index.js --name node-app   # Start the app
pm2 save                                    # Save process list
pm2 startup systemd                         # Auto-start on reboot
pm2 status                                  # Check running processes
pm2 logs node-app                           # View logs
```

### 5. Domain Setup with Nginx

- Pointed a custom subdomain (`ec2-ph.tarekmonowar.dev`) to the EC2 instance's
  public IP using **DNS A record**.
- Configured Nginx server blocks to respond to the custom domain.
- Secured the connection with **SSL/TLS** using Let's Encrypt (Certbot) for
  HTTPS.

---

## 🛠️ Tech Stack

| Layer           | Technology               |
| --------------- | ------------------------ |
| Runtime         | Node.js 22 + TypeScript  |
| Framework       | Express.js 5             |
| Database        | MongoDB (Mongoose)       |
| Process Manager | PM2                      |
| Web Server      | Nginx (Reverse Proxy)    |
| Cloud           | AWS EC2 (Ubuntu)         |
| CI/CD           | GitHub Actions           |
| SSL             | Let's Encrypt (Certbot)  |
| Domain          | Custom subdomain via DNS |

---

## 📂 CI/CD Workflow Overview

```
Push to main
    │
    ▼
┌──────────────┐
│  Build Job   │  ← Checkout → Install → Compile TS
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Deploy Job  │  ← SSH into EC2 → rsync files → npm ci → PM2 restart
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Health Check │  ← curl localhost → Verify 200 OK ✅
└──────────────┘
```

---

## 🔗 Live Link

👉 **[https://ec2-ph.tarekmonowar.dev/](https://ec2-ph.tarekmonowar.dev/)**
