from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/departments", tags=["Departments"])

@router.get("", response_model=List[schemas.DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).filter(models.Department.is_active == True).all()

@router.post("", response_model=schemas.DepartmentOut)
def create_department(
    dept_data: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(["admin"]))
):
    existing = db.query(models.Department).filter(models.Department.name == dept_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")

    dept = models.Department(**dept_data.dict())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.put("/{dept_id}", response_model=schemas.DepartmentOut)
def update_department(
    dept_id: int,
    dept_data: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(["admin"]))
):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    dept.name = dept_data.name
    dept.description = dept_data.description
    dept.is_active = dept_data.is_active
    db.commit()
    db.refresh(dept)
    return dept
