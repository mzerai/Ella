"""API Router for the ELLA AI Tutor."""

import time
from fastapi import APIRouter, HTTPException
from app.services.ella.models import (
    ChatRequest, 
    ChatResponse, 
    ConversationRequest,
    PageContextSchema,
    EnvironmentContext,
    HyperparametersContext,
    MetricsContext
)
from app.services.ella.orchestrator import generate_response, _detect_mode

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Echo-chamber for the AI tutor engine.
    Adapts Pydantic API models to legacy engine dataclasses.
    """
    start_time = time.time()
    
    try:
        # 1. Adapt Pydantic Context to Dataclass Context
        ctx = request.context
        
        # Auto-detect course from page_id
        if ctx.page_id and ctx.page_id.startswith(("01_", "02_", "03_", "04_", "05_")):
            if "course_id" not in ctx.extra:
                ctx.extra["course_id"] = "pe"
                
        legacy_context = PageContextSchema(
            page_id=ctx.page_id,
            page_title=ctx.page_title,
            algorithm=ctx.algorithm,
            lab_name=ctx.lab_name,
            environment=EnvironmentContext(
                name=ctx.environment.name,
                is_slippery=ctx.environment.is_slippery
            ),
            hyperparameters=HyperparametersContext(
                gamma=ctx.hyperparameters.gamma,
                theta=ctx.hyperparameters.theta
            ),
            policy_mode=ctx.policy_mode,
            evaluation_status=ctx.evaluation_status,
            metrics=MetricsContext(
                iterations_to_converge=ctx.metrics.iterations_to_converge,
                final_delta=ctx.metrics.final_delta,
                is_mathematically_valid=ctx.metrics.is_mathematically_valid
            ),
            extra=ctx.extra
        )
        
        # 2. Build Engine Request
        engine_request = ConversationRequest(
            query=request.message,
            context=legacy_context,
            history=request.conversation_history
        )
        
        # 3. Generate Response via Orchestrator
        # Note: generate_response returns a markdown string
        # We need to reach into the internal parser if we want structured data 
        # for the API response, but the prompt says 
        # "returns a formatted markdown string response" in orchestrator.
        # To satisfy ChatResponse, we'll return the string as 'answer' 
        # and populate metadata.
        
        formatted_answer = generate_response(engine_request)
        
        # 4. Prepare API Response
        elapsed_ms = (time.time() - start_time) * 1000
        
        return ChatResponse(
            answer=formatted_answer,
            mode=_detect_mode(request.message),
            response_time_ms=round(elapsed_ms, 2)
            # Chunks used is logged in analytics, but not easily returned here 
            # without changing generate_response signature. 
            # Keeping it simple for now.
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
