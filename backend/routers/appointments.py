from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.get("", response_model=List[schemas.AppointmentOut])
def get_appointments(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Appointment)

    # Role specific filters
    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(models.Appointment.patient_id == current_user.patient_profile.id)
    elif current_user.role == "doctor":
        if not current_user.doctor_profile:
            return []
        query = query.filter(models.Appointment.doctor_id == current_user.doctor_profile.id)
    else:
        # Admin / Staff can filter by patient_id or doctor_id
        if patient_id:
            query = query.filter(models.Appointment.patient_id == patient_id)
        if doctor_id:
            query = query.filter(models.Appointment.doctor_id == doctor_id)

    if status:
        query = query.filter(models.Appointment.status == status)

    appointments = query.order_by(models.Appointment.id.desc()).all()

    res = []
    for app in appointments:
        res.append(schemas.AppointmentOut(
            id=app.id,
            patient_id=app.patient_id,
            patient_name=app.patient.user.full_name if app.patient and app.patient.user else "Unknown Patient",
            doctor_id=app.doctor_id,
            doctor_name=app.doctor.user.full_name if app.doctor and app.doctor.user else "Unknown Doctor",
            department_id=app.department_id,
            department_name=app.department.name if app.department else "N/A",
            appointment_date=app.appointment_date,
            time_slot=app.time_slot,
            status=app.status,
            reason=app.reason,
            created_at=app.created_at
        ))
    return res

@router.post("", response_model=schemas.AppointmentOut)
def book_appointment(
    app_data: schemas.AppointmentCreate,
    patient_id_override: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Determine target patient
    target_patient_id = None
    if current_user.role == "patient":
        if not current_user.patient_profile:
            raise HTTPException(status_code=400, detail="User is not registered as a patient profile")
        target_patient_id = current_user.patient_profile.id
    elif current_user.role in ["admin", "staff"]:
        if not patient_id_override:
            raise HTTPException(status_code=400, detail="Staff/Admin must supply target patient_id")
        target_patient_id = patient_id_override
    else:
        raise HTTPException(status_code=403, detail="Doctor cannot book appointment directly")

    # Conflict check: prevent conflicting appointments for the same doctor at the same date and time_slot
    existing_conflict = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == app_data.doctor_id,
        models.Appointment.appointment_date == app_data.appointment_date,
        models.Appointment.time_slot == app_data.time_slot,
        models.Appointment.status.in_(["Scheduled", "Confirmed"])
    ).first()

    if existing_conflict:
        raise HTTPException(
            status_code=400,
            detail=f"Doctor already has a {existing_conflict.status} appointment at {app_data.time_slot} on {app_data.appointment_date}."
        )

    appointment = models.Appointment(
        patient_id=target_patient_id,
        doctor_id=app_data.doctor_id,
        department_id=app_data.department_id,
        appointment_date=app_data.appointment_date,
        time_slot=app_data.time_slot,
        status="Scheduled",
        reason=app_data.reason
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return schemas.AppointmentOut(
        id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=appointment.patient.user.full_name,
        doctor_id=appointment.doctor_id,
        doctor_name=appointment.doctor.user.full_name,
        department_id=appointment.department_id,
        department_name=appointment.department.name if appointment.department else "N/A",
        appointment_date=appointment.appointment_date,
        time_slot=appointment.time_slot,
        status=appointment.status,
        reason=appointment.reason,
        created_at=appointment.created_at
    )

@router.put("/{appointment_id}/status", response_model=schemas.AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    status_update: schemas.AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    app.status = status_update.status
    db.commit()
    db.refresh(app)

    return schemas.AppointmentOut(
        id=app.id,
        patient_id=app.patient_id,
        patient_name=app.patient.user.full_name if app.patient and app.patient.user else "Unknown Patient",
        doctor_id=app.doctor_id,
        doctor_name=app.doctor.user.full_name if app.doctor and app.doctor.user else "Unknown Doctor",
        department_id=app.department_id,
        department_name=app.department.name if app.department else "N/A",
        appointment_date=app.appointment_date,
        time_slot=app.time_slot,
        status=app.status,
        reason=app.reason,
        created_at=app.created_at
    )
