from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "patient" # patient, doctor, staff, admin
    
    # Optional patient info
    contact: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    full_name: str
    role: str
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

# Doctor Schemas
class DoctorCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    department_id: int
    specialization: str
    qualification: str
    contact: str
    consultation_fee: float = 50.0
    availability: str = "Mon-Fri 09:00 - 17:00"

class DoctorOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    department_id: int
    department_name: Optional[str] = None
    specialization: str
    qualification: str
    contact: str
    consultation_fee: float
    availability: str
    is_active: bool

    class Config:
        from_attributes = True

# Patient Schemas
class PatientCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    contact: str
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

class PatientOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    contact: str
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentCreate(BaseModel):
    doctor_id: int
    department_id: int
    appointment_date: str # YYYY-MM-DD
    time_slot: str # "10:00 AM"
    reason: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str # Scheduled, Confirmed, Completed, Cancelled, No Show

class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    doctor_id: int
    doctor_name: Optional[str] = None
    department_id: int
    department_name: Optional[str] = None
    appointment_date: str
    time_slot: str
    status: str
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Prescription Item
class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionItemOut(PrescriptionItemCreate):
    id: int
    class Config:
        from_attributes = True

# Consultation Schema
class ConsultationCreate(BaseModel):
    appointment_id: int
    symptoms: str
    diagnosis: str
    doctor_notes: Optional[str] = None
    vitals: Optional[str] = None
    follow_up_date: Optional[str] = None
    prescriptions: List[PrescriptionItemCreate] = []

class ConsultationOut(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    patient_name: Optional[str] = None
    doctor_id: int
    doctor_name: Optional[str] = None
    symptoms: str
    diagnosis: str
    doctor_notes: Optional[str] = None
    vitals: Optional[str] = None
    follow_up_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Prescription Out
class PrescriptionOut(BaseModel):
    id: int
    consultation_id: int
    patient_id: int
    patient_name: Optional[str] = None
    doctor_id: int
    doctor_name: Optional[str] = None
    items: List[PrescriptionItemOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Medical Record
class MedicalRecordCreate(BaseModel):
    patient_id: int
    title: str
    summary: str

class MedicalRecordOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    consultation_id: Optional[int] = None
    title: str
    summary: str
    record_date: datetime

    class Config:
        from_attributes = True

# Lab Report
class LabReportCreate(BaseModel):
    patient_id: int
    test_name: str
    test_date: str
    result: str
    remarks: Optional[str] = None

class LabReportOut(LabReportCreate):
    id: int
    doctor_id: Optional[int] = None
    patient_name: Optional[str] = None
    class Config:
        from_attributes = True

# Bill Schemas
class BillCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    consultation_charge: float = 0.0
    lab_charge: float = 0.0
    other_charge: float = 0.0
    discount: float = 0.0

class PaymentCreate(BaseModel):
    bill_id: int
    amount: float
    payment_method: str = "Cash"

class BillOut(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    appointment_id: Optional[int] = None
    consultation_charge: float
    lab_charge: float
    other_charge: float
    discount: float
    total_amount: float
    paid_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
