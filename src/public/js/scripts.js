// Fondo dinámico según estación y cumpleaños
(function() {
    var today = new Date();
    var month = today.getMonth() + 1; // 1-12
    var day = today.getDate();
    var bg = '';
    // Cumpleaños: 28 de octubre
    if (month === 10 && day === 28) {
        bg = '/img/cinnamoroll-birthday.jpg';
    } else {
        // Estaciones en España
        if ((month === 3 && day >= 20) || (month > 3 && month < 6) || (month === 6 && day < 21)) {
            bg = '/img/cinnamoroll-spring.png'; // Primavera: 20 marzo - 20 junio
        } else if ((month === 6 && day >= 21) || (month > 6 && month < 9) || (month === 9 && day < 23)) {
            bg = '/img/cinnamoroll-summer.jpeg'; // Verano: 21 junio - 22 septiembre
        } else if ((month === 9 && day >= 23) || (month > 9 && month < 12) || (month === 12 && day < 21)) {
            bg = '/img/cinnamoroll-autumn.png'; // Otoño: 23 septiembre - 21 diciembre
        } else {
            bg = '/img/cinnamoroll-winter.png'; // Invierno: 21 diciembre - 19 marzo
        }
    }
    if (bg) {
        document.documentElement.style.backgroundImage = 'url("' + bg + '")';
        document.documentElement.style.backgroundSize = 'cover';
        document.documentElement.style.backgroundPosition = 'center';
        document.documentElement.style.backgroundAttachment = 'fixed';
    }
})();

var calendarEl = document.getElementById('calendario');
var cfg = (typeof window !== 'undefined' && window.calendarConfig) ? window.calendarConfig : { apiKey: '', calendarId: '' };
var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'es',
    allDaySlot: false,
    nowIndicator: true,
    headerToolbar: {
        left: 'today',
        center: 'prev,title,next',
        right: 'timeGridWeek,dayGridMonth,listWeek'
    },

    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    },

    slotMinTime: '09:00:00',
    slotMaxTiem: '22:00:00',
    
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
    eventClick: function(info) {
        if (info.jsEvent) info.jsEvent.preventDefault();
        showEventModal(info.event);
    },
    eventSources: [
        {
            googleCalendarId: cfg.calendarId || '',
            className: 'gcal-event'
        }
    ]
});

calendar.render();

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

function hideEventModal() {
    if (!modalRoot) return;
    modalRoot.setAttribute('aria-hidden', 'true');
    modalRoot.style.display = 'none';
    document.removeEventListener('keydown', onKeyDownModal);
}

function onKeyDownModal(e) {
    if (e.key === 'Escape') hideEventModal();
}