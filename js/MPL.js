/**
 * MPL v1.3.2
 * (http://github.com/rkirsling/modallogic)
 *
 * A library for parsing and evaluating well-formed formulas (wffs) of modal propositional logic.
 *
 * Copyright (c) 2013-2015 Ross Kirsling
 * Released under the MIT License.
 */
var MPL = (function (FormulaParser) {
  'use strict';

  // begin formula-parser setup
  if (typeof FormulaParser === 'undefined') throw new Error('MPL could not find dependency: formula-parser');

  var variableKey = 'prop';

  var unaries = [
    { symbol: '~',  key: 'neg',  precedence: 6 },
    { symbol: '\u25a1', key: 'nec',  precedence: 6 },
    { symbol: '<>', key: 'poss', precedence: 6 },
    { symbol: '^',  key: 'bapal', precedence: 6 }, // bapal operator
    { symbol: '[', key: 'annce_start', precedence: 5 },
    { symbol: 'K{', key: 'kno_start', precedence: 4 }
  ];

  var binaries = [
    { symbol: ']', key: 'annce_end', precedence: 5, associativity: 'right' }, // the left operand to annce_end must be annce_start
    { symbol: '}', key: 'kno_end', precedence: 4, associativity: 'right' }, // the left operand to kno_end must be kno_start
    { symbol: '&',   key: 'conj', precedence: 3, associativity: 'right' },
    { symbol: '|',   key: 'disj', precedence: 2, associativity: 'right' },
    { symbol: '->',  key: 'impl', precedence: 1, associativity: 'right' },
    { symbol: '<->', key: 'equi', precedence: 0, associativity: 'right' }
  ];

  var MPLParser = new FormulaParser(variableKey, unaries, binaries);
  // end formula-parser setup

  /**
   * Converts an MPL wff from ASCII to JSON.
   * @private
   */
  function _asciiToJSON(ascii) {
    return MPLParser.parse(ascii);
  }

  /**
   * Converts an MPL wff from JSON to ASCII.
   * @private
   */

  function _announcementPreconditionNeedsParentheses(json) {
    // The raw parser models PAL and knowledge delimiters as split operators.
    // An exposed PAL or knowledge root can bind across the announcement's `]`;
    // ordinary prefix operators do not add a grouping boundary of their own.
    if (json.kno_start && json.kno_start.kno_end) return true;
    if (json.annce_start && json.annce_start.annce_end) return true;
    if (json.neg) return _announcementPreconditionNeedsParentheses(json.neg);
    if (json.nec) return _announcementPreconditionNeedsParentheses(json.nec);
    if (json.poss) return _announcementPreconditionNeedsParentheses(json.poss);
    if (json.bapal) return _announcementPreconditionNeedsParentheses(json.bapal);
    return false;
  }

function _jsonToASCII(json) {
    if (!json) throw new Error('Empty JSON node!');

    if (json.prop)
      return json.prop;
    else if (json.neg)
      return '~' + _jsonToASCII(json.neg);
    else if (json.nec)
      return '\u25a1' + _jsonToASCII(json.nec);
    else if (json.poss)
      return '<>' + _jsonToASCII(json.poss);
    else if (json.bapal)
      return '^' + _jsonToASCII(json.bapal);
    
    // binary operators: parser produces [left, right] arrays
    else if (json.conj)
      return '(' + _jsonToASCII(json.conj[0]) + ' & ' + _jsonToASCII(json.conj[1]) + ')';
    else if (json.disj)
      return '(' + _jsonToASCII(json.disj[0]) + ' | ' + _jsonToASCII(json.disj[1]) + ')';
    else if (json.impl)
      return '(' + _jsonToASCII(json.impl[0]) + ' -> ' + _jsonToASCII(json.impl[1]) + ')';
    else if (json.equi)
      return '(' + _jsonToASCII(json.equi[0]) + ' <-> ' + _jsonToASCII(json.equi[1]) + ')';

    // announcement operator [φ]ψ — annce_end holds [announcement, formula]
    else if (json.annce_start && json.annce_start.annce_end) {
      var precondition = json.annce_start.annce_end[0];
      var preconditionASCII = _jsonToASCII(precondition);
      if (_announcementPreconditionNeedsParentheses(precondition)) {
        preconditionASCII = '(' + preconditionASCII + ')';
      }
      return '[' + preconditionASCII + ']' + _jsonToASCII(json.annce_start.annce_end[1]);
    }

    // knowledge operator K{a}φ — kno_end holds [agent-prop, formula]
    else if (json.kno_start && json.kno_start.kno_end) {
      return 'K{' + _jsonToASCII(json.kno_start.kno_end[0]) + '}' + _jsonToASCII(json.kno_start.kno_end[1]);
    }
    
    else {
      throw new Error('Invalid JSON for formula!');
    }
  }

  /**
   * Converts an MPL wff from ASCII to LaTeX.
   * @private
   */
  function _asciiToLaTeX(ascii) {
    return ascii.replace(/~/g,      '\\lnot{}')
                .replace(/\u25a1/g,   '\\Box{}')
                .replace(/<>/g,     '\\Diamond{}')
                .replace(/\^/g,     '\\Diamond_{\\beta}{}')
                .replace(/K\{/g,     'K_{')
                .replace(/\}/g,     '}')
                .replace(/ & /g,    '\\land{}')
                .replace(/ \| /g,   '\\lor{}')
                .replace(/ <-> /g,  '\\leftrightarrow{}')
                .replace(/ -> /g,   '\\rightarrow{}');
  }

  /**
   * Converts an MPL wff from ASCII to Unicode.
   * @private
   */

  function _asciiToUnicode(ascii) {
    return ascii.replace(/~/g,    '\u00ac')
                .replace(/\u25a1/g, '\u25a1')
                .replace(/<>/g,   '\u25ca')
                .replace(/\^/g,   '\u25c7\u1d5d')
                // .replace(/K\[/g,  'K[') don't change from ascii for knowledge operator
                // .replace(/\]/g,   ']')  don't change from ascii for knowledge operator
                .replace(/&/g,    '\u2227')
                .replace(/\|/g,   '\u2228')
                .replace(/<->/g,  '\u2194')
                .replace(/->/g,   '\u2192');
  }

  /**
   * Constructor for MPL wff. Takes either ASCII or JSON representation as input.
   * @constructor
   */
  function Wff(asciiOrJSON) {
    // Strings for the four representations: ASCII, JSON, LaTeX, and Unicode.
    var _ascii = '', _json = '', _latex = '', _unicode = '';

    /**
     * Returns the ASCII representation of an MPL wff.
     */
    this.ascii = function () {
      return _ascii;
    };

    /**
     * Returns the JSON representation of an MPL wff.
     */
    this.json = function () {
      return _json;
    };

    /**
     * Returns the LaTeX representation of an MPL wff.
     */
    this.latex = function () {
      return _latex;
    };

    /**
     * Returns the Unicode representation of an MPL wff.
     */
    this.unicode = function () {
      return _unicode;
    };

    _json    = (typeof asciiOrJSON === 'object') ? asciiOrJSON : _asciiToJSON(asciiOrJSON);
    _ascii   = _jsonToASCII(_json);
    _latex   = _asciiToLaTeX(_ascii);
    _unicode = _asciiToUnicode(_ascii);
  }

  /**
   * Parses the legacy compact model format into plain data without mutating a
   * Model. Empty state records are preserved as null slots, including the one
   * empty record produced by the empty string. Live state records have the
   * form A<one-character word atoms>S<decimal-target><one-character-agent>,...
   * with an optional final transition comma.
   * Exposed as MPL.parseModelString for independent boundary validation.
   */
  function _modelStringFailure(code, message, details) {
    return {
      ok: false,
      error: Object.assign({
        code: code,
        message: message,
        offset: null,
        stateIndex: null,
        tokenIndex: null,
        token: null,
      }, details || {}),
    };
  }

  function _parseModelString(modelString) {
    if (typeof modelString !== 'string') {
      return _modelStringFailure(
        'INPUT_NOT_STRING',
        'Compact model input must be a string.'
      );
    }

    const stateStrings = modelString.split(';');
    const states = [];
    const transitionsToAdd = [];
    let stateOffset = 0;

    for (let stateIndex = 0; stateIndex < stateStrings.length; stateIndex++) {
      const stateString = stateStrings[stateIndex];
      if (stateString === '') {
        states.push(null);
        stateOffset += 1;
        continue;
      }

      if (stateString[0] !== 'A') {
        return _modelStringFailure(
          'MISSING_STATE_START',
          'State ' + stateIndex + ' must begin with A.',
          { offset: stateOffset, stateIndex: stateIndex, token: stateString }
        );
      }

      const indexOfS = stateString.indexOf('S', 1);
      if (indexOfS === -1) {
        return _modelStringFailure(
          'MISSING_STATE_SEPARATOR',
          'State ' + stateIndex + ' is missing the S assignment/transition separator.',
          { offset: stateOffset + stateString.length, stateIndex: stateIndex, token: stateString }
        );
      }

      const assignment = {};
      const propvarsSubstring = stateString.slice(1, indexOfS);
      for (const propvar of propvarsSubstring) {
        if (!/^[A-Za-z0-9_]$/.test(propvar) || propvar === 'A' || propvar === 'S') {
          return _modelStringFailure(
            'INVALID_ATOM_CHARACTER',
            'State ' + stateIndex + ' contains an invalid compact atom character.',
            { offset: stateOffset + 1, stateIndex: stateIndex, token: propvar }
          );
        }
        assignment[propvar] = true;
      }
      states.push({ assignment: assignment, successors: [] });

      const transitionsSubstring = stateString.slice(indexOfS + 1);
      if (transitionsSubstring === '') {
        stateOffset += stateString.length + 1;
        continue;
      }

      const transitionStrings = transitionsSubstring.split(',');
      if (transitionStrings[transitionStrings.length - 1] === '') {
        transitionStrings.pop();
      }
      if (transitionStrings.length === 0 || transitionStrings.some(function(transition) {
        return transition === '';
      })) {
        return _modelStringFailure(
          'EMPTY_TRANSITION_RECORD',
          'State ' + stateIndex + ' contains an empty transition record.',
          { offset: stateOffset + indexOfS + 1, stateIndex: stateIndex, token: '' }
        );
      }

      let transitionOffset = stateOffset + indexOfS + 1;
      for (let tokenIndex = 0; tokenIndex < transitionStrings.length; tokenIndex++) {
        const transitionString = transitionStrings[tokenIndex];
        const codePoints = Array.from(transitionString);
        if (codePoints.length < 2) {
          const code = /^[0-9]+$/.test(transitionString)
            ? 'MISSING_AGENT'
            : 'INVALID_TARGET_FORMAT';
          return _modelStringFailure(
            code,
            'State ' + stateIndex + ' transition ' + tokenIndex + ' is incomplete.',
            {
              offset: transitionOffset,
              stateIndex: stateIndex,
              tokenIndex: tokenIndex,
              token: transitionString,
            }
          );
        }

        const agent = codePoints[codePoints.length - 1];
        const targetString = codePoints.slice(0, -1).join('');
        if (!/^[0-9]+$/.test(targetString)) {
          const code = /^[0-9]/.test(transitionString)
            ? 'UNEXPECTED_TRANSITION_MATERIAL'
            : 'INVALID_TARGET_FORMAT';
          return _modelStringFailure(
            code,
            'State ' + stateIndex + ' transition ' + tokenIndex + ' has an invalid target.',
            {
              offset: transitionOffset,
              stateIndex: stateIndex,
              tokenIndex: tokenIndex,
              token: transitionString,
            }
          );
        }

        const targetIndex = Number(targetString);
        if (!Number.isSafeInteger(targetIndex)) {
          return _modelStringFailure(
            'TARGET_NOT_SAFE_INTEGER',
            'State ' + stateIndex + ' transition ' + tokenIndex + ' target is not a safe integer.',
            {
              offset: transitionOffset,
              stateIndex: stateIndex,
              tokenIndex: tokenIndex,
              token: transitionString,
            }
          );
        }
        transitionsToAdd.push({
          source: stateIndex,
          target: targetIndex,
          agent: agent,
          offset: transitionOffset,
          tokenIndex: tokenIndex,
          token: transitionString,
        });
        transitionOffset += transitionString.length + 1;
      }

      stateOffset += stateString.length + 1;
    }

    let duplicateTransitionsSuppressed = 0;
    for (const transition of transitionsToAdd) {
      if (transition.target < 0 || transition.target >= states.length) {
        return _modelStringFailure(
          'TARGET_OUT_OF_RANGE',
          'State ' + transition.source + ' transition ' + transition.tokenIndex +
            ' targets out-of-range world ' + transition.target + '.',
          {
            offset: transition.offset,
            stateIndex: transition.source,
            tokenIndex: transition.tokenIndex,
            token: transition.token,
            target: transition.target,
          }
        );
      }
      if (states[transition.target] === null) {
        return _modelStringFailure(
          'TARGET_NOT_LIVE',
          'State ' + transition.source + ' transition ' + transition.tokenIndex +
            ' targets null world ' + transition.target + '.',
          {
            offset: transition.offset,
            stateIndex: transition.source,
            tokenIndex: transition.tokenIndex,
            token: transition.token,
            target: transition.target,
          }
        );
      }

      const successors = states[transition.source].successors;
      const isDuplicate = successors.some(function(successor) {
        return successor.target === transition.target && successor.agent === transition.agent;
      });
      if (isDuplicate) {
        duplicateTransitionsSuppressed++;
      } else {
        successors.push({ target: transition.target, agent: transition.agent });
      }
    }

    return {
      ok: true,
      modelData: { states: states },
      stateCount: states.length,
      liveStateCount: states.filter(function(state) { return state !== null; }).length,
      nullStateIndices: states.map(function(state, index) {
        return state === null ? index : null;
      }).filter(function(index) { return index !== null; }),
      duplicateTransitionsSuppressed: duplicateTransitionsSuppressed,
    };
  }

  /**
   * Constructor for Kripke model. Takes no initial input.
   * @constructor
   */
  function _copyTrueAssignment(assignment) {
    var processedAssignment = Object.create(null);
    if (assignment === null || typeof assignment === 'undefined') return processedAssignment;

    Object.keys(Object(assignment)).forEach(function(propvar) {
      if (assignment[propvar] === true) processedAssignment[propvar] = true;
    });
    return processedAssignment;
  }

  function Model() {
    // Array of states (worlds) in model.
    // Each state is an object with two properties:
    // - assignment: a truth assignment (in which only true values are actually stored)
    // - successors: an array of successors, each successor is an accessible target state and an agent
    // ex: [{assignment: {},          successors: [{target: 0, agent: 'a'}, {target: 1, agent: 'a'}]},
    //      {assignment: {'p': true}, successors: []   }]
    var _states = [];

    /**
     * Adds a transition to the model, given source and target state indices.
     */
    this.addTransition = function (source, target, agent) {
      if (!_states[source] || !_states[target]) return;

      const successors = _states[source].successors;
      const isTransitionNew = successors.every((el) => el.target !== target || el.agent !== agent);

      if (isTransitionNew) {
        successors.push({ target, agent });
      }
    };

    /**
     * Removes a transition from the model, given source and target state indices.
     */
    this.removeTransition = function (source, target, agent) {
      if (!_states[source]) return;

      const successors = _states[source].successors;
      for (let index = successors.length - 1; index >= 0; index--) {
        const successor = successors[index];
        const matchesAgent = agent ? successor.agent === agent : true;
        if (successor.target === target && matchesAgent) {
          successors.splice(index, 1);
        }
      }
    };

    /**
     * Returns an array of successor states for a given state index and optional agent.
     */
    this.getSuccessorsOf = function (source, agent) {
      if (!_states[source]) return [];

      if (agent) {
        return _states[source].successors.filter(successor => successor.agent === agent);
      } else {
        return _states[source].successors;
      }
    };

    /**
     * Adds a state with a given assignment to the model.
     */
    this.addState = function (assignment) {
      var processedAssignment = _copyTrueAssignment(assignment);
      _states.push({assignment: processedAssignment, successors: []});
      const stateIndex = _states.length - 1;
      return stateIndex;
    };

    /**
     * Edits the assignment of a state in the model, given a state index and a new partial assignment.
     */
    this.editState = function (state, assignment) {
      if (!_states[state]) return;

      var stateAssignment = _states[state].assignment;
      Object.keys(Object(assignment || {})).forEach(function(propvar) {
        if (assignment[propvar] === true) stateAssignment[propvar] = true;
        else if (assignment[propvar] === false) delete stateAssignment[propvar];
      });
    };

    /**
     * Removes a state and all related transitions from the model, given a state index.
     */
    this.removeState = function (state) {
      if (!_states[state]) return;
      var self = this;

      _states[state] = null;
      _states.forEach(function (source, index) {
        if (source) self.removeTransition(index, state);
      });
    };

    /**
     * Returns an array containing the assignment (or null) of each state in the model.
     * (Only true propositional variables are returned in each assignment.)
     */
    this.getStates = function () {
      var stateList = [];
      _states.forEach(function (state) {
        if (state) stateList.push(state.assignment);
        else stateList.push(null);
      });

      return stateList;
    };

    /**
     * Returns the truth value of a given propositional variable at a given state index.
     */
    this.valuation = function (propvar, state) {
      if (!_states[state]) throw new Error('State ' + state + ' not found!');

      return Object.prototype.hasOwnProperty.call(_states[state].assignment, propvar) &&
        _states[state].assignment[propvar] === true;
    };

    /**
     * Returns current model as a compact string suitable for use as a URL parameter.
     * ex: [{
     *        assignment: {'q': true},
     *        successors: [{target: 0, agent: 'a'}, {target: 2, agent: 'a'}]
     *      },
     *      null,
     *      {assignment: {}, successors: []}
     *      ]
     *     compresses to 'AqS0a,2a;;AS;'
     */
    this.getModelString = function () {
      let modelString = '';

      for (const state of _states) {
        modelString += this.getStateString(state);
      }

      return modelString.slice(0, modelString.length-1); // remove trailing ';'
    };

    /**
     * Returns the given state represented as a compact string, used as part of a
     * compact model string.
     */
    this.getStateString = function (state) {
      if (!state) {
        return ';';
      } else {
        let successorString = '';
          for (const successor of state.successors) {
            successorString += successor.target + successor.agent + ',';
          }

        return 'A' + Object.keys(state.assignment).join('') + 'S' + successorString + ';';
      }
    }

    /**
     * Restores a model from a given model string.
     */
    this.loadFromModelString = function (modelString) {
      const parsed = _parseModelString(modelString);
      if (!parsed.ok) return parsed;

      let nextStates;
      try {
        nextStates = parsed.modelData.states.map(function(state) {
          if (state === null) return null;
          return {
            assignment: _copyTrueAssignment(state.assignment),
            successors: state.successors.map(function(successor) {
              return { target: successor.target, agent: successor.agent };
            }),
          };
        });
      } catch (error) {
        return _modelStringFailure(
          'COMMIT_PREPARATION_FAILED',
          'The validated compact model could not be prepared for commit.',
          { cause: error && error.message ? error.message : String(error) }
        );
      }

      // The sole mutation occurs after the complete model has been parsed,
      // validated, and independently cloned into its final representation.
      _states = nextStates;
      return {
        ok: true,
        stateCount: parsed.stateCount,
        liveStateCount: parsed.liveStateCount,
        nullStateIndices: parsed.nullStateIndices.slice(),
        duplicateTransitionsSuppressed: parsed.duplicateTransitionsSuppressed,
      };
    };

    /**
     * Resets the model to its initial state with no states or transitions
     */
    this.removeAllStatesAndTransitions = function () {
      _states = [];
    }

    /**
     * An agent's relation is reflexive iff ∀w Rww
     * i.e. for all states w: w is a successor of itself.
     */
    this.isReflexive = function(agent) {
      return _states.every((stateW, w) => stateW === null || this.isSuccessor(w, w, agent));
    }

    /**
     * An agent's relation is transitive iff ∀u∀v∀w (Ruv∧Rvw)→Ruw
     * i.e. for all states u, v, and w: If v is a successor of u and w is a successor of v, then
     * w is a successor of u.
     */
    this.isTransitive = function(agent) {
      return _states.every((stateU, u) =>
        stateU === null ||
        this.getSuccessorsOf(u, agent).every(successorV =>
          this.getSuccessorsOf(successorV.target, agent).every(successorW =>
            this.isSuccessor(u, successorW.target, agent)
          )
        )
      );
    }

    /**
     * An agent's relation is symmetric iff ∀w∀v Rwv -> Rvw
     * i.e. for all states w and v: If v is a successor of w, then w must be a successor of v.
     */
    this.isSymmetric = function(agent) {
      return _states.every((stateW, w) =>
        stateW === null ||
        this.getSuccessorsOf(w, agent).every(successorV =>
          this.isSuccessor(successorV.target, w, agent)
        )
      );
    }

    /**
     * An agent's relation is an equivalence relation iff it is reflexive,
     * symmetric, and transitive on the live states.
     */
    this.isEquivalenceRelation = function(agent) {
      return this.isReflexive(agent) &&
        this.isSymmetric(agent) &&
        this.isTransitive(agent);
    }

    /**
     * Get's all the agents currently present in all state's successors.
     */
    this.getActiveAgents = function() {
      const activeAgents = new Set();
      for (const state of _states) {
        if (state !== null) {
          for (const successor of state.successors) {
            activeAgents.add(successor.agent);
          }
        }
      }
      return [...activeAgents].sort();
    }

    /**
     * Gives a boolean answer for whether state2 is a successor of state1.
     */
    this.isSuccessor = function(stateIndex1, stateIndex2, agent) {
      const state1 = _states[stateIndex1];
      if (!state1) return false;
      if (agent) {
        return state1.successors
          .some(successor => successor.agent === agent && successor.target === stateIndex2);
      } else {
        return state1.successors.some(successor => successor.target === stateIndex2);
      }
    }

    /**
     * Replaces an agent's relation with its least equivalence closure on the
     * live states. Existing directed edges induce undirected connected
     * components; each component is then completed in both directions,
     * including its reflexive loops. Returns the completed components.
     */
    this.closeEquivalenceRelation = function(agent) {
      if (!agent) return [];

      const liveStates = [];
      const adjacency = new Map();
      _states.forEach((state, stateIndex) => {
        if (!state) return;
        liveStates.push(stateIndex);
        adjacency.set(stateIndex, new Set());
      });

      _states.forEach((state, sourceIndex) => {
        if (!state) return;
        state.successors.forEach(successor => {
          if (successor.agent !== agent || !adjacency.has(successor.target)) return;
          adjacency.get(sourceIndex).add(successor.target);
          adjacency.get(successor.target).add(sourceIndex);
        });
      });

      const visited = new Set();
      const components = [];
      liveStates.forEach(startState => {
        if (visited.has(startState)) return;

        const component = [];
        const queue = [startState];
        visited.add(startState);
        while (queue.length > 0) {
          const current = queue.shift();
          component.push(current);
          [...adjacency.get(current)].sort((a, b) => a - b).forEach(neighbor => {
            if (visited.has(neighbor)) return;
            visited.add(neighbor);
            queue.push(neighbor);
          });
        }

        component.sort((a, b) => a - b);
        component.forEach(sourceIndex => {
          component.forEach(targetIndex => {
            this.addTransition(sourceIndex, targetIndex, agent);
          });
        });
        components.push(component);
      });

      return components;
    }

    /**
     * Closes each named agent relation independently and deterministically.
     */
    this.closeEquivalenceRelations = function(agents) {
      return [...new Set(agents || [])]
        .filter(agent => !!agent)
        .sort()
        .map(agent => ({
          agent,
          components: this.closeEquivalenceRelation(agent),
        }));
    }

    /**
     * Stores reflexive loops for all worlds and closes the connected component
     * containing the given states under symmetry and transitivity. Returns the
     * affected component state indices.
     */
    this.closeEquivalenceClass = function(agent, seedStates) {
      if (!agent) return [];

      const seeds = (seedStates || []).filter(stateIndex => _states[stateIndex]);
      if (seeds.length === 0) return [];

      const component = new Set(seeds);
      const queue = seeds.slice();

      while (queue.length > 0) {
        const current = queue.shift();

        _states.forEach((state, sourceIndex) => {
          if (!state) return;

          const related =
            this.isSuccessor(current, sourceIndex, agent) ||
            this.isSuccessor(sourceIndex, current, agent);

          if (related && !component.has(sourceIndex)) {
            component.add(sourceIndex);
            queue.push(sourceIndex);
          }
        });
      }

      _states.forEach((state, stateIndex) => {
        if (state) this.addTransition(stateIndex, stateIndex, agent);
      });

      const classStates = [...component].sort((a, b) => a - b);
      classStates.forEach(sourceIndex => {
        classStates.forEach(targetIndex => {
          this.addTransition(sourceIndex, targetIndex, agent);
        });
      });

      return classStates;
    }

    /**
     * Returns an identical, but seperate, copy of this MPL model.
     */
    this.deepCopy = function() {
      const copy = new MPL.Model();
      const statesToRemove = [];
      copy.copied = true;

      _states.forEach((state, stateIndex) => {
        if (state) {
          copy.addState(state.assignment);
        } else {
          copy.addState({});
          statesToRemove.push(stateIndex);
        }
      });

      _states.forEach((state, sourceIndex) => {
        if (!state) return;

        state.successors.forEach(successor => {
          copy.addTransition(sourceIndex, successor.target, successor.agent);
        });
      });

      statesToRemove.forEach(stateIndex => {
        copy.removeState(stateIndex);
      });

      return copy;
    }

    this.getRawStates = function() {
      return _states;
    }
  }

  /**
   * Evaluate the truth of an MPL wff (in JSON representation) at a given state within a given model.
   * @private
   */
  function _valuationKey(assignment) {
    return Object.keys(assignment).sort().join(',');
  }

  function _truth(model, state, json) {
    if (json.prop)
      return model.valuation(json.prop, state);
    else if (json.neg)
      return !_truth(model, state, json.neg);
    else if (json.kno_start && json.kno_start.kno_end && json.kno_start.kno_end[0].prop) {
      const agents = json.kno_start.kno_end[0].prop.split('');
      return agents.every(agent => model.getSuccessorsOf(state).every(
          (succ) => succ.agent !== agent || _truth(model, succ.target, json.kno_start.kno_end[1])
      ));
    } else if (json.annce_start && json.annce_start.annce_end) {
      if (_truth(model, state, json.annce_start.annce_end[0])) {
        const postAnnouncementModel = model.deepCopy();
        postAnnouncementModel.getRawStates().forEach((stateW, w) => {
          if (stateW && !_truth(model, w, json.annce_start.annce_end[0])) {
            postAnnouncementModel.removeState(w);
          }
        });
        return _truth(postAnnouncementModel, state, json.annce_start.annce_end[1])
      } else {
        return true;
      }
    } else if (json.conj)
      return (_truth(model, state, json.conj[0]) && _truth(model, state, json.conj[1]));
    else if (json.disj)
      return (_truth(model, state, json.disj[0]) || _truth(model, state, json.disj[1]));
    else if (json.impl)
      return (!_truth(model, state, json.impl[0]) || _truth(model, state, json.impl[1]));
    else if (json.equi)
      return (_truth(model, state, json.equi[0]) === _truth(model, state, json.equi[1]));
    else if (json.nec)
      return model.getSuccessorsOf(state).every((succ) => _truth(model, succ.target, json.nec));
    else if (json.poss)
      return model.getSuccessorsOf(state).some((succ) => _truth(model, succ.target, json.poss));
    else if (json.bapal) {
      const states = model.getRawStates();
      // 排除掉模型中被 removeState 变成 null 的点
      if (!states[state]) return false;

      const currentAssignment = _valuationKey(states[state].assignment);
      const uniqueValuations = [];
      states.forEach(s => {
        if (s) {
          const valStr = _valuationKey(s.assignment);
          if (!uniqueValuations.includes(valStr)) uniqueValuations.push(valStr);
        }
      });

      const powerSet = (arr) => arr.reduce((a, v) => a.concat(a.map(r => [v, ...r])), [[]]);
      const possibleSubsets = powerSet(uniqueValuations).filter(sub => sub.includes(currentAssignment));

      return possibleSubsets.some(subsetValuations => {
        const postModel = model.deepCopy();
        postModel.getRawStates().forEach((stateW, w) => {
          if (stateW && !subsetValuations.includes(_valuationKey(stateW.assignment))) {
            postModel.removeState(w);
          }
        });
        return _truth(postModel, state, json.bapal);
      });
    }
    else
      throw new Error('Invalid formula!');
  }

  /**
   * Evaluate the truth of an MPL wff at a given state within a given model.
   */
  function truth(model, state, wff) {
    if (!(model instanceof MPL.Model)) throw new Error('Invalid model!');
    if (!model.getStates()[state]) throw new Error('State ' + state + ' not found!');
    if (!(wff instanceof MPL.Wff)) throw new Error('Invalid wff!');

    return _truth(model, state, wff.json());
  }

  // export public methods
  return {
    Wff: Wff,
    Model: Model,
    parseModelString: _parseModelString,
    truth: truth
  };

})(FormulaParser);
