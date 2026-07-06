Epistemic Logic Playground
======================
This project is based on the open-source <a href="http://rkirsling.github.io/modallogic/">Modal Logic Playground</a> by <a href="https://github.com/rkirsling">Ross Kirsling</a>.
        The Epistemic Logic Playground was made by <a href="https://elliot.website">Elliot Evans</a>.
        Special thanks to my non-classical logic instructors Richard Zach and Audrey Yap, as well
        as my classmates who provided feedback on this project.


The Epistemic Logic Playground is a graphical semantic calculator for Dynamic Epistemic logic, built using [D3](http://d3js.org/), [MathJax](http://www.mathjax.org/), and [Bootstrap](http://getbootstrap.com/).

BAPAL formulas use `^A` as the ASCII input syntax for the existential Boolean-announcement diamond `◇ᵝA`. The superscript β means Boolean announcement and should not be confused with agent `b`.

See it in action at [vezwork.github.io/modallogic](https://vezwork.github.io/modallogic)!

### Tests

Run the Node-based semantic regression checks with:

```sh
node scripts/check-all.js
node scripts/check-logic-regressions.js
node scripts/check-bapal-regression.js
node scripts/check-s5-closure.js
node scripts/check-report-links.js
```

Generate a reproducible random BAPAL evaluation report with:

```sh
node scripts/random-bapal-evaluation.js
node scripts/random-bapal-evaluation.js --s5
node scripts/random-bapal-evaluation.js --arbitrary
node scripts/random-bapal-evaluation.js --seed 12345
```

### Reusable code
* The core part of the code is MPL.js, a library for parsing and evaluating well-formed formulas of modal propositional logic. See the API Reference [here](API-Reference.md).
* I've also extracted the directed graph editing code so that it can be easily repurposed. You can find it [here](http://bl.ocks.org/rkirsling/5001347).
