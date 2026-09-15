from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional, Any
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.user import User
from app.models.evaluation_run import EvaluationRun
from app.api.deps import get_admin_user

router = APIRouter()

@router.get("/metrics")
async def get_metrics(
    days: int = Query(30),
    run_type: Optional[str] = None,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Base query for the time period
    base_query = select(EvaluationRun).where(EvaluationRun.created_at >= cutoff_date)
    if run_type:
        base_query = base_query.where(EvaluationRun.run_type == run_type)
        
    result = await db.execute(base_query.order_by(EvaluationRun.created_at.desc()))
    runs = result.scalars().all()
    
    total_runs = len(runs)
    if total_runs == 0:
        return {
            "total_runs": 0,
            "failure_rate": 0,
            "avg_latency_ms": 0,
            "avg_confidence": 0,
            "retrieval_hit_rate": 0,
            "trends": {"confidence": [], "latency": []}
        }
        
    failed_runs = sum(1 for r in runs if r.status == "fail")
    
    latency_runs = [r.latency_ms for r in runs if r.latency_ms is not None]
    avg_latency = sum(latency_runs) / len(latency_runs) if latency_runs else 0
    
    confidence_runs = [r.confidence_score for r in runs if r.confidence_score is not None]
    avg_confidence = sum(confidence_runs) / len(confidence_runs) if confidence_runs else 0
    
    # RAG specific metric
    rag_runs = [r for r in runs if r.run_type == "rag_query"]
    rag_hits = 0
    for r in rag_runs:
        if r.metric_json and r.metric_json.get("chunks_retrieved", 0) > 0:
            rag_hits += 1
    retrieval_hit_rate = (rag_hits / len(rag_runs) * 100) if rag_runs else 0
    
    # Very simple trends (daily averages)
    daily_trends = {}
    for r in runs:
        day_str = r.created_at.strftime("%Y-%m-%d")
        if day_str not in daily_trends:
            daily_trends[day_str] = {"confidences": [], "latencies": []}
        if r.confidence_score is not None:
            daily_trends[day_str]["confidences"].append(r.confidence_score)
        if r.latency_ms is not None:
            daily_trends[day_str]["latencies"].append(r.latency_ms)
            
    trend_conf = []
    trend_lat = []
    for day in sorted(daily_trends.keys()):
        d_confs = daily_trends[day]["confidences"]
        d_lats = daily_trends[day]["latencies"]
        avg_c = sum(d_confs) / len(d_confs) if d_confs else 0
        avg_l = sum(d_lats) / len(d_lats) if d_lats else 0
        trend_conf.append({"date": day, "value": avg_c})
        trend_lat.append({"date": day, "value": avg_l})
        
    return {
        "total_runs": total_runs,
        "failure_rate": (failed_runs / total_runs) * 100,
        "avg_latency_ms": avg_latency,
        "avg_confidence": avg_confidence,
        "retrieval_hit_rate": retrieval_hit_rate,
        "trends": {
            "confidence": trend_conf,
            "latency": trend_lat
        }
    }

@router.get("/recent-failures")
async def get_recent_failures(
    limit: int = Query(20),
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(EvaluationRun)
        .where(EvaluationRun.status == "fail")
        .order_by(EvaluationRun.created_at.desc())
        .limit(limit)
    )
    runs = result.scalars().all()
    
    # Return minimal safe fields
    return [
        {
            "id": r.id,
            "run_type": r.run_type,
            "prescription_id": r.prescription_id,
            "error_summary": r.error_summary,
            "latency_ms": r.latency_ms,
            "created_at": r.created_at
        }
        for r in runs
    ]
