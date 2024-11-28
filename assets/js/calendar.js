class Calendar {
    constructor() {
        try {
            Logger.info('Inicializando calendário...');
            
            this.date = new Date();
            this.currentMonth = this.date.getMonth();
            this.currentYear = this.date.getFullYear();
            
            // Elementos do DOM
            this.monthElement = document.getElementById('currentMonth');
            this.daysElement = document.getElementById('calendarDays');
            this.prevButton = document.getElementById('prevMonth');
            this.nextButton = document.getElementById('nextMonth');
            
            if (!this.monthElement || !this.daysElement || !this.prevButton || !this.nextButton) {
                throw new Error('Elementos do calendário não encontrados');
            }
            
            // Eventos simulados (exemplo)
            this.events = {
                // formato: 'YYYY-MM-DD': { type: 'contrato|os|fatura', title: 'Descrição' }
                '2024-03-15': { type: 'contrato', title: 'Renovação Contrato ABC' },
                '2024-03-20': { type: 'os', title: 'Manutenção Preventiva' },
                '2024-03-25': { type: 'fatura', title: 'Vencimento Fatura #123' }
            };
            
            // Bind dos eventos
            this.bindEvents();
            
            // Renderiza o calendário inicial
            this.render();
            
            Logger.info('Calendário inicializado com sucesso');
        } catch (error) {
            Logger.error('Erro ao inicializar o calendário:', error);
            Toast.error('Erro ao inicializar o calendário');
        }
    }
    
    bindEvents() {
        try {
            this.prevButton.addEventListener('click', () => {
                this.previousMonth();
                Logger.debug('Mês anterior selecionado');
            });
            
            this.nextButton.addEventListener('click', () => {
                this.nextMonth();
                Logger.debug('Próximo mês selecionado');
            });
        } catch (error) {
            Logger.error('Erro ao vincular eventos do calendário:', error);
            throw error;
        }
    }
    
    formatMonth() {
        return new Date(this.currentYear, this.currentMonth)
            .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    
    getDaysInMonth() {
        return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    }
    
    getFirstDayOfMonth() {
        return new Date(this.currentYear, this.currentMonth, 1).getDay();
    }
    
    getDateString(day) {
        return `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    }
    
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    }
    
    render() {
        try {
            // Atualiza o mês/ano exibido
            this.monthElement.textContent = this.formatMonth();
            
            // Limpa os dias existentes
            this.daysElement.innerHTML = '';
            
            // Adiciona células vazias para os dias antes do primeiro dia do mês
            for (let i = 0; i < this.getFirstDayOfMonth(); i++) {
                this.daysElement.appendChild(this.createDayElement(''));
            }
            
            // Adiciona os dias do mês
            for (let day = 1; day <= this.getDaysInMonth(); day++) {
                const dateString = this.getDateString(day);
                const event = this.events[dateString];
                
                this.daysElement.appendChild(this.createDayElement(day, event));
            }
            
            Logger.debug('Calendário renderizado:', {
                month: this.currentMonth + 1,
                year: this.currentYear,
                days: this.getDaysInMonth()
            });
        } catch (error) {
            Logger.error('Erro ao renderizar calendário:', error);
            Toast.error('Erro ao atualizar calendário');
        }
    }
    
    createDayElement(day, event = null) {
        const div = document.createElement('div');
        const today = new Date();
        const isToday = today.getDate() === day && 
                       today.getMonth() === this.currentMonth && 
                       today.getFullYear() === this.currentYear;
        
        div.className = `calendar-day ${isToday ? 'today' : ''} ${!day ? 'other-month' : ''}`;
        
        if (day) {
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            div.appendChild(dayNumber);
            
            if (event) {
                const eventDiv = document.createElement('div');
                eventDiv.className = `calendar-event event-${event.type}`;
                eventDiv.textContent = event.title;
                div.appendChild(eventDiv);
                
                // Adiciona tooltip
                div.setAttribute('data-bs-toggle', 'tooltip');
                div.setAttribute('data-bs-placement', 'top');
                div.setAttribute('title', event.title);
                
                // Adiciona evento de clique
                div.addEventListener('click', () => {
                    Toast.info(`Evento: ${event.title}`);
                });
            }
        }
        
        return div;
    }
    
    initializeEventHandlers() {
        // Delegação de eventos para os dias do calendário
        this.daysElement.addEventListener('click', (e) => {
            const dayEl = e.target.closest('.calendar-day');
            if (dayEl) {
                this.handleDayClick(dayEl);
            }
        });

        // Hover effects para eventos
        this.daysElement.addEventListener('mouseover', (e) => {
            const eventEl = e.target.closest('.calendar-event');
            if (eventEl) {
                eventEl.style.transform = 'translateX(2px)';
            }
        });

        this.daysElement.addEventListener('mouseout', (e) => {
            const eventEl = e.target.closest('.calendar-event');
            if (eventEl) {
                eventEl.style.transform = 'translateX(0)';
            }
        });
    }
    
    handleDayClick(dayEl) {
        const events = dayEl.querySelectorAll('.calendar-event');
        if (events.length > 0) {
            // Mostrar modal com eventos do dia
            this.showEventsModal(events);
        }
    }
    
    showEventsModal(events) {
        const modalHtml = `
            <div class="modal fade" id="eventsModal" tabindex="-1">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Eventos do Dia</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${Array.from(events).map(event => `
                                <div class="p-2 mb-2 rounded ${event.className}">
                                    ${event.textContent}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior se existir
        const existingModal = document.getElementById('eventsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Adicionar novo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('eventsModal'));
        modal.show();
    }
    
    getEventClass(type) {
        const classes = {
            contrato: 'bg-info bg-opacity-25 text-info border border-info',
            os: 'bg-success bg-opacity-25 text-success border border-success',
            fatura: 'bg-danger bg-opacity-25 text-danger border border-danger'
        };
        return classes[type] || '';
    }
}

// Inicializar tooltips do Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    try {
        Logger.info('Inicializando calendário e tooltips...');
        
        // Inicializa o calendário
        window.calendar = new Calendar();
        
        // Inicializa os tooltips do Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        Logger.info('Calendário e tooltips inicializados com sucesso');
    } catch (error) {
        Logger.error('Erro ao inicializar calendário e tooltips:', error);
        Toast.error('Erro ao inicializar o calendário');
    }
});