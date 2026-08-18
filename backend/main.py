from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from seed import seed_db

from routers import (
    auth,
    departments,
    doctors,
    patients,
    appointments,
    consultations,
    prescriptions,
    lab_reports,
    bills,
    dashboard
)

# Initialize Database and Seed Data
Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI(
    title="Hospital Management System API",
    description="Full stack API for Patient, Doctor, Staff and Admin operations",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(consultations.router)
app.include_router(prescriptions.router)
app.include_router(lab_reports.router)
app.include_router(bills.router)
app.include_router(dashboard.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Hospital Management System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
