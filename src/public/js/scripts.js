/* DOM: contenedor del calendario */
var calendarEl = document.getElementById('calendario');

/* Configuración inyectada desde Pug: apiKey y calendarId (defensas si faltan) */
var cfg = (typeof window !== 'undefined' && window.calendarConfig) ? window.calendarConfig : { apiKey: '', calendarId: '' };

/* Inicialización de FullCalendar */
var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'es',
    allDaySlot: false,
    
    headerToolbar: {
        left: 'today',
        center: 'prev,title,next',
        right: 'timeGridWeek,dayGridMonth,listWeek'
    },
    
    views: {
        timeGridWeek: {
            titleFormat: { month: 'long', day: '2-digit' }
        },
        dayGridMonth: {
            titleFormat: { month: 'long', year: 'numeric' }
        },
        listWeek: {
            titleFormat: { month: 'long', day: '2-digit' },
            listDayFormat: { weekday: 'long', day: '2-digit', month: 'long' },
            listDaySideFormat: false
        }
    },

    googleCalendarApiKey: cfg.apiKey || '',

    /* Handler: fallo al cargar eventos desde Google Calendar */
    eventSourceFailure: function() {
        if (calendarEl) {
            var noticeId = 'gcal-error-notice';
            var existing = document.getElementById(noticeId);
            if (!existing) {
                var div = document.createElement('div');
                div.id = noticeId;
                div.style.color = 'red';
                div.style.padding = '8px';
                div.textContent = 'No se pudieron cargar los eventos del calendario. Por favor, verifica la configuración.';
                calendarEl.parentNode.insertBefore(div, calendarEl);
            }
        }
    },

    /* Handler: click en evento (abrir modal) */
    eventClick: function(info) {
        if (info.jsEvent) info.jsEvent.preventDefault();
        showEventModal(info.event);
    },

    /* Fuentes de eventos: Google Calendar (si calendarId presente) */
    eventSources: [
        {
            googleCalendarId: cfg.calendarId || '',
            className: 'gcal-event'
        }
    ]
});

calendar.render();

/* Elementos del modal en el DOM (si existen) */
var modalRoot = document.getElementById('event-modal');
var modalTitle = modalRoot && modalRoot.querySelector('.event-modal__title');
var modalTime = modalRoot && modalRoot.querySelector('.event-modal__time');
var modalDesc = modalRoot && modalRoot.querySelector('.event-modal__description');
var modalClose = modalRoot && modalRoot.querySelector('.event-modal__close');

var dateFormatter = new Intl.DateTimeFormat('es', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short'
});

var timeFormatter = new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit'
});

/* Mostrar modal con datos del evento (formato en español) */
function showEventModal(event) {
    if (!modalRoot) return;
    var title = event.title || 'Sin título';
    var start = event.start ? new Date(event.start) : null;
    var end = event.end ? new Date(event.end) : null;
    var timeText = '';
    if (start && end) {
        timeText = dateFormatter.format(start) + ', ' + 
        timeFormatter.format(start) + ' - ' + timeFormatter.format(end);
    } else if (start) {
        timeText = dateFormatter.format(start) + ', ' + timeFormatter.format(start);
    }

    var description = (event.extendedProps && event.extendedProps.description) || event._def && event._def.extendedProps && event._def.extendedProps.description || '';

    modalTitle.textContent = title;
    modalTime.textContent = timeText;
    modalDesc.textContent = description;

    modalRoot.setAttribute('aria-hidden', 'false');
    modalRoot.style.display = 'flex';
    
    if (modalClose) {
        modalClose.onclick = hideEventModal;
        setTimeout(() => modalClose.focus(), 50);
    }
    modalRoot.querySelector('.event-modal__backdrop').onclick = hideEventModal;
    document.addEventListener('keydown', onKeyDownModal);
}

/* Ocultar modal y limpiar listeners */
function hideEventModal() {
    if (!modalRoot) return;
    modalRoot.setAttribute('aria-hidden', 'true');
    modalRoot.style.display = 'none';
    document.removeEventListener('keydown', onKeyDownModal);
}

function onKeyDownModal(e) {
    if (e.key === 'Escape') hideEventModal();
}