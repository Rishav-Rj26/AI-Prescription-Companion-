from pydantic import BaseModel, Field
from typing import List, Optional

class ExtractedMedicine(BaseModel):
    raw_name: str = Field(description="The exact medicine name as written in the prescription")
    normalized_name: Optional[str] = Field(None, description="Always set to None for now")
    strength: Optional[str] = Field(None, description="Medicine strength (e.g., '500mg', '10ml')")
    dosage: Optional[str] = Field(None, description="Dosage amount (e.g., '1 tablet', '2 puffs')")
    frequency: Optional[str] = Field(None, description="How often to take (e.g., 'twice a day', 'every 8 hours')")
    duration: Optional[str] = Field(None, description="How long to take (e.g., 'for 5 days')")
    instructions: Optional[str] = Field(None, description="Special instructions (e.g., 'after meals')")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0 for this medicine extraction")
    needs_verification: bool = Field(description="Set to true if handwriting is ambiguous or model is unsure")

class ExtractedTest(BaseModel):
    test_name: str = Field(description="The exact name of the laboratory or diagnostic test")
    description: Optional[str] = Field(None, description="Any additional notes about the test")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0 for this test extraction")
    needs_verification: bool = Field(description="Set to true if handwriting is ambiguous or model is unsure")

class ExtractedInstruction(BaseModel):
    text: str = Field(description="General instructions, lifestyle advice, or next appointment details")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")

class PrescriptionExtractionResult(BaseModel):
    medicines: List[ExtractedMedicine] = Field(default_factory=list, description="List of medicines prescribed")
    tests: List[ExtractedTest] = Field(default_factory=list, description="List of tests ordered")
    instructions: List[ExtractedInstruction] = Field(default_factory=list, description="General instructions")
    overall_confidence: float = Field(description="Overall confidence score for the entire prescription extraction between 0.0 and 1.0")
    disclaimer: str = Field(default="This is AI-generated informational content, not medical advice.", description="Medical disclaimer")
