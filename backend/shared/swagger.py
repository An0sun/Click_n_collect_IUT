from __future__ import annotations
from pathlib import Path
from typing import Callable, TypedDict, Optional
import yaml
import logging
from flasgger import Swagger


class SwaggerSpec(TypedDict):
    endpoint: str
    route: str
    rule_filter: Callable
    model_filter: Callable


class SwaggerConfig(TypedDict, total=False):
    headers: list[dict[str, str]]
    specs: list[SwaggerSpec]
    static_url_path: str
    swagger_ui: bool
    specs_route: str
    doc_dir: str


class SwaggerTemplate(TypedDict, total=False):
    swagger: str
    info: dict[str, str]
    basePath: str
    tags: list[dict[str, str]]
    definitions: dict[str, dict]


# === Logger ===
logger = logging.getLogger(__name__)


def init_swagger(app) -> Optional[Swagger]:
    """
    Initialise la documentation Swagger / Flasgger pour l'application Flask.
    """
    # Dossier docs/
    docs_dir: Path = Path(__file__).resolve().parents[1] / "docs"
    defs_path: Path = docs_dir / "definitions.yaml"

    # === Template de base ===
    template: SwaggerTemplate = {
        "swagger": "2.0",
        "info": {
            "title": "Click & Collect API",
            "version": "1.0.0",
            "description": (
                "Documentation interactive de l’API Flask.\n\n"
                "Endpoints disponibles : produits et commandes."
            ),
        },
        "basePath": "/",
        "tags": [
            {"name": "products", "description": "Endpoints liés à la gestion des produits"},
            {"name": "orders", "description": "Endpoints liés à la gestion des commandes"},
        ],
        "securityDefinitions": {
            "BearerAuth": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Bearer token. Exemple : **Bearer &lt;votre_token&gt;**"
            }
        },
        "security": [
            {"BearerAuth": []}
        ],
    }

    # === Chargement des définitions globales ===
    if not defs_path.exists():
        raise FileNotFoundError(f"Fichier Swagger introuvable : {defs_path}")

    try:
        with defs_path.open(encoding="utf-8") as f:
            defs = yaml.safe_load(f) or {}
            if "definitions" in defs:
                template["definitions"] = defs["definitions"]
                logger.info(
                    "Swagger : %d définitions globales importées depuis %s",
                    len(defs["definitions"]),
                    defs_path,
                )
            else:
                logger.warning("Clé 'definitions' absente dans %s", defs_path)
    except yaml.YAMLError as e:
        logger.error("Erreur YAML dans %s : %s", defs_path, e)
        raise

    # === Config Flasgger ===
    config_dict: SwaggerConfig = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/",
        "doc_dir": str(docs_dir.resolve()),
    }

    swagger = Swagger(app, template=template, config=config_dict)
    logger.info(
        "Swagger initialisé. Documentation accessible sur /apidocs/ (dossier : %s)",
        docs_dir,
    )
    return swagger
