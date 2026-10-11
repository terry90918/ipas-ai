# 中級逐題解析稽核

證據截止：2026-10-12（本次工作階段）。

六份試卷共300題已逐題撰寫；每題有推理、A/B/C/D各別判讀、概念、常見誤區及一手來源。公式計算保留換行。公告答案只讀自questions.json，未修改。序列化指令碼只在/tmp，未加入網站或依主題批次產生通用答案。

## 完整性驗證

| 試卷 | 解析數 | 最短總字數 | 平均總字數 | 題意限制數 |
|---|---:|---:|---:|---:|
| intermediate-114-2-1 | 50 | 194 | 228 | 16 |
| intermediate-114-2-2 | 50 | 181 | 216 | 12 |
| intermediate-114-2-3 | 50 | 186 | 221 | 7 |
| intermediate-115-1-1 | 50 | 194 | 221 | 4 |
| intermediate-115-1-2 | 50 | 192 | 228 | 8 |
| intermediate-115-1-3 | 50 | 201 | 228 | 10 |

字數計入reasoning、四選項、concept及pitfalls，不包含來源或caveat。所有reasoning至少60字、每選項至少12字、全題至少180字；所有300個題號與試卷題號完全一致，無跳號、空選項解析或空來源。這是完整性檢查，不以字數取代內容品質。

已獨立算術核對F1=0.685714、5引數網格×5折=2700及三類weighted F1=0.967155。其餘題目計算在各題逐步列式。

## 圖片原題核對

圖片以PDF解析器產生的public/assets/questions原頁裁圖進行view_image實際讀取；以下列出解析需要具體圖面、程式或數值的已檢視題號。共用情境表／模型架構亦實際檢視。

- intermediate-114-2-2：3、40、41、48、50。
- intermediate-114-2-3：38、39、40、45、46、47、48、49、50。
- intermediate-115-1-2：19、23、39、40、49、50。
- intermediate-115-1-3：40、41、42、43、44、45、46、47、48、50。

intermediate-115-1-2-q49已實際檢視q49-p17-s2.webp：A/B皆split(X_norm,y)，C/D為split(y,X_norm)；A/C為liblinear，B/D為lbfgs；四項train_size=0.2、random_state=123。解析保留B並說明A在二分類或舊版多類OvR可行、20%訓練的含義及全體先標準化的資料洩漏。

intermediate-115-1-3-q40與q42原JSON曾混入選項標記或題幹；已通知主代理修正。解析依圖片中的真正四選項撰寫。未修改問題JSON與解析器。

## 公告答案與題意限制

以下保留公告答案，另揭露非唯一、過度絕對、假設未說清或命題錯誤。這些不代表修改答案。

- **intermediate-114-2-1-q5**：A是題目假定的原始詞頻問題；採正規化的TF-IDF不必然因長文字失準。
- **intermediate-114-2-1-q8**：C的「保留所有輸入資訊」不嚴謹，僅指每個位置參與輸出，並非資訊完全可逆。
- **intermediate-114-2-1-q12**：PCA一般保證主成分不相關，不保證統計獨立；選項用語過強。
- **intermediate-114-2-1-q16**：A也可採用Seq2Seq，D是本題所偏好的典型應用而非唯一適用場景。
- **intermediate-114-2-1-q18**：若A指乘大logit可降低熵；原選項未定義常數，D是更明確的策略。
- **intermediate-114-2-1-q20**：A也是有效且常用的穩定方法；B反映命題對損失函式層次的偏好，並非排除梯度懲罰。
- **intermediate-114-2-1-q25**：授權與侵權依具體法域、用途及事實判斷；本題是治理比較，不能當法律免責保證。
- **intermediate-114-2-1-q26**：實務常用Ridge或Elastic Net處理相關特徵；它們未列於選項，D並非普遍唯一首選。
- **intermediate-114-2-1-q28**：標準化與目標編碼不適合所有模型；C是選項中的完整策略，不是通用最優流程。
- **intermediate-114-2-1-q32**：不能普遍保證PSI比所有其他指標更有預測力；題目答案基於輸入漂移情境。
- **intermediate-114-2-1-q37**：若單卡連完整模型都放不下，B不足以解決，需FSDP等引數分片或檢查點技術。
- **intermediate-114-2-1-q40**：A對解析度、品質與對齊的結論是概括趨勢；VAE可生成高解析度，擴散也不保證對齊或永不失穩。
- **intermediate-114-2-1-q42**：D是偵測策略，不是已觀察高錯誤率的完整修複方案；原題的「應對」描述較寬。
- **intermediate-114-2-1-q44**：C不能單憑生成資料證明促銷的因果效果；需條件生成、校驗與獨立實驗。
- **intermediate-114-2-1-q48**：B不是對數百萬高維資料的普遍保證；需核對維度、度量、稀疏性與鄰域密度。
- **intermediate-114-2-1-q50**：C只能作候選機制；僅憑生成圖症狀無法判定編碼器對齊是最主要根因。
- **intermediate-114-2-2-q4**：B針對有PDF的連續分佈；最一般定義是P(X≤x)，離散分佈以PMF加總。
- **intermediate-114-2-2-q17**：本題「一般、白金、黑卡」可具有真實等級順序，B的誤判風險需以任意編碼為前提。
- **intermediate-114-2-2-q19**：C的圖列出雲端資料湖後推論；真正毫秒響應仍需在邊緣或流處理端先判斷。
- **intermediate-114-2-2-q20**：D的「一致」應理解為方案支援精度內的對應，CKKS等近似運算不保證精確相等。
- **intermediate-114-2-2-q21**：Tufte並非一概主張所有趨勢疊在一圖；A的小多圖也可能更符合可比較性。
- **intermediate-114-2-2-q25**：A對對數刻度效果的措辭有誤；保留官方答案並指出實際是壓縮長尾、改善相對差異可見性。
- **intermediate-114-2-2-q31**：B的「只有」過強，5或10皆為經驗法則，不是普遍必要充分條件。
- **intermediate-114-2-2-q36**：轉換隻是改善候選，不保證所有模型假設成立；應檢查條件殘差而非僅Y分佈。
- **intermediate-114-2-2-q37**：C不是保證；稀少、離散或重疊病例可能不適合插值，需與閾值及類別權重一起比較。
- **intermediate-114-2-2-q38**：C也可用於二元列聯表；本例失敗數少，Z與卡方近似條件需特別檢查。
- **intermediate-114-2-2-q45**：原題用「銷售總額」，資料定義為百萬份銷量，應以總銷量解讀。
- **intermediate-114-2-2-q46**：C輸出總銷量而非顯式正規化比例；真正比例需再除總和，保留官方最佳選項。
- **intermediate-114-2-3-q13**：此題把Label Bias用於標註偏見；在區域性正規化序列模型中該術語還有不同的正式定義。
- **intermediate-114-2-3-q17**：A名稱已明確含動量；B是命題「內建」偏好的答案，而非唯一使用動量者。
- **intermediate-114-2-3-q30**：F1降低可能由Precision、Recall或兩者改變，C的Recall歸因須額外實測。
- **intermediate-114-2-3-q34**：命題有實質錯誤：標準LOOCV不存在保持類別比例的單樣本分層，D不能達成要求。
- **intermediate-114-2-3-q35**：A「安全」僅就變異門檻成立，並非無損或預測品質保證。
- **intermediate-114-2-3-q37**：本題B非唯一可行清單且不自帶防重放；C或D配正確協議也可能滿足，需明確認證與nonce機制。
- **intermediate-114-2-3-q48**：D「防止梯度爆炸或消失」過強，標準化僅有助；圖中測試獨立縮放須改用訓練統計量。
- **intermediate-115-1-1-q21**：價格只依題設計算，非當前報價；快取有門檻且摘要不保證絕對無損，B需實測才能達到40%節省。
- **intermediate-115-1-1-q32**：Flatten不是所有CNN分類頭唯一必要操作；GAP亦可完成合理架構，B是題設傳統接法。
- **intermediate-115-1-1-q34**：B將增量資料更新與動態特徵擴充套件混用；需特徵hash或明確支援新維度的架構。
- **intermediate-115-1-1-q46**：C未充分實現「公有云GPU訓練影像模型」，且題幹把HIPAA誤簡化為絕對不得離院；官方答案須結合這些限制理解。
- **intermediate-115-1-2-q1**：A是最佳圖形線索，原敘述將「存在極端值」與右偏講得過於確定。
- **intermediate-115-1-2-q11**：A在帶正則化邏輯迴歸中也能訓練，C為命題最佳方案，drop first並非所有情境必須。
- **intermediate-115-1-2-q13**：B非唯一可行架構；A或支援事務與向量的檔案庫經實測也可能滿足，不能以名稱排除。
- **intermediate-115-1-2-q17**：D是完整候選而非臨床安全保證；填補期限、72小時漂移校正及標籤噪聲策略均須專門驗證。
- **intermediate-115-1-2-q30**：B將區域性極小與泛化差直接連結過度簡化，關鍵候選是尖銳性及最佳化路徑，而非區域性性本身。
- **intermediate-115-1-2-q38**：D同樣不嚴謹：Randomized Response是經典Local DP機制，可量化與組合；本題非唯一錯誤。
- **intermediate-115-1-2-q41**：B既不完整保留分佈，又可能補的是響應標籤；且pandas較新Copy-on-Write下該鏈式inplace寫法須改。
- **intermediate-115-1-2-q49**：題幹未限定類別數時A亦可正確；舊版本liblinear可自動OvR，不能一律說A語法錯誤。全體預先縮放亦有洩漏風險。
- **intermediate-115-1-3-q6**：t-SNE並非邏輯上不能當特徵，但常規實現無新樣本transform，容易不適合線上預測管線。
- **intermediate-115-1-3-q16**：A混入深度懲罰；標準Ω明確為葉數與葉權重，深度是另設限制並非同一正則公式。
- **intermediate-115-1-3-q23**：原選項措辭絕對；標準BERT不適合直接自迴歸生成，而非任何改造都無法生成。
- **intermediate-115-1-3-q30**：B與C不是互斥，本題按「最可能」選高變異，不應將過擬合解釋判為技術錯誤。
- **intermediate-115-1-3-q33**：B「不歸零」指不主動產生稀疏，並非保證所有資料下每個係數都嚴格非零。
- **intermediate-115-1-3-q35**：D僅為需驗證的資源分配策略，不保證記憶體不增或效能提高，應核對引數及啟用成本。
- **intermediate-115-1-3-q39**：A在題設允許訓練使用群體資訊時成立；B的前處理重訓亦可能有效，不能當方法本身不可行。
- **intermediate-115-1-3-q43**：該一般微調理由與圖示凍結主體不完全對應：圖中小lr不會更新或保護凍結的預訓練權重。
- **intermediate-115-1-3-q46**：B與D的最佳化／泛化描述屬於可能助益，不能當數學保證；僅除255不是均值0標準差1。
- **intermediate-115-1-3-q48**：只憑第6輪短暫落差不能唯一斷定過擬合；D是題給選項最佳候選。

## 一手來源閱讀證據

共141個不同來源URL。來源來自研究作者原論文、官方套件API／指南、NIST、W3C、HHS及原產品檔案。所有下列URL均於本階段用Exa web_fetch_exa/web_search_exa或web.run實際取得內容，非僅憑記憶填連結。首次Transformer/BERT/GloVe等13筆以web.run讀取，其後主要以Exa批次讀取。URL重用只限對應概念相關題。

修正過兩個失效候選：Feast舊architecture-and-components路徑改為components/online-store；Azure舊data-guide路徑改為Storage官方Data Lake頁。Spark原入口只提供導引，因此改讀streaming/index.html。NIST錯連到離群值頁的假說候選已改prc131.htm；離群值頁另用於盒鬚判讀。未把失效頁作為正式來源。

以下索引列出實際使用來源及題號，細節推理見JSON。

- [Argo Rollouts：漸進金絲雀部署](https://argo-rollouts.readthedocs.io/en/stable/features/canary/)：intermediate-114-2-1-q23、intermediate-115-1-1-q43、intermediate-115-1-1-q47。
- [Word2Vec：Efficient Estimation of Word Representations](https://arxiv.org/abs/1301.3781)：intermediate-114-2-1-q4、intermediate-114-2-1-q33、intermediate-115-1-1-q3、intermediate-115-1-1-q5。
- [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114)：intermediate-114-2-1-q40、intermediate-114-2-1-q42、intermediate-114-2-1-q43、intermediate-114-2-1-q44。
- [Explaining and Harnessing Adversarial Examples](https://arxiv.org/abs/1412.6572)：intermediate-114-2-1-q24、intermediate-114-2-2-q32。
- [Faster R-CNN：Region Proposal Networks](https://arxiv.org/abs/1506.01497)：intermediate-115-1-1-q10。
- [YOLO：單階段物件偵測](https://arxiv.org/abs/1506.02640)：intermediate-115-1-1-q10。
- [Improving Neural Machine Translation Models with Monolingual Data](https://arxiv.org/abs/1511.06709)：intermediate-114-2-1-q19。
- [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)：intermediate-115-1-3-q17、intermediate-115-1-3-q42、intermediate-115-1-3-q49。
- [Federated Learning：Decentralized Data](https://arxiv.org/abs/1602.05629)：intermediate-115-1-1-q46。
- [Concrete Problems in AI Safety：Reward Hacking](https://arxiv.org/abs/1606.06565)：intermediate-115-1-3-q31。
- [Large-Batch Training：Sharp Minima](https://arxiv.org/abs/1609.04836)：intermediate-115-1-2-q30、intermediate-115-1-3-q11。
- [Grad-CAM：梯度式視覺解釋](https://arxiv.org/abs/1610.02391)：intermediate-115-1-1-q29。
- [Membership Inference Attacks](https://arxiv.org/abs/1610.05820)：intermediate-115-1-2-q37。
- [Wasserstein GAN](https://arxiv.org/abs/1701.07875)：intermediate-114-2-1-q20、intermediate-114-2-1-q40、intermediate-114-2-1-q44。
- [Multi-Task Learning Using Uncertainty to Weigh Losses](https://arxiv.org/abs/1705.07115)：intermediate-114-2-1-q21、intermediate-114-2-1-q47、intermediate-115-1-1-q18、intermediate-115-1-1-q35、intermediate-115-1-1-q50。
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)：intermediate-114-2-1-q2、intermediate-114-2-1-q8、intermediate-114-2-1-q16、intermediate-114-2-1-q18、intermediate-114-2-3-q21、intermediate-115-1-1-q11、intermediate-115-1-2-q35、intermediate-115-1-3-q3、intermediate-115-1-3-q19、intermediate-115-1-3-q23。
- [Panoptic Segmentation](https://arxiv.org/abs/1801.00868)：intermediate-114-2-1-q34、intermediate-115-1-1-q6、intermediate-115-1-1-q7。
- [BERT：雙向預訓練語言表徵](https://arxiv.org/abs/1810.04805)：intermediate-114-2-1-q3、intermediate-114-2-1-q43、intermediate-114-2-1-q49、intermediate-115-1-1-q4、intermediate-115-1-1-q17、intermediate-115-1-1-q35、intermediate-115-1-3-q23。
- [Retrieval-Augmented Generation原始研究](https://arxiv.org/abs/2005.11401)：intermediate-114-2-1-q17。
- [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239)：intermediate-114-2-1-q40、intermediate-114-2-1-q50。
- [CLIP：Learning Transferable Visual Models](https://arxiv.org/abs/2103.00020)：intermediate-114-2-1-q35、intermediate-114-2-1-q50、intermediate-115-1-1-q18。
- [The Power of Scale for Parameter-Efficient Prompt Tuning](https://arxiv.org/abs/2104.08691)：intermediate-115-1-1-q13、intermediate-115-1-1-q14。
- [LoRA：低秩引數微調](https://arxiv.org/abs/2106.09685)：intermediate-115-1-1-q2、intermediate-115-1-1-q14、intermediate-115-1-3-q35。
- [ReAct：推理與工具行動](https://arxiv.org/abs/2210.03629)：intermediate-115-1-1-q15、intermediate-115-1-1-q16、intermediate-115-1-2-q36。
- [Local Privacy與統計保證](https://arxiv.org/html/1302.3203v4)：intermediate-115-1-2-q38。
- [auto-sklearn：自動模型選擇與調參](https://automl.github.io/auto-sklearn/master/)：intermediate-114-2-3-q10。
- [ModDrop：缺失模態穩健訓練](https://chriswolfvision.github.io/www/papers/pami2015.pdf)：intermediate-114-2-1-q21、intermediate-115-1-1-q50。
- [NIST SP800-226：差分隱私保證](https://csrc.nist.gov/pubs/sp/800/226/final)：intermediate-115-1-2-q37、intermediate-115-1-2-q38。
- [MDN：HTTP POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST)：intermediate-115-1-1-q44。
- [Evidently：監控指標](https://docs.evidentlyai.com/metrics/all_metrics)：intermediate-114-2-1-q22、intermediate-114-2-1-q32、intermediate-114-2-1-q42、intermediate-114-2-1-q46、intermediate-114-2-3-q25、intermediate-114-2-3-q29、intermediate-115-1-1-q42、intermediate-115-1-1-q48、intermediate-115-1-1-q49、intermediate-115-1-3-q27。
- [Feast：Online Store](https://docs.feast.dev/getting-started/components/online-store)：intermediate-115-1-1-q20、intermediate-115-1-2-q31。
- [GitHub：持續整合](https://docs.github.com/en/actions/about-github-actions/about-continuous-integration-with-github-actions)：intermediate-114-2-1-q29、intermediate-115-1-1-q22。
- [LangChain：SQL Agent架構與權限](https://docs.langchain.com/oss/python/langchain/sql-agent)：intermediate-115-1-2-q36。
- [NVIDIA Triton：Dynamic Batching](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html)：intermediate-115-1-1-q24、intermediate-115-1-1-q41、intermediate-115-1-1-q47、intermediate-115-1-2-q29。
- [Python：預設引數值](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values)：intermediate-115-1-2-q39。
- [PyTorch：Conv2d](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Conv2d.html)：intermediate-114-2-3-q5、intermediate-114-2-3-q6、intermediate-114-2-3-q43、intermediate-115-1-1-q17、intermediate-115-1-1-q33、intermediate-115-1-2-q15。
- [PyTorch：CrossEntropyLoss輸入契約](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html)：intermediate-115-1-3-q20。
- [PyTorch：Dropout](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Dropout.html)：intermediate-114-2-3-q26、intermediate-114-2-3-q39、intermediate-115-1-3-q47。
- [PyTorch：LSTM](https://docs.pytorch.org/docs/2.14/generated/torch.nn.LSTM.html)：intermediate-114-2-3-q7、intermediate-115-1-1-q17、intermediate-115-1-3-q19。
- [PyTorch：Linear](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Linear.html)：intermediate-114-2-3-q42、intermediate-114-2-3-q44、intermediate-115-1-1-q32、intermediate-115-1-3-q18。
- [PyTorch：ReLU](https://docs.pytorch.org/docs/2.14/generated/torch.nn.ReLU.html)：intermediate-114-2-3-q27、intermediate-114-2-3-q49。
- [PyTorch：Softmax](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Softmax.html)：intermediate-114-2-1-q8。
- [PyTorch：clip_grad_norm_](https://docs.pytorch.org/docs/2.14/generated/torch.nn.utils.clip_grad_norm_.html)：intermediate-115-1-3-q50。
- [PyTorch：Adam](https://docs.pytorch.org/docs/2.14/generated/torch.optim.Adam.html)：intermediate-114-2-3-q12、intermediate-114-2-3-q17、intermediate-115-1-3-q8、intermediate-115-1-3-q9、intermediate-115-1-3-q13、intermediate-115-1-3-q43。
- [PyTorch：Distributed Data Parallel](https://docs.pytorch.org/tutorials/beginner/ddp_series_theory.html)：intermediate-114-2-1-q37、intermediate-115-1-3-q11。
- [PyTorch：影像遷移學習](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)：intermediate-114-2-3-q45、intermediate-115-1-1-q23、intermediate-115-1-1-q36、intermediate-115-1-3-q42、intermediate-115-1-3-q43。
- [Torchvision：box_iou](https://docs.pytorch.org/vision/main/generated/torchvision.ops.box_iou.html)：intermediate-114-2-1-q7。
- [Torchvision：RandomHorizontalFlip](https://docs.pytorch.org/vision/main/generated/torchvision.transforms.RandomHorizontalFlip.html)：intermediate-114-2-1-q9、intermediate-115-1-3-q4、intermediate-115-1-3-q41。
- [Torchvision：VGG16](https://docs.pytorch.org/vision/main/models/generated/torchvision.models.vgg16.html)：intermediate-114-2-3-q42、intermediate-114-2-3-q43、intermediate-114-2-3-q44。
- [SciPy：Box–Cox轉換](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.boxcox.html)：intermediate-114-2-2-q36、intermediate-115-1-3-q5、intermediate-115-1-3-q25。
- [SciPy：KL相對熵](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.entropy.html)：intermediate-114-2-1-q22。
- [SciPy：單因子ANOVA](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.f_oneway.html)：intermediate-115-1-2-q4。
- [SciPy：Kendall相關](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kendalltau.html)：intermediate-115-1-2-q24。
- [SciPy：負二項分佈](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.nbinom.html)：intermediate-115-1-2-q3。
- [SciPy：連續常態分布CDF](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html)：intermediate-114-2-2-q4、intermediate-115-1-2-q5、intermediate-115-1-2-q8。
- [SciPy：Spearman相關](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html)：intermediate-115-1-2-q24。
- [SciPy：單樣本t檢定](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_1samp.html)：intermediate-114-2-2-q23。
- [SciPy：成對t檢定](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_rel.html)：intermediate-115-1-2-q7。
- [SciPy：Monte Carlo抽樣近似](https://docs.scipy.org/doc/scipy/tutorial/stats/resampling.html)：intermediate-114-2-3-q23、intermediate-114-2-3-q41、intermediate-115-1-3-q1。
- [Fairlearn：公平性指標](https://fairlearn.org/main/user_guide/assessment/common_fairness_metrics.html)：intermediate-115-1-3-q38、intermediate-115-1-3-q39。
- [Fairlearn：訓練中公平性約束](https://fairlearn.org/main/user_guide/mitigation/reductions.html)：intermediate-115-1-3-q39。
- [Microsoft SEAL：同態加密](https://github.com/microsoft/SEAL)：intermediate-114-2-2-q13、intermediate-114-2-2-q20、intermediate-114-2-2-q32、intermediate-114-2-3-q36、intermediate-114-2-3-q37、intermediate-115-1-3-q36。
- [OpenAI：GPT-2原始模型與文件](https://github.com/openai/gpt-2)：intermediate-115-1-3-q23。
- [Diffusers：Schedulers](https://huggingface.co/docs/diffusers/using-diffusers/schedulers)：intermediate-114-2-1-q38。
- [Hugging Face：文字分類與情感分析](https://huggingface.co/docs/transformers/tasks/sequence_classification)：intermediate-114-2-1-q1、intermediate-114-2-1-q49、intermediate-114-2-3-q30。
- [imbalanced-learn：過取樣與SMOTE](https://imbalanced-learn.org/stable/over_sampling.html)：intermediate-114-2-2-q12、intermediate-114-2-2-q37、intermediate-114-2-3-q19、intermediate-115-1-1-q37、intermediate-115-1-2-q32。
- [Keras：EarlyStopping](https://keras.io/api/callbacks/early_stopping/)：intermediate-114-2-3-q26、intermediate-114-2-3-q31、intermediate-115-1-3-q8、intermediate-115-1-3-q48。
- [Keras：Conv2D](https://keras.io/api/layers/convolution_layers/convolution2d/)：intermediate-115-1-3-q47。
- [Keras：Dense](https://keras.io/api/layers/core_layers/dense/)：intermediate-114-2-3-q49、intermediate-115-1-3-q40。
- [Keras：BatchNormalization](https://keras.io/api/layers/normalization_layers/batch_normalization/)：intermediate-115-1-3-q47。
- [Keras：MaxPooling2D](https://keras.io/api/layers/pooling_layers/max_pooling2d/)：intermediate-114-2-1-q8、intermediate-115-1-3-q18。
- [Keras：機率分類損失](https://keras.io/api/losses/probabilistic_losses/)：intermediate-115-1-3-q10、intermediate-115-1-3-q40。
- [Keras：to_categorical](https://keras.io/api/utils/python_utils/)：intermediate-115-1-3-q46。
- [Kubernetes：核心功能](https://kubernetes.io/docs/concepts/overview/)：intermediate-114-2-1-q13、intermediate-114-2-1-q23、intermediate-114-2-1-q31、intermediate-115-1-1-q43、intermediate-115-1-1-q47。
- [Microsoft：Circuit Breaker](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)：intermediate-115-1-1-q15、intermediate-115-1-1-q45。
- [Microsoft：Data Lake](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)：intermediate-115-1-1-q39。
- [Matplotlib：plot格式字串](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.plot.html)：intermediate-114-2-3-q50、intermediate-115-1-2-q29。
- [MLflow：Model Registry](https://mlflow.org/docs/latest/ml/model-registry/)：intermediate-114-2-1-q15、intermediate-115-1-1-q22、intermediate-115-1-1-q25、intermediate-115-1-1-q49。
- [Neo4j：Property Graph概念](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/)：intermediate-114-2-2-q34。
- [Stanford GloVe：全域共現詞向量](https://nlp.stanford.edu/projects/glove/)：intermediate-114-2-1-q4、intermediate-114-2-1-q33、intermediate-115-1-1-q3、intermediate-115-1-1-q5。
- [NumPy：dot](https://numpy.org/doc/stable/reference/generated/numpy.dot.html)：intermediate-114-2-3-q33、intermediate-114-2-3-q40、intermediate-115-1-3-q3。
- [NumPy：矩陣反矩陣](https://numpy.org/doc/stable/reference/generated/numpy.linalg.inv.html)：intermediate-114-2-3-q40。
- [NumPy：SVD](https://numpy.org/doc/stable/reference/generated/numpy.linalg.svd.html)：intermediate-115-1-2-q16。
- [pandas：isna與isnull](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.isna.html)：intermediate-114-2-2-q49。
- [pandas：melt](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.melt.html)：intermediate-114-2-2-q46。
- [pandas：DataFrame.nlargest](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.nlargest.html)：intermediate-114-2-2-q47、intermediate-115-1-2-q45。
- [pandas：Series.describe](https://pandas.pydata.org/docs/reference/api/pandas.Series.describe.html)：intermediate-114-2-2-q2、intermediate-114-2-2-q45、intermediate-114-2-2-q48、intermediate-115-1-2-q41、intermediate-115-1-2-q45。
- [pandas：json_normalize](https://pandas.pydata.org/docs/reference/api/pandas.json_normalize.html)：intermediate-114-2-1-q27、intermediate-114-2-2-q24。
- [pandas：merge](https://pandas.pydata.org/docs/reference/api/pandas.merge.html)：intermediate-115-1-2-q47。
- [pandas：read_csv分塊讀取](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html)：intermediate-115-1-2-q12。
- [pandas：groupby聚合](https://pandas.pydata.org/docs/user_guide/groupby.html)：intermediate-114-2-2-q45、intermediate-115-1-2-q45。
- [pandas：索引與篩選](https://pandas.pydata.org/docs/user_guide/indexing.html)：intermediate-115-1-2-q46。
- [pandas：可空整數型態](https://pandas.pydata.org/docs/user_guide/integer_na.html)：intermediate-114-2-2-q43、intermediate-114-2-2-q44。
- [OpenAI：Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching)：intermediate-115-1-1-q21。
- [mlxtend：Apriori](https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/apriori/)：intermediate-115-1-2-q19。
- [mlxtend：關聯規則指標](https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/association_rules/)：intermediate-114-2-2-q26、intermediate-115-1-2-q18。
- [scikit-learn：增量學習與特徵串流](https://scikit-learn.org/stable/computing/scaling_strategies.html)：intermediate-115-1-1-q34。
- [scikit-learn：分群與DBSCAN](https://scikit-learn.org/stable/modules/clustering.html)：intermediate-114-2-1-q11、intermediate-114-2-1-q48、intermediate-114-2-2-q10、intermediate-114-2-2-q28、intermediate-114-2-2-q41、intermediate-114-2-3-q4、intermediate-115-1-1-q31、intermediate-115-1-3-q15、intermediate-115-1-3-q29。
- [scikit-learn：交叉驗證](https://scikit-learn.org/stable/modules/cross_validation.html)：intermediate-114-2-1-q14、intermediate-114-2-1-q41、intermediate-114-2-1-q43、intermediate-114-2-2-q39、intermediate-114-2-2-q40、intermediate-114-2-3-q1、intermediate-114-2-3-q28、intermediate-114-2-3-q29、intermediate-114-2-3-q34、intermediate-114-2-3-q47、intermediate-115-1-2-q10、intermediate-115-1-2-q17、intermediate-115-1-2-q22、intermediate-115-1-2-q32、intermediate-115-1-2-q49、intermediate-115-1-3-q26、intermediate-115-1-3-q27、intermediate-115-1-3-q30、intermediate-115-1-3-q44、intermediate-115-1-3-q45。
- [scikit-learn：主成分分析](https://scikit-learn.org/stable/modules/decomposition.html)：intermediate-114-2-1-q12、intermediate-114-2-1-q45、intermediate-114-2-2-q29、intermediate-114-2-3-q35、intermediate-114-2-3-q46、intermediate-115-1-1-q30、intermediate-115-1-2-q10、intermediate-115-1-2-q16、intermediate-115-1-3-q6。
- [scikit-learn：文字特徵萃取](https://scikit-learn.org/stable/modules/feature_extraction.html)：intermediate-114-2-1-q5、intermediate-114-2-1-q17。
- [scikit-learn：LogisticRegression與solver](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html)：intermediate-115-1-2-q25、intermediate-115-1-2-q33、intermediate-115-1-2-q34、intermediate-115-1-2-q49。
- [scikit-learn：QuantileRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html)：intermediate-114-2-2-q33。
- [scikit-learn：R²](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html)：intermediate-114-2-3-q15。
- [scikit-learn：超引數搜尋](https://scikit-learn.org/stable/modules/grid_search.html)：intermediate-114-2-1-q36、intermediate-114-2-1-q41、intermediate-114-2-3-q11、intermediate-115-1-3-q34。
- [scikit-learn：缺值填補](https://scikit-learn.org/stable/modules/impute.html)：intermediate-115-1-2-q17、intermediate-115-1-2-q41。
- [scikit-learn：LDA監督降維](https://scikit-learn.org/stable/modules/lda_qda.html)：intermediate-115-1-3-q44。
- [scikit-learn：線性模型與正則化](https://scikit-learn.org/stable/modules/linear_model.html)：intermediate-114-2-1-q12、intermediate-114-2-1-q26、intermediate-114-2-2-q50、intermediate-114-2-3-q2、intermediate-114-2-3-q24、intermediate-114-2-3-q25、intermediate-114-2-3-q26、intermediate-114-2-3-q32、intermediate-115-1-2-q42、intermediate-115-1-3-q5、intermediate-115-1-3-q7、intermediate-115-1-3-q13、intermediate-115-1-3-q33。
- [scikit-learn：t-SNE與流形降維](https://scikit-learn.org/stable/modules/manifold.html#t-sne)：intermediate-115-1-3-q6。
- [scikit-learn：模型評估指標](https://scikit-learn.org/stable/modules/model_evaluation.html)：intermediate-114-2-1-q7、intermediate-114-2-1-q10、intermediate-114-2-2-q22、intermediate-114-2-2-q26、intermediate-114-2-2-q30、intermediate-114-2-3-q15、intermediate-114-2-3-q16、intermediate-114-2-3-q19、intermediate-114-2-3-q30、intermediate-114-2-3-q38、intermediate-114-2-3-q47、intermediate-115-1-1-q8、intermediate-115-1-1-q9、intermediate-115-1-1-q19、intermediate-115-1-1-q42、intermediate-115-1-1-q48、intermediate-115-1-2-q17、intermediate-115-1-2-q20、intermediate-115-1-2-q23、intermediate-115-1-2-q25、intermediate-115-1-2-q43、intermediate-115-1-2-q44、intermediate-115-1-2-q50、intermediate-115-1-3-q2、intermediate-115-1-3-q10、intermediate-115-1-3-q12、intermediate-115-1-3-q30、intermediate-115-1-3-q32、intermediate-115-1-3-q48。
- [scikit-learn：貝氏定理與Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html)：intermediate-114-2-3-q22、intermediate-114-2-3-q41、intermediate-115-1-3-q14。
- [scikit-learn：近鄰分類](https://scikit-learn.org/stable/modules/neighbors.html)：intermediate-115-1-2-q40、intermediate-115-1-2-q43。
- [scikit-learn：MLP](https://scikit-learn.org/stable/modules/neural_networks_supervised.html)：intermediate-114-2-3-q3、intermediate-114-2-3-q12、intermediate-115-1-1-q12。
- [scikit-learn：資料前處理](https://scikit-learn.org/stable/modules/preprocessing.html)：intermediate-114-2-1-q9、intermediate-114-2-1-q28、intermediate-114-2-2-q1、intermediate-114-2-2-q5、intermediate-114-2-2-q6、intermediate-114-2-2-q8、intermediate-114-2-2-q9、intermediate-114-2-2-q16、intermediate-114-2-2-q17、intermediate-114-2-2-q29、intermediate-114-2-3-q9、intermediate-114-2-3-q20、intermediate-114-2-3-q48、intermediate-115-1-1-q38、intermediate-115-1-2-q5、intermediate-115-1-2-q11、intermediate-115-1-2-q26、intermediate-115-1-2-q48、intermediate-115-1-3-q24、intermediate-115-1-3-q25、intermediate-115-1-3-q46。
- [scikit-learn：決策樹不純度](https://scikit-learn.org/stable/modules/tree.html)：intermediate-114-2-2-q14、intermediate-114-2-3-q8、intermediate-115-1-2-q2、intermediate-115-1-2-q42、intermediate-115-1-3-q28。
- [seaborn：barplot](https://seaborn.pydata.org/generated/seaborn.barplot.html)：intermediate-114-2-2-q46、intermediate-114-2-2-q47。
- [SHAP：TreeExplainer輸出尺度](https://shap.readthedocs.io/en/latest/generated/shap.TreeExplainer.html)：intermediate-115-1-1-q26、intermediate-115-1-1-q28、intermediate-115-1-1-q29、intermediate-115-1-3-q28、intermediate-115-1-3-q37。
- [Spark：approxQuantile](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.approxQuantile.html)：intermediate-114-2-2-q27。
- [Spark：分散式stddev](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.functions.stddev.html)：intermediate-115-1-2-q21。
- [Spark：Structured Streaming](https://spark.apache.org/docs/latest/streaming/index.html)：intermediate-114-2-2-q11、intermediate-114-2-2-q19、intermediate-114-2-2-q24、intermediate-115-1-1-q20。
- [Stanford Stanza：詞性標註](https://stanfordnlp.github.io/stanza/pos.html)：intermediate-115-1-1-q1。
- [Stanford：N-gram Language Models](https://web.stanford.edu/~jurafsky/slp3/3.pdf)：intermediate-114-2-1-q6。
- [U.S. Copyright Office：AI與著作權](https://www.copyright.gov/ai/)：intermediate-114-2-1-q25。
- [Edward Tufte：資料視覺化著作](https://www.edwardtufte.com/tufte/books_vdqi)：intermediate-114-2-2-q21、intermediate-115-1-2-q27、intermediate-115-1-2-q28。
- [Elasticsearch：Reciprocal Rank Fusion](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion)：intermediate-115-1-3-q22。
- [HHS：HIPAA與雲端運算](https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html)：intermediate-115-1-1-q46。
- [Intel Neural Compressor：模型量化](https://www.intel.com/content/www/us/en/developer/tools/oneapi/neural-compressor.html)：intermediate-115-1-1-q23、intermediate-115-1-1-q40、intermediate-115-1-3-q21。
- [NIST：偏態與峰態](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm)：intermediate-114-2-2-q3、intermediate-114-2-2-q25、intermediate-115-1-1-q38。
- [NIST：二項分佈](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366i.htm)：intermediate-114-2-2-q31。
- [NIST：卜瓦松分佈](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm)：intermediate-114-2-2-q4、intermediate-114-2-2-q15、intermediate-114-2-2-q42、intermediate-115-1-2-q3。
- [NIST：假說檢定](https://www.itl.nist.gov/div898/handbook/prc/section1/prc131.htm)：intermediate-115-1-2-q6、intermediate-115-1-2-q8、intermediate-115-1-2-q9。
- [NIST：箱型圖與離群值](https://www.itl.nist.gov/div898/handbook/prc/section1/prc16.htm)：intermediate-115-1-2-q1。
- [MongoDB：Sharding](https://www.mongodb.com/docs/manual/sharding/)：intermediate-115-1-2-q13、intermediate-115-1-2-q14。
- [NIST：AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)：intermediate-114-2-3-q13、intermediate-114-2-3-q14、intermediate-114-2-3-q28、intermediate-115-1-1-q19、intermediate-115-1-1-q25、intermediate-115-1-1-q26、intermediate-115-1-1-q27、intermediate-115-1-1-q33、intermediate-115-1-1-q43、intermediate-115-1-2-q15、intermediate-115-1-3-q37。
- [NIST：Digital Signature Standard](https://www.nist.gov/publications/digital-signature-standard-dss-1)：intermediate-114-2-1-q30、intermediate-114-2-3-q37。
- [PostgreSQL：交易](https://www.postgresql.org/docs/current/tutorial-transactions.html)：intermediate-114-2-2-q7、intermediate-114-2-2-q18、intermediate-115-1-2-q13、intermediate-115-1-2-q36。
- [statsmodels：SARIMAX模型](https://www.statsmodels.org/stable/examples/notebooks/generated/statespace_sarimax_stata.html)：intermediate-114-2-1-q39、intermediate-115-1-2-q22、intermediate-115-1-3-q26。
- [statsmodels：雙比例Z檢定](https://www.statsmodels.org/stable/generated/statsmodels.stats.proportion.proportions_ztest.html)：intermediate-114-2-2-q38。
- [W3C：RDF 1.1資料模型](https://www.w3.org/TR/rdf11-concepts/)：intermediate-114-2-2-q35。
- [XGBoost：類別特徵](https://xgboost.readthedocs.io/en/stable/tutorials/categorical.html)：intermediate-115-1-2-q11。
- [XGBoost：Boosted Trees](https://xgboost.readthedocs.io/en/stable/tutorials/model.html)：intermediate-114-2-3-q18、intermediate-115-1-3-q16。

## 驗證範圍與限制

本稽核證明解析資料完整、圖片指定內容已讀及來源可追溯。未執行網站UI、登入／同步、部署、CI或任何雲端寫入；這些由主代理處理。原命題的非唯一或技術瑕疵以caveat公開，讀者須區分「公告選項」與實務完整條件。未對外發布或提交版本。

## Post-review corrections

The original authoring hashes above describe the pre-review draft. Seven per-option note dictionaries were aligned to the actual A–D choices; their overall reasoning and official keys did not change. Apriori q19 now distinguishes largest-cardinality from inclusion-maximal frequent sets. Shared contexts in the question corpus were separately repaired. Current explanation file hashes:

- `intermediate-114-2-1.json`: `d7dfbaa1127557264abdc0ba2c5a46317da2bbea975383ee754d05a38a1bd11a`
- `intermediate-114-2-2.json`: `4b36563b0a8a87b52934767a63237ebac97eb9c5ee67a109c07934c28f322203`
- `intermediate-114-2-3.json`: `982c8c437e11ed0528711528dc0433114482b471ae8e95a87a64a6e5c858e539`
- `intermediate-115-1-1.json`: `e775ba3d0deb7241c1b21736f57f4be2807b3cef47be54a349cb374aab9e0f8f`
- `intermediate-115-1-2.json`: `fdbb76e7dcc4477cb663c0380a2235561ddc29b867c5486ecbb2fb398d9f6673`
- `intermediate-115-1-3.json`: `9d4a96a44702bd69e00791c13de18c8b9a13f04b8dd94473c1119bf03c790b6f`
