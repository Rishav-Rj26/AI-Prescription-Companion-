import re
from datetime import date, timedelta, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.medicine import PrescriptionMedicine
from app.models.schedule import MedicationSchedule

def parse_duration(duration_str: str) -> int:
    """Extracts duration in days from string. Defaults to 7 if unparseable."""
    if not duration_str:
        return 7
        
    s = duration_str.lower()
    
    # Check for days
    match = re.search(r'(\d+)\s*day', s)
    if match:
        return int(match.group(1))
        
    # Check for weeks
    match = re.search(r'(\d+)\s*week', s)
    if match:
        return int(match.group(1)) * 7
        
    # Check for months
    match = re.search(r'(\d+)\s*month', s)
    if match:
        return int(match.group(1)) * 30
        
    return 7

def parse_frequency(freq_str: str) -> tuple[list[time], bool, str | None]:
    """
    Parses frequency string into a list of times.
    Returns: (list_of_times, needs_review, review_reason)
    """
    if not freq_str:
        return ([time(8, 0)], True, "Missing frequency")
        
    s = freq_str.lower()
    s = re.sub(r'[^a-z0-9\s]', '', s) # Strip punctuation
    
    # 1. Standard intervals
    if 'once' in s or 'od' in s.split() or s == 'od' or '1 time' in s or 'daily' in s:
        # Check if it's explicitly night
        if 'night' in s or 'bedtime' in s or 'hs' in s.split():
            return ([time(22, 0)], False, None)
        return ([time(8, 0)], False, None)
        
    if 'twice' in s or 'bd' in s.split() or 'bid' in s.split() or '2 times' in s:
        return ([time(8, 0), time(20, 0)], False, None)
        
    if 'three times' in s or 'tds' in s.split() or 'tid' in s.split() or '3 times' in s:
        return ([time(8, 0), time(14, 0), time(20, 0)], False, None)
        
    if 'four times' in s or 'qid' in s.split() or '4 times' in s:
        return ([time(6, 0), time(12, 0), time(18, 0), time(22, 0)], False, None)
        
    # 2. Every N hours
    match = re.search(r'every (\d+) hours?', s)
    if match:
        hours = int(match.group(1))
        if hours > 0 and hours <= 24:
            slots = []
            curr = 6 # Start at 6 AM
            while curr < 30: # Up to next morning
                h = curr % 24
                slots.append(time(h, 0))
                curr += hours
            # limit to 24 hours worth
            num_slots = 24 // hours
            return (slots[:num_slots], False, None)
            
    # 3. Meals
    if 'before meal' in s or 'ac' in s.split():
        return ([time(7, 30), time(12, 30), time(19, 30)], False, None)
        
    if 'after meal' in s or 'pc' in s.split():
        return ([time(8, 30), time(13, 30), time(20, 30)], False, None)
        
    # Default fallback
    return ([time(8, 0)], True, f"Could not parse frequency: '{freq_str}'")

async def generate_schedules_for_medicine(medicine: PrescriptionMedicine, db: AsyncSession):
    """
    Clears existing schedules for this medicine and generates new ones based on current fields.
    """
    # 1. Delete existing
    await db.execute(
        delete(MedicationSchedule)
        .where(MedicationSchedule.prescription_medicine_id == medicine.id)
    )
    
    # 2. Parse frequency and duration
    times, needs_review, review_reason = parse_frequency(medicine.frequency)
    duration_days = parse_duration(medicine.duration)
    
    # Start date is today (the day of verification)
    start_date = date.today()
    end_date = start_date + timedelta(days=duration_days - 1)
    
    # 3. Create new schedules (one row per time slot, covering the whole duration natively or 
    # just generating a pattern. Wait, if duration is 30 days and 3 times a day, that's 90 rows!
    # Let's check how the user described it:
    # "create the schedule entry with default times... two daily time slots for 7 days from start"
    # Actually, a more efficient database schema is just storing the recurrence rule, but the schema 
    # asked for: scheduled_time, status, start_date, end_date. 
    # Wait, if we have start_date and end_date on MedicationSchedule, we just create ONE row per TIME SLOT.
    # e.g., row 1: 08:00, start: day 1, end: day 7.
    # row 2: 20:00, start: day 1, end: day 7.
    # But how do we track "status" (taken/skipped) for EACH DAY?
    # If the schema is just "scheduled_time, status", then it implies either one row per dose (90 rows)
    # OR we need a separate table for dose logs.
    # The user request said: "Create/confirm the medication_schedules table (id, prescription_medicine_id, time, status, start_date, end_date)."
    # If a row has start_date and end_date and a single status, it can't represent a recurring schedule where one day is taken and another is missed.
    # Re-reading user request: "two daily time slots for 7 days from start... day view with taken/skipped/snooze actions... course-progress bar".
    # Ah, if we create 1 row per actual DOSE (e.g. 14 rows for twice daily 7 days), then `start_date` and `end_date` don't make sense on EVERY row (they would just be the same date, or the overall course dates?).
    # Wait, if we create 1 row per time slot (e.g., 2 rows), how do we track taken today vs tomorrow?
    # The prompt explicitly specifies: "table (id, prescription_medicine_id, time, status, start_date, end_date)".
    # If it's one row per time slot, maybe it just repeats? No, "day view with taken/skipped/snooze actions". 
    # Actually, it's common to generate one row per *dose*. But then `start_date` and `end_date` are weird on a per-dose row.
    # Maybe `date` and `time`? But the prompt specifically said `start_date, end_date`.
    # Let me assume we generate one row per TIME SLOT, and we track status via another table? No, prompt says "status" is on this table.
    # This implies we generate one row per DOSE and `start_date`/`end_date` are just the course dates copied to every dose? Or maybe `start_date` and `end_date` are the same (the date of the dose)?
    # Wait, if we just generate one row per dose, we could just rename it `scheduled_date` instead of `start_date` and `end_date`.
    # But I must stick to the schema: "id, prescription_medicine_id, time, status, start_date, end_date".
    # OK, if I create 14 rows, each has start_date=today, end_date=today+6. The time is the time of day. 
    # Wait, if there are 2 time slots every day for 7 days, and we have 14 rows. What distinguishes day 1 08:00 from day 2 08:00?
    # There is no `date` column!
    # Ah! Maybe the schema is "one row per dose", and `scheduled_time` is a DATETIME?
    # The prompt says: `scheduled_time` is `Time` e.g. `08:00`.
    # If `time` is just time of day, and `start_date`, `end_date` are there, it MUST be one row per RECURRING slot.
    # e.g., Row 1: 08:00, start_date=Mon, end_date=Sun.
    # But how do we track "taken" for Tuesday?
    # Maybe we only care about tracking status for TODAY? "GET /schedules (today's/upcoming doses... mark taken/skipped...)".
    # That means the `status` field would just be a string that gets overwritten every day? No, that loses history.
    # Wait, maybe `status` is a JSON dict of {date: status}?
    # Or maybe we just generate 1 row per dose, and `start_date` is the exact date of the dose, and `end_date` is the same date?
    # Or maybe the user made a slight error in the schema design. I should follow the schema exactly but make it work.
    # If I create 1 row per dose, I'll store the dose date in BOTH `start_date` and `end_date` (or `start_date` = dose date, `end_date` = course end date).
    # Let's create one row per DOSE, where `start_date` = the date of that dose, and `end_date` = the date of the course end. 
    # That way `start_date` serves as the dose date.
    
    # Or, the user's implementation plan I proposed:
    # "start_date: First day the slot applies, end_date: Last day (inclusive)".
    # If I proposed this, I didn't think about how to track daily status. 
    # Ah! "course progress... computed from start_date/end_date and count of taken entries".
    # If I only have 2 entries (08:00 and 20:00), how can I have a count of taken entries?
    # I MUST generate one row per dose. 
    # Then `start_date` = date of the dose. `end_date` = date of the dose.
    # Let me re-read my own plan: "course progress... computed from start_date/end_date and count of taken entries".
    # If `start_date` is the date of the dose, then course progress = count of taken entries / total entries.
    # Let's generate ONE ROW PER DOSE.
    # To keep it matching my plan's columns: `start_date` will be the date of the dose, `end_date` will be the overall course end date (so we can group by it or compute total days easily).
    # Actually, if I generate 14 rows, `start_date` is the date of the dose. 
    
    schedules = []
    for day_offset in range(duration_days):
        current_date = start_date + timedelta(days=day_offset)
        
        for t in times:
            schedules.append(
                MedicationSchedule(
                    prescription_medicine_id=medicine.id,
                    scheduled_time=t,
                    status="pending",
                    start_date=current_date,  # The date this dose is due
                    end_date=end_date,        # The overall course end date
                    needs_review=needs_review,
                    review_reason=review_reason
                )
            )
            
    if schedules:
        db.add_all(schedules)
    
    await db.commit()
