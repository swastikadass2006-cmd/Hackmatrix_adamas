
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Literal

from database import get_db
from models import ThreatVote, ThreatReport

router = APIRouter()


# Request format for submitting a vote
class VoteRequest(BaseModel):
    voter: str
    vote: Literal["confirm", "reject"]


# POST: Submit a vote for a threat report
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

    # Create a new vote
    new_vote = ThreatVote(
        report_id=report_id,
        voter=data.voter,
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
            detail="You have already voted on this report"
        )

    return {
        "message": "Vote submitted successfully",
        "report_id": report_id,
        "voter": data.voter,
        "vote": data.vote
    }


# GET: View voting results
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

    confirmed = sum(
        1 for item in votes if item.vote == "confirm"
    )

    rejected = sum(
        1 for item in votes if item.vote == "reject"
    )

    return {
        "report_id": report_id,
        "total_votes": len(votes),
        "confirmed": confirmed,
        "rejected": rejected
    }
