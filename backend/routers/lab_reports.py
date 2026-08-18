from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api", tags=["Lab Reports & Medical Records"])

@router.get("/lab-reports", response_model=List[schemas.LabReportOut])
def get_lab_reports(
    patient_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.LabReport)
    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(models.LabReport.patient_id == current_user.patient_profile.id)
    else:
        if patient_id:
            query = query.filter(models.LabReport.patient_id == patient_id)

    reports = query.order_by(models.LabReport.id.desc()).all()
    res = []
    for r in reports:
        res.append(schemas.LabReportOut(
            id=r.id,
            patient_id=r.patient_id,
            patient_name=r.patient.user.full_name if r.patient and r.patient.user else "Patient",
            doctor_id=r.doctor_id,
            test_name=r.test_name,
            test_date=r.test_date,
            result=r.result,
            remarks=r.remarks
        ))
    return res

@router.post("/lab-reports", response_model=schemas.LabReportOut)
def create_lab_report(
    report_data: schemas.LabReportCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_role(["admin", "staff", "doctor"]))
):
    doctor_id = user.doctor_profile.id if user.doctor_profile else None
    report = models.LabReport(
        patient_id=report_data.patient_id,
        doctor_id=doctor_id,
        test_name=report_data.test_name,
        test_date=report_data.test_date,
        result=report_data.result,
        remarks=report_data.remarks
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return schemas.LabReportOut(
        id=report.id,
        patient_id=report.patient_id,
        patient_name=report.patient.user.full_name if report.patient and report.patient.user else "Patient",
        doctor_id=report.doctor_id,
        test_name=report.test_name,
        test_date=report.test_date,
        result=report.result,
        remarks=report.remarks
    )

@router.get("/medical-records", response_model=List[schemas.MedicalRecordOut])
def get_medical_records(
    patient_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.MedicalRecord)
    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(models.MedicalRecord.patient_id == current_user.patient_profile.id)
    else:
        if patient_id:
            query = query.filter(models.MedicalRecord.patient_id == patient_id)

    records = query.order_by(models.MedicalRecord.id.desc()).all()
    return records
