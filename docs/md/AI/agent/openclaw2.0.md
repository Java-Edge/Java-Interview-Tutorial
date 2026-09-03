# OpenClaw 2.0 升级安装指南，全程踩坑！

## 0 一个被误判的起点

> 环境：Mac Studio（Apple Silicon, arm64）／ macOS 15.7.4
> 起点：OpenClaw `2026.7.1-2`　终点：`2026.8.1`（OpenClaw 2.0）
> 全程耗时约10分钟，未丢失任何数据

现在需求很简单——评估 OpenClaw 2.0 在 macOS 上的最佳安装方式。

但诊断第一步就推翻了问题的性质：**这台机器不是"没装"，而是"装歪了"**。

```bash
$ which openclaw
openclaw not found

$ ls -la ~/.openclaw/
drwx------  agents/       identity/     logs/
-rw-------  openclaw.json openclaw.json.bak  openclaw.json.last-good
drwxr-xr-x  plugins/      service-env/  skill-workshop/
drwx------  skills/       state/        workspace/
```

CLI 命令找不到，但状态目录一应俱全。更关键的证据在进程表：

```bash
$ lsof -nP -iTCP:18789 -sTCP:LISTEN
node  4243  javaedge  23u  IPv4 ... TCP 127.0.0.1:18789 (LISTEN)

$ curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18789/
200
```

**Gateway 一直在正常运行**，只是跑的旧版，而 CLI 因为 PATH 问题失联。

这一发现改变了整个技术路线：问题从"如何全新安装"变成"如何在不停摆的前提下完成版本切换与数据迁移"。人为给自己加点困难！

## 1 诊断

### 1.1 环境实测

| 检查项           | 实测值                                                    | 判定                             |
| ---------------- | --------------------------------------------------------- | -------------------------------- |
| 芯片 / 系统      | arm64 / macOS 15.7.4                                      | ✅ 满足                           |
| Gateway 进程     | PID 4243，监听 `127.0.0.1:18789`，HTTP 200                | ✅ 活着                           |
| **运行版本**     | `OpenClaw 2026.7.1-2 (0790d9f)`                           | ❌ 落后一个大版本                 |
| CLI 可用性       | `which openclaw` → not found                              | ❌ 断链                           |
| Gateway 安装路径 | `~/.nvm/versions/node/v20.19.6/lib/node_modules/openclaw` | ⚠️ 绑在已 EOL 的 Node 20          |
| Gateway 运行时   | `~/.hermes/node/bin/node` = v22.23.1                      | 唯一达标者，但属第三方私有运行时 |
| 磁盘可用         | 94 GiB                                                    | ✅ 充足                           |
| LM Studio        | 监听 `*:1234`                                             | ✅ 2.0 引导可自动发现             |
| OpenClaw.app     | 未安装                                                    | 可选                             |

### 1.2 Node：全系不达标的硬约束

官方门槛（来自文档与安装脚本内常量 `NODE_SUPPORTED_VERSION_LABEL`，两者一致）：

```
Node >=22.22.3 <23  或者  >=24.15.0 <25  或者  >=25.9.0
```

本机所有 Node 逐一比对：

| 来源                        | 版本       | 判定               |
| --------------------------- | ---------- | ------------------ |
| WorkBuddy 托管（PATH 首个） | `v22.22.2` | ❌ 差 0.0.1         |
| Homebrew                    | `v22.22.0` | ❌ 不达标           |
| nvm                         | `v24.13.0` | ❌ 差 24.15         |
| `.hermes/node`（私有）      | `v22.23.1` | ✅ 达标，但不应依赖 |

日志铁证：

```bash
$ tail -30 ~/.openclaw/logs/gateway.err.log
openclaw requires Node >=22.22.3 <23, >=24.15.0 <25, or >=25.9.0.
Detected: node 22.22.0 (exec: /opt/homebrew/Cellar/node@22/22.22.0/bin/node).
PATH searched: /opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin
Upgrade Node and re-run openclaw.
```

**PATH 里有 7 套 AI 运行时在互相抢占**（WorkBuddy / hermes / nvm / homebrew / grok / catpaw / bun）。这个事实直接决定了方案选型——任何"自己管 Node"的安装方式都会踩坑。

### 1.3 异常

#### SQLite 状态与服务版本错位

`~/.openclaw/state/openclaw.sqlite`（4.1 MB）于 8/31 09:16 创建、9/1 09:46 仍有写入，而常驻 Gateway 版本仍是 `2026.7.1-2`。schema 已升、服务未升——继续用旧版读写已迁移的库，是状态不一致的实际风险源。

#### PATH 污染

首位是 WorkBuddy 托管的 `v22.22.2`（不达标），若手工执行 `openclaw` 会直接命中日志里那个报错。

#### 版本陷阱

官方发布说明明确标注 `2026.9.1-beta.1` **版本号有误**，其实际内容是 `2026.8.1-beta.4`，且低于稳定版。**不要把它当成"比 2.0 更新"**。

## 2 方案选型

四条路径的取舍。

### 2.1 先确认目标版本与可用资产

```bash
curl -s "https://api.github.com/repos/openclaw/openclaw/releases/latest" \
  | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(d['tag_name'], d['published_at'], 'prerelease:', d['prerelease'])
[print(' ', a['name'], round(a['size']/1e6,1),'MB') for a in d['assets']]"
```

输出要点：

```bash
v2026.8.1  2026-08-31T03:30:51Z  prerelease: False
assets: 40
  OpenClaw-2026.8.1.dmg        531.13 MB
  OpenClaw-2026.8.1.zip        789.26 MB
  OpenClawCompanion-SHA256SUMS.txt
  ...（另有大量 *-verification.json 校验文件）
```

**关键结论：v2026.8.1 确实发布了 macOS 桌面端资产**，GUI 路线可行。

### 2.2 四条官方路径对比

| 方案                 | 命令                                                | 优势                                                         | 本机适配                     |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| **A. install.sh**    | `curl -fsSL https://openclaw.ai/install.sh \| bash` | 自动 provision Node 26；不依赖系统 Node；官方托管安装器会清 npm 新鲜度过滤 | ✅ **最佳**                   |
| B. macOS 桌面端      | 下载 `OpenClaw-2026.8.1.dmg`（531 MB）              | 菜单栏、⌥Space Quick Chat、语音唤醒、TCC 权限、Sparkle 自更新 | ✅ 可选，但应后置             |
| C. install-cli.sh    | 装进 `~/.openclaw` 本地前缀                         | 与系统 Node 解耦最彻底                                       | ⚠️ 要再往已很长的 PATH 加一项 |
| D. npm/pnpm/bun 全局 | `npm i -g openclaw@latest --allow-scripts=openclaw` | 透明可控                                                     | ❌ 必踩版本 + PATH 双坑       |

### 2.3 决策：为什么是 A

**唯一决定性理由**——A 是唯一自动 provision **Node 26** 的主线路径，一次性绕开"Node 全系不达标"与"PATH 混乱"这两个硬伤。

D 被明确排除：本机 Node 全系不达标 + 7 套运行时抢占，全局安装后命令落在哪、被哪个 node 执行，完全不可控。

B 不排除但后置：桌面端 app 可以连接已有 Gateway，不必重复安装。先用 A 完成升级与数据迁移，GUI 按需补装即可。

> **最终选择**：A（install.sh）为主线 + 原地保留数据。

## 3 执行：严格顺序

### 3.0 先停写，后备份

常规直觉是先备份再停服务。这必须**反过来**——Gateway 正在持续写 SQLite，若先备份，拷到的是一个正在被修改的库，备份本身不可信（WAL 模式下尤其明显）。

正确顺序：**停写 → 备份 → 安装**。

### 3.1 第一步：停写并确认端口释放

```bash
UID_NUM=$(id -u)
launchctl bootout gui/$UID_NUM/ai.openclaw.gateway
sleep 2
pgrep -f "openclaw/dist/index.js" || echo "✅ 进程已退"
lsof -nP -iTCP:18789 -sTCP:LISTEN  || echo "✅ 端口已释放"
launchctl list | grep -i claw      || echo "✅ 已从 launchctl 移除"
```

### 3.2 第二步：备份并校验

```bash
BK=~/openclaw-backup-$(date +%Y%m%d-%H%M%S); mkdir -p "$BK"
cp -a ~/.openclaw "$BK/dot-openclaw"
cp -a ~/Library/LaunchAgents/ai.openclaw.gateway.plist "$BK/"
cp -a ~/Library/Logs/openclaw "$BK/launchd-logs"

# 三重校验
find ~/.openclaw        -type f | wc -l      # 29
find "$BK/dot-openclaw" -type f | wc -l      # 29  → 一致
python3 -c "import sqlite3;print(sqlite3.connect('$BK/dot-openclaw/state/openclaw.sqlite').execute('PRAGMA integrity_check').fetchone())"
# ('ok',)
```

备份仅 3.2 MB，成本接近零——但它是整个操作的安全底线：**2.0 迁移到 SQLite 后降级不可逆**，官方明确要求升级前做 verified backup。

### 3.3 第三步：审查脚本后再执行

`curl | bash` 是官方推荐，但对 4070 行的脚本做基本审查是必要的：

```bash
curl -fsSL https://openclaw.ai/install.sh -o /tmp/openclaw-install.sh
grep -n "sudo" /tmp/openclaw-install.sh | head -5
grep -n "NODE_SUPPORTED_VERSION_LABEL" /tmp/openclaw-install.sh
```

审查结论：

- **sudo 仅用于 Linux `apt-get` 与 macOS 组编辑提示**，不是主安装路径
- 内置门槛常量 `22.22.3+, 24.15.0+, or 25.9.0+`，与官方文档一致
- 支持 `--no-onboard` 非交互模式

用 `--no-onboard` 避免交互式引导卡死（引导需要选择模型、登录，无法自动化）：

```bash
cd ~ && curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
```

### 3.4 安装器实际行为（节选）

```bash
✓ Detected: macos
Install plan: npm / latest / Onboarding: skipped

[1/3] Preparing environment
· Node.js v24.13.0 found, upgrading to a supported version
· Installing Node.js via Homebrew
✓ Active Node.js: v26.8.1 (/opt/homebrew/opt/node/bin/node)
· Active npm: 11.19.0

[2/3] Installing OpenClaw
· Installing OpenClaw v2026.8.1
· Published openclaw bin link at /opt/homebrew/bin/openclaw

[3/3] Finalizing setup
! Multiple OpenClaw global installs detected
    - 2026.8.1    /opt/homebrew/lib/node_modules/openclaw
    - 2026.7.1-2  /Users/javaedge/.nvm/versions/node/v20.19.6/lib/node_modules/openclaw
· Config already present; running doctor to migrate settings
! Gateway restart failed; try: openclaw daemon restart

🦞 OpenClaw installed successfully (2026.8.1)!
```

三个关键信息：

1. 安装器**自动把 Node 从 v24.13.0 升到 v26.8.1**——官方推荐版本
2. 它**检测到了多安装源冲突**并给出警告，但只警告不处理
3. `Gateway restart failed` —— 这引出下一节最容易漏的一步

## 4 收尾：安装器不会替你做的事

### 4.1 LaunchAgent 仍指向旧包

安装完成后的状态检查：

```bash
$ openclaw gateway status --deep
Command: /Users/javaedge/.hermes/node/bin/node \
         /Users/javaedge/.nvm/versions/node/v20.19.6/lib/node_modules/openclaw/dist/index.js gateway --port 18789
Runtime: stopped (state spawn scheduled)
Service is loaded but not running (likely exited immediately).
Service config issue: Gateway service PATH includes version managers or package managers
```

**根因**：安装器更新了 npm 包，但**没有重建 LaunchAgent plist**。plist 里仍写死旧路径，指向已被移动的包，于是启动即退出。

修复——必须用新装的 CLI 重建守护进程：

```bash
export PATH="/opt/homebrew/bin:$PATH"   # 确保调用新 CLI
openclaw gateway uninstall
openclaw gateway install
```

重建后的 plist 才算正确：

```xml
<string>/opt/homebrew/opt/node/bin/node</string>
<string>--max-old-space-size=32768</string>
<string>/opt/homebrew/lib/node_modules/openclaw/dist/index.js</string>
<string>gateway</string>
```

注意 `--max-old-space-size=32768`——安装器按本机 128 GB 物理内存自动配置了堆上限，这是旧版没有的。

### 4.2 清理旧安装源

官方建议 "Keep one install source, then remove stale installs"。但：

```bash
$ /Users/javaedge/.nvm/versions/node/v20.19.6/bin/npm uninstall -g openclaw
up to date in 81ms          # ← 无效

$ ls -d /Users/javaedge/.nvm/versions/node/v20.19.6/lib/node_modules/openclaw
/Users/javaedge/.nvm/versions/node/v20.19.6/lib/node_modules/openclaw   # ← 旧包仍在
```

**原因**：该包未被 npm 记录（可能是手动放置或由其他工具注入），`npm uninstall` 无从下手。

改用移动而非删除——效果相同但完全可逆：

```bash
mkdir -p "$BK/stale-npm-openclaw-2026.7.1-2"          # 父目录必须先存在
mv <old-path>/lib/node_modules/openclaw "$BK/stale-npm-openclaw-2026.7.1-2/openclaw"
```

### 4.3 一个值得记录的陷阱：不要信任单一信号

上面那条 `mv` 返回了 stderr：

```bash
mv: rename ... to .../stale-npm-openclaw-2026.7.1-2/openclaw: No such file or directory
```

但紧接着的检查却显示源路径已空。两个信号互相矛盾。

**处理方式：用独立命令复核真实结果，而不是相信任何单一输出。**

```bash
ls -d <old-path> 2>/dev/null || echo "已清空"
ls -la "$BK/"    # 确认目标确实收到了内容
```

复核结论：包实际已成功落入备份目录，stderr 是误报。若不复核，可能误判为"旧包丢失"或"清理失败"而做出多余动作。

## 5 验证：端到端确认

```bash
$ openclaw --version
OpenClaw 2026.8.1 (ea80657)

$ openclaw gateway status
CLI version: 2026.8.1 (/opt/homebrew/bin/openclaw)
Gateway version: 2026.8.1
Runtime: running (pid 7296)
Connectivity probe: ok

$ curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18789/
200
```

**必须确认 CLI version 与 Gateway version 完全一致**，且 plist 的 `ProgramArguments` 指向新包——三者缺一都可能留下"看起来装好了"的假象。

只读体检：

```bash
$ openclaw doctor --lint
{"ok":false,"checksRun":30,"checksSkipped":29,"findings":[...2 个 warning...]}
```

30 项检查通过，仅 2 个信息级提示（详见第八节遗留项），均不阻塞。

### 配置确实被迁移

对比 `~/.openclaw/openclaw.json` 前后：

| 字段                      | 升级前       | 升级后                                    |
| ------------------------- | ------------ | ----------------------------------------- |
| `meta.lastTouchedVersion` | `2026.7.1-2` | **`2026.8.1`**                            |
| `meta.migrations`         | 无           | `modelPolicyAllowlist: true`              |
| `agents.entries`          | 无           | `main: {}`                                |
| `skills.entries`          | 无           | **31 个 bundled skills**（全部 disabled） |
| `wizard.lastRunVersion`   | —            | `2026.8.1`                                |

## 6 踩坑清单

| #    | 现象                                               | 根因                                                         | 处理                                                         |
| ---- | -------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | `Service is loaded but not running`                | plist 仍指向已移动的旧包，安装器不重建                       | `gateway uninstall` → `gateway install`                      |
| 2    | `npm uninstall -g` 报 up to date，旧包仍在         | 包未进 npm 记录                                              | 用 `mv` 移到备份目录（可逆，优于 `rm`）                      |
| 3    | `mv` 报 No such file or directory 但源消失了       | 目标父目录不存在，stderr 误报                                | 用 `ls -d` 独立复核，不信任单一信号                          |
| 4    | `devices rotate --role operator` → rotation denied | 需交互式重认证，无法自动化                                   | 若 `doctor`/`devices list` 正常则无阻塞，留给终端处理        |
| 5    | `NODE_TLS_REJECT_UNAUTHORIZED=0` 警告              | **来自宿主执行环境**（AI 工具注入的 shell），非 OpenClaw 设置 | 该变量在 openclaw 的 `host-env-security` 中属**环境变量隔离清单**——它在主动管控宿主污染，方向相反。用户自带终端不受影响 |
| 6    | Dashboard 显示 "QClaw" 而非 "OpenClaw"             | 浏览器端 ServiceWorker 缓存来自旧衍生 fork                   | 见第九节                                                     |

第 5 条值得展开：最初判断是"误报"，但归因错了。复核后发现该变量确实存在，只是来源不是 OpenClaw 配置：

```bash
$ echo "[$NODE_TLS_REJECT_UNAUTHORIZED]"
[0]                    # ← 当前执行 shell 注入的
$ grep -rn "NODE_TLS_REJECT_UNAUTHORIZED" ~/.openclaw/ ~/.zshrc
（无结果）              # ← 不在 OpenClaw 配置，也不在用户 shell 配置
```

而 openclaw 源码中该变量出现在 `dist/host-env-security-*.js` 的**隔离清单**里——它是被管控对象，不是设置者。

## 7 数据判读：不要相信文件 mtime

诊断中期一度推测"SQLite 库由 2.0 迁移创建"，依据是文件时间戳（8/31 09:16 创建、9/1 09:46 写入）。这个推测是**错的**。

用 SQLite 反查才拿到真相：

```sql
SELECT * FROM schema_meta;
-- meta_key='startup-migrations', app_version='2026.7.1-2', created_at=1787017490221

SELECT * FROM gateway_boot_lifecycle ORDER BY rowid DESC LIMIT 3;
-- pid=4243, started_at_ms=1788138970088, outcome='clean_stop',
-- startup_reason='gateway.crash_loop_recovered'
```

时间戳换算后：

| 时间戳          | 本地时间            | 含义                            |
| --------------- | ------------------- | ------------------------------- |
| `1787017490221` | 2026-08-18 09:44:50 | SQLite 库由 **2026.7.1-2** 建立 |
| `1788138970088` | 2026-08-31 09:16:10 | Gateway 崩溃恢复后重启          |
| `1788273524701` | 2026-09-01 22:38:44 | 本次升级时的 clean_stop         |

**修正后的结论**：SQLite 库由旧版于 8/18 建立，8/31 09:16 是崩溃重启时刻，不是 2.0 迁移。

附带发现：`startup_reason = gateway.crash_loop_recovered` 说明旧版本身就不稳定——这次升级的必要性得到了佐证。

> **方法论**：文件 mtime 只代表最后写入时间，不代表创建版本。查真实历史要读数据库元数据，而不是文件系统时间戳。

## 8 启动与首次使用

### 8.1 Gateway 无需重新启动

升级完成后它已经在跑（PID 7296），且 LaunchAgent 的 `RunAtLoad=true` 意味着**开机自启已生效**。

Dashboard 地址：`http://127.0.0.1:18789/`

### 8.2 但必须补上模型配置

因为安装时用了 `--no-onboard`，模型接入是空的：

```bash
$ openclaw models list
Model                 Input   Ctx   Local  Auth   Tags
openai/gpt-5.6-sol    -       -     no     no     default
```

`Auth = no`，配置里没有 `models` / `auth` 键。**不配这步，打开 Dashboard 也聊不了。**

```bash
openclaw onboard        # 交互式，需在终端执行
```

2.0 的引导会先扫描机器上已有的 AI 访问权限，而不是上来就索要 key：

| 引导可复用                        | 本机情况                                     |
| --------------------------------- | -------------------------------------------- |
| Codex / ChatGPT / Claude CLI 登录 | 有多套                                       |
| 直接填 API key                    | 可选                                         |
| **Ollama / LM Studio 本地模型**   | ✅ LM Studio 正在 `*:1234` 监听，会被自动发现 |

对本机最有价值的是第三条——接本地模型，**零 API 成本、数据不出本机**。2.0 的行为是先发起一次真实调用确认该模型确实能应答，才保存凭据，不会出现配完才发现跑不通。

### 8.3 三种使用入口

```bash
open http://127.0.0.1:18789/                              # 浏览器 Dashboard
openclaw agent --message "帮我梳理今天的待办"               # 终端直接对话
openclaw gateway status                                    # 检查服务状态
```

## 9 插曲：Dashboard 为什么显示 "QClaw"？

打开 Dashboard 后，顶部品牌名显示为 **QClaw** 而非 OpenClaw。这需要严肃归因——后端可能被换成了衍生 fork。

### 9.1 后端验证

```bash
# ① 包元数据
$ cat /opt/homebrew/lib/node_modules/openclaw/package.json
name: openclaw
version: 2026.8.1
author: OpenClaw Foundation (https://openclaw.org)
homepage: https://github.com/openclaw/openclaw#readme

# ② 包内搜索
$ grep -rln "QClaw" /opt/homebrew/lib/node_modules/openclaw/
（0 命中）

# ③ 服务端实际返回
$ curl -s http://127.0.0.1:18789/ | grep -i -c "qclaw"
0
$ curl -s http://127.0.0.1:18789/ | grep -i -o "openclaw" | head -3
openclaw / openclaw / OpenClaw
```

**服务端发的内容里 "QClaw" 出现 0 次，"OpenClaw" 正常出现。后端是干净的。**

### 9.2 根因

我此前装过 **QClaw**（基于 OpenClaw 的国产衍生 fork），证据在 Application Support 残留：

```bash
~/Library/Application Support/QClaw/
  ├── .qclaw/          app-store.json
  ├── Cache/           Code Cache/
  ├── Cookies          Cookies-journal
  └── blob_storage/
```

- `/Applications/QClaw.app` 已卸载，但数据目录未清
- QClaw 与 OpenClaw **共用 18789 端口**与相似的 WebUI 资源路径
- `pgrep -fl QClaw` 无结果——**没有活跃进程**，当前 18789 唯一监听者是官方 OpenClaw

结论：**服务器发的是 OpenClaw 页面，但浏览器里 localhost:18789 的 ServiceWorker / 缓存仍是 QClaw 注册的那一套**，新页面被旧 SW 替换成了 QClaw 品牌。

### 9.3 修复（按命中率排序）

1. **硬刷新**：`Cmd + Shift + R`
2. **清 ServiceWorker**（最可能命中）：DevTools → **Application** → **Service Workers** → 对 `127.0.0.1:18789` 点 **Unregister**；再点 **Clear storage** 全清 → 刷新
3. **隐身窗口验证**：无痕窗口访问 `http://127.0.0.1:18789/` —— 若显示 OpenClaw 即确证为纯缓存问题
4. **彻底清场**：`chrome://settings/content/all` 搜索 `127.0.0.1` 删除所有数据

## 10 遗留项（均不阻塞）

| #    | 项目                                        | 风险                                                      | 处置                                                         |
| ---- | ------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | `gateway.auth.token` 明文存于 openclaw.json | 低——文件权限 600，Gateway 仅绑 loopback                   | 要收紧：`openclaw secrets configure` 迁到 SecretRef，再 `openclaw secrets audit --check` 验证 |
| 2    | `Gateway is only bound to loopback`         | 无——**这是官方安全默认值**                                | 非缺陷；需远程访问才改 `gateway.bind=lan`                    |
| 3    | 本地 operator device token 属 stale pattern | 低——`~/.openclaw/identity` 为空，CLI↔Gateway 通信实测正常 | `openclaw devices rotate` 需交互式重认证，出现 mismatch 时再处理 |

---

## 附录：完整命令清单

```bash
# ── 诊断 ─────────────────────────────────────────
which -a openclaw; openclaw --version
ls -la ~/.openclaw/ && cat ~/.openclaw/openclaw.json
cat ~/Library/LaunchAgents/ai.openclaw.gateway.plist
launchctl list | grep -i claw
lsof -nP -iTCP:18789 -sTCP:LISTEN
tail -30 ~/.openclaw/logs/gateway.err.log
for d in ~/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node; do
  [ -x "$d" ] && echo "$($d -v) -> $d"; done

# ── 停写 ─────────────────────────────────────────
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
sleep 2; lsof -nP -iTCP:18789 -sTCP:LISTEN || echo "端口已释放"

# ── 备份 ─────────────────────────────────────────
BK=~/openclaw-backup-$(date +%Y%m%d-%H%M%S); mkdir -p "$BK"
cp -a ~/.openclaw "$BK/dot-openclaw"
cp -a ~/Library/LaunchAgents/ai.openclaw.gateway.plist "$BK/"
find ~/.openclaw -type f | wc -l; find "$BK/dot-openclaw" -type f | wc -l
python3 -c "import sqlite3;print(sqlite3.connect('$BK/dot-openclaw/state/openclaw.sqlite').execute('PRAGMA integrity_check').fetchone())"

# ── 安装 ─────────────────────────────────────────
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard

# ── 收尾（关键，易漏）─────────────────────────────
export PATH="/opt/homebrew/bin:$PATH"
openclaw gateway uninstall && openclaw gateway install
mkdir -p "$BK/stale-npm-openclaw-<oldver>"
mv <old-path>/lib/node_modules/openclaw "$BK/stale-npm-openclaw-<oldver>/openclaw"
ls -d <old-path> 2>/dev/null || echo "已清空"     # 必须复核

# ── 验证 ─────────────────────────────────────────
openclaw --version
openclaw gateway status --deep
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18789/
openclaw doctor --lint

# ── 首次使用 ──────────────────────────────────────
openclaw onboard                                   # 配模型（交互式）
open http://127.0.0.1:18789/                       # Dashboard
openclaw agent --message "..."                     # 终端对话
```

## 复盘

1. **不要相信"没装"的第一印象**。`which` 找不到命令 ≠ 软件未安装。先看状态目录与进程表，问题的性质可能完全不同。

2. **安装器只做它承诺的部分**。它负责装包和升级 Node，但不重建 LaunchAgent、不清理旧安装源、不替你完成交互式引导。这三件事恰恰是"看起来装好了但用不了"的高发区。

3. **归因要比现象多走一步**。本文有两次判断修正：一次是把"SQLite 由 2.0 迁移"修正为"由旧版 8/18 建立"（靠读 `schema_meta` 而非文件 mtime）；一次是把 `NODE_TLS_REJECT_UNAUTHORIZED` 从"误报"修正为"宿主执行环境注入"（靠 `echo $VAR` 与源码定位）。两次都是因为第一次的证据不够硬