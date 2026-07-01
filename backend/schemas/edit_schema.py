from pydantic import BaseModel, Field, field_validator
from typing import List, Union

class EditUpdateItem(BaseModel):
    row: int = Field(..., ge=0, description="The 0-indexed row number in the dataset.")
    col: str = Field(..., min_length=1, description="The column name to edit.")
    value: Union[int, float, str, None] = Field(..., description="The new value for the cell.")

    @field_validator('row')
    @classmethod
    def validate_row(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Row index must be non-negative.")
        return v

class EditPayloadSchema(BaseModel):
    updates: List[EditUpdateItem] = Field(..., description="List of cell updates to apply.")
