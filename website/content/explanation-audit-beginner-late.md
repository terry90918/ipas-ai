# 初級 115 年第 2、3 次詳解查核

查核日期：2026-10-12。範圍：四份指定試卷，共 200 題。保留 questions.json 的官方答案與題目內容，逐題撰寫 reasoning、A/B/C/D 解析、concept、pitfalls 及來源。有題目歧義或技術簡化時另寫 caveat。

## 覆蓋與格式

| 試卷 | 題數 | 最短推導字數 | 最短選項字數 | 最短總字數 | 平均總字數 |
| --- | ---: | ---: | ---: | ---: | ---: |
| beginner-115-2-1 | 50 | 84 | 17 | 238 | 264 |
| beginner-115-2-2 | 50 | 97 | 18 | 240 | 273 |
| beginner-115-3-1 | 50 | 93 | 17 | 232 | 266 |
| beginner-115-3-2 | 50 | 95 | 15 | 237 | 271 |

總字數只計 reasoning、options、concept 與 pitfalls，不計來源或 caveat。逐題 ID 與題庫比對，確認各 50 題、無缺號與重複；A/B/C/D 均有具體分析。所有項目通過 reasoning ≥60、每選項 ≥12、總計 ≥180 的門檻。使用繁體中文並校正轉換造成的術語重複。

## 計算核對

- beginner-115-2-1-q19：TP=80、FP=20、FN=10；Recall=88.89%、Precision=80%、F1=84.21%。指標優先順序依漏檢與誤報成本，不是一律選召回率。
- beginner-115-2-2-q43：800/350≈2.29 年是簡單回收期，不等於完整 ROI；評價期間及持續費用仍須另定。
- beginner-115-3-1-q10：Z=(40,000−30,000)/5,000=2。
- beginner-115-3-1-q27、q28：MAPE 與 MAE 列公式、量綱及 MAPE 近零分母限制。
- beginner-115-3-1-q31：MSE 12.5 與 42.0 對應 RMSE 約 3.54 與 6.48；不能以非零誤差推論過擬合。
- beginner-115-3-2-q40：500×2,000×1.5=1,500,000 輸出 token；除 1,000 再乘 0.02=30 美元。

上述數值以 Python assert 重算通過。這四份試卷沒有需要另外辨讀影像程式碼的題目；介面仍保留原題影像供核對。

## 來源與保留限制

共有 88 個不同引用 URL。透過 Exa 讀取官方文件、法規、研究原文，或核對官方搜尋回傳。內容以原始研究和維護者文件為主；來源首頁或綜述只支援通用背景，不當作產品實測。

- CRF 原 UMass 路徑無法讀取，改用 UCLA 保存的作者論文版本，已讀取。
- 差分隱私失效的 NIST 部落格路徑已替換為 Dwork/Roth 研究專書；TCO 的失效 AWS 舊文章路徑替換為官方 AI ROI 文章。
- PyTorch stable URL 重新導向，因此引用可讀取的 2.13 官方文件。
- beginner-115-3-1-q7：已讀完整公部門手冊，約 74,556 字元，未找到題幹「人在迴圈內最終審核」逐字表述。答案 B 保留，依基本法人類自主及手冊治理審核精神解析，並明確註記未證明該段逐字歸因。
- 金管會題目按官方 AI 指引解析，區分建議與法定強制義務；個資法題目提醒確認現行生效條文及具體例外。
- 多個選項部分成立、架構非統一標準、產品功能可能改變時，保留官方答案並揭露判題範圍。不宣稱 RAG、量化、少樣本或護欄保證成功。

完成的是逐題撰寫、來源核對、公式重算及結構門檻檢查。未經第三位人類考科專家逐題覆核，也未以本次資料宣稱整站登入、持久化或部署驗收完成。

## 逐題 caveat 清單

- `beginner-115-2-1-q1`: 官方答案為 A；C 未必涉及身分辨識，但相較 A 不直接涵蓋社群貼文的政策態度分析。
- `beginner-115-2-1-q4`: 本題是在既定 AI 情境中選最符合的能力，不代表所有毫秒交易系統都是 AI。
- `beginner-115-2-1-q5`: 此為考題原則解析；具體制度是否合法仍須按資料、資格規定與適用法規判斷。
- `beginner-115-2-1-q6`: 來源是數位部公佈之評測框架；實際認證版本與適用專案應以中心當期制度為準。
- `beginner-115-2-1-q8`: 題幹稱作業規範；此處以金管會官方「金融業運用 AI 指引」核對原則，不將所有建議一概說成法定強制義務。
- `beginner-115-2-1-q11`: 本解析處理考題之公平性情境，不對個人感染風險或醫療因果作判斷。
- `beginner-115-2-1-q13`: Binary 與 Target Encoding 也需驗證；本題只問最可能引入類別次序的方式。
- `beginner-115-2-1-q14`: 官方答案 B 的「會隨機」較簡化；真正問題是一般折分割沒有保證時間先後。
- `beginner-115-2-1-q15`: 線性迴歸並非在所有設定都必須標準化；D 是選項中尺度最不敏感的典型模型。
- `beginner-115-2-1-q17`: 官方答案 D 是相對最佳方式；沒有對照表不保證達成所有個資法要求，仍需再識別風險評估與資料保護措施。
- `beginner-115-2-1-q19`: 題幹未明述成本比例，官方答案 A 是採漏檢害蟲優先的情境假設。
- `beginner-115-2-1-q27`: 官方選 A 針對「主要模型架構」與「直接分類」措辭；影像異常檢測也可合法使用自編碼器。
- `beginner-115-2-1-q28`: 「減少內部共變數偏移」是原論文表述；後續研究指出訓練改善亦涉及最佳化幾何，不宜視為唯一機制。
- `beginner-115-2-1-q33`: 官方答案 B 是可能設計，並非確認 2025 年照片轉公仔服務的未公開架構。
- `beginner-115-2-1-q34`: 官方將兩者並列自監督是較寬的用語；CLIP 原論文強調 natural language supervision。
- `beginner-115-2-1-q35`: A 的「無法同時處理」應限於超出視窗或有效上下文的情況；視窗內並非絕對無法整合。
- `beginner-115-2-1-q37`: 多種 XAI 技術可輸出熱圖；D 是題目要求之最直接方法，不代表 LIME、SHAP 不能用於影像。
- `beginner-115-2-1-q38`: 保留官方 C；若正常資料完全沒有經過確認，也可能按另一套分類歸為無監督異常檢測。
- `beginner-115-2-1-q47`: 官方 B 符合現象描述；題幹不足以辨認具體成因，不應僅憑輸出單一斷定某個訓練故障。
- `beginner-115-2-2-q1`: 保留官方 B；RAG 不保證「顯著提升」，必須以該企業的獨立單據測試驗證。
- `beginner-115-2-2-q3`: B 是等價做法；Dify 的對話 ID、記憶功能或歷史 API 也可完成，不一定必須每次手工拼接。
- `beginner-115-2-2-q4`: A 亦為一般正確敘述；官方選 C，是較完整對應題幹計費與長度的選項。
- `beginner-115-2-2-q9`: C 在實際也可能可行；官方 A 最直接對應無開發人力、快速串接與避免大型系統。
- `beginner-115-2-2-q10`: 平台實現不同，不能推論所有 Low-Code 永遠不達 50ms；本題討論典型極限最佳化限制。
- `beginner-115-2-2-q15`: RFT 的優勢依賴基礎推理能力與可信 grader，不等於少量病例必定勝過 SFT，也不代表可直接用於診療。
- `beginner-115-2-2-q22`: 各模型 API 對推理預算的參數不同；此題解釋設計概念，不表示所有模型皆支援任意動態預算。
- `beginner-115-2-2-q23`: C 為概念近似；原論文不要求把長期記憶先寫成人類可讀的「重點文字」。
- `beginner-115-2-2-q30`: 保留官方 A；B 與 A 不互斥，獎勵最佳化可能落實為排序改善，A 更完整說明強化學習機制。
- `beginner-115-2-2-q31`: 保留官方 A；平台可能整合多個模型，實際採購應按當期功能驗證，合成缺陷也不可取代真實驗證資料。
- `beginner-115-2-2-q32`: B、D 的部分描述亦可能成立；官方 C 是最完整且不隨工具能力變化而失真的原則。
- `beginner-115-2-2-q38`: 訓練資料混合且各產品詳情未必公開；D 是能力最直接對應的資料型別，不確認某模型的特定訓練配比。
- `beginner-115-2-2-q40`: Solution Graph 並非統一唯一標準；D 依本題給定定義，其他代理框架可用不同圖結構。
- `beginner-115-2-2-q44`: 同一模型須確實支援受控部署或受控服務路徑；不能把一般外部 API 邏輯上標記「隔離」就當合規。
- `beginner-115-2-2-q46`: C 描述最接近差分隱私；題目未給噪聲校準與預算，不能據此保證已滿足形式化差分隱私。
- `beginner-115-2-2-q49`: 題幹未明確排除 D 的上下文混用；保留官方 B，但實際調查不能只靠排除資料庫問題就確認訓練洩漏。
- `beginner-115-3-1-q7`: 官方答案 B；已核對手冊的風險治理及審查內容與基本法人類自主原則，但手冊所讀版本未找到題幹這段逐字表述。
- `beginner-115-3-1-q19`: 此為考題法律原則；實際案件須確認現行已生效條文、例外與具體資料使用方式。
- `beginner-115-3-1-q42`: A 對應經典獎勵模型加強化學習流程；DPO 等其他偏好學習方法不一定另建獎勵模型。
- `beginner-115-3-1-q44`: 官方 D 的「加速」與「輕微」是預期不是保證，實際影響依位寬、方法、硬體與任務而異。
- `beginner-115-3-2-q3`: 官方 C 是情境選擇；微調的成本與延遲優勢並非保證，需連訓練維護、模型大小一起比較。
- `beginner-115-3-2-q5`: 不同平台的 Aggregator 命名與功能不同；應核對能否等待所有分支，本題按其給定定義作答。
- `beginner-115-3-2-q10`: 依題目定義區分；Solution Graph 一詞在不同框架沒有唯一固定生命週期。
- `beginner-115-3-2-q13`: A 在完整提供更新資料與引用的條件下也可能可行，B 更明確滿足題設可追溯與知識更新目標。
- `beginner-115-3-2-q15`: 參數支援與解碼方式依模型而異；貪婪解碼或某些推理 API 不一定接受同樣溫度控制。
- `beginner-115-3-2-q19`: 保留官方 D；Model Routing 並不必然由 LLM 執行，也可用規則或輕量分類器，B 在合適條件下同樣可行。
- `beginner-115-3-2-q22`: 題幹將使用者互動稱「AI 客戶端」較簡化；MCP 嚴格架構中使用者互動與模型編排通常屬於 Host。
- `beginner-115-3-2-q31`: 更精確通常可稱 Role Prompting；本題將角色與語氣設定歸為 Context Prompting。
- `beginner-115-3-2-q50`: 保留官方 D；B 的測試覆蓋不足也是可能原因，題幹不能唯一證明根因，D 是最直接的重大異常風險控制。

## 引用清單

- [AWS Comprehend：情感分析](https://docs.aws.amazon.com/comprehend/latest/dg/how-sentiment.html)
- [AWS Comprehend：關鍵詞擷取](https://docs.aws.amazon.com/comprehend/latest/dg/how-key-phrases.html)
- [AWS：Calculating the ROI of AI](https://aws.amazon.com/blogs/aws-cloud-financial-management/calculating-the-roi-of-ai/)
- [AWS：SageMaker Autopilot](https://docs.aws.amazon.com/sagemaker/latest/dg/autopilot-automate-model-development.html)
- [AWS：結構化與非結構化資料](https://aws.amazon.com/what-is/structured-data/)
- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic：Extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- [Anthropic：降低幻覺與來源核對](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Attention Is All You Need 原始論文](https://arxiv.org/abs/1706.03762)
- [AutoSkill 原始論文](https://arxiv.org/abs/2603.01145)
- [Batch Normalization 原始論文](https://arxiv.org/abs/1502.03167)
- [CLIP 原始論文](https://arxiv.org/abs/2103.00020)
- [CRF 原始論文（研究者版本）](https://web.cs.ucla.edu/%7Eyzsun/classes/2014Spring_CS7280/Papers/Probabilistic_Models/crf_sequence.pdf)
- [Chain-of-Thought 原始論文](https://arxiv.org/abs/2201.11903)
- [Claude Code 官方文件](https://code.claude.com/docs/en/overview)
- [Claude Code：Agent Skills](https://code.claude.com/docs/en/skills)
- [DDPM 原始論文](https://arxiv.org/abs/2006.11239)
- [DINO 原始論文](https://arxiv.org/abs/2104.14294)
- [DeepSeekMath：GRPO](https://arxiv.org/abs/2402.03300)
- [Dify：If-Else 條件分支](https://docs.dify.ai/en/guides/workflow/node/ifelse)
- [Dify：受控 Docker Compose 部署](https://docs.dify.ai/en/self-host/quick-start/docker-compose)
- [Dwork 與 Roth：差分隱私基礎](https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf)
- [Extracting Training Data from LLMs 原始研究](https://arxiv.org/abs/2012.07805)
- [Generative Adversarial Nets 原始論文](https://arxiv.org/abs/1406.2661)
- [GitHub：Webhooks 事件通知](https://docs.github.com/en/webhooks/about-webhooks)
- [Google Cloud：Vibe coding](https://cloud.google.com/discover/what-is-vibe-coding)
- [Google Cloud：模型監控與漂移](https://cloud.google.com/vertex-ai/docs/model-monitoring/overview)
- [Google：神經網路課程](https://developers.google.com/machine-learning/crash-course/neural-networks)
- [Hugging Face：子詞切分演算法](https://huggingface.co/docs/transformers/tokenizer_summary)
- [Hugging Face：生成與溫度參數](https://huggingface.co/docs/transformers/main_classes/text_generation)
- [IBM：大數據與 5V](https://www.ibm.com/think/topics/big-data)
- [IETF RFC 8259：JSON 資料格式](https://www.rfc-editor.org/rfc/rfc8259.html)
- [IETF RFC 8446：TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [InstructGPT 與 RLHF 原始論文](https://arxiv.org/abs/2203.02155)
- [LIME 原始論文](https://arxiv.org/abs/1602.04938)
- [Lost in the Middle 原始論文](https://arxiv.org/abs/2307.03172)
- [MMLU 原始論文](https://arxiv.org/abs/2009.03300)
- [McMahan 等：聯邦學習原始論文](https://arxiv.org/abs/1602.05629)
- [Microsoft Power Platform：部署區域與資料所在地](https://learn.microsoft.com/en-us/power-platform/admin/regions-overview)
- [Midjourney：Prompt Basics](https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics)
- [Model Context Protocol 官方介紹](https://modelcontextprotocol.io/docs/getting-started/intro)
- [NIST AI 100-2 E2025：對抗式機器學習](https://csrc.nist.gov/pubs/ai/100/2/e2025/final)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST SP 800-188：政府資料去識別化](https://csrc.nist.gov/pubs/sp/800/188/final)
- [NIST 統計手冊：偏態](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm)
- [NetworkX：有向無環圖](https://networkx.org/documentation/stable/reference/algorithms/dag.html)
- [OWASP：LLM 應用安全風險](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [OpenAI：Function calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI：Reinforcement fine-tuning](https://platform.openai.com/docs/guides/reinforcement-fine-tuning)
- [OpenAI：Token 定義與計算](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
- [OpenTelemetry：可觀測性、追蹤與日誌](https://opentelemetry.io/docs/concepts/observability-primer/)
- [PyTorch：LSTM](https://pytorch.org/docs/2.13/generated/torch.nn.LSTM.html)
- [PyTorch：最佳化器](https://pytorch.org/docs/2.13/optim.html)
- [PyTorch：模型量化](https://pytorch.org/docs/2.13/quantization.html)
- [RAG 原始論文](https://arxiv.org/abs/2005.11401)
- [ReAct 原始論文](https://arxiv.org/abs/2210.03629)
- [SHAP 原始論文](https://arxiv.org/abs/1705.07874)
- [Self-Consistency 原始論文](https://arxiv.org/abs/2203.11171)
- [Sentence Transformers：Retrieve & Re-Rank](https://sbert.net/examples/applications/retrieve_rerank/README.html)
- [Sparse Mixture-of-Experts 原始論文](https://arxiv.org/abs/1701.06538)
- [Sutton 與 Barto：Reinforcement Learning](http://incompleteideas.net/book/the-book-2nd.html)
- [Sweeney：k-匿名化原始研究](https://dataprivacylab.org/dataprivacy/projects/kanonymity/kanonymity2.pdf)
- [TensorFlow：卷積神經網路](https://www.tensorflow.org/tutorials/images/cnn)
- [TensorFlow：影像分割](https://www.tensorflow.org/tutorials/images/segmentation)
- [Titans 原始論文](https://arxiv.org/abs/2501.00663)
- [Tree of Thoughts 原始論文](https://arxiv.org/abs/2305.10601)
- [Turing：Computing Machinery and Intelligence](https://www.cs.mcgill.ca/~dprecup/courses/AI/Materials/turing1950.pdf)
- [XGBoost 官方 Python API](https://xgboost.readthedocs.io/en/stable/python/python_api.html)
- [pandas：資料插補](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.interpolate.html)
- [scikit-learn：PDP 與 ICE](https://scikit-learn.org/stable/modules/partial_dependence.html)
- [scikit-learn：主成分分析](https://scikit-learn.org/stable/modules/decomposition.html#pca)
- [scikit-learn：交叉驗證](https://scikit-learn.org/stable/modules/cross_validation.html)
- [scikit-learn：分群](https://scikit-learn.org/stable/modules/clustering.html)
- [scikit-learn：半監督式學習](https://scikit-learn.org/stable/modules/semi_supervised.html)
- [scikit-learn：排列特徵重要性](https://scikit-learn.org/stable/modules/permutation_importance.html)
- [scikit-learn：支援向量機](https://scikit-learn.org/stable/modules/svm.html)
- [scikit-learn：模型評估指標](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [scikit-learn：決策樹](https://scikit-learn.org/stable/modules/tree.html)
- [scikit-learn：異常與新奇偵測](https://scikit-learn.org/stable/modules/outlier_detection.html)
- [scikit-learn：缺失值填補](https://scikit-learn.org/stable/modules/impute.html)
- [scikit-learn：資料前處理](https://scikit-learn.org/stable/modules/preprocessing.html)
- [scikit-learn：資料洩漏與可重現性](https://scikit-learn.org/stable/common_pitfalls.html)
- [人工智慧基本法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0160093)
- [個人資料保護法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021)
- [數位部：AI 產品與系統評測中心與十大評測項目](https://moda.gov.tw/ADI/news/latest-news/9295)
- [數位部：公部門人工智慧應用參考手冊](https://www-api.moda.gov.tw/File/Get/moda/zh-tw/WwHCroVhwWy52dw)
- [金管會：金融業運用人工智慧（AI）指引](https://www.fsc.gov.tw/websitedowndoc?file=chfsc%2F202408231741530.pdf&filedisplay=%E9%99%84%E4%BB%B6_%E9%87%91%E8%9E%8D%E6%A5%AD%E9%81%8B%E7%94%A8AI%E6%8C%87%E5%BC%95.pdf)
- [顯著性圖原始研究](https://arxiv.org/abs/1312.6034)
