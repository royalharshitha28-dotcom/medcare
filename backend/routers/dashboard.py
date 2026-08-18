import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models, auth

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    today_str = datetime.date.today().isoformat()
    role = current_user.role

    if role == "admin":
        total_patients = db.query(models.Patient).count()
        total_doctors = db.query(models.Doctor).count()
        today_appointments = db.query(models.Appointment).filter(models.Appointment.appointment_date == today_str).count()
        completed_appointments = db.query(models.Appointment).filter(models.Appointment.status == "Completed").count()
        
        revenue = db.query(func.sum(models.Bill.paid_amount)).scalar() or 0.0
        pending_payments = db.query(func.sum(models.Bill.total_amount - models.Bill.paid_amount)).filter(models.Bill.status != "Paid").scalar() or 0.0

        return {
            "role": "admin",
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "today_appointments": today_appointments,
            "completed_appointments": completed_appointments,
            "total_revenue": round(revenue, 2),
            "pending_payments": round(pending_payments, 2)
        }

    elif role == "doctor":
        doc_id = current_user.doctor_profile.id if current_user.doctor_profile else None
        if not doc_id:
            return {"role": "doctor", "today_appointments": 0, "upcoming_appointments": 0, "total_patients": 0}

        today_appointments = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doc_id,
            models.Appointment.appointment_date == today_str
        ).count()

        upcoming_appointments = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doc_id,
            models.Appointment.status.in_(["Scheduled", "Confirmed"])
        ).count()

        total_patients = db.query(models.Consultation.patient_id).filter(
            models.Consultation.doctor_id == doc_id
        ).distinct().count()

        return {
            "role": "doctor",
            "today_appointments": today_appointments,
            "upcoming_appointments": upcoming_appointments,
            "total_patients": total_patients
        }

    elif role == "staff":
        today_appointments = db.query(models.Appointment).filter(models.Appointment.appointment_date == today_str).count()
        new_patients = db.query(models.Patient).count()
        pending_appointments = db.query(models.Appointment).filter(models.Appointment.status == "Scheduled").count()
        pending_bills = db.query(models.Bill).filter(models.Bill.status != "Paid").count()

        return {
            "role": "staff",
            "today_appointments": today_appointments,
            "new_patients": new_patients,
            "pending_appointments": pending_appointments,
            "pending_bills": pending_bills
        }

    elif role == "patient":
        pat_id = current_user.patient_profile.id if current_user.patient_profile else None
        if not pat_id:
            return {"role": "patient", "upcoming_appointments": 0, "prescriptions_count": 0, "records_count": 0, "pending_bills": 0}

        upcoming_appointments = db.query(models.Appointment).filter(
            models.Appointment.patient_id == pat_id,
            models.Appointment.status.in_(["Scheduled", "Confirmed"])
        ).count()

        prescriptions_count = db.query(models.Prescription).filter(models.Prescription.patient_id == pat_id).count()
        records_count = db.query(models.MedicalRecord).filter(models.MedicalRecord.patient_id == pat_id).count()
        pending_bills = db.query(models.Bill).filter(models.Bill.patient_id == pat_id, models.Bill.status != "Paid").count()

        return {
            "role": "patient",
            "upcoming_appointments": upcoming_appointments,
            "prescriptions_count": prescriptions_count,
            "records_count": records_count,
            "pending_bills": pending_bills
        }
