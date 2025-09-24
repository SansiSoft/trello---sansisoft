# Sansisoft -Automation
## Framework de automatización - Playwright and Javascript

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

