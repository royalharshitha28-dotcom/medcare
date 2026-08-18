from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[schemas.PatientOut])
def get_patients(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "staff", "doctor"]))
):
    query = db.query(models.Patient)
    if search:
        query = query.join(models.User).filter(
            (models.User.full_name.ilike(f"%{search}%")) |
            (models.User.email.ilike(f"%{search}%")) |
            (models.Patient.contact.ilike(f"%{search}%"))
        )
    patients = query.all()

    res = []
    for p in patients:
        res.append(schemas.PatientOut(
            id=p.id,
            user_id=p.user_id,
            full_name=p.user.full_name,
            email=p.user.email,
            dob=p.dob,
            gender=p.gender,
            contact=p.contact,
            address=p.address,
            blood_group=p.blood_group,
            emergency_contact=p.emergency_contact,
            medical_history=p.medical_history,
            allergies=p.allergies,
            is_active=p.is_active
        ))
    return res

@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    p = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Patient can only view their own profile unless admin/staff/doctor
    if current_user.role == "patient" and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        raise HTTPException(status_code=403, detail="Forbidden")

    return schemas.PatientOut(
        id=p.id,
        user_id=p.user_id,
        full_name=p.user.full_name,
        email=p.user.email,
        dob=p.dob,
        gender=p.gender,
        contact=p.contact,
        address=p.address,
        blood_group=p.blood_group,
        emergency_contact=p.emergency_contact,
        medical_history=p.medical_history,
        allergies=p.allergies,
        is_active=p.is_active
    )

@router.post("", response_model=schemas.PatientOut)
def create_patient(
    patient_data: schemas.PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "staff"]))
):
    existing = db.query(models.User).filter(models.User.email == patient_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = models.User(
        email=patient_data.email,
        password_hash=auth.hash_password(patient_data.password),
        full_name=patient_data.full_name,
        role="patient"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_patient = models.Patient(
        user_id=new_user.id,
        dob=patient_data.dob,
        gender=patient_data.gender,
        contact=patient_data.contact,
        address=patient_data.address,
        blood_group=patient_data.blood_group,
        emergency_contact=patient_data.emergency_contact,
        medical_history=patient_data.medical_history,
        allergies=patient_data.allergies
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return schemas.PatientOut(
        id=new_patient.id,
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        dob=new_patient.dob,
        gender=new_patient.gender,
        contact=new_patient.contact,
        address=new_patient.address,
        blood_group=new_patient.blood_group,
        emergency_contact=new_patient.emergency_contact,
        medical_history=new_patient.medical_history,
        allergies=new_patient.allergies,
        is_active=new_patient.is_active
    )
