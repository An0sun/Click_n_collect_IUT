# R5A5_2025_MERIDJA_KYLLIAN_KARIM_BOUQSI_EXAUCE_PEMBELE

Projet prog avancé pour collect café

# Pour lancer le site frontend

_cd frontend/app_

_npm install_

_ng serve_

# Pour lancer le site backend

avoir python d'installé

_cd backend_

_pip install -r requirements.txt_

ou sinon : _pip install flask flask-cors flask-sqlalchemy flask-bcrypt flask-jwt-extended python-dotenv_

puis faire : _python app.py_ ou faire _python3 app.py_

## Gestion d'image produit (URL)

- Nouveau champ API: `image_url` (URL HTTP(S) optionnelle).
- Migration SQLite: exécuter `python backend/scripts/migrate_add_image_url.py` après une première exécution qui crée la base (`backend/instance/app.db`).
- DTOs/mapping mis à jour côté backend. Documentation Swagger mise à jour (`/apidocs/`).

### Frontend

- Modèle TypeScript `Product` enrichi: `imageUrl?: string | null`.
- Formulaires de création/mise à jour: champ Image URL optionnel (http/https).
- Cartes produit: affichage de l'image ou placeholder si absent.

### Tests

- Tests backend basiques: `backend/tests/test_product_image_url.py`.
