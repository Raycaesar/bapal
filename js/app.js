/**
 * Modal Logic Playground -- application code
 *
 * Dependencies: D3, MathJax, MPL
 *
 * Copyright (c) 2013 Ross Kirsling
 * Released under the MIT License.
 */

// app mode constants
var MODE = {
      EDIT: 0,
      EVAL: 1
    },
    appMode = MODE.EDIT;

// set up initial MPL model (loads saved model if available, default otherwise)
var propvars = ['p','q','r','s','t'],
    varCount = 2;

let epistemicAgents = ['a', 'b', 'c', 'd', 'e'];
let currentEpistemicAgent = 'a';

const agentButtons = d3.selectAll('#edit-pane .agent-btns button');

const model = new MPL.Model();
let modelString = ';AS0a,';

const modelParam = window.location.search.match(/\?model=(.*)/);
if (modelParam) modelString = modelParam[1];
const formulaParam = window.location.search.match(/\?formula=(.*)/);

model.loadFromModelString(modelString);

// set up initial nodes and links (edges) of graph, based on MPL model
var lastNodeId = -1,
    nodes = [],
    links = [];

// --> nodes setup
var states = model.getStates();
const propVarsInUse = new Set();
states.forEach(function(state) {
  if(!state) { lastNodeId++; return; }

  var defaultVals = propvars.map(function() { return false; }),
      node = {id: ++lastNodeId, vals: defaultVals};

  for(var propvar in state) {
    propVarsInUse.add(propvar);
    var index = propvars.indexOf(propvar);
    if(index !== -1) {
      node.vals[index] = true;
      varCount = Math.max(varCount, index+1); // set correct var count from state
    }
  }

  nodes.push(node);
});


// --> links setup
for (const source of nodes) {
  const sourceId = source.id;
  for (const succ of model.getSuccessorsOf(sourceId)) {
    const targetId = succ.target;
    if(sourceId === targetId) {
      links.push({source: source, target: source, left: true, right: true, agent: succ.agent });
      continue;
    }

    const target = nodes.filter(function(node) { return node.id === targetId; })[0];
    const link = links.filter(l => l.source === target && l.target === source && l.agent === succ.agent)[0];

    if (link) {
      if(sourceId < targetId) {
        link.right = true;
      } else {
        link.left = true;
      }
    } else {
      if(sourceId < targetId) {
        links.push({source: source, target: target, left: false, right: true, agent: succ.agent });
      } else {
        links.push({source: target, target: source, left: true, right: false, agent: succ.agent });
      }
    }
  }
}

// set up SVG for D3
var width  = 640,
    height = 540,
    colors = d3.scale.category10();

var svg = d3.select('#app-body .graph')
  .append('svg')
  .on('contextmenu', function() { d3.event.preventDefault(); })
  .attr('width', width)
  .attr('height', height);

// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(180)
    .charge(-800)
    .on('tick', tick);

for (const agent of epistemicAgents) {
  // define agent markers for graph links
  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'mid-arrow-'+agent)
      .attr('viewBox', '-2 -5 10 10')
      .attr('refX', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 0)
    .append('svg:text')
      .text(agent)
      .classed('agent-text', true)
      .classed('agent-'+agent, true);

  // define arrow markers for graph links
  svg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-'+agent)
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 6)
  .attr('markerWidth', 4)
  .attr('markerHeight', 4)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5')
  .classed('agent-'+agent, true);

  svg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-'+agent)
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 4)
  .attr('markerWidth', 4)
  .attr('markerHeight', 4)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M10,-5L0,0L10,5')
  .attr('fill', '#000')
  .classed('agent-'+agent, true);
}

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0Q0 0, 0 0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// handles for dynamic content in panel
var varCountButtons = d3.selectAll('#edit-pane .var-count button'),
    varTable = d3.select('#edit-pane table.propvars'),
    varTableRows = varTable.selectAll('tr'),
    selectedNodeLabel = d3.select('#edit-pane .selected-node-id'),
    evalInput = d3.select('#eval-pane .eval-input'),
    evalOutput = d3.select('#eval-pane .eval-output'),
    currentFormula = d3.select('#app-body .current-formula');

function announceFormula() {
  // make sure a formula has been input
  var formula = evalInput.select('input').node().value;
  formula = formula.split(',').join(''); // remove commas for parsing
  formula = formula.split('[').join('[(');
  formula = formula.split(']').join(')]');
  if(!formula) {
    evalOutput
      .html('<div class="alert">No formula!</div>')
      .classed('inactive', false);
    return;
  }

  // parse formula and catch bad input
  var wff = null;
  try {
    wff = new MPL.Wff(formula);
  } catch(e) {
    console.log(e);
    evalOutput
      .html('<div class="alert">Invalid formula!</div>')
      .classed('inactive', false);
    return;
  }

  // check formula for bad vars or agents
  const propsAndAgentsInWff = getWffAgentsAndProps(wff.json());
  for (const propOrAgent of propsAndAgentsInWff) {
    if (propOrAgent.prop) {
      if (!propvars.includes(propOrAgent.prop)) {
        evalOutput
          .html(`<div class="alert">Formula contains invalid propositional variable: <b>${propOrAgent.prop}</b></div>`)
          .classed('inactive', false);
        return;
      };
    }
    if (propOrAgent.agent) {
      const agents = propOrAgent.agent.split('');
      for (const agent of agents) {
        if (!epistemicAgents.includes(agent)) {
          evalOutput
            .html(`<div class="alert">Formula contains invalid agent: <b>${agent}</b></div>`)
            .classed('inactive', false);
          return;
        }
      }
    }
  }

  // evaluate formula at each state in model
  var trueStates  = [],
      falseStates = [];
  nodes.forEach(function(node, index) {
    var id = node.id,
        truthVal = MPL.truth(model, id, wff);

    if(truthVal) {
      trueStates.push(id);
    } else {
      falseStates.push(id);
    }
  });
  for (const falseStateId of falseStates) {
    model.removeState(falseStateId);
    const falseNode = nodes.find(node => node.id === falseStateId);
    nodes.splice(nodes.indexOf(falseNode), 1);
    spliceLinksForNode(falseNode);
  }
  onStateModified();
  restart();

  // display evaluated formula
  currentFormula
    .html('<strong>Announced formula:</strong><br>$' + wff.latex() + '$')
    .classed('inactive', false);

  // display truth evaluation
  const latexFalse = falseStates.length ? '$w_{' + falseStates.join('},$ $w_{') + '}$' : '$\\varnothing$';
  evalOutput
    .html('<div class="alert alert-dark"><strong>Worlds removed by announcement:</strong><div><div>' + latexFalse + '</div></div></div>')
    .classed('inactive', false);

  // re-render LaTeX
  MathJax.Hub.Queue(['Typeset', MathJax.Hub, currentFormula.node()]);
  MathJax.Hub.Queue(['Typeset', MathJax.Hub, evalOutput.node()]);
}

function evaluateFormula() {
  // make sure a formula has been input
  var formula = evalInput.select('input').node().value;
  formula = formula.split(',').join(''); // remove commas for parsing
  formula = formula.split('[').join('[(');
  formula = formula.split(']').join(')]');
  if(!formula) {
    evalOutput
      .html('<div class="alert">No formula!</div>')
      .classed('inactive', false);
    return;
  }

  // parse formula and catch bad input
  var wff = null;
  try {
    wff = new MPL.Wff(formula);
  } catch(e) {
    console.log(e);
    evalOutput
      .html('<div class="alert">Invalid formula!</div>')
      .classed('inactive', false);
    return;
  }

  // check formula for bad vars or agents
  const propsAndAgentsInWff = getWffAgentsAndProps(wff.json());
  for (const propOrAgent of propsAndAgentsInWff) {
    if (propOrAgent.prop) {
      if (!propvars.includes(propOrAgent.prop)) {
        evalOutput
          .html(`<div class="alert">Formula contains invalid propositional variable: <b>${propOrAgent.prop}</b></div>`)
          .classed('inactive', false);
        return;
      };
    }
    if (propOrAgent.agent) {
      const agents = propOrAgent.agent.split('');
      for (const agent of agents) {
        if (!epistemicAgents.includes(agent)) {
          evalOutput
            .html(`<div class="alert">Formula contains invalid agent: <b>${agent}</b></div>`)
            .classed('inactive', false);
          return;
        }
      }
    }
  }
  onStateModified();

  // evaluate formula at each state in model
  var trueStates  = [],
      falseStates = [];
  nodes.forEach(function(node, index) {
    var id = node.id,
        truthVal = MPL.truth(model, id, wff);

    if(truthVal) trueStates.push(id);
    else falseStates.push(id);

    d3.select(circle[0][index])
      .classed('waiting', false)
      .classed('true', truthVal)
      .classed('false', !truthVal);
  });

  // display evaluated formula
  currentFormula
    .html('<strong>Current formula:</strong><br>$' + wff.latex() + '$')
    .classed('inactive', false);
  // new
  if (typeof MathJax !== 'undefined') {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, evalOutput.node()]);
  }

  // display truth evaluation
  var latexTrue  =  trueStates.length ? '$w_{' +  trueStates.join('},$ $w_{') + '}$' : '$\\varnothing$',
      latexFalse = falseStates.length ? '$w_{' + falseStates.join('},$ $w_{') + '}$' : '$\\varnothing$';
  evalOutput
    .html('<div class="alert alert-success"><strong>True:</strong><div><div>' + latexTrue + '</div></div></div>' +
          '<div class="alert alert-danger"><strong>False:</strong><div><div>' + latexFalse + '</div></div></div>')
    .classed('inactive', false);

  // re-render LaTeX
  MathJax.Hub.Queue(['Typeset', MathJax.Hub, currentFormula.node()]);
  MathJax.Hub.Queue(['Typeset', MathJax.Hub, evalOutput.node()]);
}

/**
   * Returns an array of all propositional variables and agents used in the given Wff json.
   * i.e. [{ prop: 'p' }, { prop: 'q' }, { agent: 'b' }]
   */
function getWffAgentsAndProps(json) {
  var results = [];
  if (!json) return results;

  if (json.prop) {
    results.push({ prop: json.prop });
  } else if (json.neg) {
    results = results.concat(getWffAgentsAndProps(json.neg));
  } else if (json.nec) {
    results = results.concat(getWffAgentsAndProps(json.nec));
  } else if (json.poss) {
    results = results.concat(getWffAgentsAndProps(json.poss));
  } else if (json.bapal) {
    results = results.concat(getWffAgentsAndProps(json.bapal));
  } else if (json.conj || json.disj || json.impl || json.equi) {
    var key = json.conj ? 'conj' : (json.disj ? 'disj' : (json.impl ? 'impl' : 'equi'));
    results = results.concat(getWffAgentsAndProps(json[key][0]));
    results = results.concat(getWffAgentsAndProps(json[key][1]));
  } else if (json.annce_start && json.annce_start.annce_end) {
    // annce_end[0] is the announced formula, annce_end[1] is the body
    results = results.concat(getWffAgentsAndProps(json.annce_start.annce_end[0]));
    results = results.concat(getWffAgentsAndProps(json.annce_start.annce_end[1]));
  } else if (json.kno_start && json.kno_start.kno_end) {
    // kno_end[0] is the agent prop, kno_end[1] is the formula
    if (json.kno_start.kno_end[0] && json.kno_start.kno_end[0].prop) {
      results.push({ agent: json.kno_start.kno_end[0].prop });
    }
    results = results.concat(getWffAgentsAndProps(json.kno_start.kno_end[1]));
  }

  // 使用原生 JS 方法去重并返回数组
  return results.filter(function(item, pos) {
    return results.indexOf(item) == pos;
  });
}


// set selected node and notify panel of changes
function setSelectedNode(node) {
  selected_node = node;

  // update selected node label
  selectedNodeLabel.html(selected_node ? '<strong>World '+selected_node.id+'</strong>' : 'No world selected');

  // update variable table
  if(selected_node) {
    var vals = selected_node.vals;
    varTableRows.each(function(d,i) {
      d3.select(this).select('.var-value .btn-success').classed('active', vals[i]);
      d3.select(this).select('.var-value .btn-danger').classed('active', !vals[i]);
    });
  }
  varTable.classed('inactive', !selected_node);
}

// get truth assignment for node as a displayable string
function makeAssignmentString(node) {
  var vals = node.vals,
      outputVars = [];

  for(var i = 0; i < varCount; i++) {
    // attach 'not' symbol to false values
    outputVars.push((vals[i] ? '' : '\u00ac') + propvars[i]);
  }

  return outputVars.join(', ');
}

function setCurrentAgent(agentNumber) {
  currentEpistemicAgent = epistemicAgents[agentNumber];

  // update variable count button states
  agentButtons.each(function(d,i) {
    if(currentEpistemicAgent !== epistemicAgents[i]) d3.select(this).classed('active', false);
    else d3.select(this).classed('active', true);
  });
}

// set # of vars currently in use and notify panel of changes
function setVarCount(count) {
  varCount = count;

  // update variable count button states
  varCountButtons.each(function(d,i) {
    if(i !== varCount-1) d3.select(this).classed('active', false);
    else d3.select(this).classed('active', true);
  });

  //update graph text
  circle.selectAll('text:not(.id)').text(makeAssignmentString);

  //update variable table rows
  varTableRows.each(function(d,i) {
    if(i < varCount) d3.select(this).classed('inactive', false);
    else d3.select(this).classed('inactive', true);
  });
}

function setVarForSelectedNode(varnum, value) {
  //update node in graph and state in model
  selected_node.vals[varnum] = value;
  var update = {};
  update[propvars[varnum]] = value;
  model.editState(selected_node.id, update);
  onStateModified();

  //update buttons
  var row = d3.select(varTableRows[0][varnum]);
  row.select('.var-value .btn-success').classed('active', value);
  row.select('.var-value .btn-danger').classed('active', !value);

  //update graph text
  circle.selectAll('text:not(.id)').text(makeAssignmentString);
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  //TODO: change the ending position of arrows depending on the agent
  path.attr('d', function(d) {
    let angle = 0;
    if (d.agent === 'a') angle = 0;
    if (d.agent === 'b') angle = -0.5;
    if (d.agent === 'c') angle = 0.5;
    if (d.agent === 'd') angle = -1;
    if (d.agent === 'e') angle = 1;

    if (d.source === d.target) {
      let selfLoopOffset = [1, 0];
      selfLoopOffset = rotateByAngle(selfLoopOffset, -angle);
      return getDoubleCurvedSVGPath([d.source.x, d.source.y], [d.source.x+selfLoopOffset[0], d.source.y+selfLoopOffset[1]], 30);
    }

    const facing = normalize([
      d.target.x - d.source.x,
      d.target.y - d.source.y
    ]);
    const sourceNorm = rotateByAngle(facing, -angle);
    const targetNorm = rotateByAngle(facing, angle + Math.PI);
    const sourcePadding = d.left ? 21 : 16;
    const targetPadding = d.right ? 21 : 16;
    const sourceX = d.source.x + (sourcePadding * sourceNorm[0]),
        sourceY = d.source.y + (sourcePadding * sourceNorm[1]),
        targetX = d.target.x + (targetPadding * targetNorm[0]),
        targetY = d.target.y + (targetPadding * targetNorm[1]);

    let mul = 0;
    if (d.agent === 'a') mul = 0;
    if (d.agent === 'b') mul = -20;
    if (d.agent === 'c') mul = 20;
    if (d.agent === 'd') mul = -40;
    if (d.agent === 'e') mul = 40;

    return getDoubleCurvedSVGPath([sourceX, sourceY], [targetX, targetY], mul);
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

function getDoubleCurvedSVGPath([x1, y1], [x2, y2], curviness) {
  const facing = [
    x2 - x1,
    y2 - y1,
  ];
  const orthogonalUnit = rotate90deg(normalize(facing));

  const curveCtrlPoint = [
    x1 + facing[0]/2 + orthogonalUnit[0]*curviness,
    y1 + facing[1]/2 + orthogonalUnit[1]*curviness
  ]

  return 'M' + x1 + ',' + y1 +
    getSingleCurvedSVGPath([x1, y1], curveCtrlPoint, curviness/2) +
    getSingleCurvedSVGPath(curveCtrlPoint, [x2, y2], curviness/2);
}

function getSingleCurvedSVGPath([x1, y1], [x2, y2], curviness) {
  const facing = [
    x2 - x1,
    y2 - y1,
  ];
  const orthogonalUnit = rotate90deg(normalize(facing));

  return 'Q' + (x1 + facing[0]/2 + orthogonalUnit[0]*curviness) + ' ' + (y1 + facing[1]/2 + orthogonalUnit[1]*curviness) +
      ',' + x2 + ' ' + y2;
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  function mid(d) {
    return `url(#mid-arrow-${d.agent})`;
  }
  function start(d) {
    return d.left ? `url(#start-arrow-${d.agent})` : '';
  }
  function end(d) {
    return d.right ? `url(#end-arrow-${d.agent})` : '';
  }

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .classed('agent-a', function(d) { return d.agent === 'a'; })
    .classed('agent-b', function(d) { return d.agent === 'b'; })
    .classed('agent-c', function(d) { return d.agent === 'c'; })
    .classed('agent-d', function(d) { return d.agent === 'd'; })
    .classed('agent-e', function(d) { return d.agent === 'e'; })
    .style('marker-start', start)
    .style('marker-end', end)
    .style('marker-mid', mid);

  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .classed('agent-a', function(d) { return d.agent === 'a'; })
    .classed('agent-b', function(d) { return d.agent === 'b'; })
    .classed('agent-c', function(d) { return d.agent === 'c'; })
    .classed('agent-d', function(d) { return d.agent === 'd'; })
    .classed('agent-e', function(d) { return d.agent === 'e'; })
    .style('marker-start', start)
    .style('marker-end', end)
    .style('marker-mid', mid)
    .on('mousedown', function(d) {
      if(appMode !== MODE.EDIT || d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      setSelectedNode(null);
      restart();
    });

  // remove old links
  path.exit().remove();

  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', d => (d === selected_node) ? d3.rgb(colors(d.id)).brighter() : colors(d.id))
    .style('stroke-width', '3px')
    .style('stroke', d => (d === selected_node) ? 'black': 'transparent');

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 15)
    .style('fill', d => (d === selected_node) ? d3.rgb(colors(d.id)).brighter() : colors(d.id))
    .style('stroke-width', '3px')
    .style('stroke', d => (d === selected_node) ? 'black': 'transparent')
    .on('mouseover', function(d) {
      if(appMode !== MODE.EDIT || !mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(appMode !== MODE.EDIT || !mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {
      if(appMode !== MODE.EDIT || d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) setSelectedNode(null);
      else setSelectedNode(mousedown_node);
      selected_link = null;

      // start dragging with drag line
      drag_line
        .style('marker-end', `url(#end-arrow-${currentEpistemicAgent})`)
        .classed('hidden', false)
        .classed('agent-a', function() { return currentEpistemicAgent === 'a'; })
        .classed('agent-b', function() { return currentEpistemicAgent === 'b'; })
        .classed('agent-c', function() { return currentEpistemicAgent === 'c'; })
        .classed('agent-d', function() { return currentEpistemicAgent === 'd'; })
        .classed('agent-e', function() { return currentEpistemicAgent === 'e'; })
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'Q' + mousedown_node.x + ' ' + mousedown_node.y + ',' + mousedown_node.x + ' ' + mousedown_node.y)
        .style('marker-mid', mid);

      function mid() {
        return `url(#mid-arrow-${currentEpistemicAgent})`;
      }

      restart();
    })
    .on('mouseup', function(d) {
      if(appMode !== MODE.EDIT || !mousedown_node) return;

      // drag line dropped ontop of a node
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add transition to model
      model.addTransition(mousedown_node.id, mouseup_node.id, currentEpistemicAgent);
      onStateModified();

      // add link to graph (update if exists)
      // note: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      if(mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
      } else {
        source = mouseup_node;
        target = mousedown_node;
        direction = 'left';
      }

      var link = links.filter(function(l) {
        return (l.source === source && l.target === target && l.agent === currentEpistemicAgent);
      })[0];

      if(link) {
        link[direction] = true;
      } else {
        link = {source: source, target: target, left: false, right: false, agent: currentEpistemicAgent};
        link[direction] = true;
        links.push(link);
      }

      // select new link
      selected_link = link;
      setSelectedNode(null);
      restart();
    });

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .attr('fill', 'white')
      .text(function(d) { return d.id; });

  // text shadow
  g.append('svg:text')
      .attr('x', 18)
      .attr('y', 4)
      .attr('class', 'shadow')
      .text(makeAssignmentString);

  // text foreground
  g.append('svg:text')
      .attr('x', 18)
      .attr('y', 4)
      .text(makeAssignmentString);

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

// Set the reflexive, symmetric, and transitive checkboxes to the correct state whenever the model
// changes. Also update the URL with the shareable model and formula state.
function onStateModified() {
  const modelString = '?model=' + model.getModelString();
  let formulaString = '?formula=' + evalInput.select('input').node().value;
  formulaString = formulaString.split(' ').join(''); //remove spaces
  formulaString = formulaString.split('>').join(''); //remove > (> doesn't work in URLs)
  history.pushState({}, '', location.pathname + modelString + formulaString);

  const reflexiveCheckEl = document.getElementById('reflexive-check');
  const symmetricCheckEl = document.getElementById('symmetric-check');
  const transitiveCheckEl = document.getElementById('transitive-check');

  const activeAgents = model.getActiveAgents();
  if (activeAgents.length === 0) {
    reflexiveCheckEl.checked = false;
    symmetricCheckEl.checked = false;
    transitiveCheckEl.checked = false;
    document.getElementById('checks-title').innerHTML =
    `No agents in use!`;
  } else {
    let reflexiveForActiveAgents = true;
    let symmetricForActiveAgents = true;
    let transitiveForActiveAgents = true;
    for (const agent of activeAgents) {
      reflexiveForActiveAgents = reflexiveForActiveAgents && model.isReflexive(agent);
      symmetricForActiveAgents = symmetricForActiveAgents && model.isSymmetric(agent);
      transitiveForActiveAgents = transitiveForActiveAgents && model.isTransitive(agent);
    }
    reflexiveCheckEl.checked = reflexiveForActiveAgents;
    symmetricCheckEl.checked = symmetricForActiveAgents;
    transitiveCheckEl.checked = transitiveForActiveAgents;
    document.getElementById('checks-title').innerHTML =
    `For agent${activeAgents.length === 1 ? '' : 's'} ${activeAgents.join()} :`;
  }
}
onStateModified();

function mousedown() {
  // prevent I-bar on drag
  d3.event.preventDefault();

  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

  // insert new node at point
  var point = d3.mouse(this),
      defaultVals = propvars.map(function() { return false; }),
      node = {id: ++lastNodeId, vals: defaultVals};
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);
  setSelectedNode(node);

  // add state to model
  model.addState();
  onStateModified();

  restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // update drag line on move
  const facing = [
    d3.mouse(this)[0] - mousedown_node.x,
    d3.mouse(this)[1] - mousedown_node.y,
  ];
  const orthogonalUnit = rotate90deg(normalize(facing));

  drag_line
    .attr('d', getDoubleCurvedSVGPath([mousedown_node.x, mousedown_node.y], d3.mouse(this), 0))
    .classed('agent-a', function() { return currentEpistemicAgent === 'a'; })
    .classed('agent-b', function() { return currentEpistemicAgent === 'b'; })
    .classed('agent-c', function() { return currentEpistemicAgent === 'c'; })
    .classed('agent-d', function() { return currentEpistemicAgent === 'd'; })
    .classed('agent-e', function() { return currentEpistemicAgent === 'e'; })
    .style('marker-end', `url(#end-arrow-${currentEpistemicAgent})`)
    .style('marker-mid', mid);

  function mid() {
    return `url(#mid-arrow-${currentEpistemicAgent})`;
  }

  restart();
}

function normalize([x, y]) {
  const normalizationFactor = 1/length([x, y]);
  return [x*normalizationFactor, y*normalizationFactor];
}

function length([x, y]) {
  return Math.sqrt(x**2 + y**2);
}

function rotate90deg([x, y]) {
  return [y, -x];
}

function rotateByAngle([x, y], angle) {
  return [Math.cos(angle)*x - Math.sin(angle)*y, Math.sin(angle)*x + Math.cos(angle)*y]
}

function mouseup() {
  if(mousedown_node) {
    // release and hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function removeLinkFromModel(link) {
  const sourceId = link.source.id;
  const targetId = link.target.id;
  const agent = link.agent;

  // remove leftward transition
  if(link.left) model.removeTransition(targetId, sourceId, agent);

  // remove rightward transition
  if(link.right) model.removeTransition(sourceId, targetId, agent);
  onStateModified();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
    return;
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_node) {
        model.removeState(selected_node.id);
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      } else if(selected_link) {
        removeLinkFromModel(selected_link);
        links.splice(links.indexOf(selected_link), 1);
      }
      onStateModified();
      selected_link = null;
      setSelectedNode(null);
      restart();
      break;
    case 66: // B
      if(selected_link) {
        var sourceId = selected_link.source.id,
            targetId = selected_link.target.id;
        const agent = selected_link.agent;
        // set link direction to both left and right
        if(!selected_link.left) {
          selected_link.left = true;
          model.addTransition(targetId, sourceId, agent);
        }
        if(!selected_link.right) {
          selected_link.right = true;
          model.addTransition(sourceId, targetId, agent);
        }
      }
      onStateModified();
      restart();
      break;
    case 76: // L
      if(selected_link) {
        var sourceId = selected_link.source.id,
            targetId = selected_link.target.id;
        const agent = selected_link.agent;
        // set link direction to left only
        if(!selected_link.left) {
          selected_link.left = true;
          model.addTransition(targetId, sourceId, agent);
        }
        if(selected_link.right) {
          selected_link.right = false;
          model.removeTransition(sourceId, targetId, agent);
        }
      }
      onStateModified();
      restart();
      break;
    case 82: // R
      if(selected_node) {
        // toggle node reflexivity
        const reflexiveLink = links.filter(l => l.source === selected_node && l.target === selected_node && l.agent === currentEpistemicAgent)[0];
        if(reflexiveLink) {
          model.removeTransition(selected_node.id, selected_node.id, currentEpistemicAgent);
          removeLinkFromModel(reflexiveLink);
          links.splice(links.indexOf(reflexiveLink), 1);
        } else {
          model.addTransition(selected_node.id, selected_node.id, currentEpistemicAgent);
          links.push({source: selected_node, target: selected_node, left: true, right: true, agent: currentEpistemicAgent});
        }
      } else if(selected_link) {
        var sourceId = selected_link.source.id,
            targetId = selected_link.target.id;
        const agent = selected_link.agent;
        // set link direction to right only
        if(selected_link.left) {
          selected_link.left = false;
          model.removeTransition(targetId, sourceId, agent);
        }
        if(!selected_link.right) {
          selected_link.right = true;
          model.addTransition(sourceId, targetId, agent);
        }
      }
      onStateModified();
      restart();
      break;
  }
}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    // "uncall" force.drag
    // see: https://groups.google.com/forum/?fromgroups=#!topic/d3-js/-HcNN1deSow
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

// handles to mode select buttons and left-hand panel
var modeButtons = d3.selectAll('#mode-select button'),
    panes = d3.selectAll('#app-body .panel .tab-pane');

function setAppMode(newMode) {
  // mode-specific settings
  if(newMode === MODE.EDIT) {
    // enable listeners
    svg.classed('edit', true)
      .on('mousedown', mousedown)
      .on('mousemove', mousemove)
      .on('mouseup', mouseup);
    d3.select(window)
      .on('keydown', keydown)
      .on('keyup', keyup);

    // remove eval classes
    circle
      .classed('waiting', false)
      .classed('true', false)
      .classed('false', false);
    currentFormula.classed('inactive', true);
  } else if(newMode === MODE.EVAL) {
    // disable listeners (except for I-bar prevention)
    svg.classed('edit', false)
      .on('mousedown', function() { d3.event.preventDefault(); })
      .on('mousemove', null)
      .on('mouseup', null);
    d3.select(window)
      .on('keydown', null)
      .on('keyup', null);

    // in case ctrl still held
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
    lastKeyDown = -1;

    // stop showing drag line if the app switches to another mode e.g. from the 'Edit Modal' tab
    // to the 'Evaluate Formula' tab.
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');

    // clear mouse vars
    selected_link = null;
    setSelectedNode(null);
    resetMouseVars();

    // reset eval state
    circle.classed('waiting', true);
    evalOutput.classed('inactive', true);
  } else return;

  // switch button and panel states and set new mode
  modeButtons.each(function(d,i) {
    if(i !== newMode) d3.select(this).classed('active', false);
    else d3.select(this).classed('active', true);
  });
  panes.each(function(d,i) {
    if(i !== newMode) d3.select(this).classed('active', false);
    else d3.select(this).classed('active', true);
  });
  appMode = newMode;

  restart();
}

// allow enter key to evaluate formula
evalInput.select('input')
  .on('keyup', function() {
    // enter
    if(d3.event.keyCode === 13) evaluateFormula();
  })
  .on('keydown', function() {
    // enter -- needed on IE9
    if(d3.event.keyCode === 13) d3.event.preventDefault();
  });

// app starts here
setAppMode(MODE.EDIT);

setVarCount(varCount);

if (formulaParam && formulaParam[1].length > 0) {
  let formulaValue = formulaParam[1];
  formulaValue = formulaValue.split('-').join('->');
  evalInput.select('input').node().value = formulaValue;
  setAppMode(MODE.EVAL);
  evaluateFormula();
}
