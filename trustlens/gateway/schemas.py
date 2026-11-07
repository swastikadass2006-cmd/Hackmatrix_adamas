from pydantic import BaseModel, HttpUrl


class ScanRequest(BaseModel):
    url: HttpUrl


class ReportRequest(BaseModel):
    url: HttpUrl
    category: str
    reason: str
    reported_by: str