# Sansisoft -Automation
# 🧩 Framework de Automatización UI y API con NodeJS + Playwright

## 📘 Descripción

En este proyecto se implementó un **framework de automatización** para pruebas **UI y API** utilizando **Playwright con NodeJS**. 

## 🎯 Objetivo del Framework
El objetivo es garantizar la **calidad, estabilidad y funcionalidad** de la aplicacion Trello, mediante un enfoque modular y reutilizable.

El framework está diseñado bajo los principios de:
- **Page Object Model (POM)**
- **Data Driven Testing (DDT)**
- **Integración continua (CI/CD)** con GitHub Actions.
- **Reportes automáticos** ( HTML)

## ⚙️ Tecnologías Utilizadas

| Herramienta | Descripción |
|--------------|-------------|
| **NodeJS** | Entorno de ejecución JavaScript. |
| **Playwright** | Framework para pruebas E2E y UI multi-navegador. |
| **Playwright Reporter** | Reporte de Playwright que se genera automáticamente tras la ejecución, mostrando resultados, capturas. |
| **dotenv** | Manejo de variables de entorno. |
| **Faker.js** | Generación de datos aleatorios para pruebas (DDT). |

## 🧱 Estructura del Proyecto
Estructura del framework de automatización construido con **NodeJS + Playwright**, siguiendo los principios de **Page Object Model (POM)**, **Data Driven Testing (DDT)** y **modularidad** para pruebas UI y API de la aplicación **Trello**.

```
📦 trello---sansisoft
├── 📁 .github/workflows
│ └── playwright-tests.yml
│
├── 📁 data # Archivos JSON con datos de prueba (enfoque DDT)
│ ├── add-comments-cases.json
│ ├── card-names-cases.json
│ ├── checklists.json
│ ├── list-create-board-API.json
│ ├── list-create-cases.json
│ ├── list-edit-cases.json
│ ├── nombres-tablero.json
│ └── storageState.json 
│
├── 📁 fixtures # Fixtures reutilizables que preparan el contexto de ejecución
│ ├── api.js # Configuración base para pruebas API
│ ├── card.js # Fixture de flujo de tarjetas
│ ├── create_and_open_card.js # Crea y abre una tarjeta existente
│ ├── list.js # Fixture de flujo de listas
│ ├── login.js # Fixture para login y autenticación
│ └── td_board.js # Fixture para creación de tablero temporal
│
├── 📁 logs # Almacenamiento de logs de ejecución
│ └── app.log
│
├── 📁 pages #  (Page Object Model)
│ ├── 📁 components 
│ ├── board_list.js 
│ ├── board_page.js 
│ ├── card_page.js 
│ ├── list_page.js 
│ ├── login_page.js 
│ └── trello_home_page.js 
│
│
├── 📁 tests
│ ├──📁 setup
│ │ │── auth.setup.js   
│ ├─ 📁 tests_API 
│ │ ├── 📁 boards 
│ │ ├── 📁 cards 
│ │ └── 📁 lists 
│ │
│ ├── 📁 tests_UI 
│ │ ├── 📁 boards 
│ │ ├── 📁 card_comments 
│ │ ├── 📁 cards 
│ │ └── 📁 lists 
│
├── 📁 uploads 
│ └── test.txt
│
├── 📁 utils
│ ├──📁 scripts 
│ ├── helpers.js
│ ├── helpers_ui.js
│ │── logger.js
│ ├── routes.js
│ └── trello_api.js
│
├── .env 
├── .env.example 
├── .gitignore 
├── README.md 
├── package.json 
└── playwright.config.js 

```

### Instalación:
1. Inicializar el proyecto con Node.js

```sh
npm init -y
```

2. Instalar Playwright Test

```sh
npm install -D @playwright/test
```

3. Instalar los drivers de los navegadores

```sh
npx playwright install
```

### Ejecución de tests

```sh
npx playwright test
```

Modo Headed (headless = false) para ver la ejecución del navegador:
```sh
npx playwright test --headed
```
