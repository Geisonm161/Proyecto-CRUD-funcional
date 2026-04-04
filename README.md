# Proyecto-CRUD-funcional

CRUD de tareas con HTML, CSS y JavaScript (sin backend), usando `localStorage` para persistencia.

## Funcionalidades
- Crear tareas
- Listar tareas
- Editar tareas
- Eliminar tareas
- Buscar por titulo o descripcion

## Estructura
- `index.html`: interfaz principal
- `styles.css`: estilos de la aplicacion
- `app.js`: logica CRUD

## Ejecucion
Abrir `index.html` en el navegador.

## Git Flow aplicado
- Ramas base: `main`, `developer`, `qa`
- Ramas de trabajo implementadas:
	- `feature/crud-base`
	- `feature/validate-user-input`
	- `feature/task-status`
	- `feature/export-json`
	- `hotfix/fix-date-format`
- Integracion: cada rama de trabajo fue fusionada en `developer`, `qa` y `main`.
- Estado final: todos los cambios se encuentran integrados en `main`.
