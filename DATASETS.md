# 数据集来源与使用说明

本项目使用两个公开数据集：**LOCBEEF** 用于新鲜度分类，**Retail Beef Cuts Dataset** 用于牛肉部位识别。原始图片没有直接提交到本仓库，原因、许可和复现方式见下文。

## 一、数据集总览

| 数据集 | 用途 | 规模 | 类别 | 许可 |
| --- | --- | --- | --- | --- |
| LOCBEEF: Beef Quality Image Dataset | 新鲜度分类 | 3,268 张图片 | fresh / rotten | 以 Mendeley Data 页面标注为准 |
| Retail Beef Cuts Dataset | 牛肉部位识别 | 1,974 个文件，约 514.99 MB | 7 类 | **Not specified**（Kaggle 页面明确标注） |

## 二、LOCBEEF

- 来源：https://data.mendeley.com/datasets/7b67ynzr6k/1
- DOI：`10.17632/7b67ynzr6k.1`
- 作者：Tri Mulya Dharma、Ramzi Adriman、Khairun Saddami
- 发布时间：2022-11-30
- 内容：印度尼西亚亚齐（Aceh）本地牛肉图片，按 `train/test` 与 `fresh/rotten` 组织，共 3,268 张，覆盖多种分辨率与 07:00–22:00 的光照变化。
- 本项目用途：训练与评估新鲜度二分类模型，对应本地目录 `yolo-program/beef_freshness/`。
- 本地划分：`train` 2,288 张（fresh 1,144 / rotten 1,144），`test` 980 张（fresh 490 / rotten 490）。

## 三、Retail Beef Cuts Dataset

- 来源：https://www.kaggle.com/datasets/abdallahabuzaid/retail-beef-cuts-dataset
- 作者：Abdallah Abuzaid
- 内容：7 类零售牛肉切块图片，原始数据约 1,974 个文件、514.99 MB。
- 原始类别：Beef Chuck、Beef Fillet、Beef Flank、Beef Round、Strip-Lion、Liver、Roast Beef。
- 本项目用途：训练牛肉部位检测/分类模型。最终版本去除了 `Liver` 与 `Roast Beef`，保留 5 类：肩肉、里脊、牛腩、臀肉、外脊；对应本地目录 `yolo-program/beef_part/`。
- 检测数据集：清洗与划分后为 1,607 张，`train/val/test = 998/316/293`，位于 `yolo-program/datasets/beef_det/`。
- 许可：Kaggle 页面标注为 **Not specified**。因此本仓库不再分发原始图片，使用者应从 Kaggle 原页面下载并遵守其条款。

## 四、为什么没有直接上传原始图片

1. **体积过大**：两个数据集在本地解压后合计超过 5 GB，其中 LOCBEEF 约 5.2 GB；GitHub 普通仓库不适合承载这个量级的数据。
2. **许可限制**：Kaggle 数据集许可为 Not specified；Mendeley 数据集的许可需以原页面为准。直接搬运并再分发第三方图片存在版权与合规风险。
3. **可复现性**：保留来源链接、类别、划分和校验信息，比把图片塞进 Git 历史更便于评审和后续维护。

如果你确实需要把数据随仓库分发，建议使用 **GitHub Releases + Git LFS** 或外部网盘，并在获得数据作者许可后再做；不要直接 `git add` 原始图片目录。

## 五、下载与目录放置

### LOCBEEF

1. 打开 https://data.mendeley.com/datasets/7b67ynzr6k/1。
2. 下载数据集压缩包并解压。
3. 按以下结构放置：

```text
yolo-program/beef_freshness/
├─ train/
│  ├─ fresh/
│  └─ rotten/
└─ test/
   ├─ fresh/
   └─ rotten/
```

### Retail Beef Cuts Dataset

1. 打开 https://www.kaggle.com/datasets/abdallahabuzaid/retail-beef-cuts-dataset。
2. 下载并解压 `Meat_Dataset`。
3. 按以下结构放置：

```text
yolo-program/beef_part/
├─ Meat_Dataset/
│  ├─ Beef chuck/
│  ├─ Beef fillet/
│  ├─ Beef flank/
│  ├─ Beef round/
│  └─ Strip-lion/
└─ NA_Meat_Dataset/
   └─ NA_Meat_Dataset/
      └─ ...
```

也可以使用 Kaggle CLI：

```powershell
kaggle datasets download -d abdallahabuzaid/retail-beef-cuts-dataset -p yolo-program/beef_part --unzip
```

## 六、引用

如果论文、答辩或文档中引用这两个数据集，建议使用：

```text
Dharma, T. M., Adriman, R., & Saddami, K. (2022).
LOCBEEF: Beef Quality Image Dataset for Deep Learning Models.
Mendeley Data, V1. https://doi.org/10.17632/7b67ynzr6k.1

Abuzaid, A. (2022). Retail Beef Cuts Dataset.
Kaggle. https://www.kaggle.com/datasets/abdallahabuzaid/retail-beef-cuts-dataset
```

## 七、仓库内的数据说明文件

- `dataset_manifest.json`：两个数据集的来源、类别、数量和用途的机器可读清单。
- 原始图片、训练权重和 `runs/` 输出不在本仓库中。
