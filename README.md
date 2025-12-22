Bhai, true GitOps adopt karne ke liye ArgoCD lagana aur CD pipeline hatana – ye bilkul sahi step hai production-grade setup ke liye. Ab Jenkins sirf CI karega (build, scan, image push, aur GitOps repo mein YAML update), aur ArgoCD repo ko watch karke automatic deploy/sync karega Kubernetes pe. No direct kubectl from Jenkins → better security aur declarative flow.

Main assume kar raha hoon ki tera cluster EKS hai (previous pipeline se), kubectl configured hai, aur GitHub repo private hai (credentials needed). Agar public hai to credentials skip kar.

**Prerequisites** (Pehle ye check kar):
- EKS cluster access with kubectl (kubeconfig set).
- GitHub Personal Access Token (PAT) with repo read access (for HTTPS) ya SSH key pair (better for security).
- Helm installed optional (but CLI se kar sakte hain).
- Jenkins CI pipeline already working (jo GitOps repo update kar raha hai: https://github.com/17J/Three-Tier-Todo-App-CD.git, path: K8s).

Ab **step-by-step guide**:

### Step 1: Install ArgoCD on Your EKS Cluster
ArgoCD ko `argocd` namespace mein install kar.
1. Namespace create kar:
   ```
   kubectl create namespace argocd
   ```
2. Official manifests apply kar (stable version – 2025 tak no major change, docs se confirmed):
   ```
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
   Ye ArgoCD ke sab components (deployment, service, etc.) install karega.
3. Installation verify kar:
   ```
   kubectl get pods -n argocd
   ```
   Sab pods Running hone chahiye (5-10 min lag sakte hain).

### Step 2: Install ArgoCD CLI
Local machine pe CLI install kar taaki manage kar sake.
- Mac/Linux pe Homebrew se:
  ```
  brew install argocd
  ```
- Ya direct download (latest version le):
  ```
  curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-darwin-amd64  # Mac example, OS ke hisaab se change kar
  chmod +x argocd
  sudo mv argocd /usr/local/bin/argocd
  ```
- Verify:
  ```
  argocd version
  ```

### Step 3: Access ArgoCD API Server
ArgoCD UI/API access karne ke liye service expose kar.
- EKS pe LoadBalancer use kar (production mein Ingress ya ALB better, lekin POC ke liye ye):
  ```
  kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
  ```
- External IP ya hostname get kar:
  ```
  kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
  ```
  (Ya IP agar hostname nahi). Access URL: `https://<hostname or IP>`
- Temporary testing ke liye port-forward:
  ```
  kubectl port-forward svc/argocd-server -n argocd 8080:443
  ```
  Browser mein: `https://localhost:8080` (self-signed cert warning ignore kar).

### Step 4: Log In to ArgoCD
Initial admin credentials le.
1. Password get kar:
   ```
   argocd admin initial-password -n argocd
   ```
   (Pod name se agar multiple: `kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o name | cut -d'/' -f 2`)
2. CLI se login kar:
   ```
   argocd login <ARGOCD_SERVER>  # <ARGOCD_SERVER> = hostname:port ya localhost:8080
   ```
   Username: `admin`, Password: jo upper mila.
3. Password change kar (security ke liye):
   ```
   argocd account update-password
   ```
4. Initial secret delete kar:
   ```
   kubectl delete secret argocd-initial-admin-secret -n argocd
   ```
5. UI access: Browser mein URL khol, login kar. Dashboard dekh.

### Step 5: Configure ArgoCD for Your Private GitHub Repo
Tera repo private hai (github-cred se), to credentials add kar ArgoCD mein.
- **SSH (Recommended – more secure)**:
  1. SSH key generate kar agar nahi hai: `ssh-keygen -t rsa -b 4096 -C "your@email.com"`
  2. Public key GitHub repo ke settings > Deploy keys mein add kar (read-only ya read-write if needed).
  3. CLI se repo add kar:
     ```
     argocd repo add git@github.com:17J/Three-Tier-Todo-App-CD.git --ssh-private-key-path ~/.ssh/id_rsa
     ```
- **HTTPS (Alternative – PAT use kar)**:
  1. GitHub PAT bana (classic token with repo scope).
  2. CLI se:
     ```
     argocd repo add https://github.com/17J/Three-Tier-Todo-App-CD.git --username <any-non-empty-string> --password <PAT>
     ```
- Verify repo list:
  ```
  argocd repo list
  ```

### Step 6: Create ArgoCD Application for Your App
Ab ArgoCD ko bata ki ye repo watch kar aur sync kar `webapps` namespace mein.
1. Namespace context set kar optional: `kubectl config set-context --current --namespace=argocd`
2. Application create kar CLI se:
   ```
   argocd app create three-tier-todo-app \
     --repo https://github.com/17J/Three-Tier-Todo-App-CD.git \  # Ya git@github.com:... agar SSH
     --path K8s \
     --dest-server https://kubernetes.default.svc \  # In-cluster EKS
     --dest-namespace webapps \
     --sync-policy automated \  # Auto-sync on Git changes
     --auto-prune \  # Delete resources not in Git
     --self-heal    # Auto-correct drift
   ```
   (App name: three-tier-todo-app – change if needed).
3. Verify:
   ```
   argocd app get three-tier-todo-app
   ```
4. Initial sync trigger kar:
   ```
   argocd app sync three-tier-todo-app
   ```
5. UI mein dekh: Applications tab pe ja, sync status check kar. Pods/services deploy hone chahiye.

### Step 7: Remove CD Pipeline from Jenkins
Ab Jenkins CD job ki zaroorat nahi – sirf CI chalega jo repo update karega, ArgoCD baaki handle karega.
1. Jenkins dashboard pe ja, "three-tier-cd" job edit kar.
2. Pipeline script mein sab stages comment out kar ya delete kar (sirf echo "CD deprecated, using ArgoCD" rakh sakta hai).
3. Ya pura job delete kar.
4. CI job (three-tier-ci) check kar – wo abhi bhi GitOps repo update karega (Step 'Update YAML in GitOps Repo').
5. Trigger CI manually: New image tags update hone pe, Git commit/push hoga → ArgoCD detect karega aur auto-sync karega (5-10 sec mein).

### Step 8: Test the Full Flow
1. Code change kar CI repo mein, push kar.
2. Jenkins CI run kar: Images build/push, GitOps repo YAML update.
3. ArgoCD UI/CLI se dekh: App sync ho jayega, new pods rollout.
4. Verify K8s:
   ```
   kubectl get pods -n webapps
   kubectl get svc -n webapps
   ```
5. Agar issue: ArgoCD logs check kar `argocd app logs three-tier-todo-app`.

### Additional Tips for Production
- **Webhooks**: GitHub repo mein ArgoCD webhook add kar taaki instant sync (Settings > Webhooks > Add webhook, URL: ArgoCD's /api/webhook).
- **RBAC**: ArgoCD mein roles set kar (admin full access na de sabko).
- **Ingress/ALB**: EKS pe AWS Load Balancer Controller use kar ArgoCD UI ko proper domain se expose kar.
- **Monitoring**: Prometheus integrate kar ArgoCD metrics ke liye.
- Agar stuck: ArgoCD docs dekh ya error paste kar bata.

Bhai, ye implement kar le – tera setup ab **9/10 production-grade** ho jayega! Agar koi step fail ho ya EKS-specific issue, details bata. 🚀
