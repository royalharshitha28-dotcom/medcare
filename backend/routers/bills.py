from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/bills", tags=["Bills & Payments"])

@router.get("", response_model=List[schemas.BillOut])
def get_bills(
    patient_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Bill)

    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(models.Bill.patient_id == current_user.patient_profile.id)
    else:
        if patient_id:
            query = query.filter(models.Bill.patient_id == patient_id)

    bills = query.order_by(models.Bill.id.desc()).all()
    res = []
    for b in bills:
        res.append(schemas.BillOut(
            id=b.id,
            patient_id=b.patient_id,
            patient_name=b.patient.user.full_name if b.patient and b.patient.user else "Patient",
            appointment_id=b.appointment_id,
            consultation_charge=b.consultation_charge,
            lab_charge=b.lab_charge,
            other_charge=b.other_charge,
            discount=b.discount,
            total_amount=b.total_amount,
            paid_amount=b.paid_amount,
            status=b.status,
            created_at=b.created_at
        ))
    return res

@router.post("", response_model=schemas.BillOut)
def create_bill(
    bill_data: schemas.BillCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_role(["admin", "staff"]))
):
    subtotal = bill_data.consultation_charge + bill_data.lab_charge + bill_data.other_charge
    total = max(0.0, subtotal - bill_data.discount)

    bill = models.Bill(
        patient_id=bill_data.patient_id,
        appointment_id=bill_data.appointment_id,
        consultation_charge=bill_data.consultation_charge,
        lab_charge=bill_data.lab_charge,
        other_charge=bill_data.other_charge,
        discount=bill_data.discount,
        total_amount=total,
        paid_amount=0.0,
        status="Pending"
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)

    return schemas.BillOut(
        id=bill.id,
        patient_id=bill.patient_id,
        patient_name=bill.patient.user.full_name if bill.patient and bill.patient.user else "Patient",
        appointment_id=bill.appointment_id,
        consultation_charge=bill.consultation_charge,
        lab_charge=bill.lab_charge,
        other_charge=bill.other_charge,
        discount=bill.discount,
        total_amount=bill.total_amount,
        paid_amount=bill.paid_amount,
        status=bill.status,
        created_at=bill.created_at
    )

@router.post("/{bill_id}/payments", response_model=schemas.BillOut)
def record_payment(
    bill_id: int,
    payment_data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_role(["admin", "staff"]))
):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    payment = models.Payment(
        bill_id=bill.id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method
    )
    db.add(payment)

    bill.paid_amount += payment_data.amount
    if bill.paid_amount >= bill.total_amount:
        bill.status = "Paid"
    elif bill.paid_amount > 0:
        bill.status = "Partially Paid"

    db.commit()
    db.refresh(bill)

    return schemas.BillOut(
        id=bill.id,
        patient_id=bill.patient_id,
        patient_name=bill.patient.user.full_name if bill.patient and bill.patient.user else "Patient",
        appointment_id=bill.appointment_id,
        consultation_charge=bill.consultation_charge,
        lab_charge=bill.lab_charge,
        other_charge=bill.other_charge,
        discount=bill.discount,
        total_amount=bill.total_amount,
        paid_amount=bill.paid_amount,
        status=bill.status,
        created_at=bill.created_at
    )
