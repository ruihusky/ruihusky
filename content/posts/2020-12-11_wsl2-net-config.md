---
title: "Windows 10 WSL 2 网络配置"
date: 2020-12-11T20:00:00+08:00
draft: false
tags: ["脚本", "WSL"]
categories: ["经验技巧"]
---

使用 WSL 2 时建议将 Windows 10 升级到 **版本 2004** 或更高版本。

WSL 2 使用轻量级虚拟机 (VM) 技术运行 Linux 内核，因此 WSL 2 是有自己的独立 IP 地址的，进行网络应用开发时的情况与 WSL 1 有所不同。

## 从 Windows 访问 WSL 2 网络

在 Windows 使用 localhost 可以直接访问 WSL 2 中运行的网络应用。

## 从 WSL 2 访问 Windows 网络

需要使用主机的 IP 地址进行访问。可以使用以下命令获取主机 IP 地址：

```bash
$ cat /etc/resolv.conf | grep -oP '(?<=nameserver\ ).*'
172.20.144.1
```

以在 WSL 2 (Ubuntu 18.04) 中使用 Windows 网络代理（此处为 socks5 代理）为例，向 `~/.bashrc` 中写入以下内容：

```bash
export hostip=$(cat /etc/resolv.conf | grep -oP '(?<=nameserver\ ).*')

alias proxy='
  export https_proxy="socks5://${hostip}:10808";
  export http_proxy="socks5://${hostip}:10808";
  export all_proxy="socks5://${hostip}:10808";
  echo -e "Acquire::http::Proxy \"socks5h://${hostip}:10808\";" | sudo tee -a /etc/apt/apt.conf.d/proxy.conf > /dev/null;
  echo -e "Acquire::https::Proxy \"socks5h://${hostip}:10808\";" | sudo tee -a /etc/apt/apt.conf.d/proxy.conf > /dev/null;
'

alias unproxy='
  unset https_proxy;
  unset http_proxy;
  unset all_proxy;
  sudo sed -i -e "/Acquire::http::Proxy/d" /etc/apt/apt.conf.d/proxy.conf;
  sudo sed -i -e "/Acquire::https::Proxy/d" /etc/apt/apt.conf.d/proxy.conf;
'
```

在 bash 中运行 `proxy` 可设置 bash、apt 走代理，运行 `unproxy` 则关闭代理。

## 从局域网访问 WSL 2 网络

要实现从局域网访问 WSL 2 网络，需要在 Windows 上配置 **端口转发** 和 **防火墙允许入站规则**。参考以下 PowerShell 命令（需以管理员权限执行）：

```powershell
# 查询 WSL 2 IP 地址
C:\Users\ruihusky> wsl -- hostname -I
172.20.147.252

# 配置端口转发：外网访问 windows 8080 端口转发到 172.20.147.252:8080
C:\Users\ruihusky> netsh interface portproxy add v4tov4 listenport=8080 connectaddress=172.20.147.252 connectport=8080

# 添加允许入站规则
C:\Users\ruihusky> New-NetFirewallRule -DisplayName "Allow Inbound TCP Port 8080" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080

Name                  : {0ff9eeaa-3e82-46f0-8b2a-cb985d514ede}
DisplayName           : Allow Inbound TCP Port 8080
Description           :
DisplayGroup          :
Group                 :
Enabled               : True
Profile               : Any
Platform              : {}
Direction             : Inbound
Action                : Allow
EdgeTraversalPolicy   : Block
LooseSourceMapping    : False
LocalOnlyMapping      : False
Owner                 :
PrimaryStatus         : OK
Status                : 已从存储区成功分析规则。 (65536)
EnforcementStatus     : NotApplicable
PolicyStoreSource     : PersistentStore
PolicyStoreSourceType : Local
```

配置完后可在局域网用其他设备通过 Windows IP 访问 WSL 2 服务。

对应的删除配置命令：

```powershell
C:\Users\ruihusky> netsh interface portproxy show v4tov4

侦听 ipv4:                 连接到 ipv4:

地址            端口        地址            端口
--------------- ----------  --------------- ----------
*               8080        172.20.147.252  8080

# 删除端口转发规则
C:\Users\ruihusky> netsh interface portproxy delete v4tov4 listenport=8080

# 删除防火墙入站规则
C:\Users\ruihusky> Remove-NetFirewallRule -DisplayName "Allow Inbound TCP Port 8080"
```

将上诉命令封装成函数便于调用，向 PowerShell `$PROFILE` 配置文件写入函数：

```powershell
# 在 PowerShell 中查看 $PROFILE 文件位置
C:\Users\ruihusky> $PROFILE
C:\Users\ruihusky\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

写入以下内容：

```powershell
function Add-WSLPortProxy ($Port = '8080', $Protocol = 'TCP') {
    $wslIP = wsl -- hostname -I
    $wslIP = $wslIP.Trim()
    netsh interface portproxy add v4tov4 listenport=$Port connectaddress=$wslIP connectport=$Port
    New-NetFirewallRule -DisplayName "Allow ${Protocol} Inbound Port ${Port}" -Direction Inbound -Action Allow -Protocol $Protocol -LocalPort $Port
}

function Remove-WSLPortProxy ($Port = '8080', $Protocol = 'TCP') {
    netsh interface portproxy delete v4tov4 listenport=$Port
    Remove-NetFirewallRule -DisplayName "Allow ${Protocol} Inbound Port ${Port}"
}
```

对应的调用命令为：`Add-WSLPortProxy [$Port] [$Protocol]` 、`Remove-WSLPortProxy [$Port] [$Protocol]`，其中 `[$Port] [$Protocol]` 均为可选参数，默认为 `8080` 、`TCP`。

## 参考

[比较 WSL 2 和 WSL 1 | 访问网络应用程序](https://docs.microsoft.com/zh-cn/windows/wsl/compare-versions#accessing-network-applications)

[Win 10 与 WSL 2 间的网络和文件互访](https://logi.im/script/achieving-access-to-files-and-resources-on-the-network-between-win10-and-wsl2.html)
