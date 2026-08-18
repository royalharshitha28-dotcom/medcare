from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/consultations", tags=["Consultations"])

@router.get("", response_model=List[schemas.ConsultationOut])
def get_consultations(
    patient_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Consultation)

    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(models.Consultation.patient_id == current_user.patient_profile.id)
    elif current_user.role == "doctor":
        if not current_user.doctor_profile:
            return []
        query = query.filter(models.Consultation.doctor_id == current_user.doctor_profile.id)
    else:
        if patient_id:
            query = query.filter(models.Consultation.patient_id == patient_id)

    consultations = query.order_by(models.Consultation.id.desc()).all()

    res = []
    for c in consultations:
        res.append(schemas.ConsultationOut(
            id=c.id,
            appointment_id=c.appointment_id,
            patient_id=c.patient_id,
            patient_name=c.patient.user.full_name if c.patient and c.patient.user else "Patient",
            doctor_id=c.doctor_id,
            doctor_name=c.doctor.user.full_name if c.doctor and c.doctor.user else "Doctor",
            symptoms=c.symptoms,
            diagnosis=c.diagnosis,
            doctor_notes=c.doctor_notes,
            vitals=c.vitals,
            follow_up_date=c.follow_up_date,
            created_at=c.created_at
        ))
    return res

@router.post("", response_model=schemas.ConsultationOut)
def create_consultation(
    cons_data: schemas.ConsultationCreate,
    db: Session = Depends(get_db),
    doctor_user: models.User = Depends(auth.require_role(["doctor"]))
):
    if not doctor_user.doctor_profile:
        raise HTTPException(status_code=400, detail="User is not associated with a doctor profile")

    doctor = doctor_user.doctor_profile

    appointment = db.query(models.Appointment).filter(models.Appointment.id == cons_data.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Save Consultation
    consultation = models.Consultation(
        appointment_id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=doctor.id,
        symptoms=cons_data.symptoms,
        diagnosis=cons_data.diagnosis,
        doctor_notes=cons_data.doctor_notes,
        vitals=cons_data.vitals,
        follow_up_date=cons_data.follow_up_date
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # Mark appointment as Completed
    appointment.status = "Completed"
    db.commit()

    # Automatically create Prescription if items provided
    if cons_data.prescriptions:
        prescription = models.Prescription(
            consultation_id=consultation.id,
            patient_id=appointment.patient_id,
            doctor_id=doctor.id
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)

        for pitem in cons_data.prescriptions:
            item = models.PrescriptionItem(
                prescription_id=prescription.id,
                medicine_name=pitem.medicine_name,
                dosage=pitem.dosage,
                frequency=pitem.frequency,
                duration=pitem.duration,
                instructions=pitem.instructions
            )
            db.add(item)
        db.commit()

    # Automatically create Medical Record entry
    med_record = models.MedicalRecord(
        patient_id=appointment.patient_id,
        doctor_id=doctor.id,
        consultation_id=consultation.id,
        title=f"Consultation: {cons_data.diagnosis}",
        summary=f"Symptoms: {cons_data.symptoms}\nDiagnosis: {cons_data.diagnosis}\nNotes: {cons_data.doctor_notes or 'N/A'}"
    )
    db.add(med_record)
    db.commit()

    # Automatically generate default bill for consultation fee if no bill exists for appointment
    existing_bill = db.query(models.Bill).filter(models.Bill.appointment_id == appointment.id).first()
    if not existing_bill:
        fee = doctor.consultation_fee or 50.0
        bill = models.Bill(
            patient_id=appointment.patient_id,
            appointment_id=appointment.id,
            consultation_charge=fee,
            total_amount=fee,
            paid_amount=0.0,
            status="Pending"
        )
        db.add(bill)
        db.commit()

    return schemas.ConsultationOut(
        id=consultation.id,
        appointment_id=consultation.appointment_id,
        patient_id=consultation.patient_id,
        patient_name=consultation.patient.user.full_name if consultation.patient else "Patient",
        doctor_id=consultation.doctor_id,
        doctor_name=consultation.doctor.user.full_name if consultation.doctor else "Doctor",
        symptoms=consultation.symptoms,
        diagnosis=consultation.diagnosis,
        doctor_notes=consultation.doctor_notes,
        vitals=consultation.vitals,
        follow_up_date=consultation.follow_up_date,
        created_at=consultation.created_at
    )
