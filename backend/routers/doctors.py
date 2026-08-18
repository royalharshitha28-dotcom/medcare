from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

@router.get("", response_model=List[schemas.DoctorOut])
def get_doctors(
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Doctor).filter(models.Doctor.is_active == True)
    if department_id:
        query = query.filter(models.Doctor.department_id == department_id)
    doctors = query.all()

    res = []
    for d in doctors:
        res.append(schemas.DoctorOut(
            id=d.id,
            user_id=d.user_id,
            full_name=d.user.full_name,
            email=d.user.email,
            department_id=d.department_id,
            department_name=d.department.name if d.department else "N/A",
            specialization=d.specialization,
            qualification=d.qualification,
            contact=d.contact,
            consultation_fee=d.consultation_fee,
            availability=d.availability,
            is_active=d.is_active
        ))
    return res

@router.post("", response_model=schemas.DoctorOut)
def create_doctor(
    doctor_data: schemas.DoctorCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(["admin"]))
):
    existing = db.query(models.User).filter(models.User.email == doctor_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = models.User(
        email=doctor_data.email,
        password_hash=auth.hash_password(doctor_data.password),
        full_name=doctor_data.full_name,
        role="doctor"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_doctor = models.Doctor(
        user_id=new_user.id,
        department_id=doctor_data.department_id,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        contact=doctor_data.contact,
        consultation_fee=doctor_data.consultation_fee,
        availability=doctor_data.availability
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return schemas.DoctorOut(
        id=new_doctor.id,
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        department_id=new_doctor.department_id,
        department_name=new_doctor.department.name if new_doctor.department else "N/A",
        specialization=new_doctor.specialization,
        qualification=new_doctor.qualification,
        contact=new_doctor.contact,
        consultation_fee=new_doctor.consultation_fee,
        availability=new_doctor.availability,
        is_active=new_doctor.is_active
    )
