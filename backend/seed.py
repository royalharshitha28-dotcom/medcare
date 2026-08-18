import datetime
from database import engine, SessionLocal, Base
import models, auth

def seed_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.Department).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with initial demo data...")


    # 1. Departments
    depts = [
        models.Department(name="Cardiology", description="Heart & Vascular Health Care"),
        models.Department(name="Pediatrics", description="Child & Adolescent Medicine"),
        models.Department(name="Neurology", description="Brain & Nervous System Care"),
        models.Department(name="Orthopedics", description="Bone, Joint & Muscle Care"),
        models.Department(name="General Medicine", description="Primary Health Care & Wellness")
    ]
    db.add_all(depts)
    db.commit()
    for d in depts:
        db.refresh(d)

    # 2. Users & Roles
    # Admin
    admin_user = models.User(
        email="admin@hospital.com",
        password_hash=auth.hash_password("admin123"),
        full_name="Hospital Administrator",
        role="admin"
    )
    # Staff / Receptionist
    staff_user = models.User(
        email="staff@hospital.com",
        password_hash=auth.hash_password("staff123"),
        full_name="Jane Smith (Receptionist)",
        role="staff"
    )
    # Doctor 1 - Dr. Sarah Jenkins (Cardiology)
    doc1_user = models.User(
        email="dr.sarah@hospital.com",
        password_hash=auth.hash_password("doctor123"),
        full_name="Dr. Sarah Jenkins",
        role="doctor"
    )
    # Doctor 2 - Dr. Alan Grant (Pediatrics)
    doc2_user = models.User(
        email="dr.alan@hospital.com",
        password_hash=auth.hash_password("doctor123"),
        full_name="Dr. Alan Grant",
        role="doctor"
    )
    # Patient 1 - John Doe
    pat1_user = models.User(
        email="patient@hospital.com",
        password_hash=auth.hash_password("patient123"),
        full_name="John Doe",
        role="patient"
    )

    db.add_all([admin_user, staff_user, doc1_user, doc2_user, pat1_user])
    db.commit()
    for u in [admin_user, staff_user, doc1_user, doc2_user, pat1_user]:
        db.refresh(u)

    # 3. Doctor Profiles
    doc1_profile = models.Doctor(
        user_id=doc1_user.id,
        department_id=depts[0].id, # Cardiology
        specialization="Cardiology Specialist",
        qualification="MD, FACC",
        contact="+1 (555) 234-5678",
        consultation_fee=100.0,
        availability="Mon-Fri 09:00 - 16:00"
    )
    doc2_profile = models.Doctor(
        user_id=doc2_user.id,
        department_id=depts[1].id, # Pediatrics
        specialization="Pediatrics Specialist",
        qualification="MBBS, DCH",
        contact="+1 (555) 876-5432",
        consultation_fee=75.0,
        availability="Mon-Sat 10:00 - 15:00"
    )
    db.add_all([doc1_profile, doc2_profile])
    db.commit()
    db.refresh(doc1_profile)
    db.refresh(doc2_profile)

    # 4. Patient Profile
    pat1_profile = models.Patient(
        user_id=pat1_user.id,
        dob="1990-05-15",
        gender="Male",
        contact="+1 (555) 999-0011",
        address="123 Health Ave, Medical City",
        blood_group="O+",
        emergency_contact="Mary Doe (+1 555 999-0022)",
        medical_history="Mild Hypertension",
        allergies="Penicillin"
    )
    db.add(pat1_profile)
    db.commit()
    db.refresh(pat1_profile)

    # 5. Initial Sample Appointment
    today_str = datetime.date.today().isoformat()
    app1 = models.Appointment(
        patient_id=pat1_profile.id,
        doctor_id=doc1_profile.id,
        department_id=depts[0].id,
        appointment_date=today_str,
        time_slot="10:00 AM",
        status="Confirmed",
        reason="Routine Cardiac Checkup & Chest Tightness"
    )
    db.add(app1)
    db.commit()
    db.refresh(app1)

    # 6. Sample Initial Bill
    bill1 = models.Bill(
        patient_id=pat1_profile.id,
        appointment_id=app1.id,
        consultation_charge=100.0,
        lab_charge=50.0,
        other_charge=0.0,
        discount=10.0,
        total_amount=140.0,
        paid_amount=0.0,
        status="Pending"
    )
    db.add(bill1)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
