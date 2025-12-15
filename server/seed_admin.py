from database import SessionLocal, engine
import models
import auth
from sqlalchemy.orm import Session

# Create tables if not exist (though main app does this)
models.Base.metadata.create_all(bind=engine)

def seed_admin():
    db = SessionLocal()
    try:
        username = "admin"
        password = "admin123"
        hashed_password = auth.get_password_hash(password)
        
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            print(f"User {username} exists. Updating to ADMIN and resetting password.")
            user.role = models.UserRole.ADMIN
            user.hashed_password = hashed_password
        else:
            print(f"Creating new ADMIN user {username}.")
            user = models.User(
                username=username,
                email="admin@example.com",
                hashed_password=hashed_password,
                role=models.UserRole.ADMIN
            )
            db.add(user)
        
        db.commit()
        print("Success! Credentials:")
        print(f"Username: {username}")
        print(f"Password: {password}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
