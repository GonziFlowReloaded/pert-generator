# Generador de Diagramas PERT

Esta herramienta permite generar diagramas PERT (Program Evaluation and Review Technique) a partir de datos de actividades de un proyecto. El diagrama PERT ayuda a visualizar las dependencias entre actividades, identificar la ruta crítica y calcular los tiempos estimados del proyecto.

## Características

- Generación automática de diagramas PERT
- Cálculo de la ruta crítica
- Visualización de tiempos estimados (optimista, probable, pesimista)
- Exportación del diagrama como imagen PNG
- Interfaz intuitiva y fácil de usar

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No se requieren dependencias adicionales

## Cómo Usar

1. **Preparar los datos del proyecto**
   - Los datos deben estar en formato JSON
   - Cada actividad debe tener la siguiente estructura:
   ```json
   {
     "Fase X": [
       {
         "actividad": 1,
         "precedente": "-",
         "tiempo_optimista": 3,
         "tiempo_probable": 5,
         "tiempo_pesimista": 7,
         "descripcion": "Descripción de la actividad"
       }
     ]
   }
   ```

2. **Campos requeridos para cada actividad**
   - `actividad`: Número identificador único
   - `precedente`: ID de las actividades predecesoras (separadas por comas) o "-" si no tiene predecesoras
   - `tiempo_optimista`: Tiempo mínimo estimado
   - `tiempo_probable`: Tiempo más probable
   - `tiempo_pesimista`: Tiempo máximo estimado
   - `descripcion`: Descripción breve de la actividad

3. **Generar el diagrama**
   - Ingresa los datos en el campo de texto JSON
   - Haz clic en "Generar Diagrama PERT"
   - El diagrama se generará automáticamente

4. **Exportar el diagrama**
   - Haz clic en "Exportar Diagrama como PNG"
   - Se descargará una imagen del diagrama

## Ejemplo de Datos

```json
{
  "Fase 1": [
    {
      "actividad": 1,
      "precedente": "-",
      "tiempo_optimista": 1,
      "tiempo_probable": 2,
      "tiempo_pesimista": 3,
      "descripcion": "Iniciar proyecto"
    },
    {
      "actividad": 2,
      "precedente": 1,
      "tiempo_optimista": 2,
      "tiempo_probable": 3,
      "tiempo_pesimista": 4,
      "descripcion": "Análisis de requisitos"
    }
  ],
  "Fase 2": [
    {
      "actividad": 3,
      "precedente": 2,
      "tiempo_optimista": 2,
      "tiempo_probable": 4,
      "tiempo_pesimista": 6,
      "descripcion": "Diseño"
    }
  ]
}
```

## Interpretación del Diagrama

- **Nodos**: Representan las actividades del proyecto
- **Flechas**: Indican las dependencias entre actividades
- **Ruta Crítica**: Se muestra en rojo, indica la secuencia de actividades que determina la duración total del proyecto
- **Tiempos**: 
  - ES: Early Start (Inicio temprano)
  - EF: Early Finish (Finalización temprana)
  - LS: Late Start (Inicio tardío)
  - LF: Late Finish (Finalización tardía)
  - Holgura: Diferencia entre LS y ES

## Consejos para Uso

1. **Organización de fases**
   - Agrupa las actividades en fases lógicas
   - Mantén una numeración consistente de actividades

2. **Dependencias**
   - Asegúrate de que todas las dependencias estén correctamente definidas
   - Evita ciclos en las dependencias

3. **Tiempos estimados**
   - Usa valores realistas para los tiempos
   - Considera la incertidumbre al definir los rangos

## Solución de Problemas

Si encuentras algún problema:

1. **Diagrama no se genera**
   - Verifica que el JSON sea válido
   - Asegúrate de que todos los campos requeridos estén presentes

2. **Flechas mal posicionadas**
   - Revisa las dependencias entre actividades
   - Verifica que los IDs de las actividades sean correctos

3. **Ruta crítica no se muestra**
   - Comprueba que los tiempos estimados sean coherentes
   - Verifica que las dependencias estén correctamente definidas

## Soporte

Si necesitas ayuda adicional:
- Revisa la documentación
- Verifica que los datos de entrada sean correctos
- Prueba con el ejemplo proporcionado

## Licencia

Este proyecto está disponible bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
