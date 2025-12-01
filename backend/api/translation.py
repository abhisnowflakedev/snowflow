"""
DAX → SQL Translation API Routes

Provides REST endpoints for:
- Translating single DAX expressions
- Translating full TMDL files
- Batch translation
- Pattern library access
- Translation validation

These routes are designed to be mounted on the main FastAPI app.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

# Import the DAX engine
from dax_engine import (
    DaxTranslator,
    PatternLibrary,
    SchemaContext,
    SqlValidator,
    TranslationResult as DaxTranslationResult,
    parse_dax,
    translate_dax,
    create_sample_retail_context,
)

router = APIRouter(prefix="/api/translate", tags=["Translation"])


# ========== Request/Response Models ==========

class TranslateRequest(BaseModel):
    """Request to translate a DAX expression."""
    dax: str = Field(..., description="DAX expression to translate")
    context_json: Optional[str] = Field(
        None, 
        description="Optional JSON schema context"
    )
    validate_output: bool = Field(True, description="Whether to validate the output")
    
    class Config:
        json_schema_extra = {
            "example": {
                "dax": "SUM(Sales[Amount])",
                "validate": True
            }
        }


class TranslateResponse(BaseModel):
    """Response from translation."""
    success: bool
    sql: str
    confidence: str
    tables_used: List[str]
    joins: str
    patterns_applied: List[str]
    warnings: List[str]
    errors: List[str]
    validation_issues: List[Dict[str, Any]]
    timestamp: str


class BatchTranslateRequest(BaseModel):
    """Request for batch translation of multiple expressions."""
    expressions: List[str] = Field(..., description="List of DAX expressions")
    context_json: Optional[str] = None


class BatchTranslateResponse(BaseModel):
    """Response from batch translation."""
    total: int
    successful: int
    failed: int
    results: List[TranslateResponse]


class MeasureRequest(BaseModel):
    """Request to translate a DAX measure definition."""
    measure: str = Field(
        ..., 
        description="Measure definition like '[Name] = expression'"
    )
    context_json: Optional[str] = None


class TmdlRequest(BaseModel):
    """Request to translate a full TMDL file."""
    tmdl_content: str = Field(..., description="TMDL file content")
    context_json: Optional[str] = None


class PatternInfo(BaseModel):
    """Information about a DAX pattern."""
    function_name: str
    sql_template: str
    description: str
    complexity: str
    examples: List[Dict[str, str]]


class PatternListResponse(BaseModel):
    """List of available patterns."""
    total: int
    patterns: List[PatternInfo]


class ContextSampleResponse(BaseModel):
    """Sample schema context for testing."""
    context_json: str
    description: str


# ========== Endpoints ==========

@router.post("/expression", response_model=TranslateResponse)
async def translate_expression(request: TranslateRequest) -> TranslateResponse:
    """
    Translate a single DAX expression to Snowflake SQL.
    
    This is the main translation endpoint. It:
    1. Parses the DAX expression
    2. Applies pattern-based translation
    3. Generates Snowflake SQL
    4. Optionally validates the output
    
    Example:
    ```
    POST /api/translate/expression
    {
        "dax": "SUM(Sales[Amount])",
        "validate": true
    }
    ```
    """
    # Parse context if provided
    context = None
    if request.context_json:
        try:
            context = SchemaContext.from_json(request.context_json)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid context JSON: {str(e)}"
            )
    
    # Translate
    translator = DaxTranslator(context=context)
    result = translator.translate(request.dax)
    
    # Validate if requested
    validation_issues = []
    if request.validate_output and result.success:
        validator = SqlValidator()
        val_result = validator.validate_expression(result.sql)
        validation_issues = [i.to_dict() for i in val_result.issues]
    
    return TranslateResponse(
        success=result.success,
        sql=result.sql,
        confidence=result.confidence.name,
        tables_used=result.tables_used,
        joins=result.joins_needed,
        patterns_applied=result.patterns_applied,
        warnings=result.warnings,
        errors=result.errors,
        validation_issues=validation_issues,
        timestamp=datetime.utcnow().isoformat(),
    )


@router.post("/measure", response_model=TranslateResponse)
async def translate_measure(request: MeasureRequest) -> TranslateResponse:
    """
    Translate a DAX measure definition.
    
    Handles measure definitions in the format:
    [Measure Name] = DAX_EXPRESSION
    
    Example:
    ```
    POST /api/translate/measure
    {
        "measure": "[Total Sales] = SUM(Sales[Amount])"
    }
    ```
    """
    context = None
    if request.context_json:
        try:
            context = SchemaContext.from_json(request.context_json)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid context JSON: {str(e)}"
            )
    
    translator = DaxTranslator(context=context)
    result = translator.translate_measure(request.measure)
    
    validation_issues = []
    if result.success:
        validator = SqlValidator()
        val_result = validator.validate_expression(result.sql)
        validation_issues = [i.to_dict() for i in val_result.issues]
    
    return TranslateResponse(
        success=result.success,
        sql=result.sql,
        confidence=result.confidence.name,
        tables_used=result.tables_used,
        joins=result.joins_needed,
        patterns_applied=result.patterns_applied,
        warnings=result.warnings,
        errors=result.errors,
        validation_issues=validation_issues,
        timestamp=datetime.utcnow().isoformat(),
    )


@router.post("/batch", response_model=BatchTranslateResponse)
async def translate_batch(request: BatchTranslateRequest) -> BatchTranslateResponse:
    """
    Translate multiple DAX expressions in a batch.
    
    This is more efficient than multiple individual calls.
    
    Example:
    ```
    POST /api/translate/batch
    {
        "expressions": [
            "SUM(Sales[Amount])",
            "AVERAGE(Sales[Quantity])",
            "COUNTROWS(Sales)"
        ]
    }
    ```
    """
    context = None
    if request.context_json:
        try:
            context = SchemaContext.from_json(request.context_json)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid context JSON: {str(e)}"
            )
    
    translator = DaxTranslator(context=context)
    validator = SqlValidator()
    
    results = []
    successful = 0
    failed = 0
    
    for dax_expr in request.expressions:
        result = translator.translate(dax_expr)
        
        validation_issues = []
        if result.success:
            successful += 1
            val_result = validator.validate_expression(result.sql)
            validation_issues = [i.to_dict() for i in val_result.issues]
        else:
            failed += 1
        
        results.append(TranslateResponse(
            success=result.success,
            sql=result.sql,
            confidence=result.confidence.name,
            tables_used=result.tables_used,
            joins=result.joins_needed,
            patterns_applied=result.patterns_applied,
            warnings=result.warnings,
            errors=result.errors,
            validation_issues=validation_issues,
            timestamp=datetime.utcnow().isoformat(),
        ))
    
    return BatchTranslateResponse(
        total=len(request.expressions),
        successful=successful,
        failed=failed,
        results=results,
    )


@router.post("/tmdl")
async def translate_tmdl(request: TmdlRequest) -> Dict[str, Any]:
    """
    Translate a full TMDL file to Snowflake Cortex YAML.
    
    This extracts all measures from the TMDL and translates them.
    
    Returns a Cortex-compatible semantic model YAML.
    """
    import re
    
    context = None
    if request.context_json:
        try:
            context = SchemaContext.from_json(request.context_json)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid context JSON: {str(e)}"
            )
    
    # Parse TMDL to extract measures
    # This is a simplified parser - real TMDL is more complex
    measures = []
    
    # Pattern for measure definitions in TMDL
    measure_pattern = re.compile(
        r'measure\s+(\w+)\s*=\s*(.+?)(?=\n\s*(?:measure|column|table|\Z))',
        re.IGNORECASE | re.DOTALL
    )
    
    for match in measure_pattern.finditer(request.tmdl_content):
        name = match.group(1)
        expression = match.group(2).strip()
        measures.append({
            "name": name,
            "dax": expression,
        })
    
    # Translate each measure
    translator = DaxTranslator(context=context)
    translated_measures = []
    errors = []
    
    for measure in measures:
        result = translator.translate(measure["dax"])
        if result.success:
            translated_measures.append({
                "name": measure["name"],
                "expr": result.sql,
                "description": f"Translated from DAX: {measure['dax'][:50]}...",
            })
        else:
            errors.append({
                "measure": measure["name"],
                "errors": result.errors,
            })
    
    # Generate Cortex YAML
    yaml_output = generate_cortex_yaml(translated_measures)
    
    return {
        "success": len(errors) == 0,
        "yaml": yaml_output,
        "measures_translated": len(translated_measures),
        "measures_failed": len(errors),
        "errors": errors,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/patterns", response_model=PatternListResponse)
async def list_patterns() -> PatternListResponse:
    """
    List all available DAX → SQL patterns.
    
    This shows what DAX functions have known translations.
    """
    library = PatternLibrary()
    patterns = []
    
    for name in library.list_patterns():
        pattern = library.get_pattern(name)
        if pattern:
            patterns.append(PatternInfo(
                function_name=pattern.dax_function,
                sql_template=pattern.sql_template,
                description=pattern.description,
                complexity=pattern.complexity,
                examples=pattern.examples,
            ))
    
    return PatternListResponse(
        total=len(patterns),
        patterns=patterns,
    )


@router.get("/patterns/{function_name}")
async def get_pattern(function_name: str) -> PatternInfo:
    """
    Get pattern for a specific DAX function.
    """
    library = PatternLibrary()
    pattern = library.get_pattern(function_name)
    
    if not pattern:
        raise HTTPException(
            status_code=404,
            detail=f"No pattern found for function: {function_name}"
        )
    
    return PatternInfo(
        function_name=pattern.dax_function,
        sql_template=pattern.sql_template,
        description=pattern.description,
        complexity=pattern.complexity,
        examples=pattern.examples,
    )


@router.get("/context/sample", response_model=ContextSampleResponse)
async def get_sample_context() -> ContextSampleResponse:
    """
    Get a sample schema context for testing.
    
    Returns a retail data model with Sales, Product, Customer, etc.
    """
    context = create_sample_retail_context()
    
    return ContextSampleResponse(
        context_json=context.to_json(),
        description="Sample retail schema with Sales, Product, Customer, Store, and Date tables",
    )


@router.post("/validate")
async def validate_sql(sql: str) -> Dict[str, Any]:
    """
    Validate a SQL expression.
    """
    validator = SqlValidator()
    result = validator.validate_expression(sql)
    
    return {
        "is_valid": result.is_valid,
        "issues": [i.to_dict() for i in result.issues],
        "sql_normalized": result.sql_normalized,
    }


class CortexTranslateRequest(BaseModel):
    """Request for Cortex-enhanced translation."""
    dax: str = Field(..., description="DAX expression to translate")
    context_json: Optional[str] = None
    use_cortex: bool = Field(True, description="Use Cortex LLM for enhancement")


@router.post("/cortex")
async def translate_with_cortex(request: CortexTranslateRequest) -> Dict[str, Any]:
    """
    Translate DAX using Snowflake Cortex LLM enhancement.
    
    This endpoint:
    1. First tries pattern-based translation
    2. If confidence is MEDIUM or LOW, enhances with Cortex LLM
    3. Returns the best available translation
    
    Requires active Snowflake connection with Cortex access.
    """
    from dax_engine import CortexLLMTranslator, create_cortex_translator
    from snowflake_client import snowflake_client
    
    # Parse context
    context = None
    if request.context_json:
        try:
            context = SchemaContext.from_json(request.context_json)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid context: {e}")
    
    # Step 1: Pattern-based translation
    translator = DaxTranslator(context=context)
    pattern_result = translator.translate(request.dax)
    
    # If high confidence or Cortex disabled, return pattern result
    if pattern_result.confidence.name == "HIGH" or not request.use_cortex:
        return {
            "success": pattern_result.success,
            "sql": pattern_result.sql,
            "confidence": pattern_result.confidence.name,
            "method": "pattern",
            "cortex_enhanced": False,
            "tables_used": pattern_result.tables_used,
            "patterns_applied": pattern_result.patterns_applied,
            "warnings": pattern_result.warnings,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    # Step 2: Try Cortex enhancement
    try:
        cortex = CortexLLMTranslator(snowflake_client)
        
        # Enhance the translation
        cortex_result = cortex.enhance_translation(
            dax=request.dax,
            pattern_sql=pattern_result.sql,
            confidence=pattern_result.confidence.name,
            warnings=pattern_result.warnings,
        )
        
        if cortex_result.success:
            return {
                "success": True,
                "sql": cortex_result.sql,
                "confidence": "HIGH",  # Cortex-enhanced = HIGH
                "method": "cortex",
                "cortex_enhanced": True,
                "model_used": cortex_result.model_used,
                "original_sql": pattern_result.sql,
                "original_confidence": pattern_result.confidence.name,
                "tables_used": pattern_result.tables_used,
                "patterns_applied": pattern_result.patterns_applied,
                "timestamp": datetime.utcnow().isoformat(),
            }
        else:
            # Cortex failed, return pattern result with warning
            return {
                "success": pattern_result.success,
                "sql": pattern_result.sql,
                "confidence": pattern_result.confidence.name,
                "method": "pattern",
                "cortex_enhanced": False,
                "cortex_error": cortex_result.error,
                "tables_used": pattern_result.tables_used,
                "patterns_applied": pattern_result.patterns_applied,
                "warnings": pattern_result.warnings + ["Cortex enhancement failed"],
                "timestamp": datetime.utcnow().isoformat(),
            }
    except Exception as e:
        # Cortex not available, return pattern result
        return {
            "success": pattern_result.success,
            "sql": pattern_result.sql,
            "confidence": pattern_result.confidence.name,
            "method": "pattern",
            "cortex_enhanced": False,
            "cortex_error": f"Cortex not available: {str(e)}",
            "tables_used": pattern_result.tables_used,
            "patterns_applied": pattern_result.patterns_applied,
            "warnings": pattern_result.warnings,
            "timestamp": datetime.utcnow().isoformat(),
        }


@router.get("/cortex/status")
async def cortex_status() -> Dict[str, Any]:
    """
    Check if Cortex LLM is available.
    """
    from dax_engine import create_cortex_translator
    from snowflake_client import snowflake_client
    
    try:
        cortex = create_cortex_translator(snowflake_client)
        if cortex:
            return {
                "available": True,
                "model": cortex.model,
                "message": "Cortex LLM is ready for enhanced translation",
            }
        else:
            return {
                "available": False,
                "message": "Cortex connection test failed",
            }
    except Exception as e:
        return {
            "available": False,
            "message": f"Cortex not available: {str(e)}",
        }


# ========== Helper Functions ==========

def generate_cortex_yaml(measures: List[Dict[str, str]]) -> str:
    """Generate Cortex semantic model YAML from translated measures."""
    yaml_lines = [
        "# Cortex Semantic Model",
        "# Generated by SnowFlow DAX Translator",
        f"# Generated at: {datetime.utcnow().isoformat()}",
        "",
        "name: translated_model",
        "description: Semantic model translated from Power BI",
        "",
        "tables:",
        "  - name: sales",
        "    base_table:",
        "      database: your_database",
        "      schema: your_schema",
        "      table: sales",
        "",
        "measures:",
    ]
    
    for measure in measures:
        yaml_lines.extend([
            f"  - name: {measure['name'].lower()}",
            f"    expr: \"{measure['expr']}\"",
            f"    description: \"{measure.get('description', '')}\"",
            "",
        ])
    
    return "\n".join(yaml_lines)

