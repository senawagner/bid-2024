function formatarMoeda(valor) {
    if (!valor) return 'R$ 0,00';
    
    const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numero);
}

// Exportar para uso global
window.formatarMoeda = formatarMoeda;
