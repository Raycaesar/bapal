# BAPAL 验证说明

## 1. 结论边界

本项目是显式有限模型上的逐点检查器。`MPL.truth(M, w, φ)` 回答的是 `M,w ⊨ φ`，不是对所有模型进行搜索。一个模型内的结果应称为 `truthAtWorld`、`trueSomewhereInModel` 和 `trueAtEveryWorldInModel`；规范用语见 [`docs/RESULT_TERMINOLOGY.md`](docs/RESULT_TERMINOLOGY.md)。

因此，本项目不实现一般 BAPAL 可满足性搜索、有效性检查、定理证明或无界判定过程。下述有限模型归约说明的是：**给定一个固定的有限显式模型时**，实现怎样枚举与布尔公告相关的有限域；它不推出有限模型性质，也不推出一般可满足性或有效性的可判定性。

## 2. `^A` 的有限模型语义

输入 `^A` 表示存在性布尔任意公告算子，显示为 `◇ᵝA` / `\Diamond_{\beta}A`。`β` 表示 Boolean announcement，不是 agent `b`。

在当前世界 `w`，`^A` 为真，当且仅当存在一个布尔公告 `α`，满足：

1. `α` 在 `w` 为真；
2. 公开公告 `α` 后，只保留原模型中满足 `α` 的世界及其内部关系；
3. `A` 在限制后模型的同一世界 `w` 为真。

布尔公告只含命题原子与布尔连接词。它不含知识算子、PAL 算子、BAPAL 算子或其他模态算子。普通模态 `□` / `<>`、PAL `[A]B` 与存在性 BAPAL `^A` 是三个不同的构造；普通 `□` 不是文献中某些表示法使用的普遍 BAPAL 算子。

## 3. 有限 valuation-class 归约

固定一个有限显式模型 `M`，并考虑当前限制后的有限活动域。取该模型中实际出现的全部精确命题原子标识；未出现于某世界赋值对象中的原子统一解释为假。两个活动世界属于同一个 complete propositional valuation class，当且仅当它们对这些精确原子标识的真假赋值完全相同。

任何布尔公式的真值只依赖命题赋值，所以每个布尔公告在这个固定模型中的真集必定是若干 valuation classes 的并集。同一 class 内的两个世界不能被布尔公告分开。

反方向需要有限分隔论证，而不是潜在无限的“完整赋值合取”：

1. 对任意两个不同且实际出现的 valuation classes `C` 与 `E`，它们的完整赋值不同，因此可选出一个真假不同的精确命题原子 `p(C,E)`。
2. 选择相应文字 `p(C,E)` 或 `¬p(C,E)`，使其在 `C` 上为真而在 `E` 上为假。
3. 对固定的目标 class `C`，针对其余每个实际出现的 class 取一个这样的分隔文字，并作有限合取。因为模型中只出现有限多个 classes，这个合取是有限公式，并在出现的 classes 中只刻画 `C`。
4. 对所需的若干目标 classes，再把这些有限合取作有限析取，就得到所需 class 并集的布尔定义。空并和全并分别可用有限矛盾式与有限重言式表示。

所以，在这个固定有限模型中，布尔可定义的公告域恰好是实际出现的 complete valuation classes 的并集。一个对当前点真实的候选公告域必须包含当前世界的整个 valuation class。实现枚举这些 class 并集，而不是枚举无限多的布尔语法串。

这个论证依赖：原子标识精确保存、所有世界共享同一赋值词汇约定、缺失键统一为假，以及模型限制/复制不丢失语义键。它不证明一般 BAPAL 的有限模型性质、可满足性可判定性或有效性可判定性。

## 4. S5 与任意关系

BAPAL 的形式目标通常是 S5 epistemic models，即每个相关 agent 的关系是等价关系。S5 mode 是经过审计的编辑策略：启用时会检查相关关系，在需要时经确认后取最小等价闭包，并在后续编辑中保持该不变量。语义所需的自反环存储在 `MPL.Model` 中，即使图形界面隐藏它们。

`MPL.truth` 本身也可以对任意已存储关系求值。这是显式模型检查与稳健性测试能力；在非 S5 frame 上得到的结果不能自动提升为形式 S5 逻辑的定理。

## 5. 采样有限模型报告

`scripts/random-bapal-evaluation.js` 生成一个五世界显式有限模型、关系以及十个含 `^` 的公式，并把逐世界结果写入 `reports/random-bapal-evaluation.html`。默认模式为 S5，也可显式选择 arbitrary relations；`--seed` 可复现模型与公式。

报告使用：

- `truthAtWorld`：各活动世界的真值；
- `trueSomewhereInModel`：在这个模型的某个活动世界为真；
- `trueAtEveryWorldInModel`：在这个模型的每个活动世界为真。

这是一份 generated/sampled finite-model evaluation report。它不把某世界为真称为一般可满足性，不把所有世界为真称为有效性，也不把这个模型中处处为假称为不可满足性。采样证据不是判定过程。

生成命令会写入跟踪报告，普通测试不会自动重写它：

```sh
node scripts/random-bapal-evaluation.js --s5 --seed 12345
```

## 6. 验证架构

当前验证层次彼此分开：

1. **继承的确定性 Node 回归。** 覆盖 parser/printer、PAL/BAPAL、结构复制、S5 编辑、渲染、原子导入可见性和 Schema v1 等边界。这些测试调用生产实现，因此不是独立语义 oracle。
2. **独立 Python oracle。** `oracle/bapal_oracle.py` 使用 Python 标准库和自己的数据结构，不调用 Node、生产 JavaScript、生产 parser、`MPL.truth` 或 `MPL.SchemaV1`。
3. **手写 core corpus。** `conformance/v1/core-corpus.jsonl` 含 73 个明确的 pointed cases 与人工审阅的 expected Booleans，覆盖所有 Schema v1 公式构造及关键边界案例。
4. **FAST bounded conformance。** 固定 seed 和界限下准确比较 50,000 个 pointed results。
5. **FULL bounded conformance。** 固定 seed 和更宽界限下准确比较 500,000 个 pointed results。
6. **Mutation sensitivity。** 先要求正常生产结果与 oracle 零 mismatch，再只在内存副本中翻转一个生产 Boolean，验证比较器、artifact、reducer 与 replay 能检测差异；不在生产代码中加入隐藏 mutation 开关。
7. **GitHub Actions。** Pull request 与 `bapal-core` push 运行 FAST，定时或手动工作流按约定运行 FULL，并检查准确计数、manifest、零 mismatch、非写入回归和干净工作树。

Schema v1 是独立生成数据与生产 evaluator 之间唯一的语义交换边界。旧 compact/share 字符串和生产 ASCII parser 不承担 conformance 语义传输。

## 7. 证据可以说明什么

零 mismatch 的准确表述是：在记录的版本、seed、模型/公式生成界限与比较次数内，独立 oracle 的 expected results 和生产 evaluator 的 actual results 一致。这是有限、确定、可复现的回归证据。

它不是：

- 对两个实现独立性的形式证明；
- 对全部有限或无限模型的穷尽证明；
- soundness、completeness 或实现总体正确性的数学证明；
- 可满足性结果、有效性结果或不可满足性结果；
- 有限模型性质或一般 BAPAL 可判定性的证明；
- 无界决策过程。

“exhaustive”只可用于同时明确给出有限域的测试，例如“穷尽零至三个世界上的 531 个有向关系”；不能省略该有限界限。

## 8. 本地验证命令

```sh
node scripts/check-all.js
node scripts/check-report-terminology.js
python3 scripts/check-independent-oracle.py
python3 scripts/check-oracle-sensitivity.py
python3 scripts/check-oracle-conformance.py --profile fast
python3 scripts/check-oracle-conformance.py --profile full
python3 scripts/check-conformance-ci.py
```

独立 oracle、core、FAST/FULL、artifact、reducer 与 CI 的详细契约见 [`docs/CONFORMANCE.md`](docs/CONFORMANCE.md)。
