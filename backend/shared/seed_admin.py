import os
from src.app import create_app
from src.models.user_model import db, User, UserRole
from src.utils.security import make_password_hash

""" Execution : 
export ADMIN_EMAIL=admin@iut.univ-paris8.fr
export ADMIN_PASSWORD='MdpBienSolideMec456!'
python -m scripts.seed_admin
"""
def main():
    app = create_app()
    with app.app_context():
        email = os.getenv("ADMIN_EMAIL", "admin@iut.univ-paris8.fr")
        pwd   = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")
        first = os.getenv("ADMIN_FIRST", "Admin")
        last  = os.getenv("ADMIN_LAST", "IUT")

        exists = User.query.filter_by(email=email).first()
        if exists:
            print("[seed] Admin already exists:", email)
            return

        admin = User(
            first_name=first,
            last_name=last,
            email=email,
            password_hash=make_password_hash(pwd),
            role=UserRole.ADMIN
        )
        db.session.add(admin)
        db.session.commit()
        print("[seed] Admin created:", email)

if __name__ == "__main__":
    main()


