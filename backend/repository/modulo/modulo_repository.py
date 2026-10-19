from sqlalchemy.orm import Session

from models.modulo import Modulo


def get_by_id(db: Session, modulo_id: int):
    return db.query(Modulo).filter(Modulo.id == modulo_id).first()


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Modulo).offset(skip).limit(limit).all()


def create(db: Session, values: dict):
    value = Modulo(**values)
    db.add(value)
    db.commit()
    db.refresh(value)
    return value


def update(db: Session, modulo_id: int, values: dict):
    value = get_by_id(db, modulo_id)
    if not value:
        return None
    for key, item in values.items():
        if item is not None:
            setattr(value, key, item)
    db.commit()
    db.refresh(value)
    return value


def delete(db: Session, modulo_id: int) -> bool:
    value = get_by_id(db, modulo_id)
    if not value:
        return False
    db.delete(value)
    db.commit()
    return True
