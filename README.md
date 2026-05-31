# 放置江湖面具分查询

一个部署到 GitHub Pages 的纯静态查询页。

支持：

- 面具名字
- 称号
- 拼音全拼
- 拼音首字母
- `["achievement"]=[[广寒上仙]]` 这类原始文本
- 面具最高等级、升级材料、分解材料
- 绣女烛阴特性加成
- 白天、黑夜模式切换

## 更新数据

1. 改 `update-source.txt` 里的包目录，例如换成最新的 `Update_Package-26.xx.xx`
2. 双击 `update-data.bat`，生成新的 `data\mask_scores.json`
3. 搜 `APP_ASSET_VERSION` 和 `CACHE_VERSION`，把版本号一起改成新的更新标记
4. 改 `index.html`、`inventory.html` 里 `app.js?v=...` 的版本号，和第 3 步保持一致
5. 本地预览搜索最新面具，确认能查到后提交发布

脚本会自动覆盖更新 `data\mask_scores.json`。

注意：只更新 JSON 不改版本号时，静态站可能继续读取旧缓存，表现为数据文件里有新面具，但网页查不到。

手动运行：

```powershell
.\update-data.ps1
```

如果不想改配置文件，也可以直接指定包目录：

```powershell
.\update-data.ps1 -LuaTablePath "D:\Desktop\fzjh_backup\Update_Package\Update_Package-26.05.12"
```

会自动读取：

- `maskUpgrade.lua`
- `tujian.lua`
- `familyspecial.lua`

## 本地预览

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

打开：

- `http://127.0.0.1:4173/`

## 结果规则

- 搜到面具时，优先显示面具结果
- 打开页面默认显示全部面具
- 单面具图鉴且称号名和面具名相同的，不再重复显示称号结果
- 组合称号会显示分数和完整所需面具
- 最高等级可以点开看每级升级材料
- 分解材料会按烛阴加成实时变化

## 发布

- 仓库：`https://github.com/buzhidao32/mask_score`
- 资源路径全部用相对路径
- 包含 `.nojekyll`
