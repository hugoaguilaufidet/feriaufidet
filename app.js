/**
 * Configuración de Integración con Google Sheets
 * Hoja: https://docs.google.com/spreadsheets/d/1_3lhS2Dih1qiTZa8vEPcBmGLVFbiyiUhDWEZKdDUSKI/edit
 * Pestañas automáticas: "Expositores", "Jurados", "Visitantes"
 */
const GOOGLE_SHEETS_SCRIPT_URL = ""; // Pega aquí la URL de la Web App de Apps Script (ej: https://script.google.com/macros/s/.../exec)

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initStandsFilter();
    initProjectModals();
    initScheduleFilter();
    initRegistrationForm();
});

/* ==========================================================================
   1. NAVEGACIÓN Y ACTIVE TAB EN SCROLL
   ========================================================================== */
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('section[id], header[id]');

    // Smooth scroll para todos los enlaces ancla
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // IntersectionObserver para marcar activa la pestaña correspondiente
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navTabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.getAttribute('href') === `#${currentId}`) {
                        tab.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   2. FILTROS DE STANDS Y CÁTEDRAS
   ========================================================================== */
function initStandsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const standCards = document.querySelectorAll('.stand-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones activos
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedCategory = btn.getAttribute('data-category');

            standCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================================
   3. MODAL DE FICHAS TÉCNICAS Y PROYECTOS ABP
   ========================================================================== */
const projectData = {
    auto: {
        badge: "Cátedra: TMA & Sistemas Vehiculares",
        title: "Autotrónica: Prototipos Electromecánicos e Inyección Electrónica",
        problem: "Demanda de diagnósticos precisos en talleres mecánicos de Salta ante la transición hacia vehículos con inyección computarizada y electromovilidad sustentable. Reducción de fallas críticas y consumo de combustible.",
        prototypes: "Banco de pruebas y simulación de inyectores piezoeléctricos con control PWM automatizado; banco didáctico de tren motriz seccionado y simulador de sensores CKP/CMP con Arduino Mega.",
        measurements: "Captura de oscilogramas con osciloscopio automotriz de 4 canales; medición de ancho de pulso de inyección (ms); prueba de presión de combustible en rampa; análisis de compresión relativa con pinza amperimétrica.",
        equipment: ["Osciloscopio Automotriz Fluke / Hantek", "Banco de Inyectores Automatizado", "Pinza Amperimétrica True-RMS", "Scanner OBD-II con Telemetría CAN-Bus", "Tornero y Soldadura MIG/MAG"],
        rubric: "Criterios ABP: Diseño estructural y seguridad operativa (25%), Rigor de mediciones y contraste de señal (35%), Funcionalidad del prototipo (25%), Comunicación y defensa oral (15%)."
    },
    bio: {
        badge: "Cátedras: IYM, EAV, IRI & Electromedicina",
        title: "Biomedicina: Metrología, Ventilación Pulmonar e Instrumental Médico",
        problem: "Necesidad de verificación metrológica y calibración preventiva de equipamiento de soporte vital y diagnóstico en centros de salud y hospitales de la región, mitigando riesgos de corrientes de fuga y fallas de ventilación.",
        prototypes: "Simulador de señales biológicas ECG/SpO2/PNI portátil para control de monitores multiparamétricos; banco de calibración neumática y flujo para ventiladores mecánicos microcontrolado; cámara de prueba radiológica con sensores dosimétricos.",
        measurements: "Verificación de curvas presión-tiempo y volumen-tiempo en respiradores; medición de fugas eléctricas según norma IEC 60601-1; control de calibración de impedancia y miliamperios/segundo en generadores de rayos X.",
        equipment: ["Analizador de Ventiladores Pulmonares", "Simulador Multiparamétrico de Paciente (Fluke ProSim)", "Analizador de Seguridad Eléctrica Hospitalaria", "Dosímetro de Radiación Ionizante", "Manómetro Digital Diferencial"],
        rubric: "Criterios ABP: Aplicación de normas de bioseguridad y trazabilidad (30%), Calibración y precisión metrológica (35%), Robustez del prototipo (20%), Presentación técnica ante evaluadores (15%)."
    },
    electro: {
        badge: "Cátedra: Sistemas Embebidos & Control",
        title: "Electrónica: Adquisición de Datos, IoT Industrial y PCB Design",
        problem: "Falta de instrumentación local de bajo costo y alta fidelidad para monitoreo de procesos productivos agropecuarios e industriales en el NOA (temperatura, presión en calderas, nivel de silos y control de motores).",
        prototypes: "Sistema DAQ industrial de 8 canales diferenciales con transmisión LoRaWAN y ESP32; módulo de protección y sensado de red trifásica con relé de estado sólido y diseño de PCB en KiCAD.",
        measurements: "Rizado y estabilidad en fuentes conmutadas (Ripple < 15mV); análisis de protocolo SPI/I2C/CAN con analizador lógico; tiempo de respuesta de lazo cerrado ante perturbaciones escalón.",
        equipment: ["Analizador Lógico 16 Canales USB", "Generador de Funciones Arbitrarias DDS", "Multímetro Digital True-RMS 6½ dígitos", "Estación de Soldadura SMD con Aire Caliente", "Plataforma de Ruteo KiCAD"],
        rubric: "Criterios ABP: Ingeniería de circuito y diseño de PCB (30%), Fidelidad de adquisición y acondicionamiento (30%), Integración firmware y telemetría (25%), Documentación técnica (15%)."
    },
    software: {
        badge: "Cátedra: Desarrollo de Sistemas e Informática",
        title: "Software: Plataforma de Telemetría Web y Gestión Hospitalaria",
        problem: "Ineficiencia en la trazabilidad del mantenimiento preventivo biomédico y falta de interfaces en tiempo real para visualizar parámetros de maquinaria y pacientes.",
        prototypes: "Dashboard Web progresivo (PWA) conectado vía WebSockets/MQTT a sensores de campo; microservicio REST en Node.js/Python para registro de calibraciones con base de datos SQLite/PostgreSQL y alertas automáticas.",
        measurements: "Latencia de transmisión (< 80ms en red local); consumo de ancho de banda; pruebas de carga y concurrencia (100 peticiones concurrentes sin degradación de telemetría); compatibilidad responsive.",
        equipment: ["Servidor de Pruebas Docker Local", "Broker MQTT Eclipse Mosquitto", "Librería Chart.js para visualización de oscilogramas", "Herramientas de auditoría Lighthouse y Postman"],
        rubric: "Criterios ABP: Arquitectura de software y conectividad con hardware (35%), Usabilidad y experiencia de usuario (25%), Seguridad y validación de datos (25%), Despliegue y escalabilidad (15%)."
    }
};

function initProjectModals() {
    const modalOverlay = document.getElementById('projectModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBadge = document.getElementById('modalBadge');
    const modalTitle = document.getElementById('modalTitle');
    const modalProblem = document.getElementById('modalProblem');
    const modalPrototypes = document.getElementById('modalPrototypes');
    const modalMeasurements = document.getElementById('modalMeasurements');
    const modalEquipment = document.getElementById('modalEquipment');
    const modalRubric = document.getElementById('modalRubric');

    if (!modalOverlay) return;

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const key = btn.getAttribute('data-open-modal');
            const data = projectData[key];

            if (data) {
                modalBadge.textContent = data.badge;
                modalTitle.textContent = data.title;
                modalProblem.textContent = data.problem;
                modalPrototypes.textContent = data.prototypes;
                modalMeasurements.textContent = data.measurements;
                modalRubric.textContent = data.rubric;

                modalEquipment.innerHTML = '';
                data.equipment.forEach(item => {
                    const pill = document.createElement('span');
                    pill.className = 'modal-tech-pill';
                    pill.textContent = item;
                    modalEquipment.appendChild(pill);
                });

                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   4. FILTRO DE CRONOGRAMA
   ========================================================================== */
function initScheduleFilter() {
    const scheduleButtons = document.querySelectorAll('.schedule-btn');
    const timelineCards = document.querySelectorAll('.timeline-card');

    scheduleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            scheduleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-shift');

            timelineCards.forEach(card => {
                const shift = card.getAttribute('data-shift');
                if (filter === 'all' || shift === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.4s ease-out forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/* ==========================================================================
   5. FORMULARIO DE REGISTRO INTERACTIVO Y CREDENCIALES
   ========================================================================== */
function initRegistrationForm() {
    const roleTabs = document.querySelectorAll('.role-tab-btn');
    const roleHiddenInput = document.getElementById('selectedRoleInput');
    const form = document.getElementById('eventRegistrationForm');
    const dynamicProjectGroup = document.getElementById('projectGroup');
    const projectInput = document.getElementById('inputProject');
    const dynamicInstitutionLabel = document.getElementById('labelInstitution');
    const resultBox = document.getElementById('registrationResult');

    if (!form) return;

    // Conmutación de roles
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const role = tab.getAttribute('data-role');
            roleHiddenInput.value = role;

            if (role === 'expositor') {
                dynamicProjectGroup.style.display = 'flex';
                projectInput.setAttribute('required', 'true');
                dynamicInstitutionLabel.innerHTML = 'Cátedra / Especialidad <span class="req">*</span>';
            } else if (role === 'jurado') {
                dynamicProjectGroup.style.display = 'none';
                projectInput.removeAttribute('required');
                dynamicInstitutionLabel.innerHTML = 'Institución o Empresa / Especialidad Evaluadora <span class="req">*</span>';
            } else {
                dynamicProjectGroup.style.display = 'none';
                projectInput.removeAttribute('required');
                dynamicInstitutionLabel.innerHTML = 'Institución, Escuela o Empresa de procedencia';
            }
        });
    });

    // Envío del Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnHtml = submitBtn.innerHTML;

        const name = document.getElementById('inputName').value.trim();
        const dni = document.getElementById('inputDni').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const phone = document.getElementById('inputPhone').value.trim();
        const role = roleHiddenInput.value;
        const institution = document.getElementById('inputInstitution').value.trim();
        const project = (projectInput && projectInput.value) ? projectInput.value.trim() : '';
        const field = document.getElementById('selectField').value;
        const shift = document.getElementById('selectShift').value;
        const notes = document.getElementById('inputTextarea').value.trim();

        // Generar Código de Acreditación único
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        const rolePrefix = role === 'expositor' ? 'EXP' : (role === 'jurado' ? 'JUR' : 'VIS');
        const accreditationCode = `UFIDET-${rolePrefix}-2026-${randomHex}`;
        const timestamp = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Salta' });

        // Preparar payload para Google Sheets
        const payload = {
            timestamp: timestamp,
            code: accreditationCode,
            name: name,
            dni: dni,
            email: email,
            phone: phone,
            role: role,
            institution: institution,
            project: project,
            field: field,
            shift: shift,
            notes: notes
        };

        // Estado visual de envío
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Guardando acreditación en Google Sheets...</span>';

        // Guardado local de respaldo (Offline fallback)
        try {
            const saved = JSON.parse(localStorage.getItem('ufidet_inscripciones_2026') || '[]');
            saved.push(payload);
            localStorage.setItem('ufidet_inscripciones_2026', JSON.stringify(saved));
        } catch (storageErr) {
            console.warn('Almacenamiento local no disponible:', storageErr);
        }

        // Envío asíncrono a Google Apps Script (si está configurada la URL)
        if (GOOGLE_SHEETS_SCRIPT_URL && GOOGLE_SHEETS_SCRIPT_URL.trim() !== '') {
            try {
                await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            } catch (netErr) {
                console.warn('No se pudo contactar el endpoint de Google Sheets:', netErr);
            }
        }

        // Mapeo amigable de rol
        const roleNameMap = {
            expositor: "Expositor / Estudiante ABP",
            jurado: "Jurado Evaluador / Docente",
            visitante: "Visitante / Sector Socioproductivo"
        };

        // Completar tarjeta de credencial
        document.getElementById('credName').textContent = name;
        document.getElementById('credRole').textContent = roleNameMap[role] || "Acreditado";
        document.getElementById('credCode').textContent = accreditationCode;
        document.getElementById('credInstitution').textContent = institution ? `Procedencia: ${institution}` : "U.F.I.De.T. Salta";

        // Generar QR con la API oficial segura
        const qrImg = document.getElementById('credQrImage');
        const qrPayload = encodeURIComponent(`https://hugoaguilaufidet.github.io/feriaufidet?code=${accreditationCode}&user=${name}`);
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrPayload}`;

        // Restaurar botón y mostrar credencial
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        form.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Botón para nuevo registro
    const resetBtn = document.getElementById('btnNewRegistration');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            resultBox.style.display = 'none';
            form.style.display = 'grid';
            form.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Botón para imprimir / guardar credencial
    const printBtn = document.getElementById('btnPrintCredential');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}
