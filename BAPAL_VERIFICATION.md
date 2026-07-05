# BAPAL 验证说明

## `^A` 的语义意图

本项目把输入语法 `^A` 实现为 BAPAL 的存在性布尔任意公告算子。预期有限模型语义是：

在当前世界 `w`，`^A` 为真，当且仅当存在一个布尔/命题公告 `α`，使得：

1. `α` 在当前世界 `w` 为真；
2. 公开公告 `α` 后，模型被限制到所有满足 `α` 的世界；
3. 在限制后的模型中，`A` 在 `w` 为真。

这里的布尔公告只允许使用命题原子和布尔连接词，例如否定、合取、析取、蕴含、等价。它不允许包含知识算子 `K{a}`、公开公告算子 `[A]B` 或另一个 BAPAL 算子 `^A`。

## 为什么可以枚举 valuation classes

在有限模型中，每个世界都有一个 propositional valuation，即每个命题原子在该世界为真或为假。两个世界如果对所有命题原子的真假赋值完全相同，就属于同一个 propositional valuation class。

布尔公式的真值只依赖命题赋值。因此，一个布尔公告 `α` 在模型中选出的世界集合一定是若干 valuation classes 的并集。反过来，在有限模型中，任意若干 valuation classes 的并集都可以由某个布尔公式描述：对每个目标 valuation class 写出对应的命题合取式，再把这些合取式析取起来即可。

所以，对有限模型上的 Boolean announcement quantification，本实现可以枚举所有 propositional valuation classes 的并集，并且只考虑包含当前世界 valuation class 的并集。后一条件对应“公告 `α` 在当前世界为真”。

## 为什么同一 valuation 的世界不能被分开

如果两个世界拥有完全相同的 propositional valuation，那么任何只由命题原子和布尔连接词构成的公式，在这两个世界上的真值都相同。

因此，不存在一个 Boolean announcement `α` 能让 `α` 在其中一个世界为真、在另一个世界为假。BAPAL 的布尔公告可以删除或保留整个 valuation class，但不能在同一个 valuation class 内部分离世界。

## S5 mode 的作用边界

S5 mode 是模型构造工具，不是对 BAPAL 语义的修改。

BAPAL 通常在 epistemic models 上研究，其中每个 agent 的 accessibility relation 是 equivalence relation。S5 mode 帮助用户构造这样的关系：拖拽一个当前 agent 的关系时，底层 `MPL.Model` 会存储所需的 reflexive、symmetric 和 transitive relations。自反 self-loops 可以在图上隐藏，但只要语义求值需要，它们必须真实存在于模型中。

也就是说，S5 mode 改变的是编辑器如何写入关系；`^A` 的求值仍然按同一个 finite-model valuation-class 枚举实现。

## 随机验证脚本

`scripts/random-bapal-evaluation.js` 会随机生成：

1. 一个 5-world 有限模型；
2. 命题变量 `p, q, r, s` 的随机 valuation；
3. agents `a, b` 的关系；
4. 10 个长度不超过 10 的随机公式；
5. 每个公式都至少包含一个 BAPAL operator `^`。

默认模式是 `--s5`，会为每个 agent 生成 S5 equivalence relations。也可以用 `--arbitrary` 生成任意有向关系，作为实现压力测试。脚本支持 `--seed`，使用简单的 deterministic pseudo-random generator，因此同一个 seed 可以复现同一个模型和公式集合。

运行示例：

```sh
node scripts/random-bapal-evaluation.js
node scripts/random-bapal-evaluation.js --s5
node scripts/random-bapal-evaluation.js --arbitrary
node scripts/random-bapal-evaluation.js --seed 12345
```

脚本会在控制台打印 readable report，并写出：

```text
reports/random-bapal-evaluation.html
```

HTML 报告包含 model string、world valuations、agent relations、10 个公式的 ASCII/Unicode/LaTeX 表示、每个世界上的真值、是否 satisfiable、是否 globally true，以及尽量打开 playground evaluate-formula 页面的一组链接。

## Deterministic regression tests

`scripts/check-bapal-regression.js` 是非随机回归测试。它覆盖：

1. `^A` 的解析和 ASCII / Unicode / LaTeX rendering；
2. BAPAL 不能分开同一 propositional valuation 的世界；
3. BAPAL 能通过 Boolean announcement 分开不同 propositional valuation 的世界；
4. Public announcement `[A]B` 在 BAPAL 改动后仍然工作；
5. Public announcement 删除世界时，会移除所有指向被删除世界的 incoming agent edges；
6. 在一个小型 S5 模型中，`^K{a}p` 的行为符合预期；
7. `Model.closeEquivalenceClass(agent, seeds)` 会为相关 agent 生成 reflexive、symmetric、transitive relation；
8. hidden visual self-loops 不是语义求值的必要条件，因为 self-loops 已存储在底层 `MPL.Model` 中。

运行：

```sh
node scripts/check-bapal-regression.js
```

如果出现错误，脚本会打印 `FAIL` 并以 `process.exit(1)` 退出；正常时每个测试点会打印清晰的 `PASS` 消息。

## 为什么验证比以前更强

以前的脚本主要覆盖少数手工例子。现在的验证多了两层：

1. deterministic regression tests 固定覆盖核心语义约定，适合在每次改动后快速发现回归；
2. random evaluation report 在可复现 seed 下生成多个模型和公式，能探索更多公式形状、truth patterns 和 S5 / arbitrary relation 情况。

这增强了实现可信度：当前实现对测试覆盖到的有限模型场景，符合预期的 BAPAL valuation-class 语义；valuation-class 枚举也给出了清楚的实现理由。

但这仍然只是程序实现层面的 smoke tests / regression tests，不是 BAPAL 的数学完全性证明，也不能替代论文中的语义证明。正确表述是：

> The implementation matches the intended finite-model semantics for the tested cases, and the valuation-class enumeration gives a clear implementation reason for the BAPAL operator. The tests provide regression evidence, not a mathematical proof of completeness or soundness.

这些测试不能证明：

1. BAPAL 语义对所有有限模型和所有公式都完全正确；
2. parser 对所有复杂嵌套公式都无歧义；
3. S5 编辑模式在所有浏览器 UI 操作序列下都不会产生异常状态；
4. 当前实现相对于 BAPAL 的公理系统是可靠且完备的。
