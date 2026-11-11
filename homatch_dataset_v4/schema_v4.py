"""Homatch v4 extension of the supplied Pydantic v3 schema."""
from __future__ import annotations

from typing import Literal

from pydantic import Field, model_validator
from schemas import Attributes as AttributesV3, Listing as ListingV3

Segment = Literal["student", "young_professional", "couple_family", "premium"]

class AttributesV4(AttributesV3):
    near_school: bool
    near_supermarket: bool
    playground: bool
    security_24h: bool
    child_friendly: bool

    @model_validator(mode="after")
    def family_logic(self):
        if self.child_friendly and not self.private_wc:
            raise ValueError("child_friendly requires private_wc")
        return self

class ListingV4(ListingV3):
    attributes: AttributesV4
    target_segment: Segment
    synthetic: Literal[True] = True
    reference_ids: list[str] = Field(default_factory=list)
    reference_note: str

