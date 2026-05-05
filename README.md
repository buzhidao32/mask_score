# 放置江湖面具分查询

一个适合部署到 GitHub Pages 的纯静态查询页。

支持：

- 面具名字
- 称号
- 拼音全拼
- 拼音首字母
- `["achievement"]=[[广寒上仙]]` 这类原始文本

## 更新数据

1. 把新的 `maskUpgrade.lua` 和 `tujian.lua` 拖进 `update-data`
2. 双击 `update-data.bat`

脚本会自动覆盖更新 `data\mask_scores.json`。

如果你想手动运行：

```powershell
.\update-data.ps1
```

## 本地预览

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

打开：

- `http://127.0.0.1:4173/`

## 结果规则

- 搜到面具时，优先显示面具结果
- 单面具图鉴且称号名和面具名相同的，不再重复显示称号结果
- 组合称号会显示分数和搭配面具

## 发布

- 仓库：`https://github.com/buzhidao32/mask_score`
- 资源路径全部用相对路径
- 已包含 `.nojekyll`
