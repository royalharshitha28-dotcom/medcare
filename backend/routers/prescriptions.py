from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])

@router.get("", response_model=List[schemas.PrescriptionOut])
def get_prescriptions(
    patient_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Prescription)

    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(models.Prescription.patient_id == current_user.patient_profile.id)
    elif current_user.role == "doctor":
        if not current_user.doctor_profile:
            return []
        query = query.filter(models.Prescription.doctor_id == current_user.doctor_profile.id)
    else:
        if patient_id:
            query = query.filter(models.Prescription.patient_id == patient_id)

    prescriptions = query.order_by(models.Prescription.id.desc()).all()

    res = []
    for p in prescriptions:
        items = [
            schemas.PrescriptionItemOut(
                id=item.id,
                medicine_name=item.medicine_name,
                dosage=item.dosage,
                frequency=item.frequency,
                duration=item.duration,
                instructions=item.instructions
            ) for item in p.items
        ]
        res.append(schemas.PrescriptionOut(
            id=p.id,
            consultation_id=p.consultation_id,
            patient_id=p.patient_id,
            patient_name=p.patient.user.full_name if p.patient and p.patient.user else "Patient",
            doctor_id=p.doctor_id,
            doctor_name=p.doctor.user.full_name if p.doctor and p.doctor.user else "Doctor",
            items=items,
            created_at=p.created_at
        ))
    return res
