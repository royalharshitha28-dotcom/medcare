import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'admin', 'doctor', 'staff', 'patient'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    doctors = relationship("Doctor", back_populates="department")
    appointments = relationship("Appointment", back_populates="department")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    specialization = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    consultation_fee = Column(Float, default=50.0)
    availability = Column(String, default="Mon-Fri 09:00 - 17:00")
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    consultations = relationship("Consultation", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dob = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    contact = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    blood_group = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    consultations = relationship("Consultation", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
    lab_reports = relationship("LabReport", back_populates="patient")
    bills = relationship("Bill", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    appointment_date = Column(String, nullable=False) # YYYY-MM-DD
    time_slot = Column(String, nullable=False) # e.g. "10:00 AM"
    status = Column(String, default="Scheduled") # Scheduled, Confirmed, Completed, Cancelled, No Show
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    department = relationship("Department", back_populates="appointments")
    consultation = relationship("Consultation", back_populates="appointment", uselist=False)
    bill = relationship("Bill", back_populates="appointment", uselist=False)

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    symptoms = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=False)
    doctor_notes = Column(Text, nullable=True)
    vitals = Column(String, nullable=True) # e.g. "BP: 120/80, Temp: 98.6F"
    follow_up_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    appointment = relationship("Appointment", back_populates="consultation")
    patient = relationship("Patient", back_populates="consultations")
    doctor = relationship("Doctor", back_populates="consultations")
    prescription = relationship("Prescription", back_populates="consultation", uselist=False)

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="prescription")
    patient = relationship("Patient", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    instructions = Column(String, nullable=True)

    prescription = relationship("Prescription", back_populates="items")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    record_date = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="medical_records")

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    test_name = Column(String, nullable=False)
    test_date = Column(String, nullable=False)
    result = Column(Text, nullable=False)
    remarks = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="lab_reports")

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    consultation_charge = Column(Float, default=0.0)
    lab_charge = Column(Float, default=0.0)
    other_charge = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Pending, Partially Paid, Paid
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="bills")
    appointment = relationship("Appointment", back_populates="bill")
    payments = relationship("Payment", back_populates="bill", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="Cash") # Cash, Credit Card, Insurance, UPI
    transaction_date = Column(DateTime, default=datetime.datetime.utcnow)

    bill = relationship("Bill", back_populates="payments")
