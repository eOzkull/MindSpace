from pydantic import BaseModel, Field
from typing import Optional

class UploadMetadataSchema(BaseModel):
    cohort_name: Optional[str] = Field(None, max_length=100, description="Optional name of the student cohort.")
    academic_term: Optional[str] = Field(None, max_length=20, description="Optional term (e.g. Fall 2026).")
