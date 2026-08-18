from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    new_user = models.User(
        email=user_data.email,
        password_hash=auth.hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    patient_id = None
    doctor_id = None

    if user_data.role == "patient":
        new_patient = models.Patient(
            user_id=new_user.id,
            contact=user_data.contact or "N/A",
            dob=user_data.dob,
            gender=user_data.gender,
            address=user_data.address,
            blood_group=user_data.blood_group,
            emergency_contact=user_data.emergency_contact
        )
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        patient_id = new_patient.id

    access_token = auth.create_access_token(data={"sub": new_user.email, "role": new_user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "patient_id": patient_id,
        "doctor_id": doctor_id
    }

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    patient_id = user.patient_profile.id if user.patient_profile else None
    doctor_id = user.doctor_profile.id if user.doctor_profile else None

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "patient_id": patient_id,
        "doctor_id": doctor_id
    }

@router.get("/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    patient_id = current_user.patient_profile.id if current_user.patient_profile else None
    doctor_id = current_user.doctor_profile.id if current_user.doctor_profile else None
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "patient_id": patient_id,
        "doctor_id": doctor_id
    }
