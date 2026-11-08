
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class Finding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    signal: str
    severity: Literal[
        "critical",
        "high",
        "medium",
        "low",
        "info"
    ]
    evidence: str
    source: str
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class Coverage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    completed: int = Field(ge=0)
    total: int = Field(ge=0)


class EngineResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    engine: str
    findings: list[Finding] = Field(default_factory=list)
    coverage: Coverage
    limitations: list[str] = Field(default_factory=list)
