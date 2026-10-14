# Observatorio de Población Validada FONASA (2026 - 2027)
### Red de Salud Municipal de Lampa • Atención Primaria de Salud (APS)

Dashboard analítico web interactivo de alto rendimiento desarrollado en **HTML5, Tailwind CSS y JavaScript moderno**, diseñado para visualizar, filtrar y analizar en tiempo real los registros oficiales de la población inscrita validada per cápita ante FONASA.

---

## 🚀 Enlace de Datos en Vivo
El dashboard se sincroniza automáticamente con la planilla oficial publicada en Google Sheets:
* **URL Fuente:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vQNvnBL8JmRnslsqopUX2KNx4uIgf887KyudrbCqwCXhCMyctxMH8phe0ZitiT2en6e4Rw5jSIySdVK/pub?gid=232444535&single=true&output=csv`
* **Registros totales procesados:** **181.299 registros individuales**
  - **Proceso 2026:** 89.036 validados (Corte 30/09/2025)
  - **Proceso 2027:** 92.263 validados (Corte 30/09/2026)
  - **Crecimiento comunal:** **+3.227 inscritos (+3.62%)**

---

## 🌟 Características Principales

### 1. Conectividad Dinámica y Modo Sin Conexión
- **Extracción en vivo:** Descarga y parsea el CSV oficial de Google Sheets al iniciar.
- **Respaldo Local (`data.csv`):** Si estás sin conexión o en una red aislada, carga automáticamente la copia local.
- **Drag & Drop:** Puedes arrastrar cualquier archivo `.csv` directamente sobre la ventana para analizar nuevos cortes.
- **Botón "Subir CSV" y "Actualizar":** Permite forzar la recarga desde la nube o seleccionar un archivo de tu equipo.

### 2. Tarjetas de Métricas Ejecutivas (KPIs)
- **Total de Validados:** Con comparativa porcentual y absoluta interanual.
- **Distribución por Género:** % Mujeres, % Hombres y barra de proporción interactiva.
- **Vulnerabilidad FONASA (Tramos A y B):** Cuantificación de personas en gratuidad o ingresos mínimos.
- **Población Adulto Mayor (60+ y 80+ años):** Identificación de personas de la tercera y cuarta edad.
- **Población Migrante:** Conteo y variación porcentual (+22.6% de aumento en 2027).
- **Grupos Prioritarios:** Beneficiarios del Programa PRAIS, Personas con Discapacidad y Cuidadores acreditados.

### 3. Siete Módulos de Análisis Especializado (Pestañas)
1. **📊 Visión General:** KPIs ejecutivos, gráficos de centros de salud, distribución por tramos FONASA, desglose territorial por sectores y el **Índice Compuesto de Vulnerabilidad y Demanda Asistencial por Centro**.
2. **📈 Comparativo 2026 vs 2027:** Análisis interanual profundo con 4 banners de variación neta, gráficos divergentes de crecimiento por establecimiento, migración inter-tramos FONASA (explosión del Tramo A), variación en los 18 grupos etarios, crecimiento de la población migrante y **Matriz Comparativa Interanual dinámica**.
3. **👥 Demografía y Pirámide:** Pirámide poblacional bimodal oficial en **18 grupos etarios** (desde *Menos de 1 año* hasta *80 y más años*), botón de inversión de orden, tabla demográfica completa de 18 filas e indicadores de envejecimiento y masculinidad.
4. **🏥 Tramos FONASA:** Estructura porcentual por establecimiento (gráfico 100% apilado), evolución de los tramos A, B, C, D y X, y tarjetas explicativas según normativa de salud.
5. **🌎 Migración & Inclusión:** Ranking de las principales nacionalidades extranjeras (Venezuela, Perú, Bolivia, Colombia, Haití, etc.), pueblos originarios registrados y distribución territorial de programas prioritarios.
6. **💰 Financiamiento Per Cápita:** Calculadora y simulador financiero oficial que permite ajustar el valor per cápita basal mensual y los factores indexadores comunales (pobreza y ruralidad) para proyectar el presupuesto anual de la salud municipal y su distribución estimada en cada uno de los 5 centros.
7. **📋 Explorador de Datos:** Buscador en tiempo real con paginación optimizada, selector de tamaño de página y botón para **exportar a CSV con codificación UTF-8 compatible con Microsoft Excel**.

### 4. Nuevas Herramientas Avanzadas de Gestión Sanitaria
- **🚨 Monitor de Cohortes de Riesgo y Alertas Sanitarias (1 Clic):** Barra superior de botones reactivos que filtra al instante cohortes prioritarias: *Adultos 65+ en Pobreza (Tramo A)*, *Infancia Vulnerable (0-4 años en Tramo A)*, *Salud de la Mujer (15-49 años)*, *Brecha de Cuidadores (Discapacidad sin cuidador)*, *Primera Infancia Migrante (<10 años)* y *Tramo X (Previsión en trámite)*.
- **🏛️ Generador de "Ficha Ejecutiva por Centro":** Modal interactivo con selector de establecimiento y botón de impresión/PDF que compila en una sola página limpia el perfil sociodemográfico, pirámide de tramos, sectores territoriales, brecha de dependencia y recomendaciones clínicas automatizadas.
- **📷 Exportador de Gráficos en Alta Resolución (PNG 2x):** Cada uno de los 14 gráficos cuenta con un botón en su encabezado para generar y descargar una imagen PNG en resolución Retina 2x con fondo temático, título institucional, fecha y pie de fuente.
- **🎯 Índice Compuesto de Vulnerabilidad y Demanda Asistencial:** Modelo analítico multicriterio que clasifica a los 5 centros comunales evaluando 5 dimensiones clave: FONASA Tramo A (35%), Adultos Mayores 60+ (25%), Infancia <10 años (20%), Población Migrante (15%) y Discapacidad (5%).

### 5. Experiencia de Usuario y Accesibilidad
- **Modo Oscuro / Modo Claro:** Selector con persistencia en memoria local (`localStorage`).
- **Impresión / Reporte PDF:** Estilos optimizados `@media print` para imprimir fichas técnicas o el informe comunal sin distorsiones ni fondos innecesarios.
- **Filtrado cruzado instantáneo:** Motor de reducción en un solo paso que procesa los 181.000 registros en ~25 milisegundos sin congelar el navegador.

---

## 💻 Formas de Ejecución

### Opción A (Recomendada en Mac):
Haz doble clic en el archivo:
```bash
iniciar_servidor.command
```
Esto abrirá automáticamente tu navegador predeterminado en `http://localhost:8080`.

### Opción B (Línea de Comandos):
Abre una terminal en esta carpeta y ejecuta:
```bash
python3 -m http.server 8080
```
Luego ingresa en tu navegador a `http://localhost:8080`.

### Opción C (Apertura Directa):
Puedes hacer doble clic en `index.html`. Si tu navegador bloquea la lectura automática local por políticas de seguridad `file://`, simplemente arrastra el archivo `data.csv` a la ventana o pulsa en **"Subir CSV"**.

### Opción D (Despliegue 100% Web):
Puedes subir estos mismos archivos a cualquier servicio de hosting estático (GitHub Pages, Netlify, Vercel, o el servidor web institucional del municipio/salud). No requiere backend ni base de datos adicional.

---

## 📁 Estructura del Proyecto
```text
Validados 2026-2027 Web/
├── index.html                  # Estructura principal, KPIs, tabs y filtros
├── styles.css                  # Estilos visuales, tipografías, animaciones y soporte para impresión
├── app.js                      # Motor de carga, filtros cruzados en memoria y gráficos Chart.js
├── data.csv                    # Copia local limpia del CSV oficial (181.299 filas)
├── summary.json                # Resumen precalculado de respaldo
├── iniciar_servidor.command    # Lanzador de un solo clic para macOS
└── README.md                   # Documentación técnica y funcional
```
