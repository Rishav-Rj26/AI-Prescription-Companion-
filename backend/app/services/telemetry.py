import logging
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.models.evaluation_run import EvaluationRun

logger = logging.getLogger(__name__)

async def log_evaluation_run(
    run_type: str,
    model_name: str,
    status: str,
    prescription_id: Optional[int] = None,
    model_version: Optional[str] = None,
    confidence_score: Optional[float] = None,
    latency_ms: Optional[int] = None,
    error_summary: Optional[str] = None,
    metric_json: Optional[Dict[str, Any]] = None
) -> None:
    """
    Fire-and-forget telemetry logging. 
    Creates a new DB session internally so it doesn't interfere with the main request transaction.
    Swallows all exceptions to prevent breaking the main request flow.
    """
    try:
        # Truncate error_summary if provided to ensure no raw data logging rule is met
        truncated_error = None
        if error_summary:
            truncated_error = str(error_summary)[:255]

        async with AsyncSessionLocal() as session:
            run = EvaluationRun(
                run_type=run_type,
                model_name=model_name,
                model_version=model_version,
                status=status,
                prescription_id=prescription_id,
                confidence_score=confidence_score,
                latency_ms=latency_ms,
                error_summary=truncated_error,
                metric_json=metric_json
            )
            session.add(run)
            await session.commit()
    except Exception as e:
        logger.error(f"Failed to log telemetry for {run_type}: {e}")
