"""
DAX Translation Engine for SnowFlow

This module provides a production-grade DAX → Snowflake SQL translation pipeline.
It uses a multi-stage approach:
1. Lexer: Tokenize DAX expressions
2. Parser: Build Abstract Syntax Tree (AST)
3. Context Analyzer: Understand table relationships and filter context
4. Pattern Matcher: Apply known DAX→SQL patterns
5. LLM Translator: Handle complex/unknown patterns
6. Validator: Test generated SQL

Author: SnowFlow Team
Version: 1.0.0
"""

from .lexer import DaxLexer, Token, TokenType
from .parser import DaxParser, parse_dax, parse_dax_measure
from .ast_nodes import (
    DaxNode,
    DaxExpression,
    DaxFunction,
    DaxColumn,
    DaxMeasure,
    DaxTable,
    DaxBinaryOp,
    DaxLiteral,
)
from .patterns import PatternLibrary, DaxPattern
from .translator import DaxTranslator, TranslationResult, translate_dax
from .validator import SqlValidator, ValidationResult
from .context import SchemaContext, TableRelationship, create_sample_retail_context
from .cortex_llm import CortexLLMTranslator, CortexTranslationResult, create_cortex_translator

__all__ = [
    # Lexer
    "DaxLexer",
    "Token",
    "TokenType",
    # Parser
    "DaxParser",
    "parse_dax",
    "parse_dax_measure",
    # AST Nodes
    "DaxNode",
    "DaxExpression",
    "DaxFunction",
    "DaxColumn",
    "DaxMeasure",
    "DaxTable",
    "DaxBinaryOp",
    "DaxLiteral",
    # Patterns
    "PatternLibrary",
    "DaxPattern",
    # Translator
    "DaxTranslator",
    "TranslationResult",
    "translate_dax",
    # Validator
    "SqlValidator",
    "ValidationResult",
    # Context
    "SchemaContext",
    "TableRelationship",
    "create_sample_retail_context",
    # Cortex LLM
    "CortexLLMTranslator",
    "CortexTranslationResult",
    "create_cortex_translator",
]

__version__ = "1.0.0"



