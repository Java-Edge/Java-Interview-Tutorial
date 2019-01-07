# os配置
2 CPUs or more
2GB of free memory
20GB of free disk space
Internet connection
Container or virtual machine manager, such as: Docker, Hyperkit, Hyper-V, KVM, Parallels, Podman, VirtualBox, or VMWare

# 安装
## Linux
x86
Binary download

```bash
 curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
 sudo install minikube-linux-amd64 /usr/local/bin/minikube
```


## macOS

```bash
brew install minikube
```

```bash
➜ brew install minikube
Updating Homebrew...
==> Downloading https://homebrew.bintray.com/bottles/kubernetes-cli-1.19.3.catalina.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/f741a91d9fbcea6a40fbedbf0a63cdc8e9be3b39d13405d1d8507cc1b0f41e2f?response-c
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/minikube-1.14.0.catalina.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/06468df343ad2b30e145885faf3e79ab992d6ee59bdabb2b9e6d20c467b746cb?response-c
######################################################################## 100.0%
==> Installing dependencies for minikube: kubernetes-cli
==> Installing minikube dependency: kubernetes-cli
==> Pouring kubernetes-cli-1.19.3.catalina.bottle.tar.gz
Error: The `brew link` step did not complete successfully
The formula built, but is not symlinked into /usr/local
Could not symlink bin/kubectl
Target /usr/local/bin/kubectl
already exists. You may want to remove it:
  rm '/usr/local/bin/kubectl'

To force the link and overwrite all conflicting files:
  brew link --overwrite kubernetes-cli

To list all files that would be deleted:
  brew link --overwrite --dry-run kubernetes-cli

Possible conflicting files are:
/usr/local/bin/kubectl -> /Applications/Docker.app/Contents/Resources/bin/kubectl
==> Caveats
Bash completion has been installed to:
  /usr/local/etc/bash_completion.d

zsh completions have been installed to:
  /usr/local/share/zsh/site-functions
==> Summary
🍺  /usr/local/Cellar/kubernetes-cli/1.19.3: 231 files, 49MB
==> Installing minikube
==> Pouring minikube-1.14.0.catalina.bottle.tar.gz
==> Caveats
Bash completion has been installed to:
  /usr/local/etc/bash_completion.d

zsh completions have been installed to:
  /usr/local/share/zsh/site-functions
==> Summary
🍺  /usr/local/Cellar/minikube/1.14.0: 8 files, 62.3MB
==> Caveats
==> kubernetes-cli
Bash completion has been installed to:
  /usr/local/etc/bash_completion.d

zsh completions have been installed to:
  /usr/local/share/zsh/site-functions
==> minikube
Bash completion has been installed to:
  /usr/local/etc/bash_completion.d

zsh completions have been installed to:
  /usr/local/share/zsh/site-functions
```
