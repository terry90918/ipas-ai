# 初級前四份試卷詳解查證紀錄

證據截止：2026-10-12。本紀錄只涵蓋下列 200 題。原題與官方答案取自專案 PDF 擷取結果；詳解逐題閱讀題幹與 A–D 後撰寫，未以選項重述或通用模板代替分析。

每題均有 reasoning、A–D 判讀、concept、pitfalls 與適用的一手來源。保留官方答案；若選項或題意存在技術歧義，另以 caveat 說明。

## 覆蓋與檢查

| 試卷 | 詳解數 | JSON SHA-256 |
| --- | ---: | --- |
| beginner-114-4-1 | 50 | 84044904e99e87854e164dd8ea1b3473bb4265e449b58070d2485b01b3cfd2c1 |
| beginner-114-4-2 | 50 | 66f88ef2d7af7384a31a30d99d665b4b258e576f93c75eb7e3349806ea494907 |
| beginner-115-1-1 | 50 | fce91b0fbafbf2d8bbdf044049b313c0ee2b017a8e3bef345a12ed5d6e307712 |
| beginner-115-1-2 | 50 | 74f1d464cf1bd265f450def190214f49ec956605f10fdd107ec43112ce1c9f79 |

- 共 200 題，200 個不同的逐題 reasoning；來源頁面共 89 個。
- reasoning 每題至少 60 字元，各選項至少 12 字元；reasoning、四選項、觀念與易錯點合計 187–327 字元。
- 已比對題號 1–50、四份檔案的唯一鍵、A–D 欄位及來源連結。未修改官方答案。
- 二分搜尋的向下取整流程以 assert 重算為 21→33→27；回收期題重算月省 29,040 元、200,000/29,040≈6.887 月。
- 繁體中文已統一，原理名稱與函數、token、模型型號保留。

## 來源取得與適用範圍

以 Exa 搜尋一手頁面，並讀取官方文件、原論文頁面或全文；補以網頁工具讀取 NIST PDF、LSTM 原論文與公會附件。原論文是算法機制來源；官方產品文件依題目年份解讀，不把歷史介紹當成當前可用性。

銀行公會官方附件已下載並以 Poppler 讀取：第九條確認高階主管、專責單位、人才培育和生成式 AI 運作理解；第十一條確認自動化互動、用途範圍和替代方案。使用公會原文件，未以金管會指引冒稱同一規範。

查證時發現舊 LangChain multi_vector 網址轉至通用首頁，已改為官方 MultiVectorRetriever reference，核對多子向量搜尋、去重父文件 ID、回取父文件。先前 Azure reliability 路徑無法讀取，已替換並核對正式 redundancy 文件。

產品時間限制：Copilot 的 Codex 敘述採 2021 發布原文；Sora 官方 2025 安全文章已追加 2026-04-26 停止產品說明；AgentKit 官方 2025 發布文章已追加 Agent Builder/Evals 2026-11-30 退場說明。對應題目已加 caveat。

下表列實際用到的原頁；一個來源可能支援同主題多題，未將同一來源塞入所有題目。NIST AI RMF 支援風險、隱私、公平與治理；GenAI Profile 特別核對虛構內容、偏見、資料隱私與來源驗證，並非用來證明模型數學。

| 已讀一手來源與章節主題 | 使用題號 |
| --- | --- |
| [A2A 官方：Core Concepts and Components](https://a2a-protocol.org/latest/topics/key-concepts/) | 114-4-2-q8, 114-4-2-q16 |
| [歐盟 AI Act 第 57 條：AI regulatory sandboxes](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-57) | 114-4-1-q9 |
| [Simonyan 等：Image Classification Models and Saliency Maps](https://arxiv.org/abs/1312.6034) | 115-1-1-q29 |
| [Kingma、Welling：Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114) | 114-4-1-q22, 115-1-1-q10, 115-1-1-q22 |
| [Xu 等：Show, Attend and Tell（視覺注意力圖像描述）](https://arxiv.org/abs/1502.03044) | 114-4-2-q25 |
| [Hinton 等：Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531) | 114-4-2-q42, 115-1-2-q10 |
| [Ribeiro 等：Why Should I Trust You?（LIME）](https://arxiv.org/abs/1602.04938) | 114-4-1-q29, 114-4-1-q30, 115-1-1-q26 |
| [McMahan 等：Learning from Decentralized Data](https://arxiv.org/abs/1602.05629) | 114-4-1-q42, 114-4-2-q2 |
| [Cheng 等：Wide & Deep Learning for Recommender Systems](https://arxiv.org/abs/1606.07792) | 115-1-1-q8 |
| [Kirkpatrick 等：Overcoming catastrophic forgetting](https://arxiv.org/abs/1612.00796) | 114-4-1-q26, 114-4-2-q17 |
| [Lundberg、Lee：A Unified Approach to Interpreting Model Predictions](https://arxiv.org/abs/1705.07874) | 115-1-1-q27 |
| [Vaswani 等：Attention Is All You Need](https://arxiv.org/abs/1706.03762) | 114-4-1-q8, 114-4-1-q28, 114-4-2-q15, 114-4-2-q50, 115-1-1-q12, 115-1-1-q43, 115-1-1-q47, 115-1-2-q5, 115-1-2-q35 |
| [Wachter 等：Counterfactual Explanations](https://arxiv.org/abs/1711.00399) | 114-4-1-q31, 115-1-1-q28 |
| [Kaplan 等：Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) | 114-4-1-q24, 114-4-2-q43 |
| [Lewis 等：Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401) | 114-4-2-q14, 114-4-2-q17, 114-4-2-q18, 114-4-2-q29, 114-4-2-q32, 114-4-2-q42, 114-4-2-q44, 114-4-2-q47, 115-1-1-q42, 115-1-2-q10, 115-1-2-q12, 115-1-2-q13, 115-1-2-q26, 115-1-2-q31, 115-1-2-q37 |
| [Brown 等：Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165) | 114-4-2-q22, 114-4-2-q23, 114-4-2-q28, 114-4-2-q41, 115-1-2-q9, 115-1-2-q30 |
| [Ho 等：Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239) | 115-1-1-q21 |
| [Hendrycks 等：Measuring Massive Multitask Language Understanding](https://arxiv.org/abs/2009.03300) | 114-4-2-q45 |
| [Hu 等：LoRA（凍結基礎權重與低秩適配）](https://arxiv.org/abs/2106.09685) | 115-1-2-q2 |
| [Wei 等：Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903) | 114-4-2-q39, 115-1-2-q45 |
| [Ouyang 等：Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) | 115-1-1-q12, 115-1-1-q24 |
| [Dao 等：FlashAttention（IO-Aware Exact Attention）](https://arxiv.org/abs/2205.14135) | 115-1-1-q41 |
| [Yao 等：Tree of Thoughts](https://arxiv.org/abs/2305.10601) | 114-4-2-q11, 114-4-2-q39, 115-1-2-q36 |
| [Besta 等：Graph of Thoughts](https://arxiv.org/abs/2308.09687) | 114-4-2-q4, 114-4-2-q40, 114-4-2-q49, 115-1-2-q16, 115-1-2-q36 |
| [Fatemi 等：Talk like a Graph（圖的文字編碼）](https://arxiv.org/abs/2310.04560) | 114-4-2-q4 |
| [Zhou 等：Large Language Models are Human-Level Prompt Engineers](https://arxiv.org/html/2211.01910v2) | 114-4-2-q4, 114-4-2-q5 |
| [OWASP：LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) | 114-4-2-q31, 114-4-2-q36, 114-4-2-q46, 115-1-2-q19, 115-1-2-q39 |
| [Google Cloud：What is AutoML?](https://cloud.google.com/automl) | 115-1-1-q34, 115-1-2-q11, 115-1-2-q32 |
| [Google DeepMind：Watermarking AI-generated text and video with SynthID](https://deepmind.google/blog/watermarking-ai-generated-text-and-video-with-synthid/) | 115-1-2-q22 |
| [OpenAI 官方：Reinforcement fine-tuning（獎勵與 grader）](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning) | 115-1-2-q40 |
| [GitHub 官方：What is GitHub Copilot?](https://docs.github.com/en/copilot/get-started/what-is-github-copilot) | 114-4-2-q13, 115-1-2-q18 |
| [n8n 官方：Workflow automation documentation](https://docs.n8n.io/) | 115-1-2-q27, 115-1-2-q29 |
| [Python 官方：bisect（排序序列二分搜尋）](https://docs.python.org/3/library/bisect.html) | 115-1-1-q18 |
| [PyTorch：Pruning Tutorial](https://docs.pytorch.org/tutorials/intermediate/pruning_tutorial.html) | 114-4-1-q27 |
| [PyTorch：Reinforcement Learning（DQN）Tutorial](https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html) | 114-4-1-q13, 114-4-1-q17, 114-4-1-q18, 115-1-1-q19, 115-1-1-q39, 115-1-1-q43 |
| [GitHub：Introducing GitHub Copilot（2021）](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) | 114-4-2-q13 |
| [Hugging Face：Text generation（temperature 與解碼）](https://huggingface.co/docs/transformers/main_classes/text_generation) | 114-4-2-q15, 114-4-2-q26, 114-4-2-q50, 115-1-2-q23 |
| [imbalanced-learn：Over-sampling（SMOTE 插值合成）](https://imbalanced-learn.org/stable/over_sampling.html) | 115-1-1-q5 |
| [金管會：金融業運用人工智慧指引（治理及問責）](https://law.fsc.gov.tw/LawContent.aspx?id=GL003920) | 114-4-2-q24, 114-4-2-q38, 115-1-2-q26, 115-1-2-q41, 115-1-2-q46, 115-1-2-q50 |
| [Microsoft：Extract, transform, load（ETL）](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl) | 114-4-1-q3, 115-1-1-q1, 115-1-1-q15, 115-1-1-q46, 115-1-2-q3, 115-1-2-q14 |
| [Microsoft：Estimate total cost of ownership](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/estimate-total-cost-of-ownership) | 115-1-2-q24, 115-1-2-q25, 115-1-2-q28 |
| [Microsoft：What is Azure IoT?](https://learn.microsoft.com/en-us/azure/iot/iot-introduction) | 115-1-1-q2, 115-1-1-q14, 115-1-1-q37, 115-1-1-q46, 115-1-2-q3, 115-1-2-q8 |
| [Azure Well-Architected：Recommendations for designing redundancy](https://learn.microsoft.com/en-us/azure/well-architected/reliability/redundancy) | 115-1-2-q17 |
| [Microsoft：Power Apps Test Studio（自動化測試）](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/test-studio) | 114-4-2-q3, 115-1-2-q49 |
| [Microsoft：Model-driven app overview](https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/model-driven-app-overview) | 114-4-2-q1, 114-4-2-q6, 114-4-2-q33, 115-1-2-q11, 115-1-2-q29, 115-1-2-q32, 115-1-2-q33 |
| [Microsoft：Power Platform Data policies（連接器與治理）](https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention) | 115-1-2-q7, 115-1-2-q34 |
| [數位發展部：AI 評測機制與十項評測指標](https://moda.gov.tw/press/multimedia/blog/10273) | 114-4-1-q23, 114-4-2-q20, 114-4-2-q34, 115-1-2-q47 |
| [MCP 官方：Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture) | 114-4-2-q7, 114-4-2-q14, 114-4-2-q29, 114-4-2-q44, 115-1-2-q12 |
| [NIST AI 100-1：AI RMF 1.0（治理、公平、隱私與驗證）](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf) | 114-4-1-q1, 114-4-1-q25, 114-4-1-q30, 114-4-1-q31, 114-4-2-q6, 114-4-2-q10, 114-4-2-q12, 114-4-2-q20, 114-4-2-q22, 114-4-2-q24, 114-4-2-q30, 114-4-2-q31, 114-4-2-q34, 114-4-2-q37, 114-4-2-q38, 114-4-2-q46, 115-1-1-q11, 115-1-1-q14, 115-1-1-q35, 115-1-2-q1, 115-1-2-q7, 115-1-2-q33, 115-1-2-q34, 115-1-2-q38, 115-1-2-q39, 115-1-2-q41, 115-1-2-q43, 115-1-2-q46, 115-1-2-q47, 115-1-2-q48, 115-1-2-q50 |
| [NIST AI 600-1：Generative AI Profile（Confabulation、Privacy、Bias）](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) | 114-4-1-q49, 114-4-2-q10, 114-4-2-q20, 114-4-2-q22, 114-4-2-q31, 114-4-2-q34 |
| [OpenAI：Introducing AgentKit（2025-10-06）](https://openai.com/index/introducing-agentkit/) | 115-1-2-q21 |
| [OpenAI：Introducing gpt-realtime（2025-08-28）](https://openai.com/index/introducing-gpt-realtime/) | 115-1-2-q20 |
| [OpenAI：Launching Sora responsibly（2025-09-30）](https://openai.com/index/launching-sora-responsibly/) | 115-1-2-q6 |
| [OpenAI：Sora System Card（2024-12-09）](https://openai.com/index/sora-system-card/) | 115-1-2-q6 |
| [LangChain：MultiVectorRetriever（child embeddings、parent documents）](https://reference.langchain.com/python/langchain-classic/retrievers/multi_vector/MultiVectorRetriever) | 114-4-2-q48 |
| [scikit-learn：Computational Performance（Latency、Throughput、Batch）](https://scikit-learn.org/stable/computing/computational_performance.html) | 114-4-1-q50, 114-4-2-q21, 114-4-2-q35, 115-1-1-q23, 115-1-1-q25, 115-1-1-q37, 115-1-2-q4, 115-1-2-q8, 115-1-2-q17, 115-1-2-q28, 115-1-2-q44 |
| [scikit-learn：Clustering](https://scikit-learn.org/stable/modules/clustering.html) | 114-4-1-q11, 114-4-1-q13, 114-4-1-q44, 115-1-1-q3, 115-1-1-q39 |
| [scikit-learn：Cross-validation（時間序列與資料切分）](https://scikit-learn.org/stable/modules/cross_validation.html) | 114-4-1-q5, 114-4-1-q14, 114-4-1-q37, 114-4-2-q37, 115-1-1-q6, 115-1-1-q30, 115-1-2-q48 |
| [scikit-learn：Ensembles（Bagging 與隨機森林）](https://scikit-learn.org/stable/modules/ensemble.html) | 114-4-1-q5, 114-4-1-q21, 114-4-1-q35 |
| [scikit-learn：Feature selection（單變量及模型式篩選）](https://scikit-learn.org/stable/modules/feature_selection.html) | 114-4-1-q34, 114-4-1-q46 |
| [scikit-learn：Linear Models（Lasso、Ridge、Logistic regression）](https://scikit-learn.org/stable/modules/linear_model.html) | 114-4-1-q4, 114-4-1-q6, 114-4-1-q14, 114-4-1-q20, 115-1-1-q30, 115-1-2-q23 |
| [scikit-learn：Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html) | 114-4-1-q19, 114-4-1-q35, 114-4-1-q39, 115-1-1-q34, 115-1-1-q40, 115-1-1-q50 |
| [scikit-learn：Multiclass and multioutput algorithms](https://scikit-learn.org/stable/modules/multiclass.html) | 115-1-1-q47 |
| [scikit-learn：Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html) | 114-4-1-q7 |
| [scikit-learn：Nearest Neighbors（分類投票與距離）](https://scikit-learn.org/stable/modules/neighbors.html) | 114-4-1-q15 |
| [scikit-learn：Neural network models（MLP、activation）](https://scikit-learn.org/stable/modules/neural_networks_supervised.html) | 114-4-1-q47, 115-1-1-q9, 115-1-1-q45 |
| [scikit-learn：Novelty and Outlier Detection](https://scikit-learn.org/stable/modules/outlier_detection.html) | 114-4-1-q33, 114-4-1-q40, 115-1-1-q4, 115-1-1-q22 |
| [scikit-learn：Preprocessing data（標準化與類別編碼）](https://scikit-learn.org/stable/modules/preprocessing.html) | 114-4-1-q34, 114-4-1-q41, 114-4-1-q43, 115-1-1-q4, 115-1-1-q6, 115-1-1-q7, 115-1-1-q44 |
| [scikit-learn：Semi-supervised learning](https://scikit-learn.org/stable/modules/semi_supervised.html) | 114-4-1-q11, 114-4-1-q13, 114-4-1-q40, 115-1-1-q31, 115-1-1-q39, 115-1-1-q43 |
| [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 114-4-2-q14, 114-4-2-q16, 114-4-2-q19, 114-4-2-q21, 114-4-2-q30, 114-4-2-q49, 115-1-2-q15, 115-1-2-q16, 115-1-2-q18, 115-1-2-q19, 115-1-2-q33, 115-1-2-q38, 115-1-2-q44, 115-1-2-q49 |
| [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | 114-4-2-q5, 114-4-2-q9, 114-4-2-q10, 114-4-2-q12, 114-4-2-q19, 114-4-2-q21, 114-4-2-q23, 114-4-2-q27, 114-4-2-q32, 114-4-2-q47, 115-1-1-q11, 115-1-2-q5, 115-1-2-q13, 115-1-2-q14, 115-1-2-q15, 115-1-2-q37, 115-1-2-q43, 115-1-2-q44 |
| [銀行公會：金融機構運用人工智慧技術作業規範（第九條、第十一條）](https://www.ba.org.tw/memberStandard/DownloadFile?downName=.pdf&intId=249028) | 114-4-1-q10, 115-1-1-q13 |
| [Hochreiter、Schmidhuber：Long Short-Term Memory（1997）](https://www.bioinf.jku.at/publications/older/2604.pdf) | 114-4-1-q16, 114-4-1-q47, 115-1-1-q33 |
| [Elasticsearch：Index API（增量新增與更新文件）](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index) | 114-4-1-q38, 114-4-2-q18, 115-1-1-q42, 115-1-2-q31 |
| [行政院：人工智慧基本法草案政策說明](https://www.ey.gov.tw/Page/5A8A0CB5B41DA11E/b6fbf240-2d1a-4252-9f81-28144acb1d64) | 114-4-1-q9 |
| [IBM：Types of Artificial Intelligence（Narrow AI）](https://www.ibm.com/think/topics/artificial-intelligence-types) | 115-1-1-q36 |
| [NIST：Exploratory Data Analysis（探索與假說形成）](https://www.itl.nist.gov/div898/handbook/eda/eda.htm) | 114-4-1-q36, 115-1-1-q4 |
| [NIST：Histogram（分箱與分布）](https://www.itl.nist.gov/div898/handbook/eda/section3/eda33e.htm) | 114-4-1-q48, 115-1-1-q17 |
| [NIST：Scatter Plot（關係與因果限制）](https://www.itl.nist.gov/div898/handbook/eda/section3/eda33q.htm) | 114-4-1-q12 |
| [NIST：Measures of Location（平均、中位數與極端值）](https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm) | 114-4-1-q32, 114-4-1-q45, 115-1-1-q16 |
| [NIST：Measures of Scale（標準差、IQR 與穩健尺度）](https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm) | 114-4-1-q32, 114-4-1-q45, 115-1-1-q16 |
| [NIST：Measures of Skewness and Kurtosis](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm) | 115-1-1-q44 |
| [NIST：Percentiles（百分位與排序）](https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm) | 115-1-1-q16 |
| [Microsoft Research：SEAL 同態加密計算](https://www.microsoft.com/en-us/research/project/microsoft-seal/) | 115-1-2-q42 |
| [TensorFlow：Autoencoder 與異常偵測](https://www.tensorflow.org/tutorials/generative/autoencoder) | 114-4-1-q33, 115-1-1-q22 |
| [TensorFlow：Image segmentation（逐像素分類）](https://www.tensorflow.org/tutorials/images/segmentation) | 115-1-1-q32, 115-1-1-q48 |
| [TensorFlow：Transfer learning and fine-tuning](https://www.tensorflow.org/tutorials/images/transfer_learning) | 115-1-1-q20, 115-1-1-q38, 115-1-1-q48, 115-1-1-q49 |
| [TensorFlow：Structured data（Crossed feature columns）](https://www.tensorflow.org/tutorials/structured_data/feature_columns) | 114-4-1-q2 |
| [TensorFlow：Time series forecasting（RNN/LSTM）](https://www.tensorflow.org/tutorials/structured_data/time_series) | 115-1-1-q45 |

## 題目歧義與版本注意事項

- `beginner-114-4-1-q1`：題目使用 Human-over-the-loop；文獻常用 Human-on-the-loop 描述監督型態，各框架的分類並不完全一致。
- `beginner-114-4-1-q6`：官方 C 的原因描述不精確；正確機制是 L1 的非光滑零點與稀疏解幾何。
- `beginner-114-4-1-q9`：行政院資料記載草案於 114 年 8 月 28 日通過；題幹「9 月通過」與官方日期不符。
- `beginner-114-4-1-q24`：本題參數值為假設比較，勿把 20 億、120 億視為實際 GPT-OSS 型號規格。
- `beginner-114-4-1-q32`：原題把「降低偏誤」說得太寬；樣本平均可本來就無偏，而中位數估計的是不同參數。
- `beginner-114-4-1-q46`：本題有歧義：B 和 C 都是監督式特徵選擇；保留官方 B，同時指出 C 並非技術錯誤。
- `beginner-114-4-1-q47`：題幹把消失與爆炸一起歸給 ReLU 過於概括；本題 B 是相對最合適答案。
- `beginner-114-4-2-q5`：D 不是 APE 必然的「最大限制」；原論文允許自行定義評分，若採全局評分便不一定出現此問題。
- `beginner-114-4-2-q13`：D 適合 Copilot 初期介紹；現行 Copilot 並非所有功能都只由單一 Codex 模型支援。
- `beginner-114-4-2-q16`：A、B、C 也是合理潛在風險；官方 D 表示本題欲強調的最直接問題。
- `beginner-114-4-2-q19`：題乾證據不足以唯一確定 B；需追蹤 LLM 意圖輸出與 API 映射才能排除 A。
- `beginner-114-4-2-q24`：D 中「自訓」不是隱私必要條件；私有部署已訓練權重亦可實現資料控制。
- `beginner-114-4-2-q26`：官方 C 是減少隨機性的方案；若目標是指定品牌風格，提示示例或微調通常比單獨降溫更直接。
- `beginner-114-4-2-q41`：四項描述高度近義，A 是官方鍵，但 B、C、D 也都可成立，缺乏可唯一排除的技術條件。
- `beginner-115-1-1-q18`：中點取上整的實現可能產生不同具體比較數；官方答案對應常見向下取整流程。
- `beginner-115-1-1-q38`：題乾未明說輸入為影像；官方 B 假設使用視覺特徵，若僅表格傳感值則也可能是一般分類。
- `beginner-115-1-1-q39`：C 有歧義：監督學習也會依據損失調整參數；題乾未說明環境行動及獎勵，不能嚴格排除 C。
- `beginner-115-1-2-q6`：按試卷時期的官方機制判斷；截至本次查證，官方頁面已註明 Sora 產品於 2026-04-26 停止提供。歷史的「目前」不能當作現行可用性。
- `beginner-115-1-2-q21`：題目明指 2025 年 AgentKit。官方頁面後續更新說明 Agent Builder 與 Evals 將於 2026-11-30 停止提供；不改變 2025 年發布用途。
- `beginner-115-1-2-q25`：0.8元/千token 是題設單價，非實時 API 報價；題目實際算回收期，不是完整 ROI 指標。
- `beginner-115-1-2-q35`：A 亦為合理簡述，官方 B 是更具體回答，不能將 A 當作技術上完全錯誤。
- `beginner-115-1-2-q46`：官方 C 不意味著自訓是唯一合規方案；B 只要補齊控制與審計也可能符合需求。

## 擷取回歸修復紀錄

另依主代理指派修復中級 115 年第 1 次第 3 科第 40、42 題。兩題題幹中的程式碼 (A)/(B) 空格被誤判為選項起點；先新增兩個 fixture，觀察原解析器測試失敗，再讓完整 A–D 行首標記優先，測試轉為通過。

已直接檢視兩題原始裁圖，並以 --no-render 重跑全部 14 份試卷。與修復前 JSON 比對，只有 intermediate-115-1-3-q40、q42 的 stem/options 改變；700 題的答案、頁碼、圖片、試卷 metadata 都未變。擷取測試 11 項通過，結構性 extraction exceptions 為 0。這只是結構檢查與兩題針對性修復，並不代表 700 題已全部逐字人工核對。

## 尚未證明的層次

未宣稱所有官方單選題的命題唯一性已成立，也未將來源文件視為產品端測試。這 200 題的文字與來源已查證；全站逐題介面、鍵盤互動、部署與網路連結仍由主代理驗收。
