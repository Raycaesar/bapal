#!/usr/bin/env python3
"""Independent finite-model semantics for Model and Formula Schema v1.

This module intentionally contains no JavaScript bridge and performs no file or
process I/O.  Callers supply already-decoded Schema v1 JSON documents.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from itertools import product
from typing import Any, Iterator, Mapping, Sequence


class OracleInputError(ValueError):
    """Raised when a supplied Schema v1 document is outside this contract."""


@dataclass(frozen=True)
class Transition:
    target: int
    agent: str


@dataclass(frozen=True)
class World:
    true_atoms: frozenset[str]
    transitions: tuple[Transition, ...]


@dataclass(frozen=True)
class FiniteModel:
    worlds: tuple[World | None, ...]


@dataclass(frozen=True)
class Formula:
    operator: str
    name: str | None = None
    agents: tuple[str, ...] = ()
    arguments: tuple["Formula", ...] = ()


_FORMULA_WORD = re.compile(r"[A-Za-z0-9_]+\Z")
_KNOWLEDGE_UNIT = re.compile(r"[A-Za-z0-9_]\Z")
_UNARY_OPERATORS = frozenset({"not", "box", "diamond", "bapal"})
_BINARY_OPERATORS = frozenset({"and", "or", "implies", "iff"})


def _require_mapping(value: Any, path: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise OracleInputError(f"{path} must be an object")
    return value


def _require_exact_fields(value: Mapping[str, Any], fields: set[str], path: str) -> None:
    actual = set(value)
    if actual != fields:
        missing = sorted(fields - actual)
        extra = sorted(actual - fields)
        details: list[str] = []
        if missing:
            details.append("missing " + ", ".join(missing))
        if extra:
            details.append("unexpected " + ", ".join(extra))
        raise OracleInputError(f"{path} has invalid fields ({'; '.join(details)})")


def _is_integer(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _is_scalar_string(value: Any) -> bool:
    return (
        isinstance(value, str)
        and bool(value)
        and all(not 0xD800 <= ord(character) <= 0xDFFF for character in value)
    )


def parse_model_document(document: Any) -> FiniteModel:
    """Decode a Model Schema v1 document into independent immutable data."""

    root = _require_mapping(document, "model")
    _require_exact_fields(root, {"format", "version", "worlds"}, "model")
    if root["format"] != "bapal-model" or not _is_integer(root["version"]) or root["version"] != 1:
        raise OracleInputError("model must have format 'bapal-model' and integer version 1")
    raw_worlds = root["worlds"]
    if not isinstance(raw_worlds, list):
        raise OracleInputError("model.worlds must be an array")

    decoded: list[World | None] = []
    for world_index, raw_world in enumerate(raw_worlds):
        world_path = f"model.worlds[{world_index}]"
        if raw_world is None:
            decoded.append(None)
            continue
        world_mapping = _require_mapping(raw_world, world_path)
        _require_exact_fields(world_mapping, {"trueAtoms", "transitions"}, world_path)

        raw_atoms = world_mapping["trueAtoms"]
        if not isinstance(raw_atoms, list):
            raise OracleInputError(f"{world_path}.trueAtoms must be an array")
        atoms: list[str] = []
        for atom_index, atom_name in enumerate(raw_atoms):
            if not _is_scalar_string(atom_name):
                raise OracleInputError(
                    f"{world_path}.trueAtoms[{atom_index}] must be a nonempty Unicode scalar string"
                )
            atoms.append(atom_name)
        if len(atoms) != len(set(atoms)):
            raise OracleInputError(f"{world_path}.trueAtoms contains a duplicate atom")

        raw_transitions = world_mapping["transitions"]
        if not isinstance(raw_transitions, list):
            raise OracleInputError(f"{world_path}.transitions must be an array")
        transitions: list[Transition] = []
        seen_transitions: set[tuple[int, str]] = set()
        for transition_index, raw_transition in enumerate(raw_transitions):
            transition_path = f"{world_path}.transitions[{transition_index}]"
            transition_mapping = _require_mapping(raw_transition, transition_path)
            _require_exact_fields(transition_mapping, {"target", "agent"}, transition_path)
            target = transition_mapping["target"]
            agent = transition_mapping["agent"]
            if not _is_integer(target) or target < 0:
                raise OracleInputError(f"{transition_path}.target must be a nonnegative integer")
            if not _is_scalar_string(agent):
                raise OracleInputError(
                    f"{transition_path}.agent must be a nonempty Unicode scalar string"
                )
            identity = (target, agent)
            if identity in seen_transitions:
                raise OracleInputError(f"{world_path}.transitions contains a duplicate transition")
            seen_transitions.add(identity)
            transitions.append(Transition(target, agent))
        decoded.append(World(frozenset(atoms), tuple(transitions)))

    model = FiniteModel(tuple(decoded))
    for source_index in live_domain(model):
        source = model.worlds[source_index]
        assert source is not None
        for transition in source.transitions:
            if transition.target >= len(model.worlds) or model.worlds[transition.target] is None:
                raise OracleInputError(
                    f"model.worlds[{source_index}] has a transition to non-live world {transition.target}"
                )
    return model


def _parse_formula_expression(raw: Any, path: str, active: set[int]) -> Formula:
    expression = _require_mapping(raw, path)
    identity = id(expression)
    if identity in active:
        raise OracleInputError(f"{path} contains a cyclic formula object")
    active.add(identity)
    try:
        operator = expression.get("type")
        if operator == "atom":
            _require_exact_fields(expression, {"type", "name"}, path)
            name = expression["name"]
            if not isinstance(name, str) or not _FORMULA_WORD.fullmatch(name):
                raise OracleInputError(f"{path}.name must be a nonempty ASCII word identifier")
            return Formula("atom", name=name)

        if operator in _UNARY_OPERATORS:
            _require_exact_fields(expression, {"type", "operand"}, path)
            operand = _parse_formula_expression(expression["operand"], f"{path}.operand", active)
            return Formula(str(operator), arguments=(operand,))

        if operator in _BINARY_OPERATORS:
            _require_exact_fields(expression, {"type", "left", "right"}, path)
            left = _parse_formula_expression(expression["left"], f"{path}.left", active)
            right = _parse_formula_expression(expression["right"], f"{path}.right", active)
            return Formula(str(operator), arguments=(left, right))

        if operator == "knowledge":
            _require_exact_fields(expression, {"type", "agents", "operand"}, path)
            raw_agents = expression["agents"]
            if not isinstance(raw_agents, list) or not raw_agents:
                raise OracleInputError(f"{path}.agents must be a nonempty array")
            agents: list[str] = []
            for agent_index, agent in enumerate(raw_agents):
                if not isinstance(agent, str) or not _KNOWLEDGE_UNIT.fullmatch(agent):
                    raise OracleInputError(
                        f"{path}.agents[{agent_index}] must be one ASCII letter, digit, or underscore"
                    )
                agents.append(agent)
            operand = _parse_formula_expression(expression["operand"], f"{path}.operand", active)
            return Formula("knowledge", agents=tuple(agents), arguments=(operand,))

        if operator == "announcement":
            _require_exact_fields(expression, {"type", "precondition", "body"}, path)
            precondition = _parse_formula_expression(
                expression["precondition"], f"{path}.precondition", active
            )
            body = _parse_formula_expression(expression["body"], f"{path}.body", active)
            return Formula("announcement", arguments=(precondition, body))

        raise OracleInputError(f"{path}.type is not a Formula Schema v1 constructor")
    finally:
        active.remove(identity)


def parse_formula_document(document: Any) -> Formula:
    """Decode a Formula Schema v1 document into an independent immutable tree."""

    root = _require_mapping(document, "formula document")
    _require_exact_fields(root, {"format", "version", "formula"}, "formula document")
    if root["format"] != "bapal-formula" or not _is_integer(root["version"]) or root["version"] != 1:
        raise OracleInputError("formula must have format 'bapal-formula' and integer version 1")
    return _parse_formula_expression(root["formula"], "formula document.formula", set())


def live_domain(model: FiniteModel) -> frozenset[int]:
    """Return stable indices of all non-null worlds."""

    return frozenset(index for index, world in enumerate(model.worlds) if world is not None)


def successors(model: FiniteModel, world: int, domain: frozenset[int]) -> tuple[int, ...]:
    """Return all outgoing successor indices still present in ``domain``."""

    source = model.worlds[world]
    if source is None:
        return ()
    return tuple(transition.target for transition in source.transitions if transition.target in domain)


def relation_successors(
    model: FiniteModel, world: int, agent: str, domain: frozenset[int]
) -> tuple[int, ...]:
    """Return successors reached by exactly one relation identity."""

    source = model.worlds[world]
    if source is None:
        return ()
    return tuple(
        transition.target
        for transition in source.transitions
        if transition.agent == agent and transition.target in domain
    )


def valuation_key(model: FiniteModel, world: int) -> frozenset[str]:
    """Return the complete finite-model valuation identity of a live world."""

    selected = model.worlds[world]
    if selected is None:
        raise OracleInputError(f"world {world} is null")
    return selected.true_atoms


def restriction(domain: frozenset[int], retained_worlds: Sequence[int] | frozenset[int]) -> frozenset[int]:
    """Restrict a live domain without renumbering any stable world index."""

    return domain.intersection(retained_worlds)


def valuation_classes(model: FiniteModel, domain: frozenset[int]) -> tuple[frozenset[int], ...]:
    """Partition a domain by exact complete propositional valuations."""

    classes_by_key: dict[frozenset[str], set[int]] = {}
    for world in sorted(domain):
        classes_by_key.setdefault(valuation_key(model, world), set()).add(world)
    classes = (frozenset(members) for members in classes_by_key.values())
    return tuple(sorted(classes, key=lambda members: min(members)))


def boolean_definable_domains(
    model: FiniteModel, domain: frozenset[int], pointed_world: int
) -> Iterator[frozenset[int]]:
    """Enumerate class unions that contain the pointed valuation class."""

    classes = valuation_classes(model, domain)
    pointed_class = next(members for members in classes if pointed_world in members)
    optional_classes = tuple(members for members in classes if members is not pointed_class)
    for choices in product((False, True), repeat=len(optional_classes)):
        selected = set(pointed_class)
        for include, members in zip(choices, optional_classes):
            if include:
                selected.update(members)
        yield frozenset(selected)


class SemanticOracle:
    """Evaluate immutable formulas over immutable finite models."""

    def __init__(self, model: FiniteModel):
        self.model = model
        self.initial_domain = live_domain(model)

    def holds(self, formula: Formula, world: int) -> bool:
        if world not in self.initial_domain:
            raise OracleInputError(f"pointed world {world} is not live")
        return bool(self._holds(formula, self.initial_domain, world))

    @lru_cache(maxsize=None)
    def _holds(self, formula: Formula, domain: frozenset[int], world: int) -> bool:
        if world not in domain:
            raise OracleInputError(f"world {world} is outside the active restriction")

        operator = formula.operator
        arguments = formula.arguments

        if operator == "atom":
            assert formula.name is not None
            return formula.name in valuation_key(self.model, world)

        if operator == "not":
            return not self._holds(arguments[0], domain, world)

        if operator in _BINARY_OPERATORS:
            left_value = self._holds(arguments[0], domain, world)
            if operator == "and":
                return left_value and self._holds(arguments[1], domain, world)
            if operator == "or":
                return left_value or self._holds(arguments[1], domain, world)
            if operator == "implies":
                return (not left_value) or self._holds(arguments[1], domain, world)
            return left_value == self._holds(arguments[1], domain, world)

        if operator == "box":
            return all(self._holds(arguments[0], domain, target) for target in successors(self.model, world, domain))

        if operator == "diamond":
            return any(self._holds(arguments[0], domain, target) for target in successors(self.model, world, domain))

        if operator == "knowledge":
            return all(
                self._holds(arguments[0], domain, target)
                for agent in formula.agents
                for target in relation_successors(self.model, world, agent, domain)
            )

        if operator == "announcement":
            precondition, body = arguments
            if not self._holds(precondition, domain, world):
                return True
            retained = frozenset(
                candidate
                for candidate in domain
                if self._holds(precondition, domain, candidate)
            )
            return self._holds(body, restriction(domain, retained), world)

        if operator == "bapal":
            return any(
                self._holds(arguments[0], announced_domain, world)
                for announced_domain in boolean_definable_domains(self.model, domain, world)
            )

        raise OracleInputError(f"unsupported formula operator: {operator}")


def canonical_model_document(model: FiniteModel) -> dict[str, Any]:
    """Return a stable Schema v1 representation for diagnostics."""

    worlds: list[dict[str, Any] | None] = []
    for world in model.worlds:
        if world is None:
            worlds.append(None)
            continue
        transitions = sorted(world.transitions, key=lambda edge: (edge.target, tuple(map(ord, edge.agent))))
        worlds.append(
            {
                "trueAtoms": sorted(world.true_atoms, key=lambda name: tuple(map(ord, name))),
                "transitions": [
                    {"target": transition.target, "agent": transition.agent}
                    for transition in transitions
                ],
            }
        )
    return {"format": "bapal-model", "version": 1, "worlds": worlds}


def _canonical_formula_expression(formula: Formula) -> dict[str, Any]:
    operator = formula.operator
    if operator == "atom":
        return {"type": "atom", "name": formula.name}
    if operator in _UNARY_OPERATORS:
        return {"type": operator, "operand": _canonical_formula_expression(formula.arguments[0])}
    if operator in _BINARY_OPERATORS:
        return {
            "type": operator,
            "left": _canonical_formula_expression(formula.arguments[0]),
            "right": _canonical_formula_expression(formula.arguments[1]),
        }
    if operator == "knowledge":
        return {
            "type": "knowledge",
            "agents": list(formula.agents),
            "operand": _canonical_formula_expression(formula.arguments[0]),
        }
    if operator == "announcement":
        return {
            "type": "announcement",
            "precondition": _canonical_formula_expression(formula.arguments[0]),
            "body": _canonical_formula_expression(formula.arguments[1]),
        }
    raise OracleInputError(f"cannot canonicalize formula operator: {operator}")


def canonical_formula_document(formula: Formula) -> dict[str, Any]:
    """Return a stable Formula Schema v1 representation for diagnostics."""

    return {
        "format": "bapal-formula",
        "version": 1,
        "formula": _canonical_formula_expression(formula),
    }


def evaluate(model_document: Any, formula_document: Any, world: int) -> bool:
    """Evaluate one Schema v1 pointed request with independent semantics."""

    if not _is_integer(world) or world < 0:
        raise OracleInputError("world must be a nonnegative integer")
    model = parse_model_document(model_document)
    formula = parse_formula_document(formula_document)
    return SemanticOracle(model).holds(formula, world)

