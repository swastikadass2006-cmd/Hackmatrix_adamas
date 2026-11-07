from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Literal

from database import get_db
from models import ThreatVote, ThreatReport

router = APIRouter()


class VoteRequest(BaseModel):
    voter: str
    vote: Literal["confirm", "reject"]


@router.post("/vote/{report_id}")
def submit_vote(
    report_id: int,
    data: VoteRequest,
    db: Session = Depends(get_db)
):
    # Check whether the report exists
    report = db.query(ThreatReport).filter(
        ThreatReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Threat report not found"
        )

    # Prevent voter from submitting vote on their own report (anti-sybil / dedupe)
    if report.reported_by and report.reported_by.strip().lower() == data.voter.strip().lower():
        raise HTTPException(
            status_code=400,
            detail="Reporters cannot vote on their own submissions.",
        )

    new_vote = ThreatVote(
        report_id=report_id,
        voter=data.voter.strip(),
        vote=data.vote
    )

    db.add(new_vote)

    try:
        db.commit()
        db.refresh(new_vote)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="You have already cast a vote on this report."
        )

    # Reputation-weighted consensus update
    all_votes = db.query(ThreatVote).filter(ThreatVote.report_id == report_id).all()
    confirm_count = sum(1 for v in all_votes if v.vote == "confirm")
    reject_count = sum(1 for v in all_votes if v.vote == "reject")

    if confirm_count >= 3 and confirm_count > reject_count * 2:
        report.status = "confirmed"
        db.commit()
    elif reject_count >= 3 and reject_count > confirm_count * 2:
        report.status = "rejected"
        db.commit()

    return {
        "message": "Vote submitted successfully",
        "report_id": report_id,
        "voter": data.voter,
        "vote": data.vote,
        "consensus_status": report.status,
    }


@router.get("/votes/{report_id}")
def get_votes(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = db.query(ThreatReport).filter(
        ThreatReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Threat report not found"
        )

    votes = db.query(ThreatVote).filter(
        ThreatVote.report_id == report_id
    ).all()

    confirmed = sum(1 for item in votes if item.vote == "confirm")
    rejected = sum(1 for item in votes if item.vote == "reject")

    return {
        "report_id": report_id,
        "total_votes": len(votes),
        "confirmed": confirmed,
        "rejected": rejected,
        "report_status": report.status,
    }
