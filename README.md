# 面具分查询

一个适合部署到 GitHub Pages 的纯静态页面。用户输入面具名字、图鉴称号或拼音，即可实时查询对应面具分。

## 本地生成数据

```powershell
python .\scripts\generate_data.py `
  --mask-upgrade "D:\Desktop\fzjh_backup\Update_Package\Update_Package-26.04.22\luaTablePath\res\script\others\maskUpgrade.lua" `
  --tujian "D:\Desktop\fzjh_backup\Update_Package\Update_Package-26.04.22\luaTablePath\res\script\others\tujian.lua" `
  --out ".\data\mask_scores.json"
```

## 本地预览

```powershell
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## GitHub Pages

这个项目按纯静态站设计，适合直接发布到 GitHub Pages 项目页：

- 仓库地址：`https://github.com/buzhidao32/mask_score`
- 资源路径全部使用相对路径
- 包含 `.nojekyll`，避免 Pages 误处理
- 已内置 `pinyin-pro` 浏览器版脚本，不依赖外部拼音接口

## 查询规则

- 输入面具名字：展示该面具的单面具图鉴分，并列出它参与的组合称号分。
- 输入称号：展示该称号的分数与所需面具。
- 支持中文、拼音全拼、拼音首字母，输入时实时显示结果。
- 支持粘贴 `["achievement"]=[[广寒上仙]]` 这类文本，页面会自动提取 `广寒上仙`。
