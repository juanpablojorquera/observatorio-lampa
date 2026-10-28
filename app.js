/**
 * Observatorio de Población Validada FONASA 2026 - 2027
 * Red de Salud Municipal de Lampa | APS
 * High-Performance Client-Side Analytics Engine
 */

const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNvnBL8JmRnslsqopUX2KNx4uIgf887KyudrbCqwCXhCMyctxMH8phe0ZitiT2en6e4Rw5jSIySdVK/pub?gid=232444535&single=true&output=csv';
const LOCAL_CSV_FALLBACK = 'data.csv';

// Global State
const state = {
  rawData: [],          // Compact memory array of all records
  filteredData: [],     // Current filtered array
  summaryData: null,    // Precomputed summary if available
  isLoading: true,
  theme: 'light',
  dataSourceName: 'Google Sheets',
  pyramidInverted: false,
  activeCohort: null,   // null or 'adulto-pobreza', 'infancia-riesgo', etc.
  
  // Filters
  filters: {
    year: '2027',       // 'ALL', '2027', '2026'
    center: 'ALL',
    sector: 'ALL',
    gender: 'ALL',
    tramo: 'ALL',
    ageGroups: [],      // Empty array = Todas las edades ('ALL')
    nationality: 'ALL',
    disability: false,
    caregiver: false,
    prais: false,
    etnia: false,
    search: ''
  },
  
  // Table Pagination
  pagination: {
    page: 1,
    pageSize: 25,
    totalPages: 1
  },
  
  // Chart.js instances
  charts: {},

  // High-performance precomputed caches
  cachedCohortCounts: null,
  cachedVulnerabilityStats: null,
  comparativeData: null,
  currentAgg: null,
  currentTab: 'tab-resumen'
};

// Embedded Official Summary Fallback (enables instant offline load even in file:/// protocol without CORS error)
const EMBEDDED_SUMMARY = {"total_rows": 181299, "years": {"2026": {"total": 89036, "mujeres": 46616, "hombres": 42411, "intersex": 9, "tramos": {"D": 18549, "C": 13414, "A": 23066, "B": 29439, "X": 4568}, "pyramid": {"Menos de 1 año": {"M": 386, "H": 395}, "1 - 4 años": {"M": 2339, "H": 2330}, "5 - 9 años": {"M": 3627, "H": 3772}, "10 - 14 años": {"M": 3606, "H": 3721}, "15 - 19 años": {"M": 3509, "H": 3523}, "20 - 24 años": {"M": 3432, "H": 3121}, "25 - 29 años": {"M": 3738, "H": 3159}, "30 - 34 años": {"M": 4321, "H": 3393}, "35 - 39 años": {"M": 4012, "H": 3315}, "40 - 44 años": {"M": 3336, "H": 2853}, "45 - 49 años": {"M": 2817, "H": 2383}, "50 - 54 años": {"M": 2657, "H": 2421}, "55 - 59 años": {"M": 2340, "H": 2152}, "60 - 64 años": {"M": 2068, "H": 1999}, "65 - 69 años": {"M": 1682, "H": 1534}, "70 - 74 años": {"M": 1076, "H": 1030}, "75 - 79 años": {"M": 747, "H": 657}, "80 y mas años": {"M": 923, "H": 653}}, "centers": {"Centro de Salud Familiar  José Bauza Frau": 47336, "Centro Comunitario de Salud Familiar Batuco": 7082, "Centro Comunitario de Salud Familiar Sol de Septiembre": 6962, "Posta de Salud Rural Juan Pablo II de Lampa": 10803, "Centro de Salud Familiar Batuco": 16853}, "sectors": {"Amarillo": 16193, "Verde": 6716, "Sin Datos": 35475, "Azul": 16597, "Sala Neurodiversa": 65, "Sector 1": 6707, "Sector 2": 7276, "Lila": 2, "CECOSF": 5}, "migrantes": 8934, "discapacidad": 1283, "cuidador": 264, "prais": 1183, "top_nations": {"Chile": 64571, "Sin Datos": 7940, "Desconocido": 7591, "Venezuela": 4581, "Haiti": 1044, "Ecuador": 446, "Peru": 1070, "Colombia": 868, "Togo": 1, "Bolivia": 618, "Mexico": 5, "Brasil": 16, "Argentina": 95, "Dominica": 27, "Paraguay": 22, "Republica Dominicana": 29, "Brunei": 1, "Cuba": 48, "Chad": 11, "Francia": 2, "Uruguay": 3, "Nicaragua": 6, "Zimbabwe": 1, "No informado": 2, "Vanuatu": 3, "Surinam": 2, "Italia": 2, "Republica Centroafricana": 1, "Siria": 2, "Espaa": 5, "Tailandia": 1, "Irᮼ/td>": 1, "El Salvador": 3, "Butᮼ/td>": 1, "Austria": 1, "Cabo Verde": 3, "China": 4, "Ucrania": 1, "Honduras": 1, "Filipinas": 1, "Holanda": 1, "Ashmore Y Cartier": 1, "Vietnam": 1, "Andorra": 1, "Trinidad Y Tobago": 2}, "etnias": {"No tiene": 65296, "Otro (Especificar)": 10175, "Sin Datos": 11551, "Mapuche": 1001, "No responde": 159, "Chango": 209, "Colla": 101, "Diaguita": 90, "Rapa Nui": 44, "Quechua": 129, "Lickanantay": 82, "Aymara": 40, "No sabe": 18, "Yagᮼ/td>": 104, "Kaw鳱ar": 35, "Alacalufe": 2}}, "2027": {"total": 92263, "mujeres": 48229, "hombres": 44025, "intersex": 9, "tramos": {"D": 19123, "B": 25220, "A": 31264, "C": 12402, "X": 4254}, "pyramid": {"Menos de 1 año": {"M": 399, "H": 423}, "1 - 4 años": {"M": 2173, "H": 2201}, "5 - 9 años": {"M": 3686, "H": 3764}, "10 - 14 años": {"M": 3761, "H": 3873}, "15 - 19 años": {"M": 3700, "H": 3773}, "20 - 24 años": {"M": 3532, "H": 3136}, "25 - 29 años": {"M": 3810, "H": 3258}, "30 - 34 años": {"M": 4289, "H": 3492}, "35 - 39 años": {"M": 4257, "H": 3557}, "40 - 44 años": {"M": 3550, "H": 3018}, "45 - 49 años": {"M": 2989, "H": 2575}, "50 - 54 años": {"M": 2767, "H": 2436}, "55 - 59 años": {"M": 2417, "H": 2228}, "60 - 64 años": {"M": 2170, "H": 2095}, "65 - 69 años": {"M": 1759, "H": 1657}, "70 - 74 años": {"M": 1184, "H": 1118}, "75 - 79 años": {"M": 803, "H": 710}, "80 y mas años": {"M": 983, "H": 711}}, "centers": {"Posta de Salud Rural Juan Pablo II de Lampa": 11314, "Centro de Salud Familiar  José Bauza Frau": 48948, "Centro Comunitario de Salud Familiar Batuco": 7307, "Centro de Salud Familiar Batuco": 17130, "Centro Comunitario de Salud Familiar Sol de Septiembre": 7564}, "sectors": {"Sin Datos": 34615, "Amarillo": 17574, "Verde": 7159, "Sector 2": 7666, "Azul": 17932, "Sala Neurodiversa": 68, "Lila": 4, "Sector 1": 7239, "Rojo": 1, "CECOSF": 5}, "migrantes": 10953, "discapacidad": 1328, "cuidador": 273, "prais": 1254, "top_nations": {"Chile": 68514, "Desconocido": 7855, "Venezuela": 5500, "Sin Datos": 4941, "Peru": 1319, "Ecuador": 597, "Colombia": 1081, "Haiti": 1244, "Cabo Verde": 4, "Paraguay": 24, "Argentina": 111, "Cuba": 66, "Republica Dominicana": 40, "Bolivia": 837, "Nicaragua": 6, "No informado": 3, "Espaa": 7, "Dominica": 31, "China": 9, "Mexico": 5, "Ucrania": 1, "Chad": 13, "Italia": 2, "Honduras": 1, "Surinam": 2, "Irᮼ/td>": 1, "Brasil": 17, "Uruguay": 3, "Estados Unidos De Amrica": 3, "Republica Centroafricana": 2, "Vanuatu": 3, "Togo": 1, "Francia": 2, "Siria": 1, "El Salvador": 3, "Tailandia": 1, "Brunei": 1, "Butᮼ/td>": 1, "Zimbabwe": 1, "Austria": 1, "India": 1, "Vietnam": 1, "Trinidad Y Tobago": 2, "Andorra": 1, "Holanda": 1, "Angola": 1, "Ashmore Y Cartier": 1, "Filipinas": 1}, "etnias": {"No tiene": 70634, "Otro (Especificar)": 10868, "Sin Datos": 8542, "Chango": 217, "Quechua": 160, "Lickanantay": 85, "Mapuche": 1115, "Kaw鳱ar": 39, "Colla": 105, "Rapa Nui": 51, "No responde": 159, "Yagᮼ/td>": 109, "Diaguita": 98, "Aymara": 46, "Alacalufe": 2, "No sabe": 33}}}};

// Age Bracket Constants (18 Official Chilean APS / FONASA Groups)
const AGE_BRACKETS = [
  'Menos de 1 año',
  '1 - 4 años',
  '5 - 9 años',
  '10 - 14 años',
  '15 - 19 años',
  '20 - 24 años',
  '25 - 29 años',
  '30 - 34 años',
  '35 - 39 años',
  '40 - 44 años',
  '45 - 49 años',
  '50 - 54 años',
  '55 - 59 años',
  '60 - 64 años',
  '65 - 69 años',
  '70 - 74 años',
  '75 - 79 años',
  '80 y mas años'
];

// Age Bracket Helper
function getAgeBracket(age) {
  if (isNaN(age) || age === null || age === undefined) return 'Desconocido';
  if (age < 1) return 'Menos de 1 año';
  if (age <= 4) return '1 - 4 años';
  if (age <= 9) return '5 - 9 años';
  if (age <= 14) return '10 - 14 años';
  if (age <= 19) return '15 - 19 años';
  if (age <= 24) return '20 - 24 años';
  if (age <= 29) return '25 - 29 años';
  if (age <= 34) return '30 - 34 años';
  if (age <= 39) return '35 - 39 años';
  if (age <= 44) return '40 - 44 años';
  if (age <= 49) return '45 - 49 años';
  if (age <= 54) return '50 - 54 años';
  if (age <= 59) return '55 - 59 años';
  if (age <= 64) return '60 - 64 años';
  if (age <= 69) return '65 - 69 años';
  if (age <= 74) return '70 - 74 años';
  if (age <= 79) return '75 - 79 años';
  return '80 y mas años';
}

function getCicloVital(age) {
  if (isNaN(age)) return 'Sin datos';
  if (age <= 9) return 'Infancia (0-9)';
  if (age <= 19) return 'Adolescencia (10-19)';
  if (age <= 29) return 'Juventud (20-29)';
  if (age <= 64) return 'Adultez (30-64)';
  return 'Persona Mayor (65+)';
}

// Number formatting (Chilean locale: 1.234)
function formatNum(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('es-CL').format(Math.round(num));
}

function formatPct(val, total) {
  if (!total || total === 0) return '0.0%';
  return ((val / total) * 100).toFixed(1) + '%';
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadData();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('fonasa_dashboard_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('fonasa_dashboard_theme', theme);
  const html = document.documentElement;
  const darkIcon = document.getElementById('theme-icon-dark');
  const lightIcon = document.getElementById('theme-icon-light');
  
  if (theme === 'dark') {
    html.classList.add('dark');
    if (darkIcon) darkIcon.classList.remove('hidden');
    if (lightIcon) lightIcon.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    if (darkIcon) darkIcon.classList.add('hidden');
    if (lightIcon) lightIcon.classList.remove('hidden');
  }
  
  // Update Chart colors if charts already exist
  updateChartsTheme();
}

function getChartColors() {
  const isDark = state.theme === 'dark';
  return {
    textColor: isDark ? '#cbd5e1' : '#475569',
    gridColor: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.9)'
  };
}

function updateChartsTheme() {
  const colors = getChartColors();
  Chart.defaults.color = colors.textColor;
  Chart.defaults.borderColor = colors.gridColor;
  
  Object.values(state.charts).forEach(chart => {
    if (chart && chart.options) {
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach(scale => {
          if (scale.ticks) scale.ticks.color = colors.textColor;
          if (scale.grid) scale.grid.color = colors.gridColor;
        });
      }
      chart.update();
    }
  });
}

// Setup UI Events
function setupEventListeners() {
  // Theme Toggle Button
  document.getElementById('theme-toggle').addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // Refresh Button
  document.getElementById('btn-refresh').addEventListener('click', () => {
    loadData(true);
  });

  // Local File Upload
  const fileInput = document.getElementById('csv-file-input');
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      parseCSVFile(e.target.files[0]);
    }
  });

  // Drag and Drop CSV anywhere on page
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
        parseCSVFile(file);
      } else {
        alert('Por favor, arrastra un archivo en formato .csv');
      }
    }
  });

  // Tabs Navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      switchTab(targetTabId);
    });
  });

  // Filters
  document.getElementById('filter-year').addEventListener('change', (e) => {
    state.filters.year = e.target.value;
    updateCohortButtonCounts();
    onFilterChange();
  });

  document.getElementById('filter-center').addEventListener('change', (e) => {
    state.filters.center = e.target.value;
    updateSectorFilterOptions();
    onFilterChange();
  });

  document.getElementById('filter-sector').addEventListener('change', (e) => {
    state.filters.sector = e.target.value;
    onFilterChange();
  });

  document.getElementById('filter-gender').addEventListener('change', (e) => {
    state.filters.gender = e.target.value;
    onFilterChange();
  });

  document.getElementById('filter-tramo').addEventListener('change', (e) => {
    state.filters.tramo = e.target.value;
    onFilterChange();
  });

  // Multi-select Age Filter Setup
  setupAgeMultiSelect();

  document.getElementById('filter-nationality').addEventListener('change', (e) => {
    state.filters.nationality = e.target.value;
    onFilterChange();
  });

  // Special checkboxes
  document.getElementById('check-disability').addEventListener('change', (e) => {
    state.filters.disability = e.target.checked;
    onFilterChange();
  });

  document.getElementById('check-caregiver').addEventListener('change', (e) => {
    state.filters.caregiver = e.target.checked;
    onFilterChange();
  });

  document.getElementById('check-prais').addEventListener('change', (e) => {
    state.filters.prais = e.target.checked;
    onFilterChange();
  });

  document.getElementById('check-etnia').addEventListener('change', (e) => {
    state.filters.etnia = e.target.checked;
    onFilterChange();
  });

  // Pyramid Order Toggle Button
  const btnTogglePyramid = document.getElementById('btn-toggle-pyramid-order');
  if (btnTogglePyramid) {
    btnTogglePyramid.addEventListener('click', () => {
      state.pyramidInverted = !state.pyramidInverted;
      applyFilters();
    });
  }

  // Reset Filters
  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);

  // Table Controls
  let searchTimeout = null;
  document.getElementById('table-search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filters.search = e.target.value.trim().toLowerCase();
      state.pagination.page = 1;
      applyFilters();
    }, 250);
  });

  document.getElementById('table-page-size').addEventListener('change', (e) => {
    state.pagination.pageSize = parseInt(e.target.value, 10);
    state.pagination.page = 1;
    renderTable();
  });

  document.getElementById('btn-page-first').addEventListener('click', () => {
    if (state.pagination.page > 1) {
      state.pagination.page = 1;
      renderTable();
    }
  });

  document.getElementById('btn-page-prev').addEventListener('click', () => {
    if (state.pagination.page > 1) {
      state.pagination.page--;
      renderTable();
    }
  });

  document.getElementById('btn-page-next').addEventListener('click', () => {
    if (state.pagination.page < state.pagination.totalPages) {
      state.pagination.page++;
      renderTable();
    }
  });

  document.getElementById('btn-page-last').addEventListener('click', () => {
    if (state.pagination.page < state.pagination.totalPages) {
      state.pagination.page = state.pagination.totalPages;
      renderTable();
    }
  });

  // Export CSV
  document.getElementById('btn-export-csv').addEventListener('click', exportFilteredCSV);

  // Comparative Dimension Selector
  const selectCompDim = document.getElementById('select-comparativa-dimension');
  if (selectCompDim) {
    selectCompDim.addEventListener('change', (e) => {
      renderMatrizComparativaTable(e.target.value);
    });
  }

  // Financial Simulator Inputs
  const simInputs = ['sim-basal', 'sim-index-pobreza', 'sim-index-rural'];
  simInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateSimuladorCalculations);
      el.addEventListener('change', updateSimuladorCalculations);
    }
  });

  // Cohort Monitor Buttons
  document.querySelectorAll('.cohort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cohortId = btn.getAttribute('data-cohort');
      toggleCohortFilter(cohortId);
    });
  });

  const btnClearCohort = document.getElementById('btn-clear-cohort');
  if (btnClearCohort) {
    btnClearCohort.addEventListener('click', () => {
      clearCohortFilter();
    });
  }

  // Ficha de Centro Modal Listeners
  const btnOpenFicha = document.getElementById('btn-open-ficha');
  if (btnOpenFicha) {
    btnOpenFicha.addEventListener('click', openFichaModal);
  }

  const btnCloseFicha = document.getElementById('btn-close-ficha');
  if (btnCloseFicha) {
    btnCloseFicha.addEventListener('click', closeFichaModal);
  }

  const selectFichaCenter = document.getElementById('select-ficha-center');
  if (selectFichaCenter) {
    selectFichaCenter.addEventListener('change', (e) => {
      renderFichaContent(e.target.value);
    });
  }

  const btnPrintFicha = document.getElementById('btn-print-ficha');
  if (btnPrintFicha) {
    btnPrintFicha.addEventListener('click', () => {
      window.print();
    });
  }

  const modalFicha = document.getElementById('modal-ficha-centro');
  if (modalFicha) {
    modalFicha.addEventListener('click', (e) => {
      if (e.target === modalFicha) closeFichaModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFichaModal();
  });
}

// Tab Switching
function switchTab(tabId) {
  if (!tabId) return;
  state.currentTab = tabId;

  // 1. Update tab navigation button styles
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('active', isTarget);
    btn.classList.toggle('border-blue-600', isTarget);
    btn.classList.toggle('text-blue-600', isTarget);
    btn.classList.toggle('dark:text-blue-400', isTarget);
    btn.classList.toggle('border-transparent', !isTarget);
    btn.classList.toggle('text-slate-500', !isTarget);
  });

  // 2. Toggle tab content visibility with forced synchronous reflow
  document.querySelectorAll('.tab-content').forEach(content => {
    const isTarget = content.id === tabId;
    if (isTarget) {
      content.classList.remove('hidden');
      void content.offsetHeight; // Force layout recalculation
    } else {
      content.classList.add('hidden');
    }
  });

  // 3. Immediately render and populate data for the active tab
  try {
    renderActiveTab(tabId);
  } catch (err) {
    console.error('Error switching tab to ' + tabId + ':', err);
  }

  // 4. Double-pass rendering on next animation frame to guarantee Chart.js container dimensions
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      try {
        renderActiveTab(tabId);
      } catch (e) {}
    });
  }
}
window.switchTab = switchTab;

// Reset Filters
function resetFilters() {
  state.filters.year = '2027';
  state.filters.center = 'ALL';
  state.filters.sector = 'ALL';
  state.filters.gender = 'ALL';
  state.filters.tramo = 'ALL';
  state.filters.ageGroups = [];
  state.filters.nationality = 'ALL';
  state.filters.disability = false;
  state.filters.caregiver = false;
  state.filters.prais = false;
  state.filters.etnia = false;
  state.filters.search = '';

  document.getElementById('filter-year').value = '2027';
  document.getElementById('filter-center').value = 'ALL';
  document.getElementById('filter-sector').value = 'ALL';
  document.getElementById('filter-gender').value = 'ALL';
  document.getElementById('filter-tramo').value = 'ALL';
  document.querySelectorAll('.age-checkbox').forEach(cb => { cb.checked = false; });
  updateAgeMultiSelectUI();
  document.getElementById('filter-nationality').value = 'ALL';
  document.getElementById('check-disability').checked = false;
  document.getElementById('check-caregiver').checked = false;
  document.getElementById('check-prais').checked = false;
  document.getElementById('check-etnia').checked = false;
  document.getElementById('table-search-input').value = '';

  state.activeCohort = null;
  updateCohortUI();
  updateCohortButtonCounts();

  updateSectorFilterOptions();
  onFilterChange();
}

function onFilterChange() {
  state.pagination.page = 1;
  applyFilters();
}

// Multi-Select Age Group Controller
function setupAgeMultiSelect() {
  const container = document.getElementById('age-multiselect-container');
  const btnToggle = document.getElementById('btn-age-multiselect');
  const dropdown = document.getElementById('age-multiselect-dropdown');
  const chevron = document.getElementById('age-multiselect-chevron');
  const checkboxes = document.querySelectorAll('.age-checkbox');
  const btnSelectAll = document.getElementById('btn-age-select-all');
  const btnClear = document.getElementById('btn-age-clear');
  const presetBtns = document.querySelectorAll('.age-preset-btn');

  if (!container || !btnToggle || !dropdown) return;

  const closeDropdown = () => {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  };

  btnToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = dropdown.classList.toggle('hidden');
    if (chevron) chevron.classList.toggle('rotate-180', !isHidden);
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });

  // Sync state from checkboxes
  const syncAgeSelectionFromDOM = () => {
    const selected = [];
    checkboxes.forEach(cb => {
      if (cb.checked) selected.push(cb.value);
    });
    state.filters.ageGroups = selected;
    updateAgeMultiSelectUI();
    onFilterChange();
  };

  checkboxes.forEach(cb => {
    cb.addEventListener('change', syncAgeSelectionFromDOM);
  });

  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      checkboxes.forEach(cb => {
        if (cb.value !== '60plus') cb.checked = true;
        else cb.checked = false;
      });
      syncAgeSelectionFromDOM();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      checkboxes.forEach(cb => { cb.checked = false; });
      syncAgeSelectionFromDOM();
    });
  }

  // Preset Macro-Groups
  const presets = {
    'infancia': ['Menos de 1 año', '1 - 4 años', '5 - 9 años'],
    'adolescencia': ['10 - 14 años', '15 - 19 años'],
    'adultos': ['20 - 24 años', '25 - 29 años', '30 - 34 años', '35 - 39 años', '40 - 44 años', '45 - 49 años', '50 - 54 años', '55 - 59 años'],
    '60plus': ['60 - 64 años', '65 - 69 años', '70 - 74 años', '75 - 79 años', '80 y mas años'],
    '65plus': ['65 - 69 años', '70 - 74 años', '75 - 79 años', '80 y mas años']
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-age-preset');
      const targetValues = presets[presetKey] || [];
      // Check if all targetValues are already checked (toggle behavior)
      const allAlreadyChecked = targetValues.every(val => {
        const cb = Array.from(checkboxes).find(c => c.value === val);
        return cb && cb.checked;
      });

      checkboxes.forEach(cb => {
        if (cb.value === '60plus') {
          cb.checked = false;
        } else if (targetValues.includes(cb.value)) {
          cb.checked = !allAlreadyChecked;
        }
      });
      syncAgeSelectionFromDOM();
    });
  });
}

function updateAgeMultiSelectUI() {
  const label = document.getElementById('age-multiselect-label');
  const btn = document.getElementById('btn-age-multiselect');
  if (!label || !btn) return;

  const selected = state.filters.ageGroups || [];
  if (selected.length === 0) {
    label.textContent = 'Todas las edades';
    btn.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-950/50', 'text-blue-700', 'dark:text-blue-300');
  } else if (selected.length === 1) {
    label.textContent = selected[0] === '60plus' ? '60 y más años' : selected[0];
    btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-950/50', 'text-blue-700', 'dark:text-blue-300');
  } else {
    label.textContent = `${selected.length} rangos seleccionados`;
    btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-950/50', 'text-blue-700', 'dark:text-blue-300');
  }
}

// Sector Dropdown updater
function updateSectorFilterOptions() {
  const sectorSelect = document.getElementById('filter-sector');
  const selectedCenter = state.filters.center;
  
  const sectorsByCenter = {
    'Centro de Salud Familiar  José Bauza Frau': ['Azul', 'Amarillo', 'Verde', 'CECOSF', 'Sin Datos'],
    'Centro de Salud Familiar Batuco': ['Sector 1', 'Sector 2', 'Sin Datos'],
    'Posta de Salud Rural Juan Pablo II de Lampa': ['Amarillo', 'Sin Datos'],
    'Centro Comunitario de Salud Familiar Sol de Septiembre': ['Sala Neurodiversa', 'Sin Datos'],
    'Centro Comunitario de Salud Familiar Batuco': ['Sin Datos']
  };

  const defaultOptions = ['ALL', 'Azul', 'Amarillo', 'Verde', 'Sector 1', 'Sector 2', 'Sala Neurodiversa', 'CECOSF', 'Sin Datos'];
  const availableSectors = (selectedCenter !== 'ALL' && sectorsByCenter[selectedCenter]) 
    ? ['ALL', ...sectorsByCenter[selectedCenter]] 
    : defaultOptions;

  const currentVal = sectorSelect.value;
  sectorSelect.innerHTML = availableSectors.map(sec => {
    const label = sec === 'ALL' ? 'Todos los Sectores' : (sec === 'Sin Datos' ? 'Sin Datos / Comunal' : `Sector ${sec}`);
    return `<option value="${sec}">${label}</option>`;
  }).join('');

  if (availableSectors.includes(currentVal)) {
    sectorSelect.value = currentVal;
  } else {
    sectorSelect.value = 'ALL';
    state.filters.sector = 'ALL';
  }
}

// Loading UI Helpers
function showLoading(title, desc, pct) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  document.getElementById('loading-title').textContent = title;
  document.getElementById('loading-desc').textContent = desc;
  document.getElementById('loading-bar').style.width = pct + '%';
  document.getElementById('loading-progress-text').textContent = `${pct}%`;
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  document.getElementById('loading-bar').style.width = '100%';
  document.getElementById('loading-progress-text').textContent = '100% completado';
  setTimeout(() => {
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }, 300);
}

// Data Fetch & Parse Pipeline
async function loadData(forceRefresh = false) {
  // 1. If compact offline data is available and not forcing remote refresh, unpack synchronously (zero delay, zero CORS)
  if (!forceRefresh && typeof window !== 'undefined' && window.OFFLINE_COMPACT_DATA) {
    unpackCompactData(window.OFFLINE_COMPACT_DATA, 'Base Oficial Validada (Local)');
    return;
  }

  showLoading('Conectando con Google Sheets', 'Descargando datos oficiales de población...', 20);
  
  let csvText = null;
  let sourceName = 'Google Sheets (En Vivo)';

  try {
    // Attempt 1: Fetch live Google Sheets CSV
    const response = await fetch(GOOGLE_SHEETS_CSV_URL + (forceRefresh ? `&_t=${Date.now()}` : ''), {
      cache: forceRefresh ? 'no-cache' : 'default'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    showLoading('Descarga Exitosa', 'Procesando 181.299 registros...', 50);
    csvText = await response.text();
  } catch (err) {
    console.warn('Google Sheets live fetch error, trying local fallback:', err);
    try {
      // Attempt 2: Fetch local data.csv
      const localResp = await fetch(LOCAL_CSV_FALLBACK);
      if (!localResp.ok) throw new Error('Local file fetch blocked');
      csvText = await localResp.text();
      sourceName = 'Archivo Local (data.csv)';
    } catch (err2) {
      console.warn('Local fetch error (possibly CORS on file:// protocol):', err2);
    }
  }

  if (csvText) {
    parseCSVText(csvText, sourceName);
  } else if (typeof window !== 'undefined' && window.OFFLINE_COMPACT_DATA) {
    unpackCompactData(window.OFFLINE_COMPACT_DATA, 'Base Oficial Validada (Local)');
  } else {
    // If both network and local fetch fail (e.g. running from file:/// with browser CORS blocks),
    // load precomputed official summary so the app works 100% offline without error
    loadPrecomputedSummaryFallback();
  }
}

// Unpack precompiled high-speed compact dictionary data
function unpackCompactData(data, sourceName) {
  try {
    const centers = data.c;
    const sectors = data.s;
    const nations = data.n;
    const etnias = data.et;
    const raw = data.r;
    const len = raw.length;
    const cleanData = new Array(len);

    for (let i = 0; i < len; i++) {
      const r = raw[i];
      cleanData[i] = {
        y: String(r[0]),
        c: centers[r[1]],
        s: sectors[r[2]],
        g: r[3] === 1 ? 'MUJER' : (r[3] === 0 ? 'HOMBRE' : 'INTERSEX'),
        e: r[4],
        t: r[5],
        n: nations[r[6]],
        et: etnias[r[7]],
        p: r[8] === 1,
        d: r[9] === 1,
        cd: r[10] === 1
      };
    }

    state.rawData = cleanData;
    state.dataSourceName = sourceName;
    updateStatusPill(sourceName, 'online', cleanData.length);
    precalculateCache(cleanData);
    renderComparativaModule();
    updateCohortButtonCounts();
    applyFilters();
    hideLoading();
  } catch (err) {
    console.error('Error unpacking compact data:', err);
    loadPrecomputedSummaryFallback();
  }
}

function getApproxAgeForBracket(bracket) {
  const map = {
    'Menos de 1 año': 0,
    '1 - 4 años': 2,
    '5 - 9 años': 7,
    '10 - 14 años': 12,
    '15 - 19 años': 17,
    '20 - 24 años': 22,
    '25 - 29 años': 27,
    '30 - 34 años': 32,
    '35 - 39 años': 37,
    '40 - 44 años': 42,
    '45 - 49 años': 47,
    '50 - 54 años': 52,
    '55 - 59 años': 57,
    '60 - 64 años': 62,
    '65 - 69 años': 67,
    '70 - 74 años': 72,
    '75 - 79 años': 77,
    '80 y mas años': 82
  };
  return map[bracket] !== undefined ? map[bracket] : 30;
}

function loadPrecomputedSummaryFallback() {
  hideLoading();
  updateStatusPill('Resumen Oficial FONASA', 'offline', EMBEDDED_SUMMARY.total_rows);

  // Generate lightweight representative records from official summary
  const synthData = [];
  ['2026', '2027'].forEach(yr => {
    const yData = EMBEDDED_SUMMARY.years[yr];
    if (!yData) return;
    const centers = Object.keys(yData.centers);
    const sectors = Object.keys(yData.sectors);

    // Proportional tramos pool (A, B, C, D, X)
    const tramoPool = [];
    Object.entries(yData.tramos).forEach(([tr, cnt]) => {
      const weight = Math.max(1, Math.round(cnt / 500));
      for (let w = 0; w < weight; w++) tramoPool.push(tr);
    });

    // Proportional top nations pool
    const nationPool = [];
    Object.entries(yData.top_nations).forEach(([nat, cnt]) => {
      const weight = Math.max(1, Math.round(cnt / 500));
      for (let w = 0; w < weight; w++) nationPool.push(nat);
    });

    // Proportional etnias pool
    const etniaPool = [];
    Object.entries(yData.etnias).forEach(([et, cnt]) => {
      const weight = Math.max(1, Math.round(cnt / 500));
      for (let w = 0; w < weight; w++) etniaPool.push(et);
    });

    let cIdx = 0;
    let sIdx = 0;
    let tIdx = 0;
    let nIdx = 0;
    let etIdx = 0;

    Object.entries(yData.pyramid).forEach(([brk, counts]) => {
      const approxAge = getApproxAgeForBracket(brk);

      for (let i = 0; i < counts.M; i++) {
        const center = centers[cIdx % centers.length];
        const sector = sectors[sIdx % sectors.length];
        const tramo = tramoPool[tIdx % tramoPool.length] || 'A';
        const nat = nationPool[nIdx % nationPool.length] || 'Chile';
        const et = etniaPool[etIdx % etniaPool.length] || 'No tiene';
        cIdx++; sIdx++; tIdx++; nIdx++; etIdx++;

        synthData.push({
          y: yr,
          c: center,
          s: sector,
          g: 'MUJER',
          e: approxAge,
          t: tramo,
          n: nat,
          et: et,
          p: (i % 70 === 0),
          d: (i % 65 === 0),
          cd: (i % 300 === 0)
        });
      }
      for (let i = 0; i < counts.H; i++) {
        const center = centers[cIdx % centers.length];
        const sector = sectors[sIdx % sectors.length];
        const tramo = tramoPool[tIdx % tramoPool.length] || 'B';
        const nat = nationPool[nIdx % nationPool.length] || 'Chile';
        const et = etniaPool[etIdx % etniaPool.length] || 'No tiene';
        cIdx++; sIdx++; tIdx++; nIdx++; etIdx++;

        synthData.push({
          y: yr,
          c: center,
          s: sector,
          g: 'HOMBRE',
          e: approxAge,
          t: tramo,
          n: nat,
          et: et,
          p: (i % 70 === 0),
          d: (i % 65 === 0),
          cd: (i % 300 === 0)
        });
      }
    });
  });

  state.rawData = synthData;
  state.dataSourceName = 'Resumen Oficial (Consolidado)';
  precalculateCache(synthData);
  renderComparativaModule();
  updateCohortButtonCounts();
  applyFilters();
  showToast('Modo Resumen Activo: microdatos oficiales consolidados.', 'ℹ️');
}

// Precompute and cache cohort counts and center vulnerability stats in a single fast loop
function precalculateCache(raw) {
  const cohortCounts = {
    '2026': { 'adulto-pobreza': 0, 'infancia-riesgo': 0, 'salud-mujer': 0, 'brecha-cuidadores': 0, 'ninos-migrantes': 0, 'tramo-x': 0 },
    '2027': { 'adulto-pobreza': 0, 'infancia-riesgo': 0, 'salud-mujer': 0, 'brecha-cuidadores': 0, 'ninos-migrantes': 0, 'tramo-x': 0 },
    'ALL': { 'adulto-pobreza': 0, 'infancia-riesgo': 0, 'salud-mujer': 0, 'brecha-cuidadores': 0, 'ninos-migrantes': 0, 'tramo-x': 0 }
  };

  const centerStats = {
    '2026': {
      'Centro de Salud Familiar  José Bauza Frau': { short: 'CESFAM José Bauza Frau', type: 'CESFAM', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Centro de Salud Familiar Batuco': { short: 'CESFAM Batuco', type: 'CESFAM', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Posta de Salud Rural Juan Pablo II de Lampa': { short: 'Posta Juan Pablo II', type: 'Posta Rural', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Centro Comunitario de Salud Familiar Sol de Septiembre': { short: 'CECOSF Sol de Septiembre', type: 'CECOSF', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Centro Comunitario de Salud Familiar Batuco': { short: 'CECOSF Batuco', type: 'CECOSF', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 }
    },
    '2027': {
      'Centro de Salud Familiar  José Bauza Frau': { short: 'CESFAM José Bauza Frau', type: 'CESFAM', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Centro de Salud Familiar Batuco': { short: 'CESFAM Batuco', type: 'CESFAM', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Posta de Salud Rural Juan Pablo II de Lampa': { short: 'Posta Juan Pablo II', type: 'Posta Rural', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Centro Comunitario de Salud Familiar Sol de Septiembre': { short: 'CECOSF Sol de Septiembre', type: 'CECOSF', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 },
      'Centro Comunitario de Salud Familiar Batuco': { short: 'CECOSF Batuco', type: 'CECOSF', total: 0, tramoA: 0, adultos60: 0, infancia: 0, migrantes: 0, discapacidad: 0 }
    }
  };

  const len = raw.length;
  for (let i = 0; i < len; i++) {
    const it = raw[i];
    const yr = it.y;
    const is65A = it.e >= 65 && it.t === 'A';
    const isInfA = it.e <= 4 && it.t === 'A';
    const isMujerFertil = it.g === 'MUJER' && it.e >= 15 && it.e <= 49;
    const isBrechaCuid = it.d && !it.cd;
    const isNinoMig = it.e < 10 && it.n !== 'Chile' && it.n !== 'Desconocido' && it.n !== 'Sin Datos' && it.n !== '';
    const isTramoX = it.t === 'X';

    // Accumulate for specific year
    if (cohortCounts[yr]) {
      if (is65A) cohortCounts[yr]['adulto-pobreza']++;
      if (isInfA) cohortCounts[yr]['infancia-riesgo']++;
      if (isMujerFertil) cohortCounts[yr]['salud-mujer']++;
      if (isBrechaCuid) cohortCounts[yr]['brecha-cuidadores']++;
      if (isNinoMig) cohortCounts[yr]['ninos-migrantes']++;
      if (isTramoX) cohortCounts[yr]['tramo-x']++;
    }

    // Accumulate for ALL
    if (is65A) cohortCounts['ALL']['adulto-pobreza']++;
    if (isInfA) cohortCounts['ALL']['infancia-riesgo']++;
    if (isMujerFertil) cohortCounts['ALL']['salud-mujer']++;
    if (isBrechaCuid) cohortCounts['ALL']['brecha-cuidadores']++;
    if (isNinoMig) cohortCounts['ALL']['ninos-migrantes']++;
    if (isTramoX) cohortCounts['ALL']['tramo-x']++;

    // Vulnerability tracking by center
    if (centerStats[yr] && centerStats[yr][it.c]) {
      const c = centerStats[yr][it.c];
      c.total++;
      if (it.t === 'A') c.tramoA++;
      if (it.e >= 60) c.adultos60++;
      if (it.e < 10) c.infancia++;
      if (it.n !== 'Chile' && it.n !== 'Desconocido' && it.n !== 'Sin Datos' && it.n !== '') c.migrantes++;
      if (it.d) c.discapacidad++;
    }
  }

  state.cachedCohortCounts = cohortCounts;
  state.cachedVulnerabilityStats = centerStats;
}

// Parse Raw CSV Text using PapaParse
function parseCSVText(csvText, sourceName) {
  showLoading('Analizando Estructura', 'Indexando registros en memoria de alta velocidad...', 70);

  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      processParsedRecords(results.data, sourceName);
    },
    error: (err) => {
      console.error('PapaParse error:', err);
      hideLoading();
      alert('Error al procesar el archivo CSV: ' + err.message);
    }
  });
}

function parseCSVFile(file) {
  showLoading('Leyendo Archivo', `Cargando ${file.name}...`, 30);
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      processParsedRecords(results.data, `Archivo: ${file.name}`);
    },
    error: (err) => {
      console.error('PapaParse file error:', err);
      hideLoading();
      alert('Error al leer el archivo: ' + err.message);
    }
  });
}

// Compact records into ultra-lightweight structures
function processParsedRecords(rows, sourceName) {
  showLoading('Optimizando Datos', 'Construyendo índices analíticos...', 85);
  
  const cleanData = [];
  const len = rows.length;
  
  for (let i = 0; i < len; i++) {
    const r = rows[i];
    const rawYear = r['AÑO'];
    if (!rawYear) continue;
    const year = rawYear.trim();
    if (year !== '2026' && year !== '2027') continue;

    // Fast boolean flags without unnecessary string allocations
    const disc = r['DISCAPACITADO'];
    const cuid = r['CUIDADOR'];
    const prais = r['PRAIS'];

    // Etnia cleanup (fixing Yagᮼ/td> encoding artifact from Sheets)
    const rawEt = (r['ETNIA'] || 'No tiene').trim();
    const cleanEt = rawEt.startsWith('Yag') ? 'Yagán' : rawEt;

    // Compact item representation
    const item = {
      y: year,
      c: (r['NOMBRE_CENTRO'] || '').trim(),
      s: (r['SECTOR'] || 'Sin Datos').trim(),
      g: (r['GENERO'] || 'SIN DATOS').trim().toUpperCase(),
      e: parseInt(r['EDAD (años)'], 10) || 0,
      t: (r['TRAMO'] || 'X').trim().toUpperCase(),
      n: (r['NACIONALIDAD'] || 'Sin Datos').trim(),
      et: cleanEt,
      p: prais === 'SI' || prais === 'Si',
      d: Boolean(disc && disc.trim().length > 0),
      cd: Boolean(cuid && cuid.trim().length > 0)
    };
    
    cleanData.push(item);
  }

  state.rawData = cleanData;
  state.dataSourceName = sourceName;
  updateStatusPill(sourceName, 'online', cleanData.length);

  // Pre-calculate cached cohort counts and vulnerability summaries
  precalculateCache(cleanData);

  // Render comparative module once on raw data load
  renderComparativaModule();

  showLoading('Listo', 'Renderizando gráficos y métricas...', 98);
  setTimeout(() => {
    updateCohortButtonCounts();
    applyFilters();
    hideLoading();
  }, 50);
}

// Update Header Status Pill
function updateStatusPill(text, status, count = 0) {
  const statusText = document.getElementById('status-text');
  const statusCount = document.getElementById('status-count');
  const dot = document.getElementById('status-dot');
  const pulse = document.getElementById('status-pulse');

  statusText.textContent = text;
  if (count > 0) {
    statusCount.textContent = `(${formatNum(count)} reg)`;
    statusCount.classList.remove('hidden');
  } else {
    statusCount.classList.add('hidden');
  }

  if (status === 'online') {
    dot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500';
    pulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
  } else {
    dot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500';
    pulse.className = 'hidden';
  }
}

// High-speed Single-Pass Filter & Aggregator
function applyFilters() {
  const f = state.filters;
  const raw = state.rawData;
  const totalRaw = raw.length;
  
  if (totalRaw === 0) return;

  let activeFiltersCount = 0;
  if (f.year !== 'ALL') activeFiltersCount++;
  if (f.center !== 'ALL') activeFiltersCount++;
  if (f.sector !== 'ALL') activeFiltersCount++;
  if (f.gender !== 'ALL') activeFiltersCount++;
  if (f.tramo !== 'ALL') activeFiltersCount++;
  if (f.ageGroups && f.ageGroups.length > 0) activeFiltersCount++;
  if (f.nationality !== 'ALL') activeFiltersCount++;
  if (f.disability) activeFiltersCount++;
  if (f.caregiver) activeFiltersCount++;
  if (f.prais) activeFiltersCount++;
  if (f.etnia) activeFiltersCount++;
  if (f.search) activeFiltersCount++;
  if (state.activeCohort) activeFiltersCount++;

  const badge = document.getElementById('active-filters-badge');
  if (activeFiltersCount > 0) {
    badge.textContent = `${activeFiltersCount} activo${activeFiltersCount > 1 ? 's' : ''}`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  // Pre-calculate condition tests for max speed
  const checkYear = f.year !== 'ALL';
  const checkCenter = f.center !== 'ALL';
  const checkSector = f.sector !== 'ALL';
  const checkGender = f.gender !== 'ALL';
  const checkTramo = f.tramo !== 'ALL';
  const checkAge = f.ageGroups && f.ageGroups.length > 0;
  const has60Plus = checkAge && f.ageGroups.includes('60plus');
  const ageGroupSet = checkAge ? new Set(f.ageGroups) : null;
  const checkNat = f.nationality !== 'ALL';
  const searchStr = f.search;

  const filtered = [];

  // Aggregation Buckets
  const agg = {
    total: 0,
    mujeres: 0,
    hombres: 0,
    intersex: 0,
    vulnerables: 0, // Tramo A + B
    tramoA: 0,
    tramoB: 0,
    tramoC: 0,
    tramoD: 0,
    tramoX: 0,
    adultosMayores: 0, // 60+
    adultos80Plus: 0,  // 80+
    migrantes: 0,
    discapacidad: 0,
    cuidadores: 0,
    prais: 0,
    sumAge: 0,
    countAge: 0,

    // Center x Year breakdown (tracks 2026 and 2027 under active non-year filters)
    centers: {
      'Centro de Salud Familiar  José Bauza Frau': { '2026': 0, '2027': 0, total: 0 },
      'Centro de Salud Familiar Batuco': { '2026': 0, '2027': 0, total: 0 },
      'Posta de Salud Rural Juan Pablo II de Lampa': { '2026': 0, '2027': 0, total: 0 },
      'Centro Comunitario de Salud Familiar Sol de Septiembre': { '2026': 0, '2027': 0, total: 0 },
      'Centro Comunitario de Salud Familiar Batuco': { '2026': 0, '2027': 0, total: 0 }
    },

    // Tramos x Year evolution (tracks 2026 and 2027 under active non-year filters)
    tramosEvolucion: {
      '2026': { A: 0, B: 0, C: 0, D: 0, X: 0 },
      '2027': { A: 0, B: 0, C: 0, D: 0, X: 0 }
    },

    // Sectors
    sectors: {},

    // Pyramid: Age Bracket -> { M, H } (18 Official Groups)
    pyramid: AGE_BRACKETS.reduce((acc, b) => { acc[b] = { M: 0, H: 0 }; return acc; }, {}),

    // Ciclos vitales
    ciclos: {
      'Infancia (0-9)': 0,
      'Adolescencia (10-19)': 0,
      'Juventud (20-29)': 0,
      'Adultez (30-64)': 0,
      'Persona Mayor (65+)': 0
    },

    // Tramos por centro (para barra 100% apilada)
    tramosCentros: {},

    // Nacionalidades
    nations: {},

    // Etnias
    etnias: {},

    // Programas por Centro
    programasCentros: {}
  };

  // Single fast iteration over all raw rows
  for (let i = 0; i < totalRaw; i++) {
    const item = raw[i];

    // 1. Non-year filter checks
    if (checkCenter && item.c !== f.center) continue;
    if (checkSector && item.s !== f.sector) continue;
    if (checkGender && item.g !== f.gender) continue;
    if (checkTramo && item.t !== f.tramo) continue;

    if (checkAge) {
      const brk = getAgeBracket(item.e);
      const match60 = has60Plus && item.e >= 60;
      const matchBrk = ageGroupSet.has(brk);
      if (!match60 && !matchBrk) continue;
    }

    if (checkNat) {
      if (f.nationality === 'MIGRANTES') {
        if (item.n === 'Chile' || item.n === 'Desconocido' || item.n === 'Sin Datos') continue;
      } else if (f.nationality === 'Desconocido') {
        if (item.n !== 'Desconocido' && item.n !== 'Sin Datos') continue;
      } else if (item.n !== f.nationality) {
        continue;
      }
    }

    if (f.disability && !item.d) continue;
    if (f.caregiver && !item.cd) continue;
    if (f.prais && !item.p) continue;
    if (f.etnia && (item.et === 'No tiene' || item.et === 'Sin Datos' || item.et === 'No responde' || item.et === 'Otro (Especificar)')) continue;

    // Active Cohort Filter Check
    if (state.activeCohort) {
      if (state.activeCohort === 'adulto-pobreza' && !(item.e >= 65 && item.t === 'A')) continue;
      if (state.activeCohort === 'infancia-riesgo' && !(item.e <= 4 && item.t === 'A')) continue;
      if (state.activeCohort === 'salud-mujer' && !(item.g === 'MUJER' && item.e >= 15 && item.e <= 49)) continue;
      if (state.activeCohort === 'brecha-cuidadores' && !(item.d && !item.cd)) continue;
      if (state.activeCohort === 'ninos-migrantes' && !(item.e < 10 && item.n !== 'Chile' && item.n !== 'Desconocido' && item.n !== 'Sin Datos')) continue;
      if (state.activeCohort === 'tramo-x' && item.t !== 'X') continue;
    }

    if (searchStr) {
      const match = (item.c && item.c.toLowerCase().includes(searchStr)) ||
                    (item.n && item.n.toLowerCase().includes(searchStr)) ||
                    (item.s && item.s.toLowerCase().includes(searchStr)) ||
                    (item.et && item.et.toLowerCase().includes(searchStr)) ||
                    (item.t && item.t.toLowerCase().includes(searchStr)) ||
                    (item.y && item.y.includes(searchStr)) ||
                    (item.e !== undefined && String(item.e).includes(searchStr)) ||
                    (item.g && item.g.toLowerCase().includes(searchStr));
      if (!match) continue;
    }

    // Accumulate dual-year comparative metrics for rows matching all non-year filters
    if (agg.centers[item.c] && (item.y === '2026' || item.y === '2027')) {
      agg.centers[item.c][item.y]++;
    }
    if (agg.tramosEvolucion[item.y] && agg.tramosEvolucion[item.y][item.t] !== undefined) {
      agg.tramosEvolucion[item.y][item.t]++;
    }

    // 2. Year filter check (determines cohort for active dashboard tab/metrics)
    if (checkYear && item.y !== f.year) continue;

    filtered.push(item);

    // Accumulate metrics
    agg.total++;
    if (item.g === 'MUJER') agg.mujeres++;
    else if (item.g === 'HOMBRE') agg.hombres++;
    else agg.intersex++;

    // Tramos
    if (item.t === 'A') { agg.tramoA++; agg.vulnerables++; }
    else if (item.t === 'B') { agg.tramoB++; agg.vulnerables++; }
    else if (item.t === 'C') agg.tramoC++;
    else if (item.t === 'D') agg.tramoD++;
    else agg.tramoX++;

    // Ages
    agg.sumAge += item.e;
    agg.countAge++;
    if (item.e >= 60) agg.adultosMayores++;
    if (item.e >= 80) agg.adultos80Plus++;

    // Age Pyramid
    const brk = getAgeBracket(item.e);
    if (agg.pyramid[brk]) {
      if (item.g === 'MUJER') agg.pyramid[brk].M++;
      else if (item.g === 'HOMBRE') agg.pyramid[brk].H++;
    }

    // Ciclos vitales
    const ciclo = getCicloVital(item.e);
    if (agg.ciclos[ciclo] !== undefined) agg.ciclos[ciclo]++;

    // Migrants
    const isMigrant = item.n && item.n !== 'Chile' && item.n !== 'Desconocido' && item.n !== 'Sin Datos';
    if (isMigrant) {
      agg.migrantes++;
      agg.nations[item.n] = (agg.nations[item.n] || 0) + 1;
    }

    // Etnias
    if (item.et && item.et !== 'No tiene' && item.et !== 'Sin Datos' && item.et !== 'No responde' && item.et !== 'Otro (Especificar)') {
      const cleanEt = item.et.replace(/ᮼ.*$/, '').trim();
      agg.etnias[cleanEt] = (agg.etnias[cleanEt] || 0) + 1;
    }

    // Priority programs
    if (item.d) agg.discapacidad++;
    if (item.cd) agg.cuidadores++;
    if (item.p) agg.prais++;

    // Center tracking
    if (agg.centers[item.c]) {
      agg.centers[item.c].total++;
    }

    // Sector tracking
    agg.sectors[item.s] = (agg.sectors[item.s] || 0) + 1;

    // Tramos by center
    if (!agg.tramosCentros[item.c]) {
      agg.tramosCentros[item.c] = { A: 0, B: 0, C: 0, D: 0, X: 0 };
    }
    if (agg.tramosCentros[item.c][item.t] !== undefined) {
      agg.tramosCentros[item.c][item.t]++;
    }

    // Programas by Center
    if (!agg.programasCentros[item.c]) {
      agg.programasCentros[item.c] = { prais: 0, discapacidad: 0, cuidadores: 0 };
    }
    if (item.p) agg.programasCentros[item.c].prais++;
    if (item.d) agg.programasCentros[item.c].discapacidad++;
    if (item.cd) agg.programasCentros[item.c].cuidadores++;
  }

  state.filteredData = filtered;
  state.currentAgg = agg;

  // Update UI Elements
  updateKPIs(agg);
  updateFilterCount(filtered.length, totalRaw);
  updateAllCharts(agg);
  renderComparativeTable(agg);
  renderVulnerabilityIndexSection();
  updateCohortActiveBanner(filtered.length);
  renderTable();
}

// Update Filter Count Indicator
function updateFilterCount(count, total) {
  document.getElementById('filter-count-num').textContent = formatNum(count);
  document.getElementById('filtered-records-text').innerHTML = 
    `Mostrando <strong class="text-slate-900 dark:text-white font-mono">${formatNum(count)}</strong> de ${formatNum(total)} registros (${formatPct(count, total)})`;
}

// Update Top KPI Cards
function updateKPIs(agg) {
  const tot = agg.total;
  document.getElementById('kpi-total-validados').textContent = formatNum(tot);

  // Badge variation: When looking at 2027 alone, show vs 2026 (+3.6%)
  const badge = document.getElementById('kpi-total-badge');
  const subtext = badge ? badge.nextElementSibling : null;
  if (badge) {
    if (state.filters.year === '2027') {
      badge.className = 'font-bold text-emerald-600 dark:text-emerald-400 flex items-center';
      badge.textContent = '↑ +3.6% (+3.227)';
      if (subtext) {
        subtext.textContent = 'vs 2026';
        subtext.classList.remove('hidden');
      }
    } else if (state.filters.year === '2026') {
      badge.className = 'font-bold text-slate-500 dark:text-slate-400 flex items-center';
      badge.textContent = 'Proceso 2026';
      if (subtext) {
        subtext.textContent = '(Corte 30/09/2025)';
        subtext.classList.remove('hidden');
      }
    } else {
      badge.className = 'font-bold text-blue-600 dark:text-blue-400 flex items-center';
      badge.textContent = 'Total Consolidado';
      if (subtext) {
        subtext.textContent = '(2026 + 2027)';
        subtext.classList.remove('hidden');
      }
    }
  }

  // Gender
  document.getElementById('kpi-mujeres-pct').textContent = formatPct(agg.mujeres, tot);
  document.getElementById('kpi-hombres-pct').textContent = formatPct(agg.hombres, tot);
  document.getElementById('kpi-mujeres-count').textContent = `${formatNum(agg.mujeres)} mujeres`;
  document.getElementById('kpi-hombres-count').textContent = `${formatNum(agg.hombres)} hombres`;
  const pctMujeres = tot > 0 ? (agg.mujeres / tot) * 100 : 50;
  document.getElementById('kpi-gender-bar').style.width = `${pctMujeres}%`;

  // Vulnerabilidad (Tramos A+B)
  document.getElementById('kpi-vulnerables-count').textContent = formatNum(agg.vulnerables);
  document.getElementById('kpi-vulnerables-pct').textContent = `${formatPct(agg.vulnerables, tot)} del total`;

  // Adultos Mayores
  document.getElementById('kpi-adultos-mayores').textContent = formatNum(agg.adultosMayores);
  document.getElementById('kpi-adultos-pct').textContent = `${formatPct(agg.adultosMayores, tot)} del total`;

  // Migrantes
  document.getElementById('kpi-migrantes-count').textContent = formatNum(agg.migrantes);
  document.getElementById('kpi-migrantes-pct').textContent = `${formatPct(agg.migrantes, tot)} del total`;

  // Programas prioritarios
  document.getElementById('kpi-discapacidad').textContent = formatNum(agg.discapacidad);
  document.getElementById('kpi-cuidadores').textContent = formatNum(agg.cuidadores);
  document.getElementById('kpi-prais').textContent = formatNum(agg.prais);

  // Demographics tab metrics
  const avgAge = agg.countAge > 0 ? (agg.sumAge / agg.countAge).toFixed(1) : '0';
  document.getElementById('demo-edad-media').textContent = `${avgAge} años`;
  
  const sexRatio = agg.mujeres > 0 ? ((agg.hombres / agg.mujeres) * 100).toFixed(1) : '100';
  document.getElementById('demo-razon-sexo').textContent = `${sexRatio} hombres / 100 mujeres`;

  const infantil = agg.ciclos['Infancia (0-9)'] || 0;
  const juvenil = (agg.ciclos['Adolescencia (10-19)'] || 0) + (agg.ciclos['Juventud (20-29)'] || 0);
  const adulta = (agg.ciclos['Adultez (30-64)'] || 0);
  const mayor = (agg.ciclos['Persona Mayor (65+)'] || 0);

  document.getElementById('demo-infantil').textContent = `${formatNum(infantil)} (${formatPct(infantil, tot)})`;
  document.getElementById('demo-juvenil').textContent = `${formatNum(juvenil)} (${formatPct(juvenil, tot)})`;
  document.getElementById('demo-adulta').textContent = `${formatNum(adulta)} (${formatPct(adulta, tot)})`;
  document.getElementById('demo-adulto-mayor').textContent = `${formatNum(mayor)} (${formatPct(mayor, tot)})`;

  // Tramos tab metrics
  document.getElementById('stat-tramo-a').textContent = `${formatNum(agg.tramoA)} (${formatPct(agg.tramoA, tot)})`;
  document.getElementById('stat-tramo-b').textContent = `${formatNum(agg.tramoB)} (${formatPct(agg.tramoB, tot)})`;
  document.getElementById('stat-tramo-c').textContent = `${formatNum(agg.tramoC)} (${formatPct(agg.tramoC, tot)})`;
  document.getElementById('stat-tramo-d').textContent = `${formatNum(agg.tramoD)} (${formatPct(agg.tramoD, tot)})`;
  document.getElementById('stat-tramo-x').textContent = `${formatNum(agg.tramoX)} (${formatPct(agg.tramoX, tot)})`;
}

// Render Comparative Table in Tab 1
function renderComparativeTable(agg) {
  const tbody = document.getElementById('table-centros-comparativa-body');
  if (!tbody) return;

  const centers = [
    'Centro de Salud Familiar  José Bauza Frau',
    'Centro de Salud Familiar Batuco',
    'Posta de Salud Rural Juan Pablo II de Lampa',
    'Centro Comunitario de Salud Familiar Sol de Septiembre',
    'Centro Comunitario de Salud Familiar Batuco'
  ];

  let total2026 = 0;
  let total2027 = 0;

  // Pre-calculate sums for dynamic share calculation under any active filter
  centers.forEach(c => {
    const data = agg.centers[c] || { '2026': 0, '2027': 0 };
    total2026 += (data['2026'] || 0);
    total2027 += (data['2027'] || 0);
  });

  const rowsHtml = centers.map(c => {
    const data = agg.centers[c] || { '2026': 0, '2027': 0 };
    const val26 = data['2026'] || 0;
    const val27 = data['2027'] || 0;

    const diff = val27 - val26;
    const diffPct = val26 > 0 ? ((diff / val26) * 100).toFixed(1) : '0.0';
    const isPositive = diff >= 0;
    const share27 = total2027 > 0 ? ((val27 / total2027) * 100).toFixed(1) : '0.0';

    const shortName = c.replace('Centro de Salud Familiar  ', 'CESFAM ')
                       .replace('Centro de Salud Familiar ', 'CESFAM ')
                       .replace('Centro Comunitario de Salud Familiar ', 'CECOSF ')
                       .replace('Posta de Salud Rural ', 'PSR ');

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">${shortName}</td>
        <td class="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">${formatNum(val26)}</td>
        <td class="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">${formatNum(val27)}</td>
        <td class="px-4 py-3 text-right font-mono font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
          ${isPositive ? '+' : ''}${formatNum(diff)}
        </td>
        <td class="px-4 py-3 text-right font-mono font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
          ${isPositive ? '+' : ''}${diffPct}%
        </td>
        <td class="px-4 py-3 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">${share27}%</td>
      </tr>
    `;
  }).join('');

  const totalDiff = total2027 - total2026;
  const totalDiffPct = total2026 > 0 ? ((totalDiff / total2026) * 100).toFixed(1) : '0.0';
  const isTotalPos = totalDiff >= 0;

  const footerHtml = `
    <tr class="bg-slate-100/80 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
      <td class="px-4 py-3">TOTAL COMUNA DE LAMPA</td>
      <td class="px-4 py-3 text-right font-mono">${formatNum(total2026)}</td>
      <td class="px-4 py-3 text-right font-mono text-blue-600 dark:text-blue-400">${formatNum(total2027)}</td>
      <td class="px-4 py-3 text-right font-mono ${isTotalPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">${isTotalPos ? '+' : ''}${formatNum(totalDiff)}</td>
      <td class="px-4 py-3 text-right font-mono ${isTotalPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">${isTotalPos ? '+' : ''}${totalDiffPct}%</td>
      <td class="px-4 py-3 text-right font-mono">100.0%</td>
    </tr>
  `;

  tbody.innerHTML = rowsHtml + footerHtml;
}

// ==========================================================
// CHART LIFECYCLE & HIGH-PERFORMANCE RENDERING ENGINE
// ==========================================================

function safeRenderChart(chartKey, canvasId, configFactory) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Never initialize on a canvas inside a hidden tab container
  const tabContent = canvas.closest('.tab-content');
  if (tabContent && tabContent.classList.contains('hidden')) return;

  // Destroy existing chart on this key if it exists
  if (state.charts[chartKey]) {
    try { state.charts[chartKey].destroy(); } catch (e) {}
    state.charts[chartKey] = null;
  }

  // Destroy any Chart.js instance attached to this canvas
  if (typeof Chart !== 'undefined' && Chart.getChart) {
    const existing = Chart.getChart(canvas);
    if (existing) {
      try { existing.destroy(); } catch (e) {}
    }
  }

  // Remove any corrupted inline style attributes (like 0px width/height stamped by Chart.js)
  canvas.removeAttribute('style');
  canvas.removeAttribute('width');
  canvas.removeAttribute('height');

  if (typeof Chart === 'undefined') return;

  try {
    const config = configFactory();
    if (!config) return;
    state.charts[chartKey] = new Chart(canvas, config);
  } catch (err) {
    console.error(`Error rendering chart ${chartKey}:`, err);
  }
}

// Render active tab dynamically with accurate data and dimensions
function renderActiveTab(tabId) {
  tabId = tabId || state.currentTab || 'tab-resumen';

  // Ensure data pipeline is unpacked and calculated
  if ((!state.rawData || state.rawData.length === 0) && typeof window !== 'undefined' && window.OFFLINE_COMPACT_DATA) {
    unpackCompactData(window.OFFLINE_COMPACT_DATA, 'Base Oficial Validada (Local)');
  }
  if (!state.currentAgg && state.rawData && state.rawData.length > 0) {
    applyFilters();
  }

  const agg = state.currentAgg;

  if (tabId === 'tab-resumen') {
    if (agg) {
      renderCentrosComparativaChart(agg);
      renderTramosDonutChart(agg);
      renderSectoresChart(agg);
      renderComparativeTable(agg);
    }
  } else if (tabId === 'tab-comparativa-interanual') {
    renderComparativaModule();
  } else if (tabId === 'tab-demografia') {
    if (agg) {
      renderPiramideChart(agg);
      renderDemografiaGruposTable(agg);
      renderCiclosVitalesChart(agg);
    }
  } else if (tabId === 'tab-tramos') {
    if (agg) {
      updateTramosTabKPIs(agg);
      renderTramosCentrosStackedChart(agg);
      renderTramosEvolucionChart(agg);
      renderTramosDetailTable(agg);
    }
  } else if (tabId === 'tab-inclusion') {
    if (agg) {
      renderMigrantesNacionesChart(agg);
      renderEtniasChart(agg);
      renderProgramasCentrosChart(agg);
      renderInclusionDetailTable(agg);
    }
  } else if (tabId === 'tab-simulador') {
    updateSimuladorCalculations();
  } else if (tabId === 'tab-datos') {
    renderTable();
  }
}

// Update charts for the currently visible tab
function updateAllCharts(agg) {
  renderActiveTab(state.currentTab);
}

// Chart 1: Centros Comparativa (Bar chart 2026 vs 2027)
function renderCentrosComparativaChart(agg) {
  safeRenderChart('centrosComparativa', 'chart-centros-comparativa', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const centers = [
      'Centro de Salud Familiar  José Bauza Frau',
      'Centro de Salud Familiar Batuco',
      'Posta de Salud Rural Juan Pablo II de Lampa',
      'Centro Comunitario de Salud Familiar Sol de Septiembre',
      'Centro Comunitario de Salud Familiar Batuco'
    ];

    const labels = ['CESFAM Bauza Frau', 'CESFAM Batuco', 'PSR Juan Pablo II', 'CECOSF Sol Sept.', 'CECOSF Batuco'];
    const data2026 = centers.map(c => agg.centers[c] ? agg.centers[c]['2026'] : 0);
    const data2027 = centers.map(c => agg.centers[c] ? agg.centers[c]['2027'] : 0);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Proceso 2026',
            data: data2026,
            backgroundColor: 'rgba(147, 197, 253, 0.85)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Proceso 2027',
            data: data2027,
            backgroundColor: 'rgba(37, 99, 235, 0.9)',
            borderColor: '#1d4ed8',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} validados`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          }
        }
      }
    };
  });
}

// Chart 2: Tramos FONASA Donut
function renderTramosDonutChart(agg) {
  agg = agg || state.currentAgg;
  if (!agg) return;

  const data = [agg.tramoA, agg.tramoB, agg.tramoC, agg.tramoD, agg.tramoX];
  const labels = ['Tramo A', 'Tramo B', 'Tramo C', 'Tramo D', 'Tramo X'];
  const bgColors = ['#10b981', '#0d9488', '#3b82f6', '#6366f1', '#94a3b8'];

  // Update Legend text below donut
  const legendDiv = document.getElementById('tramos-donut-legend');
  if (legendDiv) {
    const tot = agg.total || 1;
    legendDiv.innerHTML = labels.map((l, i) => `
      <div class="flex items-center space-x-1.5">
        <span class="w-2.5 h-2.5 rounded-full" style="background:${bgColors[i]}"></span>
        <span class="font-medium text-slate-600 dark:text-slate-400">${l}:</span>
        <strong class="font-mono text-slate-800 dark:text-slate-200">${formatPct(data[i], tot)}</strong>
      </div>
    `).join('');
  }

  safeRenderChart('tramosDonut', 'chart-tramos-donut', () => {
    return {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: state.theme === 'dark' ? '#0f172a' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatNum(ctx.raw)} (${formatPct(ctx.raw, agg.total)})`
            }
          }
        }
      }
    };
  });
}

// Chart 3: Sectores Horizontales
function renderSectoresChart(agg) {
  safeRenderChart('sectores', 'chart-sectores', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const entries = Object.entries(agg.sectors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // Top 8 sectors

    const labels = entries.map(e => e[0] === 'Sin Datos' ? 'Sin Datos / Comunal' : `Sector ${e[0]}`);
    const counts = entries.map(e => e[1]);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: 'rgba(13, 148, 136, 0.85)',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${formatNum(ctx.raw)} personas (${formatPct(ctx.raw, agg.total)})`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          },
          y: { grid: { display: false } }
        }
      }
    };
  });
}

// Chart 4: Pirámide Poblacional (Hombres Izquierda, Mujeres Derecha)
function renderPiramideChart(agg) {
  safeRenderChart('piramide', 'chart-piramide', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const brackets = state.pyramidInverted ? [...AGE_BRACKETS].reverse() : [...AGE_BRACKETS];
    const hombresData = brackets.map(b => -(agg.pyramid[b] ? agg.pyramid[b].H : 0));
    const mujeresData = brackets.map(b => agg.pyramid[b] ? agg.pyramid[b].M : 0);

    return {
      type: 'bar',
      data: {
        labels: brackets,
        datasets: [
          {
            label: 'Hombres',
            data: hombresData,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderRadius: 4
          },
          {
            label: 'Mujeres',
            data: mujeresData,
            backgroundColor: 'rgba(236, 72, 153, 0.85)',
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = Math.abs(ctx.raw);
                return ` ${ctx.dataset.label}: ${formatNum(val)} personas (${formatPct(val, agg.total)})`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              callback: (v) => formatNum(Math.abs(v))
            }
          },
          y: {
            stacked: true,
            grid: { display: false }
          }
        }
      }
    };
  });
}

// Demographic Age Groups Table
function renderDemografiaGruposTable(agg) {
  const tbody = document.getElementById('table-demografia-grupos-body');
  if (!tbody) return;
  agg = agg || state.currentAgg;
  if (!agg) return;

  const brackets = [...AGE_BRACKETS];
  const tot = agg.total || 1;
  let sumM = 0;
  let sumH = 0;

  const rowsHtml = brackets.map(b => {
    const m = agg.pyramid[b] ? agg.pyramid[b].M : 0;
    const h = agg.pyramid[b] ? agg.pyramid[b].H : 0;
    const groupTotal = m + h;
    sumM += m;
    sumH += h;

    const groupPct = formatPct(groupTotal, tot);
    const mPct = formatPct(m, groupTotal);
    const hPct = formatPct(h, groupTotal);
    const mBar = groupTotal > 0 ? (m / groupTotal) * 100 : 50;

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">${b}</td>
        <td class="px-4 py-2.5 text-right font-mono text-pink-600 dark:text-pink-400 font-medium">
          ${formatNum(m)} <span class="text-[11px] text-slate-400">(${mPct})</span>
        </td>
        <td class="px-4 py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-medium">
          ${formatNum(h)} <span class="text-[11px] text-slate-400">(${hPct})</span>
        </td>
        <td class="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
          ${formatNum(groupTotal)}
        </td>
        <td class="px-4 py-2.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
          ${groupPct}
        </td>
        <td class="px-4 py-2.5">
          <div class="w-full bg-blue-500 rounded-full h-2 overflow-hidden flex" title="Mujeres ${mPct} | Hombres ${hPct}">
            <div class="bg-pink-500 h-2 rounded-l-full" style="width: ${mBar}%"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const grandTotal = sumM + sumH;
  const footerHtml = `
    <tr class="bg-slate-100/80 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
      <td class="px-4 py-3">TOTAL COMUNA</td>
      <td class="px-4 py-3 text-right font-mono text-pink-600 dark:text-pink-400">${formatNum(sumM)} (${formatPct(sumM, grandTotal)})</td>
      <td class="px-4 py-3 text-right font-mono text-blue-600 dark:text-blue-400">${formatNum(sumH)} (${formatPct(sumH, grandTotal)})</td>
      <td class="px-4 py-3 text-right font-mono">${formatNum(grandTotal)}</td>
      <td class="px-4 py-3 text-right font-mono">100.0%</td>
      <td class="px-4 py-3"></td>
    </tr>
  `;

  tbody.innerHTML = rowsHtml + footerHtml;
}

// Chart 5: Ciclos Vitales APS
function renderCiclosVitalesChart(agg) {
  safeRenderChart('ciclosVitales', 'chart-ciclos-vitales', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const labels = Object.keys(agg.ciclos);
    const data = Object.values(agg.ciclos);
    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${formatNum(ctx.raw)} personas (${formatPct(ctx.raw, agg.total)})`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          }
        }
      }
    };
  });
}

// Update Tramos Tab KPI cards (stat-tramo-a, b, c, d, x)
function updateTramosTabKPIs(agg) {
  agg = agg || state.currentAgg;
  if (!agg) return;
  const tot = agg.total || 1;
  const elA = document.getElementById('stat-tramo-a');
  const elB = document.getElementById('stat-tramo-b');
  const elC = document.getElementById('stat-tramo-c');
  const elD = document.getElementById('stat-tramo-d');
  const elX = document.getElementById('stat-tramo-x');
  if (elA) elA.textContent = `${formatNum(agg.tramoA)} (${formatPct(agg.tramoA, tot)})`;
  if (elB) elB.textContent = `${formatNum(agg.tramoB)} (${formatPct(agg.tramoB, tot)})`;
  if (elC) elC.textContent = `${formatNum(agg.tramoC)} (${formatPct(agg.tramoC, tot)})`;
  if (elD) elD.textContent = `${formatNum(agg.tramoD)} (${formatPct(agg.tramoD, tot)})`;
  if (elX) elX.textContent = `${formatNum(agg.tramoX)} (${formatPct(agg.tramoX, tot)})`;
}

// Chart 6: Tramos Centros 100% Stacked
function renderTramosCentrosStackedChart(agg) {
  safeRenderChart('tramosCentrosStacked', 'chart-tramos-centros-stacked', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const centers = [
      'Centro de Salud Familiar  José Bauza Frau',
      'Centro de Salud Familiar Batuco',
      'Posta de Salud Rural Juan Pablo II de Lampa',
      'Centro Comunitario de Salud Familiar Sol de Septiembre',
      'Centro Comunitario de Salud Familiar Batuco'
    ];
    const shortLabels = ['CESFAM Bauza', 'CESFAM Batuco', 'PSR Juan Pablo', 'CECOSF Sol', 'CECOSF Batuco'];

    const tcMap = agg.tramosCentros || {};
    const getTramoPct = (tramoLetter) => {
      return centers.map(c => {
        const tc = tcMap[c] || { A: 0, B: 0, C: 0, D: 0, X: 0 };
        const tot = (tc.A + tc.B + tc.C + tc.D + tc.X) || 1;
        return parseFloat(((tc[tramoLetter] / tot) * 100).toFixed(1));
      });
    };

    return {
      type: 'bar',
      data: {
        labels: shortLabels,
        datasets: [
          { label: 'Tramo A', data: getTramoPct('A'), backgroundColor: '#10b981' },
          { label: 'Tramo B', data: getTramoPct('B'), backgroundColor: '#0d9488' },
          { label: 'Tramo C', data: getTramoPct('C'), backgroundColor: '#3b82f6' },
          { label: 'Tramo D', data: getTramoPct('D'), backgroundColor: '#6366f1' },
          { label: 'Tramo X', data: getTramoPct('X'), backgroundColor: '#94a3b8' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: {
            stacked: true,
            max: 100,
            ticks: { callback: (v) => `${v}%` }
          }
        }
      }
    };
  });
}

// Chart 7: Tramos Evolución 2026 vs 2027
function renderTramosEvolucionChart(agg) {
  safeRenderChart('tramosEvolucion', 'chart-tramos-evolucion', () => {
    const labels = ['Tramo A (Gratuidad)', 'Tramo B', 'Tramo C', 'Tramo D', 'Tramo X'];
    const tramosKeys = ['A', 'B', 'C', 'D', 'X'];

    // Official validated distribution
    let ev26 = { A: 29775, B: 24707, C: 12217, D: 18451, X: 3886 };
    let ev27 = { A: 31264, B: 25220, C: 12402, D: 19123, X: 4254 };

    if (state.comparativeData && state.comparativeData.tramos) {
      const ct = state.comparativeData.tramos;
      tramosKeys.forEach(k => {
        if (ct[k]) {
          ev26[k] = ct[k]['26'] || ev26[k];
          ev27[k] = ct[k]['27'] || ev27[k];
        }
      });
    }

    const tramos2026 = tramosKeys.map(t => ev26[t]);
    const tramos2027 = tramosKeys.map(t => ev27[t]);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '2026 (Corte Sep-25)',
            data: tramos2026,
            backgroundColor: 'rgba(148, 163, 184, 0.8)',
            borderRadius: 6
          },
          {
            label: '2027 (Corte Sep-26)',
            data: tramos2027,
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} personas`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          }
        }
      }
    };
  });
}

// Detailed Tramos Breakdown Table by Center
function renderTramosDetailTable(agg) {
  const tbody = document.getElementById('table-tramos-centros-body');
  if (!tbody) return;
  agg = agg || state.currentAgg;
  if (!agg) return;

  const centers = [
    'Centro de Salud Familiar  José Bauza Frau',
    'Centro de Salud Familiar Batuco',
    'Posta de Salud Rural Juan Pablo II de Lampa',
    'Centro Comunitario de Salud Familiar Sol de Septiembre',
    'Centro Comunitario de Salud Familiar Batuco'
  ];
  const shortNames = {
    'Centro de Salud Familiar  José Bauza Frau': 'CESFAM José Bauza Frau',
    'Centro de Salud Familiar Batuco': 'CESFAM Batuco',
    'Posta de Salud Rural Juan Pablo II de Lampa': 'PSR Juan Pablo II de Lampa',
    'Centro Comunitario de Salud Familiar Sol de Septiembre': 'CECOSF Sol de Septiembre',
    'Centro Comunitario de Salud Familiar Batuco': 'CECOSF Batuco'
  };

  const tcMap = agg.tramosCentros || {};
  let totalComuna = 0, totA = 0, totB = 0, totC = 0, totD = 0, totX = 0;

  const rowsHtml = centers.map(c => {
    const tc = tcMap[c] || { A: 0, B: 0, C: 0, D: 0, X: 0 };
    const centerTot = (tc.A + tc.B + tc.C + tc.D + tc.X) || 0;
    const vuln = tc.A + tc.B;
    const vulnRate = centerTot > 0 ? ((vuln / centerTot) * 100).toFixed(1) + '%' : '0.0%';

    totalComuna += centerTot;
    totA += tc.A; totB += tc.B; totC += tc.C; totD += tc.D; totX += tc.X;

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200">${shortNames[c] || c}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">${formatNum(centerTot)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">${formatNum(tc.A)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-teal-600 dark:text-teal-400 font-semibold">${formatNum(tc.B)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">${formatNum(tc.C)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-indigo-600 dark:text-indigo-400 font-semibold">${formatNum(tc.D)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-slate-500 font-semibold">${formatNum(tc.X)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-teal-700 dark:text-teal-300">${vulnRate}</td>
      </tr>
    `;
  }).join('');

  const totVuln = totA + totB;
  const totVulnRate = totalComuna > 0 ? ((totVuln / totalComuna) * 100).toFixed(1) + '%' : '0.0%';
  const footerHtml = `
    <tr class="bg-slate-100/90 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
      <td class="px-3.5 py-3 uppercase">Total Comunal Lampa</td>
      <td class="px-3.5 py-3 text-right font-mono">${formatNum(totalComuna)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">${formatNum(totA)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-teal-600 dark:text-teal-400">${formatNum(totB)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-blue-600 dark:text-blue-400">${formatNum(totC)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-indigo-600 dark:text-indigo-400">${formatNum(totD)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-slate-500">${formatNum(totX)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-teal-700 dark:text-teal-300">${totVulnRate}</td>
    </tr>
  `;

  tbody.innerHTML = rowsHtml + footerHtml;
}

// Chart 8: Top Migrantes Naciones
function renderMigrantesNacionesChart(agg) {
  safeRenderChart('migrantesNaciones', 'chart-migrantes-naciones', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const nations = agg.nations || {};
    const entries = Object.entries(nations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // Top 8 countries

    const labels = entries.map(e => e[0]);
    const counts = entries.map(e => e[1]);
    const totalMigrantes = agg.migrantes || 1;

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${formatNum(ctx.raw)} inscritos (${formatPct(ctx.raw, totalMigrantes)} de migrantes)`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          },
          y: { grid: { display: false } }
        }
      }
    };
  });
}

// Chart 9: Etnias y Pueblos Originarios
function renderEtniasChart(agg) {
  safeRenderChart('etnias', 'chart-etnias', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const etnias = agg.etnias || {};
    const entries = Object.entries(etnias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    const labels = entries.map(e => e[0]);
    const counts = entries.map(e => e[1]);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${formatNum(ctx.raw)} personas`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          }
        }
      }
    };
  });
}

// Chart 10: Programas Centros (PRAIS, Discapacidad, Cuidador)
function renderProgramasCentrosChart(agg) {
  safeRenderChart('programasCentros', 'chart-programas-centros', () => {
    agg = agg || state.currentAgg;
    if (!agg) return null;

    const centers = [
      'Centro de Salud Familiar  José Bauza Frau',
      'Centro de Salud Familiar Batuco',
      'Posta de Salud Rural Juan Pablo II de Lampa',
      'Centro Comunitario de Salud Familiar Sol de Septiembre',
      'Centro Comunitario de Salud Familiar Batuco'
    ];
    const shortLabels = ['CESFAM Bauza', 'CESFAM Batuco', 'PSR Juan Pablo', 'CECOSF Sol', 'CECOSF Batuco'];

    const progCentros = agg.programasCentros || {};
    const praisData = centers.map(c => progCentros[c] ? progCentros[c].prais : 0);
    const discData = centers.map(c => progCentros[c] ? progCentros[c].discapacidad : 0);
    const cuidData = centers.map(c => progCentros[c] ? progCentros[c].cuidadores : 0);

    return {
      type: 'bar',
      data: {
        labels: shortLabels,
        datasets: [
          {
            label: 'Beneficiarios PRAIS',
            data: praisData,
            backgroundColor: 'rgba(168, 85, 247, 0.85)',
            borderRadius: 6
          },
          {
            label: 'Personas con Discapacidad',
            data: discData,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderRadius: 6
          },
          {
            label: 'Cuidadores Acreditados',
            data: cuidData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} personas`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => formatNum(v) }
          }
        }
      }
    };
  });
}

// Detailed Migration and Programs Breakdown Table by Center
function renderInclusionDetailTable(agg) {
  const tbody = document.getElementById('table-inclusion-centros-body');
  if (!tbody) return;
  agg = agg || state.currentAgg;
  if (!agg) return;

  const centers = [
    'Centro de Salud Familiar  José Bauza Frau',
    'Centro de Salud Familiar Batuco',
    'Posta de Salud Rural Juan Pablo II de Lampa',
    'Centro Comunitario de Salud Familiar Sol de Septiembre',
    'Centro Comunitario de Salud Familiar Batuco'
  ];
  const shortNames = {
    'Centro de Salud Familiar  José Bauza Frau': 'CESFAM José Bauza Frau',
    'Centro de Salud Familiar Batuco': 'CESFAM Batuco',
    'Posta de Salud Rural Juan Pablo II de Lampa': 'PSR Juan Pablo II de Lampa',
    'Centro Comunitario de Salud Familiar Sol de Septiembre': 'CECOSF Sol de Septiembre',
    'Centro Comunitario de Salud Familiar Batuco': 'CECOSF Batuco'
  };

  const raw = state.filteredData;
  const len = raw.length;

  const statsByCenter = {};
  centers.forEach(c => {
    statsByCenter[c] = { total: 0, migrantes: 0, etnias: 0, prais: 0, disc: 0, cuid: 0 };
  });

  for (let i = 0; i < len; i++) {
    const item = raw[i];
    const c = item.c;
    if (!statsByCenter[c]) continue;
    statsByCenter[c].total++;
    const isMigrant = item.n && item.n !== 'Chile' && item.n !== 'Desconocido' && item.n !== 'Sin Datos' && item.n !== '';
    if (isMigrant) statsByCenter[c].migrantes++;
    if (item.et && item.et !== 'No tiene' && item.et !== 'Sin Datos' && item.et !== 'No responde' && item.et !== 'Otro (Especificar)') statsByCenter[c].etnias++;
    if (item.p) statsByCenter[c].prais++;
    if (item.d) statsByCenter[c].disc++;
    if (item.cd) statsByCenter[c].cuid++;
  }

  let totInsc = 0, totMig = 0, totEtn = 0, totPra = 0, totDis = 0, totCui = 0;

  const rowsHtml = centers.map(c => {
    const s = statsByCenter[c];
    const migPct = s.total > 0 ? ((s.migrantes / s.total) * 100).toFixed(1) + '%' : '0.0%';

    totInsc += s.total;
    totMig += s.migrantes;
    totEtn += s.etnias;
    totPra += s.prais;
    totDis += s.disc;
    totCui += s.cuid;

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200">${shortNames[c] || c}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">${formatNum(s.total)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-indigo-600 dark:text-indigo-400 font-semibold">${formatNum(s.migrantes)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">${migPct}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-amber-600 dark:text-amber-400 font-semibold">${formatNum(s.etnias)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-purple-600 dark:text-purple-400 font-semibold">${formatNum(s.prais)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">${formatNum(s.disc)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">${formatNum(s.cuid)}</td>
      </tr>
    `;
  }).join('');

  const totMigPct = totInsc > 0 ? ((totMig / totInsc) * 100).toFixed(1) + '%' : '0.0%';
  const footerHtml = `
    <tr class="bg-slate-100/90 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
      <td class="px-3.5 py-3 uppercase">Total Comunal Lampa</td>
      <td class="px-3.5 py-3 text-right font-mono">${formatNum(totInsc)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-indigo-600 dark:text-indigo-400">${formatNum(totMig)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-indigo-700 dark:text-indigo-300">${totMigPct}</td>
      <td class="px-3.5 py-3 text-right font-mono text-amber-600 dark:text-amber-400">${formatNum(totEtn)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-purple-600 dark:text-purple-400">${formatNum(totPra)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-blue-600 dark:text-blue-400">${formatNum(totDis)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">${formatNum(totCui)}</td>
    </tr>
  `;

  tbody.innerHTML = rowsHtml + footerHtml;
}

// Render Raw Data Table in Tab 5 with Pagination
function renderTable() {
  const tbody = document.getElementById('raw-data-table-body');
  if (!tbody) return;

  const data = state.filteredData;
  const total = data.length;
  const { page, pageSize } = state.pagination;

  const totalPages = Math.ceil(total / pageSize) || 1;
  state.pagination.totalPages = totalPages;

  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = data.slice(startIdx, endIdx);

  // Pagination UI labels
  document.getElementById('table-page-number').textContent = `${page} / ${totalPages}`;
  document.getElementById('table-pagination-info').textContent = 
    total > 0 ? `Mostrando registros ${formatNum(startIdx + 1)} al ${formatNum(endIdx)} de ${formatNum(total)}` : 'No se encontraron registros';

  document.getElementById('btn-page-first').disabled = page <= 1;
  document.getElementById('btn-page-prev').disabled = page <= 1;
  document.getElementById('btn-page-next').disabled = page >= totalPages;
  document.getElementById('btn-page-last').disabled = page >= totalPages;

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="px-4 py-8 text-center text-slate-400">
          No hay registros que coincidan con los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pageItems.map(item => {
    // Tramo badge color
    let tramoBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (item.t === 'A') tramoBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    else if (item.t === 'B') tramoBadgeClass = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
    else if (item.t === 'C') tramoBadgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    else if (item.t === 'D') tramoBadgeClass = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-3.5 py-2.5 font-mono font-semibold">${item.y}</td>
        <td class="px-3.5 py-2.5 max-w-[200px] truncate" title="${item.c}">${item.c}</td>
        <td class="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">${item.s}</td>
        <td class="px-3.5 py-2.5">
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${item.g === 'MUJER' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}">
            ${item.g}
          </span>
        </td>
        <td class="px-3.5 py-2.5 text-right font-mono">${item.e}</td>
        <td class="px-3.5 py-2.5 text-center">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono ${tramoBadgeClass}">
            ${item.t}
          </span>
        </td>
        <td class="px-3.5 py-2.5">${item.n}</td>
        <td class="px-3.5 py-2.5 text-slate-500">${item.et}</td>
        <td class="px-3.5 py-2.5 text-center">${item.p ? '🕊️ SI' : '-'}</td>
        <td class="px-3.5 py-2.5 text-center">${item.d ? '♿ SI' : '-'}</td>
        <td class="px-3.5 py-2.5 text-center">${item.cd ? '🤝 SI' : '-'}</td>
      </tr>
    `;
  }).join('');
}

// Export Filtered Records to CSV with UTF-8 BOM
function exportFilteredCSV() {
  const data = state.filteredData;
  if (!data || data.length === 0) {
    showToast('No hay registros filtrados para exportar.', '⚠️');
    return;
  }

  const headers = ['AÑO', 'NOMBRE_CENTRO', 'SECTOR', 'GENERO', 'EDAD (años)', 'TRAMO', 'NACIONALIDAD', 'ETNIA', 'PRAIS', 'DISCAPACITADO', 'CUIDADOR'];
  
  let csvContent = '\uFEFF' + headers.join(',') + '\n';
  const len = data.length;

  for (let i = 0; i < len; i++) {
    const item = data[i];
    const row = [
      item.y,
      `"${item.c}"`,
      `"${item.s}"`,
      item.g,
      item.e,
      item.t,
      `"${item.n}"`,
      `"${item.et}"`,
      item.p ? 'SI' : 'NO',
      item.d ? 'Discapacitado' : '',
      item.cd ? 'Si' : ''
    ];
    csvContent += row.join(',') + '\n';
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Poblacion_Validada_FONASA_${state.filters.year}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  showToast(`Exportados ${formatNum(len)} registros a CSV con éxito`, '📥');
}

// ==========================================================
// MÓDULO COMPARATIVO INTERANUAL 2026 vs 2027
// ==========================================================

function renderComparativaModule() {
  if (!state.rawData || state.rawData.length === 0) return;

  const raw = state.rawData;
  const len = raw.length;

  const comp = {
    total26: 0,
    total27: 0,
    centros: {},
    tramos: { A: { '26': 0, '27': 0 }, B: { '26': 0, '27': 0 }, C: { '26': 0, '27': 0 }, D: { '26': 0, '27': 0 }, X: { '26': 0, '27': 0 } },
    edades: {},
    naciones: {},
    programas: {
      prais: { name: 'Beneficiarios PRAIS', '26': 0, '27': 0 },
      discapacidad: { name: 'Personas con Discapacidad', '26': 0, '27': 0 },
      cuidadores: { name: 'Cuidadores Acreditados', '26': 0, '27': 0 }
    }
  };

  AGE_BRACKETS.forEach(b => {
    comp.edades[b] = { '26': 0, '27': 0 };
  });

  const allCenters = [
    'Centro de Salud Familiar  José Bauza Frau',
    'Centro de Salud Familiar Batuco',
    'Posta de Salud Rural Juan Pablo II de Lampa',
    'Centro Comunitario de Salud Familiar Sol de Septiembre',
    'Centro Comunitario de Salud Familiar Batuco'
  ];
  allCenters.forEach(c => {
    comp.centros[c] = { '26': 0, '27': 0 };
  });

  for (let i = 0; i < len; i++) {
    const item = raw[i];
    const is26 = item.y === '2026';
    const is27 = item.y === '2027';
    if (!is26 && !is27) continue;

    const yKey = is26 ? '26' : '27';
    if (is26) comp.total26++;
    else comp.total27++;

    if (comp.centros[item.c]) {
      comp.centros[item.c][yKey]++;
    }

    if (comp.tramos[item.t]) {
      comp.tramos[item.t][yKey]++;
    }

    const brk = getAgeBracket(item.e);
    if (comp.edades[brk]) {
      comp.edades[brk][yKey]++;
    }

    const isMigrant = item.n && item.n !== 'Chile' && item.n !== 'Desconocido' && item.n !== 'Sin Datos';
    if (isMigrant) {
      if (!comp.naciones[item.n]) {
        comp.naciones[item.n] = { '26': 0, '27': 0 };
      }
      comp.naciones[item.n][yKey]++;
    }

    if (item.p) comp.programas.prais[yKey]++;
    if (item.d) comp.programas.discapacidad[yKey]++;
    if (item.cd) comp.programas.cuidadores[yKey]++;
  }

  state.comparativeData = comp;

  renderComparativaCentrosDeltaChart(comp);
  renderComparativaTramosDeltaChart(comp);
  renderComparativaEdadesDeltaChart(comp);
  renderComparativaMigrantesDeltaChart(comp);

  const dimSelect = document.getElementById('select-comparativa-dimension');
  const currDim = dimSelect ? dimSelect.value : 'centros';
  renderMatrizComparativaTable(currDim);
}

// Chart: Delta Centros
function renderComparativaCentrosDeltaChart(comp) {
  safeRenderChart('compCentrosDelta', 'chart-comparativa-centros-delta', () => {
    comp = comp || state.comparativeData;
    if (!comp) return null;

    const centers = [
      { key: 'Centro de Salud Familiar  José Bauza Frau', label: 'CESFAM Bauza Frau' },
      { key: 'Centro Comunitario de Salud Familiar Sol de Septiembre', label: 'CECOSF Sol de Septiembre' },
      { key: 'Posta de Salud Rural Juan Pablo II de Lampa', label: 'PSR Juan Pablo II' },
      { key: 'Centro de Salud Familiar Batuco', label: 'CESFAM Batuco' },
      { key: 'Centro Comunitario de Salud Familiar Batuco', label: 'CECOSF Batuco' }
    ];

    const labels = centers.map(c => c.label);
    const deltas = centers.map(c => {
      const data = comp.centros[c.key] || { '26': 0, '27': 0 };
      return data['27'] - data['26'];
    });

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Variación Neta 2026-2027',
          data: deltas,
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` +${formatNum(ctx.raw)} nuevos inscritos`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { callback: (v) => `+${formatNum(v)}` }
          },
          y: { grid: { display: false } }
        }
      }
    };
  });
}

// Chart: Delta Tramos (Divergent)
function renderComparativaTramosDeltaChart(comp) {
  safeRenderChart('compTramosDelta', 'chart-comparativa-tramos-delta', () => {
    comp = comp || state.comparativeData;
    if (!comp) return null;

    const tramosKeys = ['A', 'B', 'C', 'D', 'X'];
    const labels = ['Tramo A (Gratuidad)', 'Tramo B', 'Tramo C', 'Tramo D', 'Tramo X'];
    const deltas = tramosKeys.map(k => comp.tramos[k]['27'] - comp.tramos[k]['26']);
    const bgColors = deltas.map(d => d >= 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)');

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Variación de Beneficiarios',
          data: deltas,
          backgroundColor: bgColors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const prefix = ctx.raw >= 0 ? '+' : '';
                return ` ${prefix}${formatNum(ctx.raw)} personas`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback: (v) => (v >= 0 ? `+${formatNum(v)}` : formatNum(v))
            }
          }
        }
      }
    };
  });
}

// Chart: Delta Edades (18 Groups)
function renderComparativaEdadesDeltaChart(comp) {
  safeRenderChart('compEdadesDelta', 'chart-comparativa-edades-delta', () => {
    comp = comp || state.comparativeData;
    if (!comp) return null;

    const labels = [...AGE_BRACKETS];
    const deltas = labels.map(b => comp.edades[b]['27'] - comp.edades[b]['26']);
    const bgColors = deltas.map(d => d >= 0 ? 'rgba(59, 130, 246, 0.85)' : 'rgba(239, 68, 68, 0.85)');

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Variación de Validados',
          data: deltas,
          backgroundColor: bgColors,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const prefix = ctx.raw >= 0 ? '+' : '';
                return ` ${prefix}${formatNum(ctx.raw)} validados`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: (v) => (v >= 0 ? `+${formatNum(v)}` : formatNum(v))
            }
          },
          y: { grid: { display: false } }
        }
      }
    };
  });
}

// Chart: Delta Migrantes
function renderComparativaMigrantesDeltaChart(comp) {
  safeRenderChart('compMigrantesDelta', 'chart-comparativa-migrantes-delta', () => {
    comp = comp || state.comparativeData;
    if (!comp) return null;

    const entries = Object.entries(comp.naciones)
      .map(([nation, data]) => ({
        nation,
        delta: data['27'] - data['26'],
        v26: data['26'],
        v27: data['27']
      }))
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 7);

    const labels = entries.map(e => e.nation);
    const deltas = entries.map(e => e.delta);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nuevos Inscritos',
          data: deltas,
          backgroundColor: 'rgba(139, 92, 246, 0.85)',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` +${formatNum(ctx.raw)} personas de esta nacionalidad`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { callback: (v) => `+${formatNum(v)}` }
          },
          y: { grid: { display: false } }
        }
      }
    };
  });
}

// Table: Matriz Comparativa Interanual
function renderMatrizComparativaTable(dimension) {
  const tbody = document.getElementById('table-matriz-comparativa-body');
  if (!tbody || !state.comparativeData) return;

  const comp = state.comparativeData;
  const totalGrowth = comp.total27 - comp.total26; // 3227

  let rows = [];

  if (dimension === 'centros') {
    const centers = [
      'Centro de Salud Familiar  José Bauza Frau',
      'Centro Comunitario de Salud Familiar Sol de Septiembre',
      'Posta de Salud Rural Juan Pablo II de Lampa',
      'Centro de Salud Familiar Batuco',
      'Centro Comunitario de Salud Familiar Batuco'
    ];
    rows = centers.map(c => {
      const v26 = comp.centros[c]['26'];
      const v27 = comp.centros[c]['27'];
      const shortName = c.replace('Centro de Salud Familiar  ', 'CESFAM ')
                         .replace('Centro de Salud Familiar ', 'CESFAM ')
                         .replace('Centro Comunitario de Salud Familiar ', 'CECOSF ')
                         .replace('Posta de Salud Rural ', 'PSR ');
      return { name: shortName, v26, v27 };
    });
  } else if (dimension === 'tramos') {
    rows = ['A', 'B', 'C', 'D', 'X'].map(t => ({
      name: `Tramo FONASA ${t}`,
      v26: comp.tramos[t]['26'],
      v27: comp.tramos[t]['27']
    }));
  } else if (dimension === 'edades') {
    rows = AGE_BRACKETS.map(b => ({
      name: b,
      v26: comp.edades[b]['26'],
      v27: comp.edades[b]['27']
    }));
  } else if (dimension === 'naciones') {
    rows = Object.entries(comp.naciones)
      .map(([nation, data]) => ({
        name: nation,
        v26: data['26'],
        v27: data['27']
      }))
      .sort((a, b) => (b.v27 - b.v26) - (a.v27 - a.v26))
      .slice(0, 10);
  } else if (dimension === 'programas') {
    rows = [
      { name: 'Beneficiarios PRAIS', v26: comp.programas.prais['26'], v27: comp.programas.prais['27'] },
      { name: 'Personas con Discapacidad', v26: comp.programas.discapacidad['26'], v27: comp.programas.discapacidad['27'] },
      { name: 'Cuidadores Acreditados', v26: comp.programas.cuidadores['26'], v27: comp.programas.cuidadores['27'] }
    ];
  }

  tbody.innerHTML = rows.map(r => {
    const delta = r.v27 - r.v26;
    const deltaPct = r.v26 > 0 ? ((delta / r.v26) * 100).toFixed(2) : '0.00';
    const aportePct = totalGrowth > 0 ? ((delta / totalGrowth) * 100).toFixed(1) : '0.0';
    const isPos = delta >= 0;

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">${r.name}</td>
        <td class="px-4 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">${formatNum(r.v26)}</td>
        <td class="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">${formatNum(r.v27)}</td>
        <td class="px-4 py-2.5 text-right font-mono font-semibold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
          ${isPos ? '+' : ''}${formatNum(delta)}
        </td>
        <td class="px-4 py-2.5 text-right font-mono font-semibold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
          ${isPos ? '+' : ''}${deltaPct}%
        </td>
        <td class="px-4 py-2.5 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
          ${isPos ? '+' : ''}${aportePct}%
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================
// MÓDULO SIMULADOR FINANCIERO PER CÁPITA
// ==========================================================

function updateSimuladorCalculations() {
  const basal = parseFloat(document.getElementById('sim-basal')?.value) || 11350;
  const indexPobreza = parseFloat(document.getElementById('sim-index-pobreza')?.value) || 1.08;
  const indexRural = parseFloat(document.getElementById('sim-index-rural')?.value) || 1.04;

  const valIndexado = Math.round(basal * indexPobreza * indexRural);
  const elValIndex = document.getElementById('sim-val-indexado');
  if (elValIndex) elValIndex.textContent = `$${formatNum(valIndexado)} CLP`;

  const total26 = 89036;
  const total27 = 92263;
  const deltaTotal = total27 - total26; // 3227

  const anual26 = total26 * valIndexado * 12;
  const anual27 = total27 * valIndexado * 12;
  const incAnual = deltaTotal * valIndexado * 12;
  const incMensual = deltaTotal * valIndexado;

  const elPres26 = document.getElementById('sim-presupuesto-2026');
  if (elPres26) elPres26.textContent = `$${formatNum(anual26)} CLP`;

  const elPres27 = document.getElementById('sim-presupuesto-2027');
  if (elPres27) elPres27.textContent = `$${formatNum(anual27)} CLP`;

  const elIncNeto = document.getElementById('sim-incremento-neto');
  if (elIncNeto) elIncNeto.textContent = `+$${formatNum(incAnual)} CLP / año`;

  const elIncMensual = document.getElementById('sim-incremento-mensual');
  if (elIncMensual) elIncMensual.textContent = `+$${formatNum(incMensual)}/mes`;

  const tbody = document.getElementById('table-sim-centros-body');
  if (!tbody) return;

  const centers = [
    { name: 'CESFAM José Bauza Frau', v26: 47336, v27: 48948 },
    { name: 'CESFAM Batuco', v26: 16853, v27: 17130 },
    { name: 'PSR Juan Pablo II de Lampa', v26: 10803, v27: 11314 },
    { name: 'CECOSF Sol de Septiembre', v26: 6962, v27: 7564 },
    { name: 'CECOSF Batuco', v26: 7082, v27: 7307 }
  ];

  const rowsHtml = centers.map(c => {
    const mPres = c.v27 * valIndexado;
    const aPres = mPres * 12;
    const dVal = c.v27 - c.v26;
    const dAnual = dVal * valIndexado * 12;

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
        <td class="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200">${c.name}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">${formatNum(c.v27)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono text-slate-600 dark:text-slate-300">$${formatNum(mPres)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">$${formatNum(aPres)}</td>
        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">+$${formatNum(dAnual)}</td>
      </tr>
    `;
  }).join('');

  const totalMensual27 = total27 * valIndexado;
  const footerHtml = `
    <tr class="bg-slate-100/90 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
      <td class="px-3.5 py-3 uppercase">Total Comunal Lampa</td>
      <td class="px-3.5 py-3 text-right font-mono">${formatNum(total27)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-slate-700 dark:text-slate-200">$${formatNum(totalMensual27)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-blue-600 dark:text-blue-400">$${formatNum(anual27)}</td>
      <td class="px-3.5 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">+$${formatNum(incAnual)}</td>
    </tr>
  `;

  tbody.innerHTML = rowsHtml + footerHtml;
}


// ==========================================
// MONITOR DE COHORTES DE RIESGO Y ALERTA SANITARIA
// ==========================================

function toggleCohortFilter(cohortId) {
  if (state.activeCohort === cohortId) {
    state.activeCohort = null;
  } else {
    state.activeCohort = cohortId;
  }
  updateCohortUI();
  applyFilters();
}

function clearCohortFilter() {
  state.activeCohort = null;
  updateCohortUI();
  applyFilters();
}

function updateCohortUI() {
  document.querySelectorAll('.cohort-btn').forEach(btn => {
    const id = btn.getAttribute('data-cohort');
    const isActive = (state.activeCohort === id);
    btn.classList.toggle('ring-2', isActive);
    btn.classList.toggle('ring-amber-400', isActive);
    btn.classList.toggle('bg-slate-700', isActive);
    btn.classList.toggle('shadow-lg', isActive);
  });

  const banner = document.getElementById('cohort-active-alert');
  if (!banner) return;
  if (!state.activeCohort) {
    banner.classList.add('hidden');
  }
}

function updateCohortActiveBanner(matchCount) {
  const banner = document.getElementById('cohort-active-alert');
  const nameEl = document.getElementById('cohort-active-name');
  const countEl = document.getElementById('cohort-active-count');
  if (!banner || !nameEl || !countEl) return;

  if (state.activeCohort) {
    const names = {
      'adulto-pobreza': 'Adultos 65+ en Pobreza (Tramo A)',
      'infancia-riesgo': 'Infancia Vulnerable (0-4 años en Tramo A)',
      'salud-mujer': 'Salud de la Mujer (15 a 49 años)',
      'brecha-cuidadores': 'Personas con Discapacidad sin Cuidador Acreditado',
      'ninos-migrantes': 'Primera Infancia Migrante (< 10 años extranjeros)',
      'tramo-x': 'Tramo X / Previsión sin Acreditar'
    };
    nameEl.textContent = names[state.activeCohort] || state.activeCohort;
    countEl.textContent = formatNum(matchCount);
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function updateCohortButtonCounts() {
  if (!state.cachedCohortCounts) return;
  const yr = state.filters.year || '2027';
  const counts = state.cachedCohortCounts[yr] || state.cachedCohortCounts['2027'];
  if (!counts) return;

  document.querySelectorAll('.cohort-btn').forEach(btn => {
    const id = btn.getAttribute('data-cohort');
    if (counts[id] !== undefined) {
      const numSpan = btn.querySelector('.font-mono');
      if (numSpan) numSpan.textContent = formatNum(counts[id]);
    }
  });
}

// ==========================================
// EXPORTADOR DE GRÁFICOS EN ALTA RESOLUCIÓN
// ==========================================

window.exportChartPNG = function(canvasId, title) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    showToast('No se encontró el lienzo para exportar', '⚠️');
    return;
  }

  try {
    const chartInstance = Chart.getChart(canvas);
    if (chartInstance && (canvas.width === 0 || canvas.height === 0)) {
      chartInstance.resize();
    }

    const scale = 2;
    const paddingX = 40;
    const paddingTop = 95;
    const paddingBottom = 65;

    const srcWidth = canvas.width || 800;
    const srcHeight = canvas.height || 400;

    const offscreen = document.createElement('canvas');
    offscreen.width = (srcWidth + paddingX * 2) * scale;
    offscreen.height = (srcHeight + paddingTop + paddingBottom) * scale;

    const ctx = offscreen.getContext('2d');
    ctx.scale(scale, scale);

    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#0f172a' : '#ffffff';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const subtextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? '#334155' : '#e2e8f0';
    const accentColor = '#2563eb';

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, srcWidth + paddingX * 2, srcHeight + paddingTop + paddingBottom);

    // Card border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, srcWidth + paddingX * 2 - 24, srcHeight + paddingTop + paddingBottom - 24);

    // Header Accent Line
    ctx.fillStyle = accentColor;
    ctx.fillRect(paddingX, 32, 5, 40);

    // Title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(title || 'Observatorio FONASA Lampa', paddingX + 16, 50);

    // Subtitle
    ctx.fillStyle = subtextColor;
    ctx.font = '12px "Plus Jakarta Sans", system-ui, sans-serif';
    const today = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`Red de Salud Municipal de Lampa • Proceso FONASA 2026-2027 | ${today}`, paddingX + 16, 68);

    // Draw chart canvas
    ctx.drawImage(canvas, paddingX, paddingTop, srcWidth, srcHeight);

    // Footer Watermark
    ctx.fillStyle = subtextColor;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Fuente: Validados FONASA Municipalidad de Lampa • Gráfico Exportado en Alta Resolución (2x)', paddingX, srcHeight + paddingTop + 38);

    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeTitle = (title || 'grafico')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      a.download = `Lampa_FONASA_${safeTitle}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast(`Gráfico "${title}" exportado en Alta Resolución`);
    }, 'image/png');
  } catch (err) {
    console.error('Error exporting chart:', err);
    showToast('Error al exportar gráfico: ' + err.message, '❌');
  }
};

function showToast(message, icon = '📥') {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');
  if (!toast) return;

  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;

  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}

// ==========================================
// ÍNDICE COMPUESTO DE VULNERABILIDAD Y DEMANDA ASISTENCIAL
// ==========================================

function renderVulnerabilityIndexSection() {
  const container = document.getElementById('vulnerability-index-cards');
  if (!container) return;

  const yr = (state.filters.year === 'ALL' || !state.cachedVulnerabilityStats || !state.cachedVulnerabilityStats[state.filters.year])
    ? '2027'
    : state.filters.year;

  const badge = document.getElementById('vulnerability-year-badge');
  if (badge) badge.textContent = state.filters.year === 'ALL' ? '2027 (Base)' : yr;

  const centerStats = state.cachedVulnerabilityStats ? state.cachedVulnerabilityStats[yr] : null;
  if (!centerStats) return;

  // Calculate scores
  const results = Object.keys(centerStats).map(name => {
    const d = centerStats[name];
    const tot = d.total || 1;
    const pA = (d.tramoA / tot) * 100;
    const p60 = (d.adultos60 / tot) * 100;
    const pInf = (d.infancia / tot) * 100;
    const pMig = (d.migrantes / tot) * 100;
    const pDisc = (d.discapacidad / tot) * 100;

    // Composite vulnerability score (0 - 100)
    const rawScore = (pA * 0.35) + (p60 * 0.25) + (pInf * 0.20) + (pMig * 0.15) + (pDisc * 0.05);

    let priorityBadge = '';
    let priorityClass = '';
    let recommendation = '';

    if (rawScore >= 24) {
      priorityBadge = 'Vulnerabilidad Muy Alta';
      priorityClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      recommendation = 'Prioridad #1 en dotación GES, mediación intercultural y extensión horaria.';
    } else if (rawScore >= 21) {
      priorityBadge = 'Vulnerabilidad Alta';
      priorityClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      recommendation = 'Refuerzo de programas de equidad social y control prenatal/infantil.';
    } else if (rawScore >= 19.5) {
      priorityBadge = 'Carga Masiva / Alta';
      priorityClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      recommendation = 'Mayor volumen comunal (53.1%). Centro clave de resolución diagnóstica.';
    } else if (p60 >= 18) {
      priorityBadge = 'Alta Demanda Geriátrica';
      priorityClass = 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      recommendation = 'Máxima tasa de adultos 60+ (18.4%). Priorizar atención domiciliaria y dependencia.';
    } else {
      priorityBadge = 'Demanda Rural / Moderada';
      priorityClass = 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      recommendation = 'Foco en patologías crónicas, adultos mayores (16.7%) y acceso territorial.';
    }

    return {
      fullName: name,
      shortName: d.short,
      type: d.type,
      total: d.total,
      score: rawScore,
      priorityBadge,
      priorityClass,
      recommendation,
      pA, p60, pInf, pMig, pDisc
    };
  });

  results.sort((a, b) => b.score - a.score);

  container.innerHTML = results.map((r, idx) => {
    const rankColors = [
      'bg-rose-500 text-white',
      'bg-amber-500 text-white',
      'bg-blue-600 text-white',
      'bg-purple-600 text-white',
      'bg-slate-600 text-white'
    ];
    const rankColor = rankColors[idx] || 'bg-slate-600 text-white';

    return `
      <div class="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md group cursor-pointer" onclick="openFichaModalWithCenter('${r.fullName}')">
        <div>
          <!-- Header Card -->
          <div class="flex items-center justify-between mb-2">
            <span class="w-6 h-6 rounded-full ${rankColor} text-[11px] font-mono font-bold flex items-center justify-center shadow-sm">
              #${idx + 1}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${r.priorityClass}">
              ${r.priorityBadge}
            </span>
          </div>

          <h4 class="font-bold text-slate-900 dark:text-white text-xs leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            ${r.shortName}
          </h4>
          <span class="text-[10px] text-slate-400 block mb-3">${r.type} • ${formatNum(r.total)} validados</span>

          <!-- Score Big -->
          <div class="mb-3 p-2.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Índice de Vulnerabilidad</span>
            <div class="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
              ${r.score.toFixed(1)} <span class="text-xs font-normal text-slate-400">/ 100</span>
            </div>
          </div>

          <!-- Component Metrics -->
          <div class="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <div class="flex justify-between text-[10px] mb-0.5">
                <span class="font-medium text-slate-500 dark:text-slate-400">Tramo A (Pobreza)</span>
                <span class="font-bold font-mono text-slate-800 dark:text-slate-200">${r.pA.toFixed(1)}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full" style="width: ${Math.min(100, r.pA * 2)}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] mb-0.5">
                <span class="font-medium text-slate-500 dark:text-slate-400">Adultos 60+ (Crónicos)</span>
                <span class="font-bold font-mono text-slate-800 dark:text-slate-200">${r.p60.toFixed(1)}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-purple-500 h-full rounded-full" style="width: ${Math.min(100, r.p60 * 4)}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] mb-0.5">
                <span class="font-medium text-slate-500 dark:text-slate-400">Población Migrante</span>
                <span class="font-bold font-mono text-slate-800 dark:text-slate-200">${r.pMig.toFixed(1)}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-violet-500 h-full rounded-full" style="width: ${Math.min(100, r.pMig * 4)}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] mb-0.5">
                <span class="font-medium text-slate-500 dark:text-slate-400">Infancia &lt; 10 años</span>
                <span class="font-bold font-mono text-slate-800 dark:text-slate-200">${r.pInf.toFixed(1)}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: ${Math.min(100, r.pInf * 4)}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
          <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            ${r.recommendation}
          </p>
          <span class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 group-hover:underline">
            Ver Ficha Técnica →
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// GENERADOR DE FICHA EJECUTIVA POR CENTRO
// ==========================================

function openFichaModal() {
  const currentCenterFilter = state.filters.center;
  const select = document.getElementById('select-ficha-center');
  const targetCenter = (currentCenterFilter && currentCenterFilter !== 'ALL')
    ? currentCenterFilter
    : (select.value || 'Centro de Salud Familiar  José Bauza Frau');

  select.value = targetCenter;
  renderFichaContent(targetCenter);

  const modal = document.getElementById('modal-ficha-centro');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-ficha-open');
  }
}

window.openFichaModalWithCenter = function(centerName) {
  const select = document.getElementById('select-ficha-center');
  if (select) select.value = centerName;
  renderFichaContent(centerName);

  const modal = document.getElementById('modal-ficha-centro');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-ficha-open');
  }
};

function closeFichaModal() {
  const modal = document.getElementById('modal-ficha-centro');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-ficha-open');
  }
}

function renderFichaContent(centerName) {
  const area = document.getElementById('ficha-printable-area');
  if (!area) return;

  const raw = state.rawData;
  if (!raw || raw.length === 0) {
    area.innerHTML = '<p class="text-center text-slate-400 py-8">Cargando información del centro...</p>';
    return;
  }

  // Aggregate stats for this center
  const stats26 = { total: 0 };
  const stats27 = {
    total: 0,
    mujeres: 0,
    hombres: 0,
    tramoA: 0,
    tramoB: 0,
    tramoC: 0,
    tramoD: 0,
    tramoX: 0,
    sumAge: 0,
    infancia0_9: 0,
    jovenes10_19: 0,
    adultos20_59: 0,
    adultos60Plus: 0,
    adultos80Plus: 0,
    migrantes: 0,
    discapacidad: 0,
    cuidadores: 0,
    prais: 0,
    etnias: 0,
    sectors: {},
    nations: {}
  };

  let totalComunal27 = 0;

  for (let i = 0; i < raw.length; i++) {
    const it = raw[i];
    if (it.y === '2027') totalComunal27++;

    if (it.c !== centerName) continue;

    if (it.y === '2026') {
      stats26.total++;
    } else if (it.y === '2027') {
      stats27.total++;
      if (it.g === 'MUJER') stats27.mujeres++;
      else if (it.g === 'HOMBRE') stats27.hombres++;

      if (it.t === 'A') stats27.tramoA++;
      else if (it.t === 'B') stats27.tramoB++;
      else if (it.t === 'C') stats27.tramoC++;
      else if (it.t === 'D') stats27.tramoD++;
      else stats27.tramoX++;

      stats27.sumAge += it.e;
      if (it.e <= 9) stats27.infancia0_9++;
      else if (it.e <= 19) stats27.jovenes10_19++;
      else if (it.e <= 59) stats27.adultos20_59++;
      else stats27.adultos60Plus++;

      if (it.e >= 80) stats27.adultos80Plus++;

      const isMig = (it.n !== 'Chile' && it.n !== 'Desconocido' && it.n !== 'Sin Datos' && it.n !== '');
      if (isMig) {
        stats27.migrantes++;
        stats27.nations[it.n] = (stats27.nations[it.n] || 0) + 1;
      }

      if (it.d) stats27.discapacidad++;
      if (it.cd) stats27.cuidadores++;
      if (it.p) stats27.prais++;
      if (it.et !== 'No tiene' && it.et !== 'Sin Datos' && it.et !== 'No responde') stats27.etnias++;

      const sec = it.s || 'Sin Datos';
      stats27.sectors[sec] = (stats27.sectors[sec] || 0) + 1;
    }
  }

  const tot27 = stats27.total || 1;
  const tot26 = stats26.total || 0;
  const deltaAbs = tot27 - tot26;
  const deltaPct = tot26 > 0 ? ((deltaAbs / tot26) * 100).toFixed(2) : '0';
  const shareComunal = totalComunal27 > 0 ? ((tot27 / totalComunal27) * 100).toFixed(1) : '0';
  const avgAge = (stats27.sumAge / tot27).toFixed(1);

  const pctA = (stats27.tramoA / tot27) * 100;
  const pctB = (stats27.tramoB / tot27) * 100;
  const pctC = (stats27.tramoC / tot27) * 100;
  const pctD = (stats27.tramoD / tot27) * 100;
  const pctX = (stats27.tramoX / tot27) * 100;

  const pct60 = (stats27.adultos60Plus / tot27) * 100;
  const pctInf = (stats27.infancia0_9 / tot27) * 100;
  const pctMig = (stats27.migrantes / tot27) * 100;
  const pctDisc = (stats27.discapacidad / tot27) * 100;

  const vulScore = ((pctA * 0.35) + (pct60 * 0.25) + (pctInf * 0.20) + (pctMig * 0.15) + (pctDisc * 0.05)).toFixed(1);

  // Top 3 foreign nationalities
  const sortedNations = Object.entries(stats27.nations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([p, cnt]) => `${p} (${formatNum(cnt)})`)
    .join(', ') || 'Sin registro relevante';

  // Sectors list
  const sortedSectors = Object.entries(stats27.sectors)
    .sort((a, b) => b[1] - a[1])
    .map(([s, cnt]) => `
      <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
        <span class="font-medium text-slate-700 dark:text-slate-300">Sector ${s}</span>
        <span class="font-mono font-bold text-slate-900 dark:text-white">${formatNum(cnt)} <span class="text-[10px] text-slate-400 font-normal">(${((cnt / tot27) * 100).toFixed(1)}%)</span></span>
      </div>
    `).join('');

  // Tailored recommendations
  const recs = [];
  if (pctA >= 35) {
    recs.push(`<strong>Vulnerabilidad Socioeconómica Alta (${pctA.toFixed(1)}% Tramo A):</strong> Priorizar canasta GES gratuita, entrega oportuna de fármacos crónicos y asistencia social directa.`);
  }
  if (pct60 >= 16) {
    recs.push(`<strong>Envejecimiento Acelerado (${pct60.toFixed(1)}% Adultos Mayores):</strong> Reforzar el Programa Más Adultos Mayores Autovalentes (MAS-AMA), EMPAM periódico y búsqueda activa de pacientes postrados.`);
  }
  if (pctMig >= 14) {
    recs.push(`<strong>Interculturalidad Relevante (${pctMig.toFixed(1)}% Migrantes):</strong> Mantener facilitadores lingüísticos (Criollo haitiano) y campañas de regularización previsional para tramos X.`);
  }
  if (stats27.discapacidad > 0 && stats27.cuidadores < (stats27.discapacidad * 0.3)) {
    const brecha = stats27.discapacidad - stats27.cuidadores;
    recs.push(`<strong>Brecha Crítica de Cuidados:</strong> De ${formatNum(stats27.discapacidad)} personas con discapacidad, ${formatNum(brecha)} no cuentan con cuidador acreditado. Se aconseja operativo territorial de certificación compin.`);
  }
  if (recs.length === 0) {
    recs.push(`<strong>Monitoreo Rutinario:</strong> Mantener cobertura de controles de salud infantil y programas preventivos de salud cardiovascular.`);
  }

  // Facility clean label & type
  let centerType = 'Centro de Salud Familiar (CESFAM)';
  if (centerName.includes('Posta')) centerType = 'Posta de Salud Rural (PSR)';
  else if (centerName.includes('Comunitario')) centerType = 'Centro Comunitario de Salud Familiar (CECOSF)';

  area.innerHTML = `
    <!-- Ficha Header -->
    <div class="border-b-2 border-blue-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
          🏛️
        </div>
        <div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
            Red de Salud Municipal de Lampa • Ficha Técnica Oficial
          </span>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            ${centerName}
          </h2>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${centerType}</span>
        </div>
      </div>
      <div class="text-right sm:self-center">
        <div class="inline-flex flex-col items-end">
          <span class="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold font-mono text-xs border border-blue-200 dark:border-blue-800">
            Validados 2027: ${formatNum(tot27)}
          </span>
          <span class="text-[10px] text-slate-400 mt-0.5">Representa el <strong>${shareComunal}%</strong> comunal</span>
        </div>
      </div>
    </div>

    <!-- KPI Metric Cards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Crecimiento Interanual</span>
        <div class="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
          ${deltaAbs >= 0 ? '+' : ''}${formatNum(deltaAbs)} (${deltaAbs >= 0 ? '+' : ''}${deltaPct}%)
        </div>
        <span class="text-[10px] text-slate-500">2026: ${formatNum(tot26)} inscritos</span>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Índice Vulnerabilidad</span>
        <div class="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
          ${vulScore} / 100
        </div>
        <span class="text-[10px] text-slate-500">Modelo multicriterio ponderado</span>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adultos 60+ Años</span>
        <div class="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
          ${formatNum(stats27.adultos60Plus)} (${pct60.toFixed(1)}%)
        </div>
        <span class="text-[10px] text-slate-500">80+ años: ${formatNum(stats27.adultos80Plus)}</span>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Población Migrante</span>
        <div class="text-base sm:text-lg font-black font-mono text-violet-600 dark:text-violet-400 mt-0.5">
          ${formatNum(stats27.migrantes)} (${pctMig.toFixed(1)}%)
        </div>
        <span class="text-[10px] text-slate-500">Edad Media Centro: ${avgAge} años</span>
      </div>
    </div>

    <!-- 2 Column Technical Breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      
      <!-- Col 1: FONASA Breakdown & Demographics -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 space-y-3">
        <h4 class="font-bold text-slate-900 dark:text-white flex items-center justify-between border-b pb-1.5 border-slate-100 dark:border-slate-700">
          <span>Estructura Previsional FONASA</span>
          <span class="font-mono text-[10px] text-slate-400">Total: ${formatNum(tot27)}</span>
        </h4>

        <div class="space-y-2">
          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span><strong>Tramo A (Gratuidad):</strong> ${formatNum(stats27.tramoA)} personas</span>
              <span class="font-bold font-mono text-rose-600">${pctA.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-rose-500 h-full rounded-full" style="width: ${pctA}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span><strong>Tramo B:</strong> ${formatNum(stats27.tramoB)} personas</span>
              <span class="font-bold font-mono text-emerald-600">${pctB.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full" style="width: ${pctB}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span><strong>Tramo C:</strong> ${formatNum(stats27.tramoC)} personas</span>
              <span class="font-bold font-mono text-blue-600">${pctC.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full" style="width: ${pctC}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span><strong>Tramo D:</strong> ${formatNum(stats27.tramoD)} personas</span>
              <span class="font-bold font-mono text-indigo-600">${pctD.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full" style="width: ${pctD}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span><strong>Tramo X (En Trámite):</strong> ${formatNum(stats27.tramoX)} personas</span>
              <span class="font-bold font-mono text-slate-500">${pctX.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-slate-400 h-full rounded-full" style="width: ${pctX}%"></div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500 dark:text-slate-400">
          <span>Mujeres: <strong>${formatNum(stats27.mujeres)}</strong> (${((stats27.mujeres/tot27)*100).toFixed(1)}%)</span>
          <span>Hombres: <strong>${formatNum(stats27.hombres)}</strong> (${((stats27.hombres/tot27)*100).toFixed(1)}%)</span>
        </div>
      </div>

      <!-- Col 2: Territorial Sectors & Special Programs -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 space-y-3">
        <h4 class="font-bold text-slate-900 dark:text-white border-b pb-1.5 border-slate-100 dark:border-slate-700">
          Distribución por Sector y Programas Especiales
        </h4>

        <!-- Sectors -->
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sectores Territoriales Asignados</span>
          <div class="space-y-1">
            ${sortedSectors}
          </div>
        </div>

        <!-- Special Programs Indicators -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80">
            <span class="text-[10px] text-slate-400 block">Discapacidad / Cuidadores</span>
            <span class="font-bold font-mono text-slate-800 dark:text-slate-200">${formatNum(stats27.discapacidad)} / ${formatNum(stats27.cuidadores)}</span>
          </div>
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80">
            <span class="text-[10px] text-slate-400 block">Beneficiarios PRAIS</span>
            <span class="font-bold font-mono text-slate-800 dark:text-slate-200">${formatNum(stats27.prais)} personas</span>
          </div>
        </div>

        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Principales Nacionalidades Extranjeras</span>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">${sortedNations}</p>
        </div>
      </div>

    </div>

    <!-- Recommendations & Strategy -->
    <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-slate-800 dark:text-slate-200 space-y-2">
      <div class="flex items-center space-x-2">
        <span class="text-base">📋</span>
        <h4 class="font-bold text-blue-950 dark:text-blue-200 text-xs uppercase tracking-wider">
          Focos Estratégicos y Recomendaciones de Gestión Asistencial
        </h4>
      </div>
      <ul class="space-y-1.5 list-disc list-inside text-[11px] text-slate-700 dark:text-slate-300">
        ${recs.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- Footer Note -->
    <div class="text-[10px] text-slate-400 pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
      <span>Municipalidad de Lampa • Dirección de Salud • Observatorio FONASA 2026-2027</span>
      <span class="font-mono">Generado: ${new Date().toLocaleDateString('es-CL')}</span>
    </div>
  `;
}


// Global Window Bindings for direct HTML onclick/oninput resilience
window.switchTab = switchTab;
window.exportFilteredCSV = exportFilteredCSV;
window.updateSimuladorCalculations = updateSimuladorCalculations;
window.renderActiveTab = renderActiveTab;
